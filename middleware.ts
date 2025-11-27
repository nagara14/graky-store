import { NextRequest, NextResponse } from 'next/server'

// Replace previous implementation that imported `next-auth/middleware`
// with a minimal middleware that won't crash the runtime.
// If you need route protection, implement session checks inside server
// routes (using lib/auth.auth()) or client-side redirects.
export default function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname

	// Allow all Next.js assets and public files through
	if (
		pathname.startsWith('/_next/') ||
		pathname.startsWith('/static/') ||
		pathname.startsWith('/favicon.ico') ||
		pathname.startsWith('/api/auth/session') || // allow session endpoint
		pathname.startsWith('/api/') // keep API requests reaching handlers
	) {
		return NextResponse.next()
	}

	// Optional: redirect logged-in-only pages to login here if you have a reliable cookie/session check.
	// For now, just continue.
	return NextResponse.next()
}

export const config = {
	// match all routes except Next.js internals (same as before)
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
