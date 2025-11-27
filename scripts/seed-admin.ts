import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '@/lib/db'

async function seedAdmin() {
  try {
    // Check if admin exists
    const existingAdmin = await getUserByEmail('admin@graky.com')
    
    if (existingAdmin) {
      console.log('✓ Admin sudah ada')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Create admin user
    const admin = await createUser(
      'Admin Graky',
      'admin@graky.com',
      hashedPassword,
      'ADMIN'
    )

    console.log('✓ Admin berhasil dibuat:', admin)
  } catch (error) {
    console.error('✗ Error seeding admin:', error)
  }

  process.exit(0)
}

seedAdmin()
