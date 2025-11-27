'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { X } from 'lucide-react'

export default function WelcomeOverlay() {
  const { data: session, status } = useSession()
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)

  useEffect(() => {
    try {
      // Only show welcome if user just logged in (not on page refresh)
      if (status === 'authenticated' && session?.user && !hasShownWelcome) {
        // Check if this is a fresh login by checking sessionStorage
        const lastLoginTime = sessionStorage.getItem('lastWelcomeTime')
        const now = Date.now()
        
        // Show welcome only if last login was more than 5 minutes ago
        if (!lastLoginTime || now - parseInt(lastLoginTime) > 5 * 60 * 1000) {
          setShowWelcome(true)
          setHasShownWelcome(true)
          sessionStorage.setItem('lastWelcomeTime', now.toString())
          
          // Auto-hide after 4 seconds
          const timer = setTimeout(() => {
            setShowWelcome(false)
          }, 4000)
          
          return () => clearTimeout(timer)
        }
      }
    } catch (error) {
      console.error('[WelcomeOverlay] Error:', error)
    }
  }, [status, session, hasShownWelcome])

  if (!showWelcome) return null

  try {
    const userName = session?.user?.name || 'Tamu'

    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-300"></div>
        
        {/* Welcome card - centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="bg-gradient-to-br from-graky-tan via-graky-cream to-graky-tan rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md mx-4 text-center animate-in zoom-in duration-500 relative">
            {/* Close button */}
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-4 right-4 text-graky-brown hover:text-graky-dark transition hover:bg-black/5 p-2 rounded-lg"
              aria-label="Close welcome message"
            >
              <X size={24} />
            </button>
            
            {/* Decorative top element */}
            <div className="mb-6 text-4xl">✨</div>
            
            {/* Welcome text */}
            <h2 className="text-3xl sm:text-4xl font-bold text-graky-dark mb-2">
              Selamat Datang!
            </h2>
            
            {/* Name greeting */}
            <p className="text-xl sm:text-2xl text-graky-brown font-semibold mb-4">
              {userName}
            </p>
            
            {/* Warm message */}
            <p className="text-graky-dark/80 text-base sm:text-lg leading-relaxed mb-6">
              Terima kasih telah berkunjung ke Graky Store. Kami senang melayani Anda dengan koleksi vintage pilihan terbaik.
            </p>
            
            {/* Decorative bottom element */}
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-graky-brown opacity-60"></div>
              <div className="w-2 h-2 rounded-full bg-graky-brown opacity-80"></div>
              <div className="w-2 h-2 rounded-full bg-graky-brown opacity-60"></div>
            </div>
            
            {/* Loading indicator */}
            <div className="mt-6 text-sm text-graky-brown/60">
              Mengalihkan ke beranda...
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('[WelcomeOverlay] Render error:', error)
    return null
  }
}
