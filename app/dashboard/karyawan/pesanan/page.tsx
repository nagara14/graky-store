'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Eye, ChevronDown, Trash2 } from 'lucide-react'
import { useLoading } from '@/app/context/LoadingContext'

interface Order {
  id: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  shippingCity: string
  user: {
    name: string
    email: string
  }
  createdAt: string
  items: Array<{ id: string }>
}

export default function PesananKaryawanPage() {
  const { showLoading, hideLoading } = useLoading()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('ALL')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [currentPage, filter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/orders/admin', {
        params: {
          status: filter,
          page: currentPage
        }
      })
      setOrders(response.data.orders)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-600',
      CONFIRMED: 'bg-blue-50 text-blue-600',
      PAID: 'bg-green-50 text-green-600'
    }
    return colors[status] || 'bg-gray-50 text-gray-600'
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setIsDeleting(true)
      showLoading('Menghapus pesanan...')
      
      await axios.delete(`/api/orders/admin/${orderId}`)
      
      hideLoading()
      setDeleteConfirm(null)
      
      // Refresh orders list
      fetchOrders()
    } catch (error: any) {
      console.error('Error deleting order:', error)
      hideLoading()
      alert(error.response?.data?.error || 'Gagal menghapus pesanan')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 space-y-4">
            <h3 className="text-xl font-bold text-red-600">Hapus Pesanan?</h3>
            <p className="text-graky-brown/80">
              Apakah Anda yakin ingin menghapus pesanan ini? Data akan hilang selamanya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-graky-dark">Pesanan Masuk</h1>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="appearance-none bg-white border border-graky-brown/30 rounded-lg px-4 py-2 pr-10 text-graky-dark focus:outline-none focus:ring-2 focus:ring-graky-dark"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Tertunda</option>
            <option value="PROCESSING">Diproses</option>
            <option value="SHIPPED">Dikirim</option>
            <option value="DELIVERED">Terkirim</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-graky-brown/50 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-graky-brown">Memuat pesanan...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-graky-dark font-semibold">Tidak ada pesanan</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-graky-tan/20 border-b border-graky-brown/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-graky-dark">
                      No. Pesanan
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-graky-dark">
                      Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-graky-dark">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-graky-dark">
                      Status Pesanan
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-graky-dark">
                      Status Pembayaran
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-graky-dark">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-graky-dark">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graky-brown/10">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-graky-tan/5 transition">
                      <td className="px-6 py-4 text-sm font-mono text-graky-dark">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-graky-dark">
                          {order.user?.name}
                        </div>
                        <div className="text-xs text-graky-brown/70">
                          {order.user?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-graky-dark">
                        Rp {order.totalAmount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-graky-brown/70">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/dashboard/karyawan/pesanan/${order.id}`}
                            className="inline-flex items-center gap-1 text-graky-dark hover:text-graky-dark/70 font-semibold transition text-sm"
                          >
                            <Eye size={16} />
                            Lihat
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(order.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold transition text-sm hover:bg-red-50 px-2 py-1 rounded"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-graky-tan/20 text-graky-dark rounded-lg disabled:opacity-50 hover:bg-graky-tan/30 transition"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-graky-brown">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-graky-tan/20 text-graky-dark rounded-lg disabled:opacity-50 hover:bg-graky-tan/30 transition"
            >
              Selanjutnya
            </button>
          </div>
        </>
      )}
    </div>
  )
}
