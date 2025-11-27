import type { Metadata } from 'next'
import { Suspense } from 'react'
import SessionWrapper from "./providers/SessionWrapper"
import Footer from './components/Footer'
import { CartProvider } from './components/CartContext'
import { LoadingProvider } from './context/LoadingContext'
import { ThemeProvider } from './context/ThemeContext'
import GlobalLoader from './components/GlobalLoader'
import InitialLoadingOverlay from './components/InitialLoadingOverlay'
import { initializeDatabase } from '@/lib/db'
import NavbarWrapper from './components/NavbarWrapper'
import BottomNavWrapper from './components/BottomNavWrapper'
import WhatsAppFloat from './components/WhatsAppFloat'
import './globals.css'

export const metadata: Metadata = {
  title: 'Graky Store',
  description: 'Toko online Graky - Vintage & Thrifting',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize DB with reduced timeout - balance between speed and reliability
  try {
    const initPromise = initializeDatabase()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB init timeout')), 1000)
    )

    await Promise.race([initPromise, timeoutPromise]).catch(error => {
      console.warn('[Layout] DB init failed (non-blocking):', error.message || error)
    })
  } catch (error) {
    console.warn('[Layout] DB init error (non-blocking):', error)
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <SessionWrapper>
          <ThemeProvider>
            <CartProvider>
              <LoadingProvider>
                <InitialLoadingOverlay />
                <GlobalLoader />
                <NavbarWrapper />
                <main className="min-h-screen pb-16 md:pb-0">
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-graky-brown dark:border-graky-tan mx-auto mb-4"></div>
                        <p className="text-graky-brown dark:text-dark-text-muted">Loading...</p>
                      </div>
                    </div>
                  }>
                    {children}
                  </Suspense>
                </main>
                <Footer />
                <BottomNavWrapper />
                <WhatsAppFloat />
              </LoadingProvider>
            </CartProvider>
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  )
}
