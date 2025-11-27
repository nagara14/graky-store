import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db'

// GET -> instruction page with interactive form (so you can test from browser)
export async function GET(request: NextRequest) {
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Debug: check-login</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body { font-family: system-ui, Arial; padding: 24px; color:#111 }
      input, button { font-size:14px; padding:8px; margin:4px 0; width:100% }
      .box { max-width:700px; margin:0 auto }
      pre { background:#f6f8fa; padding:12px; border-radius:6px; overflow:auto }
      .result { white-space:pre-wrap; background:#0f172a; color:#e6f0ff; padding:12px; border-radius:6px; }
      label { font-weight:600; display:block; margin-top:8px }
    </style>
  </head>
  <body>
    <div class="box">
      <h1>/api/debug/check-login</h1>
      <p>This page lets you test a login (POST) against the database and bcrypt hash.</p>

      <label for="email">Email</label>
      <input id="email" type="email" value="mamat.admin@graky.com" />

      <label for="password">Password</label>
      <input id="password" type="password" value="admin123456" />

      <button id="btn">Check</button>

      <h3>Response</h3>
      <div id="out" class="result">No test yet.</div>

      <h4>Example curl</h4>
      <pre>curl -X POST http://localhost:3000/api/debug/check-login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"mamat.admin@graky.com","password":"admin123456"}'</pre>

      <p style="color:#a00"><strong>DEBUG ONLY:</strong> remove this route after troubleshooting. Do not expose on production.</p>
    </div>

    <script>
      const btn = document.getElementById('btn')
      const out = document.getElementById('out')
      btn.addEventListener('click', async () => {
        out.textContent = 'Checking...'
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        try {
          const res = await fetch(location.pathname, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })
          const data = await res.json()
          out.textContent = JSON.stringify(data, null, 2)
        } catch (err) {
          out.textContent = 'Request error: ' + err.message
        }
      })
    </script>
  </body>
  </html>
  `
  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } })
}

// POST -> perform debug check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    const user = await getUserByEmail(email)
    if (!user) return NextResponse.json({ found: false })

    const match = await bcrypt.compare(password, user.password)

    return NextResponse.json({
      found: true,
      user: { id: user.id, email: user.email, role: user.role ?? null, isActive: !!user.isActive },
      passwordHash: user.password, // debug only
      passwordMatch: match,
    })
  } catch (err) {
    console.error('Debug check-login error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
