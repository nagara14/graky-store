import { NextResponse } from 'next/server'
import { getAllUsers, getUserByEmail } from '@/lib/db'

export async function GET() {
    try {
        const users = await getAllUsers()
        const admin = await getUserByEmail('admin@graky.store')

        return NextResponse.json({
            totalUsers: users.length,
            users: users.map(u => ({
                email: u.email,
                name: u.name,
                role: u.role,
                isActive: u.isActive,
            })),
            adminExists: !!admin,
            adminDetails: admin ? {
                name: admin.name,
                role: admin.role,
                hasPassword: !!admin.password
            } : null
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
