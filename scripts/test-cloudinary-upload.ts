import { v2 as cloudinary } from 'cloudinary'

// GANTI DENGAN CREDENTIALS ANDA DARI VERCEL/DASHBOARD
const CLOUD_NAME = 'dh9tfdjpl'
const API_KEY = '628222914186412'
// Masukkan API Secret Anda di sini (jangan di-commit)
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'PASTE_YOUR_SECRET_HERE_IF_LOCAL'

console.log('Testing Cloudinary Connection...')
console.log('Cloud Name:', CLOUD_NAME)
console.log('API Key:', API_KEY)

if (API_SECRET === 'PASTE_YOUR_SECRET_HERE_IF_LOCAL') {
    console.error('❌ ERROR: Harap masukkan API SECRET di script atau set env var CLOUDINARY_API_SECRET')
    process.exit(1)
}

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
})

async function testUpload() {
    try {
        console.log('Mencoba upload test image...')
        // Upload gambar 1x1 pixel transparan base64
        const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', {
            folder: 'test-upload',
        })
        console.log('✅ UPLOAD BERHASIL!')
        console.log('URL:', result.secure_url)
    } catch (error: any) {
        console.error('❌ UPLOAD GAGAL!')
        console.error('Error Detail:', error.message || error)
    }
}

testUpload()
