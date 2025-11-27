'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'KARYAWAN' | 'USER'
  isActive: boolean
}

interface EditUserModalProps {
  user: User
  onClose: () => void
  onSuccess: () => void
}

export default function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await axios.put(`/api/users/${user.id}`, formData)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal update user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-graky-dark">Edit User</h2>
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
              className="w-full px-4 py-2 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Email (read-only)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50"
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

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 rounded border-graky-brown/20"
              />
              <span className="text-sm font-semibold text-graky-dark">Aktif</span>
            </label>
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
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
