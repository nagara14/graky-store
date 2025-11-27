'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/app/context/LoadingContext'
import { User, Mail, Lock, Loader } from 'lucide-react'
import GoogleLoginButton from './GoogleLoginButton'

export default function RegisterForm() {
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    showLoading('Mendaftar...')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registrasi gagal')
        hideLoading()
        return
      }

      setSuccess(true)
      hideLoading()
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
    } catch (error) {
      setError('Terjadi kesalahan, coba lagi')
      console.error(error)
      hideLoading()
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
        ✓ Registrasi berhasil! Redirecting...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-graky-dark mb-2">Nama</label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-graky-brown/50" size={20} />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nama lengkap"
            className="w-full pl-10 pr-4 py-2 border border-graky-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-graky-dark"
            disabled={loading}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-graky-dark mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-graky-brown/50" size={20} />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
            className="w-full pl-10 pr-4 py-2 border border-graky-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-graky-dark"
            disabled={loading}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-graky-dark mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-graky-brown/50" size={20} />
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min 8 karakter (huruf besar, kecil, angka)"
            className="w-full pl-10 pr-4 py-2 border border-graky-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-graky-dark"
            disabled={loading}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-graky-dark mb-2">Konfirmasi Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-graky-brown/50" size={20} />
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Konfirmasi password"
            className="w-full pl-10 pr-4 py-2 border border-graky-brown/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-graky-dark"
            disabled={loading}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-graky-dark text-white py-2 rounded-lg font-semibold hover:bg-graky-charcoal transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader size={18} className="animate-spin" />}
        {loading ? 'Mendaftar...' : 'Daftar'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-graky-brown/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-graky-cream text-graky-brown/70">
            Atau daftar dengan
          </span>
        </div>
      </div>

      <GoogleLoginButton />
    </form>
  )
}
