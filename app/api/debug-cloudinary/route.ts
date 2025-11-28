import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export async function GET() {
    // Check env vars presence (masked)
    const envCheck = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
        api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing',
        node_env: process.env.NODE_ENV
    }

    // Try to configure
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })

        // Try a simple ping or check (Cloudinary doesn't have a simple ping, but we can check config)
        const config = cloudinary.config()

        return NextResponse.json({
            status: 'Debug Info',
            env: envCheck,
            configCheck: {
                cloud_name: config.cloud_name ? '✅ Configured' : '❌ Missing in config',
                api_key: config.api_key ? '✅ Configured' : '❌ Missing in config',
            }
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'Error',
            error: error.message
        }, { status: 500 })
    }
}
