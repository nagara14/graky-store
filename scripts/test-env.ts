
// Test if DATABASE_URL is being loaded
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20))
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_NAME:', process.env.DB_NAME)
