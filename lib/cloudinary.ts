import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
// Note: Environment variables must be set in Vercel
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

/**
 * Upload buffer to Cloudinary
 */
export async function uploadToCloudinary(buffer: Buffer, folder: string = 'graky-store'): Promise<string> {
    // Explicitly check config before uploading
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
        console.error('[Cloudinary] Missing configuration:', {
            cloud_name: !!cloudName,
            api_key: !!apiKey,
            api_secret: !!apiSecret
        })
        throw new Error('Cloudinary configuration is missing. Please check environment variables.')
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('[Cloudinary] Upload error:', error)
                    reject(new Error(error.message || 'Unknown Cloudinary Error'))
                } else {
                    resolve(result?.secure_url || '')
                }
            }
        )

        uploadStream.end(buffer)
    })
}
