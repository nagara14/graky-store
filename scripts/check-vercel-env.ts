// Check required environment variables for Vercel deployment
console.log('=========================================')
console.log('VERCEL ENVIRONMENT VARIABLES CHECK')
console.log('=========================================')

const requiredVars = {
    // Database
    'DATABASE_URL': process.env.DATABASE_URL,

    // NextAuth
    'NEXTAUTH_URL': process.env.NEXTAUTH_URL,
    'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,

    // Google OAuth
    'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,

    // Midtrans
    'MIDTRANS_SERVER_KEY': process.env.MIDTRANS_SERVER_KEY,
    'MIDTRANS_CLIENT_KEY': process.env.MIDTRANS_CLIENT_KEY,
    'MIDTRANS_IS_PRODUCTION': process.env.MIDTRANS_IS_PRODUCTION,

    // App
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
}

console.log('\n📋 CHECKING REQUIRED VARIABLES:\n')

let missingVars: string[] = []
let foundVars: string[] = []

for (const [key, value] of Object.entries(requiredVars)) {
    const exists = !!value
    const status = exists ? '✅' : '❌'

    if (exists) {
        foundVars.push(key)
        // Show partial value for security
        let preview = value as string
        if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')) {
            preview = value.substring(0, 15) + '...'
        } else if (key === 'DATABASE_URL') {
            preview = value.substring(0, 30) + '...'
        }
        console.log(`${status} ${key}`)
        console.log(`   Value: ${preview}`)
    } else {
        missingVars.push(key)
        console.log(`${status} ${key}`)
        console.log(`   Value: NOT SET`)
    }
    console.log('')
}

console.log('=========================================')
console.log('SUMMARY')
console.log('=========================================')
console.log(`✅ Found: ${foundVars.length} variables`)
console.log(`❌ Missing: ${missingVars.length} variables`)

if (missingVars.length > 0) {
    console.log('\n⚠️  CRITICAL MISSING VARIABLES:')
    missingVars.forEach(v => console.log(`   - ${v}`))
}

console.log('\n=========================================')
console.log('VERCEL DEPLOYMENT CHECKLIST')
console.log('=========================================')

console.log('\n1. Go to Vercel Dashboard:')
console.log('   https://vercel.com/dashboard')

console.log('\n2. Select your project')

console.log('\n3. Go to: Settings > Environment Variables')

console.log('\n4. Add/Update these variables:')
console.log('\n   CRITICAL for Auth (fixes "Bad request"):')
console.log('   ✓ NEXTAUTH_URL=https://your-app.vercel.app')
console.log('   ✓ NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>')
console.log('   ✓ DATABASE_URL=<your TiDB connection string>')
console.log('   ✓ GOOGLE_CLIENT_ID=<from Google Console>')
console.log('   ✓ GOOGLE_CLIENT_SECRET=<from Google Console>')

console.log('\n   For Payment:')
console.log('   ✓ MIDTRANS_SERVER_KEY=<from Midtrans Dashboard>')
console.log('   ✓ MIDTRANS_CLIENT_KEY=<from Midtrans Dashboard>')
console.log('   ✓ MIDTRANS_IS_PRODUCTION=false (or true for prod)')

console.log('\n   For Frontend:')
console.log('   ✓ NEXT_PUBLIC_APP_URL=https://your-app.vercel.app')

console.log('\n5. Update Google OAuth Callback:')
console.log('   Go to: https://console.cloud.google.com/apis/credentials')
console.log('   Add authorized redirect URI:')
console.log('   https://your-app.vercel.app/api/auth/callback/google')

console.log('\n6. Redeploy:')
console.log('   Go to Deployments tab > Click "Redeploy"')

console.log('\n=========================================\n')
