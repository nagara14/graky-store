'use client'

import { useEffect, useState } from 'react'
import CustomLoader from './CustomLoader'

export default function InitialLoadingOverlay() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Hide immediately if page is already ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setIsLoading(false)
      return
    }

    const handleLoad = () => {
      setIsLoading(false)
    }

    window.addEventListener('load', handleLoad)

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  return <CustomLoader show={isLoading} message="Memuat..." />
}
