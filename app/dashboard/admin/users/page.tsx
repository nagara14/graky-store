'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2 } from 'lucide-react'
import axios from 'axios'
import CreateUserModal from './components/CreateUserModal'
import EditUserModal from './components/EditUserModal'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'KARYAWAN' | 'USER'
  isActive: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users')
      setUsers(res.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return
    try {
      await axios.delete(`/api/users/${id}`)
      setUsers(users.filter(u => u.id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleUserCreated = () => {
    setShowCreateModal(false)
    fetchUsers()
  }

  const handleUserUpdated = () => {
    setEditingUser(null)
    fetchUsers()
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-graky-dark">Manajemen User</h1>
          <p className="text-graky-brown/70">Total: {users.length} user</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-graky-dark text-white px-4 py-2 rounded-lg hover:bg-graky-charcoal transition"
        >
          <Plus size={20} />
          Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-graky-tan/20">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Nama</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4 text-sm text-graky-brown/70">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    user.role === 'KARYAWAN' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
