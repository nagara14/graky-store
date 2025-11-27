#!/usr/bin/env node
import { createUser, getUserByEmail } from '../lib/db'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const ADMIN_EMAIL = 'admin@graky.store'
const ADMIN_PASSWORD = 'admin123'
const ADMIN_NAME = 'Super Admin'

async function createAdmin() {
    console.log('🔧 Creating admin user...\n')
    console.log(`Email: ${ADMIN_EMAIL}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)
    console.log(`Name: ${ADMIN_NAME}\n`)

    try {
        // Check if admin already exists
        const existing = await getUserByEmail(ADMIN_EMAIL)

        if (existing) {
            console.log('⚠️  Admin user already exists!')
            console.log('Use reset-admin-password script to change password.')
            process.exit(0)
        }

        // Create new admin
        const admin = await createUser(ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, 'ADMIN')

        console.log('✅ Admin user created successfully!')
        console.log(`\nYou can now login with:`)
        console.log(`  Email: ${ADMIN_EMAIL}`)
        console.log(`  Password: ${ADMIN_PASSWORD}`)

        process.exit(0)
    } catch (error: any) {
        console.error('❌ Failed to create admin:', error.message)
        process.exit(1)
    }
}

createAdmin()
