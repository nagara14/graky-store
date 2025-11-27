import { NextResponse } from 'next/server'
import { updateUserPasswordByEmail } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const email = 'admin@graky.store'
    const newPassword = 'admin123'

    console.log('[API] Resetting admin password to:', newPassword)

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    console.log('[API] Generated hash:', hashedPassword.substring(0, 20) + '...')

    await updateUserPasswordByEmail(email, hashedPassword)

    console.log('[API] Password reset successful')

    return NextResponse.json({
      success: true,
      message: `Password for ${email} has been reset to: ${newPassword}`,
      passwordLength: newPassword.length,
      hashPrefix: hashedPassword.substring(0, 20)
    })
  } catch (error: any) {
    console.error('[API] Error resetting password:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
