'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Package, Trash2, Edit2 } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  categoryId: string
  condition: string
  price: number
  createdAt: string
}

const categoryMap: Record<string, string> = {
  'cat-topi': 'Topi',
  'cat-kaos': 'Kaos',
  'cat-kemeja': 'Kemeja',
  'cat-jacket': 'Jacket',
  'cat-hoodie': 'Hoodie',
  'cat-celana-jeans': 'Celana Jeans',
  'cat-celana-pendek': 'Celana Pendek',
  'cat-sepatu': 'Sepatu',
}

export default function KaryawanDashboard() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products')
      const userProducts = res.data.filter((p: any) => p.userId === session?.user?.id)
      setProducts(userProducts)
      setStats({
        totalProducts: userProducts.length,
        totalValue: userProducts.reduce((sum: number, p: Product) => sum + p.price, 0),
      })
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return
    try {
      await axios.delete(`/api/products/${id}`)
      setProducts(products.filter(p => p.id !== id))
      setStats({
        totalProducts: products.length - 1,
        totalValue: products.reduce((sum: number, p: Product) => sum + (p.id === id ? 0 : p.price), 0),
      })
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-graky-dark">Dashboard Karyawan</h1>
        <p className="text-sm sm:text-base text-graky-brown/70">Kelola produk etalase Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-graky-brown/70 mb-1">Total Produk</p>
              <p className="text-2xl sm:text-3xl font-bold text-graky-dark">{stats.totalProducts}</p>
            </div>
            <div className="bg-purple-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Package size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-graky-brown/70 mb-1">Total Nilai Produk</p>
              <p className="text-xl sm:text-3xl font-bold text-graky-dark truncate">
                Rp {stats.totalValue.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <Package size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Produk List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-graky-dark">Produk Saya</h2>
          <Link
            href="/dashboard/karyawan/produk/create"
            className="w-full sm:w-auto bg-graky-dark text-white px-4 py-2 rounded-lg hover:bg-graky-charcoal transition text-center text-sm sm:text-base"
          >
            + Tambah Produk
          </Link>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-graky-dark truncate">{product.name}</p>
                  <p className="text-xs text-graky-brown/70">{categoryMap[product.categoryId] || product.categoryId}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${product.condition === 'A' ? 'bg-green-100 text-green-700' :
                    product.condition === 'B' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                  }`}>
                  Kondisi {product.condition}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-graky-brown/70">Harga</p>
                  <p className="font-semibold text-graky-dark">Rp {product.price.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-graky-brown/70">Tanggal</p>
                  <p className="font-semibold text-graky-dark">{new Date(product.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Link
                  href={`/dashboard/karyawan/produk/${product.id}/edit`}
                  className="flex-1 p-2 text-center text-blue-600 hover:bg-blue-50 rounded transition text-sm font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 p-2 text-center text-red-600 hover:bg-red-50 rounded transition text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-8 text-graky-brown/70">
              <p className="mb-3">Belum ada produk</p>
              <Link href="/dashboard/karyawan/produk/create" className="text-graky-brown font-semibold hover:underline">
                Buat sekarang
              </Link>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-graky-tan/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Nama Produk</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Kategori</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Kondisi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Harga</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-graky-dark">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-graky-dark">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-graky-brown/70">
                      {categoryMap[product.categoryId] || product.categoryId}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${product.condition === 'A' ? 'bg-green-100 text-green-700' :
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
                    <td className="px-6 py-4 flex gap-2">
                      <Link
                        href={`/dashboard/karyawan/produk/${product.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit2 size={18} />
                      </Link>
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
            {products.length === 0 && (
              <div className="text-center py-12 text-graky-brown/70">
                Belum ada produk. <Link href="/dashboard/karyawan/produk/create" className="text-graky-brown font-semibold hover:underline">Buat sekarang</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
