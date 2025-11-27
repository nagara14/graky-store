import { NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/db'

const ADMIN_EMAIL = 'admin@graky.store'
const ADMIN_PASSWORD = 'admin123'
const ADMIN_NAME = 'Super Admin'

export async function POST() {
    try {
        console.log('[API] Creating admin user...')

        // Check if admin already exists
        const existing = await getUserByEmail(ADMIN_EMAIL)

        if (existing) {
            return NextResponse.json({
                success: false,
                message: 'Admin user already exists',
                admin: {
                    email: ADMIN_EMAIL,
                    name: existing.name,
                    role: existing.role
                }
            })
        }

        // Create new admin
        const admin = await createUser(ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, 'ADMIN')

        return NextResponse.json({
            success: true,
            message: 'Admin user created successfully!',
            credentials: {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            },
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        })
    } catch (error: any) {
        console.error('[API] Failed to create admin:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
