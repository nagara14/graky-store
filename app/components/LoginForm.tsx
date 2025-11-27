'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/app/context/LoadingContext'
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react'
import GoogleLoginButton from './GoogleLoginButton'

export default function LoginForm() {
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError('')
    showLoading('Masuk...')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('=== SIGNIN RESULT ===', result)

      // Check BOTH ok field and error field (NextAuth bug fix)
      if (!result?.ok || result?.error) {
        console.log('=== LOGIN FAILED ===')
        const errorMessage = result?.error === 'CredentialsSignin'
          ? 'Email atau password salah!'
          : result?.error === 'DatabaseConnectionError'
            ? 'Gagal terhubung ke database! Pastikan XAMPP MySQL berjalan.'
            : result?.error === 'DatabaseError'
              ? 'Terjadi kesalahan database.'
              : (result?.error || 'Login gagal, coba lagi')
        setError(errorMessage)
        setLoading(false)

        setTimeout(() => {
          hideLoading()
        }, 300)
        return
      }

      // Login success
      const session = await getSession()
      const role = (session?.user as any)?.role

      // Hide loading BEFORE redirect
      hideLoading()
      setLoading(false)

      // Small delay to ensure loading is hidden
      setTimeout(() => {
        if (role === 'ADMIN') {
          window.location.href = '/dashboard/admin'
        } else if (role === 'KARYAWAN') {
          window.location.href = '/dashboard/karyawan'
        } else {
          window.location.href = '/'
        }
      }, 100)
    } catch (error) {
      console.error('=== EXCEPTION IN LOGIN ===', error)
      setError('Terjadi kesalahan, coba lagi')
      setLoading(false)
      hideLoading()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white p-4 rounded-xl shadow-2xl border-2 border-red-400 dark:border-red-500">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">Login Gagal!</h3>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="flex-shrink-0 ml-2 text-white/80 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-graky-dark dark:text-dark-text mb-2">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-graky-brown/50 dark:text-dark-text-muted" size={20} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            className="w-full pl-10 pr-4 py-2.5 border border-graky-brown/20 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-graky-dark dark:focus:ring-graky-tan bg-white dark:bg-dark-surface text-graky-dark dark:text-dark-text"
            disabled={loading}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-graky-dark dark:text-dark-text mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-graky-brown/50 dark:text-dark-text-muted" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-12 py-2.5 border border-graky-brown/20 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-graky-dark dark:focus:ring-graky-tan bg-white dark:bg-dark-surface text-graky-dark dark:text-dark-text"
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-graky-brown/50 dark:text-dark-text-muted hover:text-graky-dark dark:hover:text-dark-text transition"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-graky-dark dark:bg-graky-tan text-white dark:text-dark-bg py-3 rounded-lg font-semibold hover:bg-graky-charcoal dark:hover:bg-graky-brown transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader size={18} className="animate-spin" />}
        {loading ? 'Masuk...' : 'Masuk'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-graky-brown/20 dark:border-dark-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-graky-cream dark:bg-dark-surface text-graky-brown/70 dark:text-dark-text-muted">
            Atau masuk dengan
          </span>
        </div>
      </div>

      <GoogleLoginButton />
    </form>
  )
}
