'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLoading } from '@/app/context/LoadingContext'
import axios from 'axios'
import { CheckCircle2, ChevronDown, Save, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface OrderDetail {
  id: string
  totalAmount: number
  orderStatus: string
  paymentStatus: string
  shippingAddress: string
  shippingCity: string
  shippingPostal: string
  shippingPhone: string
  notes?: string
  createdAt: string
  processedAt?: string
  user: {
    id: string
    name: string
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      id: string
      name: string
    }
  }>
  processedBy?: {
    name: string
  }
}

export default function DetailPesananPage() {
  const params = useParams()
  const router = useRouter()
  const { showLoading, hideLoading } = useLoading()
  const orderId = params.id as string
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orderStatus, setOrderStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  useEffect(() => {
    if (order) {
      setOrderStatus(order.orderStatus)
      setPaymentStatus(order.paymentStatus)
      setNotes(order.notes || '')
    }
  }, [order])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/orders/admin/${orderId}`)
      setOrder(response.data)
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Gagal mengambil detail pesanan')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      showLoading('Menyimpan perubahan...')

      await axios.patch(`/api/orders/admin/${orderId}`, {
        orderStatus,
        paymentStatus,
        notes
      })

      setSuccess('Pesanan berhasil diupdate!')
      hideLoading()
      setTimeout(() => {
        fetchOrder()
      }, 1000)
    } catch (error: any) {
      console.error('Error updating order:', error)
      setError(error.response?.data?.error || 'Gagal mengupdate pesanan')
      hideLoading()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setError('')
      showLoading('Menghapus pesanan...')

      await axios.delete(`/api/orders/admin/${orderId}`)

      hideLoading()
      setSuccess('Pesanan berhasil dihapus!')
      
      // Redirect to pesanan list after 1.5 seconds
      setTimeout(() => {
        router.push('/dashboard/karyawan/pesanan')
      }, 1500)
    } catch (error: any) {
      console.error('Error deleting order:', error)
      setError(error.response?.data?.error || 'Gagal menghapus pesanan')
      hideLoading()
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-graky-brown">Memuat detail pesanan...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold">Pesanan tidak ditemukan</p>
      </div>
    )
  }

  const getStatusBadge = (status: string, type: 'order' | 'payment') => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PROCESSING: 'bg-blue-100 text-blue-700',
      SHIPPED: 'bg-purple-100 text-purple-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PAID: 'bg-green-100 text-green-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <Link href="/dashboard/karyawan/pesanan" className="inline-flex items-center gap-2 text-graky-dark hover:text-graky-dark/70 font-semibold">
          <ArrowLeft size={20} />
          Kembali
        </Link>
        
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 px-4 py-2 rounded-lg transition"
        >
          <Trash2 size={20} />
          Hapus Pesanan
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 space-y-4">
            <h3 className="text-xl font-bold text-red-600">Hapus Pesanan?</h3>
            <p className="text-graky-brown/80">
              Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={20} />
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-graky-brown/70">No. Pesanan</p>
                <p className="text-lg font-mono font-bold text-graky-dark">{order.id}</p>
              </div>
              <p className="text-sm text-graky-brown/70">
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-bold text-graky-dark">Update Status</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-graky-dark mb-2">
                  Status Pesanan
                </label>
                <div className="relative">
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="appearance-none w-full bg-white border border-graky-brown/30 rounded-lg px-4 py-2 pr-10 text-graky-dark focus:outline-none focus:ring-2 focus:ring-graky-dark"
                  >
                    <option value="PENDING">Tertunda</option>
                    <option value="PROCESSING">Diproses</option>
                    <option value="SHIPPED">Dikirim</option>
                    <option value="DELIVERED">Terkirim</option>
                    <option value="CANCELLED">Dibatalkan</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-graky-brown/50 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-graky-dark mb-2">
                  Status Pembayaran
                </label>
                <div className="relative">
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="appearance-none w-full bg-white border border-graky-brown/30 rounded-lg px-4 py-2 pr-10 text-graky-dark focus:outline-none focus:ring-2 focus:ring-graky-dark"
                  >
                    <option value="PENDING">Tertunda</option>
                    <option value="CONFIRMED">Dikonfirmasi</option>
                    <option value="PAID">Dibayar</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-graky-brown/50 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-graky-dark mb-2">
                💬 Catatan untuk Pelanggan
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Barang sedang dikemas... Barang sudah dikirim via JNE..."
                className="w-full border border-graky-brown/30 rounded-lg px-4 py-3 text-graky-dark placeholder-graky-brown/50 focus:outline-none focus:ring-2 focus:ring-graky-dark"
                rows={4}
              />
              <p className="text-xs text-graky-brown/60 mt-1">Catatan ini akan terlihat oleh pelanggan di halaman riwayat pesanan mereka</p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-graky-dark text-white font-semibold py-3 rounded-lg hover:bg-graky-charcoal transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-graky-dark">Item Pesanan</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-graky-brown/10 last:border-0">
                  <div>
                    <p className="font-semibold text-graky-dark">{item.product.name}</p>
                    <p className="text-sm text-graky-brown/70">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-graky-dark">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-bold text-graky-dark">Informasi Pelanggan</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-graky-brown/70">Nama</p>
                <p className="font-semibold text-graky-dark">{order.user.name}</p>
              </div>
              <div>
                <p className="text-graky-brown/70">Email</p>
                <p className="font-semibold text-graky-dark break-all">{order.user.email}</p>
              </div>
              <div>
                <p className="text-graky-brown/70">Telepon</p>
                <p className="font-semibold text-graky-dark">{order.shippingPhone}</p>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-bold text-graky-dark">Alamat Pengiriman</h3>
            <div className="space-y-2 text-sm">
              <p className="text-graky-dark">{order.shippingAddress}</p>
              <p className="text-graky-dark">{order.shippingCity}</p>
              <p className="text-graky-dark">{order.shippingPostal}</p>
            </div>
          </div>

          {/* Display Current Notes */}
          {order?.notes && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold mb-2">Catatan Saat Ini</p>
              <p className="text-sm text-blue-900">{order.notes}</p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-graky-tan/10 rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-graky-dark">Ringkasan</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-graky-brown/70">Total</span>
                <span className="font-bold text-graky-dark">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="pt-3 border-t border-graky-brown/20 space-y-3">
                <div>
                  <p className="text-xs text-graky-brown/70 mb-1">Status Pesanan</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.orderStatus, 'order')}`}>
                    {order.orderStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-graky-brown/70 mb-1">Status Pembayaran</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.paymentStatus, 'payment')}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
