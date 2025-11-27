import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlStart: process.env.DATABASE_URL?.substring(0, 30),
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        nodeEnv: process.env.NODE_ENV,
    })
}
