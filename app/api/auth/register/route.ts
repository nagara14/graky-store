import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { createUser, getUserByEmail, initializeDatabase } from '@/lib/db'
import { registerRateLimiter } from '@/lib/ratelimit'
import { validatePassword, validateEmail, sanitizeInput } from '@/lib/validation'

// Initialize database on module load (for serverless cold starts)
let dbInitialized = false

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized (critical for Vercel serverless)
    if (!dbInitialized) {
      try {
        await initializeDatabase()
        dbInitialized = true
      } catch (initError: any) {
        console.error('[Register] Database initialization failed:', {
          message: initError.message,
          stack: initError.stack,
          code: initError.code,
          env: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            nodeEnv: process.env.NODE_ENV,
          }
        })
        return NextResponse.json(
          {
            error: 'Database connection failed',
            details: process.env.NODE_ENV === 'development' ? initError.message : undefined
          },
          { status: 500 }
        )
      }
    }

    const body = await request.json()
    let { name, email, password, confirmPassword } = body

    // Sanitize inputs
    name = sanitizeInput(name)
    email = email?.toLowerCase().trim()

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    // Rate limiting
    const rateLimitOk = registerRateLimiter.check(email)
    if (!rateLimitOk) {
      const resetTime = registerRateLimiter.getResetTime(email)
      const resetMinutes = Math.ceil(resetTime / 60)
      return NextResponse.json(
        { error: `Terlalu banyak percobaan registrasi. Coba lagi dalam ${resetMinutes} menit` },
        { status: 429 }
      )
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password tidak cocok' }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.length < 2) {
      return NextResponse.json({ error: 'Nama minimal 2 karakter' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Nama maksimal 100 karakter' }, { status: 400 })
    }

    // Check if email already exists
    const exists = await getUserByEmail(email)
    if (exists) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    // Hash password with strong salt rounds
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await createUser(name, email, hashedPassword, 'USER')

    // Reset rate limiter on successful registration
    registerRateLimiter.reset(email)

    return NextResponse.json(
      { success: true, message: 'Registrasi berhasil' },
      { status: 201 }
    )
  } catch (error: any) {
    // Handle duplicate email error from database
    if (error.message?.includes('Email sudah terdaftar')) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    // Enhanced error logging for debugging in Vercel
    console.error('[Register] Error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
    })

    return NextResponse.json(
      {
        error: 'Registrasi gagal, silakan coba lagi',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
