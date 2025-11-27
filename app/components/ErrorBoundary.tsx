'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-graky-cream">
      <div className="text-center space-y-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-graky-dark">Terjadi Kesalahan</h1>
        <p className="text-graky-brown/70 max-w-md">
          {error.message || 'Maaf, ada masalah saat memuat halaman ini'}
        </p>
        <button
          onClick={() => reset()}
          className="bg-graky-dark text-white px-6 py-2 rounded-lg hover:bg-graky-charcoal transition font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
