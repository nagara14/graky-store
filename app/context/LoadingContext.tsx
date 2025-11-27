'use client'

import { createContext, useContext, useState, useRef } from 'react'

interface LoadingContextType {
  isLoading: boolean
  message: string
  showLoading: (message?: string) => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showLoading = (msg?: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setMessage(msg || '')
    setIsLoading(true)

    // Auto-hide loading after 10 seconds as safety measure
    timeoutRef.current = setTimeout(() => {
      console.warn('[LoadingContext] Auto-hiding loading after 10s timeout')
      setIsLoading(false)
      setMessage('')
      timeoutRef.current = null
    }, 10000)
  }

  const hideLoading = () => {
    // Clear timeout if exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setIsLoading(false)
    setMessage('')
  }

  return (
    <LoadingContext.Provider value={{ isLoading, message, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}
