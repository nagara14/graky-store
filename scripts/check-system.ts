import mysql from 'mysql2/promise'
import { getUserByEmail } from '@/lib/db'

async function checkSystem() {
  console.log('🔍 === GRAKY STORE SYSTEM CHECK ===\n')

  // 1. Check DB Connection
  console.log('1️⃣  Database Connection...')
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'graky_store',
    })
    console.log('   ✅ Connected to MySQL')

    // Check tables
    const [tables]: any = await conn.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'graky_store'])

    console.log(`   ✅ Found ${tables.length} tables: ${tables.map((t: any) => t.TABLE_NAME).join(', ')}\n`)

    // 2. Check Admin User
    console.log('2️⃣  Admin User Check...')
    const user = await getUserByEmail('mamat.admin@graky.com')
    if (user) {
      console.log(`   ✅ Admin user exists: ${user.name} (${user.role})\n`)
    } else {
      console.log('   ⚠️  Admin user NOT found\n')
    }

    // 3. Check Categories
    const [categories]: any = await conn.execute('SELECT * FROM categories')
    console.log(`3️⃣  Categories: ${categories.length} found`)
    categories.forEach((cat: any) => {
      console.log(`   - ${cat.icon} ${cat.name}`)
    })
    console.log()

    // 4. Check Products
    const [products]: any = await conn.execute('SELECT COUNT(*) as count FROM products')
    console.log(`4️⃣  Products: ${products[0].count} total\n`)

    // 5. Environment Check
    console.log('5️⃣  Environment Variables:')
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ NOT SET'}`)
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`)
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'graky_store'}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`)

    console.log('✅ === SYSTEM CHECK COMPLETE ===')

    await conn.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

checkSystem()
