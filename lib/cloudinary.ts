import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
// Note: Environment variables must be set in Vercel
// Configure Cloudinary
// Note: Environment variables must be set in Vercel
// We will configure inside the function to ensure we use trimmed values

/**
 * Upload buffer to Cloudinary
 */
export async function uploadToCloudinary(buffer: Buffer, folder: string = 'graky-store'): Promise<string> {
    // Explicitly check config before uploading
    // Trim to remove any accidental spaces from copy-pasting
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()

    if (!cloudName || !apiKey || !apiSecret) {
        console.error('[Cloudinary] Missing configuration:', {
            cloud_name: !!cloudName,
            api_key: !!apiKey,
            api_secret: !!apiSecret
        })
        throw new Error('Cloudinary configuration is missing. Please check environment variables.')
    }

    // Configure with trimmed values
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    })

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
