import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, updateUserPasswordByEmail } from '@/lib/db'

// GET -> simple form/instructions
export async function GET() {
  const html = `
  <!doctype html>
  <html><head><meta charset="utf-8"><title>Debug: reset-password</title></head>
  <body style="font-family:system-ui,Arial;margin:24px">
    <h2>/api/debug/reset-password</h2>
    <p>POST JSON { "email":"...", "newPassword":"..." } with header <code>X-DEBUG-SECRET</code>.</p>
    <p>Example curl:</p>
    <pre>curl -X POST http://localhost:3000/api/debug/reset-password \\
  -H "Content-Type: application/json" \\
  -H "X-DEBUG-SECRET: ${process.env.DEBUG_RESET_SECRET || 'set_DEBUG_RESET_SECRET'}" \\
  -d '{"email":"mamat.admin@graky.com","newPassword":"admin123456"}'</pre>
    <p><strong>DEBUG ONLY:</strong> remove after use.</p>
  </body></html>`
  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } })
}

// POST -> perform reset (requires X-DEBUG-SECRET header)
export async function POST(request: NextRequest) {
  try {
    const secretHeader = request.headers.get('x-debug-secret') || ''
    const secretEnv = process.env.DEBUG_RESET_SECRET || ''

    if (!secretEnv || secretHeader !== secretEnv) {
      return NextResponse.json({ error: 'Unauthorized (invalid debug secret)' }, { status: 401 })
    }

    const body = await request.json()
    const { email, newPassword } = body || {}

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Missing email or newPassword' }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hashed = bcrypt.hashSync(newPassword, 10)
    await updateUserPasswordByEmail(email, hashed)

    return NextResponse.json({ success: true, email, hashed })
  } catch (err) {
    console.error('reset-password error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
