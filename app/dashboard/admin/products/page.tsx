'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import axios from 'axios'

interface Product {
  id: string
  name: string
  categoryId: string
  condition: string
  price: number
  userId: string
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, usersRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/users'),
      ])
      setProducts(productsRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return
    try {
      await axios.delete(`/api/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Unknown'
  }

  const filteredProducts = filter === 'all'
    ? products
    : products.filter(p => p.condition === filter)

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-graky-dark">Manajemen Produk</h1>
        <p className="text-graky-brown/70">Total: {products.length} produk</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Semua' },
          { value: 'A', label: 'Kondisi A' },
          { value: 'B', label: 'Kondisi B' },
          { value: 'C', label: 'Kondisi C' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === opt.value
                ? 'bg-graky-dark text-white'
                : 'bg-white border-2 border-graky-brown/20 text-graky-dark hover:border-graky-brown'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-graky-tan/20">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Nama Produk</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Dibuat Oleh</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Kondisi</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Harga</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Tanggal</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-graky-dark">{product.name}</td>
                <td className="px-6 py-4 text-sm text-graky-brown/70">{getUserName(product.userId)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.condition === 'A' ? 'bg-green-100 text-green-700' :
                    product.condition === 'B' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Kondisi {product.condition}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-graky-dark">
                  Rp {product.price.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 text-sm text-graky-brown/70">
                  {new Date(product.createdAt).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-graky-brown/70">
            Tidak ada produk
          </div>
        )}
      </div>
    </div>
  )
}
