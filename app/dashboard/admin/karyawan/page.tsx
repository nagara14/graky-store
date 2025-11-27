'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import axios from 'axios'
import CreateUserModal from '../users/components/CreateUserModal'
import EditUserModal from '../users/components/EditUserModal'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'KARYAWAN' | 'USER'
  isActive: boolean
  createdAt: string
}

export default function KaryawanPage() {
  const [karyawan, setKaryawan] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchKaryawan()
  }, [])

  const fetchKaryawan = async () => {
    try {
      const res = await axios.get('/api/users')
      const karyawanList = res.data.filter((u: User) => u.role === 'KARYAWAN')
      setKaryawan(karyawanList)
    } catch (error) {
      console.error('Error fetching karyawan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus karyawan ini?')) return
    try {
      await axios.delete(`/api/users/${id}`)
      setKaryawan(karyawan.filter(k => k.id !== id))
    } catch (error) {
      console.error('Error deleting karyawan:', error)
    }
  }

  const handleUserCreated = () => {
    setShowCreateModal(false)
    fetchKaryawan()
  }

  const handleUserUpdated = () => {
    setEditingUser(null)
    fetchKaryawan()
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-graky-dark">Manajemen Karyawan</h1>
          <p className="text-graky-brown/70">Total: {karyawan.length} karyawan</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-graky-dark text-white px-4 py-2 rounded-lg hover:bg-graky-charcoal transition"
        >
          <Plus size={20} />
          Tambah Karyawan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-graky-tan/20">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Nama</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Bergabung</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {karyawan.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-graky-dark">{k.name}</td>
                <td className="px-6 py-4 text-sm text-graky-brown/70">{k.email}</td>
                <td className="px-6 py-4">
                  <span className={k.isActive ? 'text-green-600' : 'text-red-600'}>
                    {k.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-graky-brown/70">
                  {new Date(k.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => setEditingUser(k)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {karyawan.length === 0 && (
          <div className="text-center py-12 text-graky-brown/70">
            Belum ada karyawan
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleUserCreated}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleUserUpdated}
        />
      )}
    </div>
  )
}
