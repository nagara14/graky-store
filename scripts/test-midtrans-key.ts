// Test Midtrans configuration
console.log('=========================================')
console.log('MIDTRANS CONFIGURATION CHECK')
console.log('=========================================')

const serverKey = process.env.MIDTRANS_SERVER_KEY
const clientKey = process.env.MIDTRANS_CLIENT_KEY
const isProduction = process.env.MIDTRANS_IS_PRODUCTION

console.log('\n1. SERVER KEY:')
console.log('   Exists:', !!serverKey)
console.log('   Value:', serverKey ? `${serverKey.substring(0, 15)}...` : 'NOT SET')
console.log('   Is default/example:', serverKey === 'SB-Mid-server-YOUR_SERVER_KEY')

console.log('\n2. CLIENT KEY:')
console.log('   Exists:', !!clientKey)
console.log('   Value:', clientKey ? `${clientKey.substring(0, 15)}...` : 'NOT SET')
console.log('   Is default/example:', clientKey === 'SB-Mid-client-YOUR_CLIENT_KEY')

console.log('\n3. ENVIRONMENT:')
console.log('   Production Mode:', isProduction === 'true')
console.log('   Raw Value:', isProduction)

console.log('\n4. KEY VALIDATION:')
if (serverKey && serverKey.startsWith('SB-Mid-server-')) {
    console.log('   ✅ Server Key format looks correct (Sandbox)')
} else if (serverKey && serverKey.startsWith('Mid-server-')) {
    console.log('   ✅ Server Key format looks correct (Production)')
} else {
    console.log('   ❌ Server Key format is INVALID or not set')
}

if (clientKey && clientKey.startsWith('SB-Mid-client-')) {
    console.log('   ✅ Client Key format looks correct (Sandbox)')
} else if (clientKey && clientKey.startsWith('Mid-client-')) {
    console.log('   ✅ Client Key format looks correct (Production)')
} else {
    console.log('   ❌ Client Key format is INVALID or not set')
}

console.log('\n=========================================')
console.log('RECOMMENDATION:')
console.log('=========================================')

if (!serverKey || serverKey === 'SB-Mid-server-YOUR_SERVER_KEY') {
    console.log('❌ CRITICAL: Server key tidak di-set dengan benar!')
    console.log('   Silakan copy key dari Midtrans Dashboard')
    console.log('   Dashboard: https://dashboard.sandbox.midtrans.com/ (sandbox)')
    console.log('   atau: https://dashboard.midtrans.com/ (production)')
}

if (!clientKey || clientKey === 'SB-Mid-client-YOUR_CLIENT_KEY') {
    console.log('❌ CRITICAL: Client key tidak di-set dengan benar!')
    console.log('   Silakan copy key dari Midtrans Dashboard')
}

console.log('=========================================\n')
