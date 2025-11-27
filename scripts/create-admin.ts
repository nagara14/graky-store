
import { createUser } from '../lib/db'

async function createAdmin() {
    const email = 'admin@graky.store'
    const password = 'password123'
    const name = 'Super Admin'

    console.log('Creating admin user...')
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)

    try {
        const user = await createUser(name, email, password, 'ADMIN')
        console.log('✅ Admin created successfully:', user)
    } catch (error: any) {
        if (error.message === 'Email sudah terdaftar') {
            console.log('⚠️  Admin already exists with this email.')
        } else {
            console.error('❌ Failed to create admin:', error)
        }
    }
}

createAdmin()
