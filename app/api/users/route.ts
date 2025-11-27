import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { getAllUsers, createUser } from '@/lib/db'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'KARYAWAN', 'USER']),
})

// GET all users (ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const users = await getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data users' },
      { status: 500 }
    )
  }
}

// POST create user (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    const newUser = await createUser(
      validatedData.name,
      validatedData.email,
      hashedPassword,
      validatedData.role
    )

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat user' },
      { status: 500 }
    )
  }
}
