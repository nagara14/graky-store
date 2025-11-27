
import { getUserByEmail, getAllUsers } from '../lib/db'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function listUsers() {
    console.log('Fetching all users from database...')

    try {
        const users = await getAllUsers()
        console.log(`\nFound ${users.length} users:\n`)

        for (const user of users) {
            console.log(`- Email: ${user.email}`)
            console.log(`  Name: ${user.name}`)
            console.log(`  Role: ${user.role}`)
            console.log(`  Active: ${user.isActive}`)
            console.log(`  Created: ${user.createdAt}`)
            console.log('')
        }

        // Check specifically for admin@graky.store
        console.log('Checking for admin@graky.store...')
        const admin = await getUserByEmail('admin@graky.store')
        if (admin) {
            console.log('✅ admin@graky.store exists!')
            console.log('Has password:', !!admin.password)
        } else {
            console.log('❌ admin@graky.store does NOT exist')
        }

    } catch (error) {
        console.error('Error:', error)
    }
}

listUsers()
