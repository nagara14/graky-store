
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Load env vars from .env.local
dotenv.config({ path: '.env.local' })

async function checkDb() {
    console.log('Checking database connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)

    let config: any

    if (process.env.DATABASE_URL) {
        console.log('Using TiDB Cloud (DATABASE_URL)...')
        try {
            const url = new URL(process.env.DATABASE_URL)
            config = {
                host: url.hostname,
                user: url.username,
                password: url.password,
                database: url.pathname.replace(/^\//, ''),
                port: parseInt(url.port) || 4000,
                ssl: {
                    minVersion: 'TLSv1.2',
                    rejectUnauthorized: true,
                }
            }
            console.log(`Connecting to ${config.host}:${config.port}/${config.database}...`)
        } catch (err) {
            console.error('Failed to parse DATABASE_URL:', err)
            process.exit(1)
        }
    } else {
        console.log('Using local MySQL...')
        config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'graky_store',
            port: parseInt(process.env.DB_PORT || '3306'),
        }
        console.log(`Connecting to ${config.host}:${config.port}/${config.database}...`)
    }

    try {
        const connection = await mysql.createConnection(config)
        console.log('✅ Database connection successful!')
        await connection.end()
        process.exit(0)
    } catch (error: any) {
        console.error('❌ Database connection failed:', error.message)
        if (error.code === 'ECONNREFUSED') {
            console.error('👉 HINT: Database server is not reachable!')
        } else if (error.code === 'ENOTFOUND') {
            console.error('👉 HINT: Database host not found! Check your DATABASE_URL.')
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('👉 HINT: Invalid username or password!')
        }
        process.exit(1)
    }
}

checkDb()
