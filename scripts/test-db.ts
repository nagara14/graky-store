import mysql from 'mysql2/promise'

async function testConnection() {
  console.log('🔍 Testing database connection...')
  console.log('Config:')
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`)
  console.log(`  User: ${process.env.DB_USER || 'root'}`)
  console.log(`  Database: ${process.env.DB_NAME || 'graky_store'}`)

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'graky_store',
    })

    console.log('✅ Connection successful!')

    // Test query
    const [result]: any = await connection.execute('SELECT 1 as test')
    console.log('✅ Query test passed:', result)

    // Count tables
    const [tables]: any = await connection.execute(`
      SELECT COUNT(*) as count FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_NAME || 'graky_store'])
    
    console.log(`✅ Database has ${tables[0].count} tables`)

    await connection.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

testConnection()
