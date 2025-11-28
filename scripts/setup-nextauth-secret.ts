// Script to add NEXTAUTH_SECRET to .env.local if not exists
import * as fs from 'fs'
import * as path from 'path'

const ENV_FILE = path.join(process.cwd(), '.env.local')

// Generate a random secret
function generateSecret(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

console.log('=========================================')
console.log('NEXTAUTH_SECRET SETUP')
console.log('=========================================\n')

try {
    // Check if .env.local exists
    if (!fs.existsSync(ENV_FILE)) {
        console.log('❌ .env.local file not found!')
        console.log('   Creating new .env.local file...\n')
        fs.writeFileSync(ENV_FILE, '', 'utf8')
    }

    // Read current .env.local
    let envContent = fs.readFileSync(ENV_FILE, 'utf8')

    // Check if NEXTAUTH_SECRET already exists
    if (envContent.includes('NEXTAUTH_SECRET=')) {
        console.log('✅ NEXTAUTH_SECRET already exists in .env.local\n')

        // Extract the current value
        const match = envContent.match(/NEXTAUTH_SECRET=(.+)/)
        if (match && match[1] && match[1].trim()) {
            console.log('   Current value: ' + match[1].substring(0, 15) + '...\n')
        } else {
            console.log('   ⚠️  But it\'s empty! Generating a new one...\n')
            const secret = generateSecret()
            envContent = envContent.replace(/NEXTAUTH_SECRET=.*/, `NEXTAUTH_SECRET=${secret}`)
            fs.writeFileSync(ENV_FILE, envContent, 'utf8')
            console.log('✅ NEXTAUTH_SECRET updated!')
            console.log('   New value: ' + secret + '\n')
        }
    } else {
        console.log('⚠️  NEXTAUTH_SECRET not found in .env.local')
        console.log('   Adding NEXTAUTH_SECRET...\n')

        const secret = generateSecret()

        // Add NEXTAUTH_SECRET to .env.local
        if (!envContent.endsWith('\n') && envContent.length > 0) {
            envContent += '\n'
        }
        envContent += `\n# NextAuth Secret (for session encryption)\nNEXTAUTH_SECRET=${secret}\n`

        fs.writeFileSync(ENV_FILE, envContent, 'utf8')

        console.log('✅ NEXTAUTH_SECRET added to .env.local!')
        console.log('   Value: ' + secret + '\n')
    }

    // Check NEXTAUTH_URL
    if (!envContent.includes('NEXTAUTH_URL=')) {
        console.log('⚠️  NEXTAUTH_URL not found')
        console.log('   Adding NEXTAUTH_URL for local development...\n')

        if (!envContent.endsWith('\n')) {
            envContent += '\n'
        }
        envContent += `NEXTAUTH_URL=http://localhost:3000\n`

        fs.writeFileSync(ENV_FILE, envContent, 'utf8')
        console.log('✅ NEXTAUTH_URL added (http://localhost:3000)\n')
    } else {
        console.log('✅ NEXTAUTH_URL already exists\n')
    }

    console.log('=========================================')
    console.log('SUMMARY')
    console.log('=========================================')
    console.log('✅ Local .env.local is configured!')
    console.log('\n⚠️  IMPORTANT for Vercel:')
    console.log('   You MUST also set NEXTAUTH_SECRET in Vercel!')
    console.log('   Go to: https://vercel.com/dashboard')
    console.log('   → Settings → Environment Variables')
    console.log('   → Add NEXTAUTH_SECRET with the value above')
    console.log('=========================================\n')

} catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
}
