'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'

interface CreateUserModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateUserModal({ onClose, onSuccess }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'KARYAWAN',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.post('/api/users', formData)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal membuat user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-graky-dark">Tambah User Baru</h2>
          <button onClick={onClose} className="text-graky-brown/70 hover:text-graky-dark">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Nama
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              className="w-full px-4 py-2 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
            >
              <option value="ADMIN">Admin</option>
              <option value="KARYAWAN">Karyawan</option>
              <option value="USER">User</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-graky-brown/20 rounded-lg hover:bg-gray-50 transition font-semibold text-graky-dark"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-graky-dark text-white rounded-lg hover:bg-graky-charcoal transition font-semibold disabled:opacity-50"
            >
              {loading ? 'Membuat...' : 'Buat User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
