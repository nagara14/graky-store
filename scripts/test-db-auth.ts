
import { getUserByEmail, createUser } from '../lib/db'
import bcrypt from 'bcryptjs'
const { hash } = bcrypt

async function testAuth() {
    console.log('Starting DB Auth Test...')

    const testEmail = `test-${Date.now()}@example.com`
    const testName = 'Test User'

    try {
        console.log(`Checking if user ${testEmail} exists...`)
        const existing = await getUserByEmail(testEmail)
        console.log('Existing user:', existing)

        if (!existing) {
            console.log('Creating new user...')
            const password = await hash('password123', 10)
            const newUser = await createUser(testName, testEmail, password, 'USER')
            console.log('User created successfully:', newUser)
        }

        console.log('Test completed successfully')
    } catch (error) {
        console.error('Test failed:', error)
    }
}

testAuth()
