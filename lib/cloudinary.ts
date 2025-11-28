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
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('[Cloudinary] Upload error:', error)
                    reject(error)
                } else {
                    resolve(result?.secure_url || '')
                }
            }
        )

        uploadStream.end(buffer)
    })
}
