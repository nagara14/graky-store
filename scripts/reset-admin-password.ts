

import { updateUserPasswordByEmail } from '../lib/db'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load env vars from .env.local
dotenv.config({ path: '.env.local' })

async function resetAdminPassword() {
    const email = 'admin@graky.store'
    const newPassword = 'password123'

    console.log(`Resetting password for ${email}...`)

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        await updateUserPasswordByEmail(email, hashedPassword)
        console.log('✅ Password reset successfully to:', newPassword)
    } catch (error) {
        console.error('❌ Failed to reset password:', error)
    }
}

resetAdminPassword()
