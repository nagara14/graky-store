'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { Star, ChevronDown, Send } from 'lucide-react'

export default function OrderHistoryPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [reviewData, setReviewData] = useState<Record<string, { rating: number; reviewText: string }>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchOrders()
  }, [session, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/orders')
      setOrders(res.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (orderId: string) => {
    const review = reviewData[orderId]
    if (!review || !review.rating) {
      alert('Silakan berikan rating terlebih dahulu')
      return
    }

    try {
      setSubmitting(true)
      const res = await axios.post(`/api/orders/${orderId}`, {
        rating: review.rating,
        reviewText: review.reviewText || ''
      })

      if (res.data?.success) {
        await fetchOrders()
        setExpandedOrder(null)
        setReviewData(prev => {
          const newData = { ...prev }
          delete newData[orderId]
          return newData
        })
      }
    } catch (error: any) {
      console.error('Error submitting review:', error)
      alert(error.response?.data?.error || 'Gagal menyimpan review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-graky-dark mb-2">Riwayat Pesanan</h1>
      <p className="text-graky-brown/70 mb-8">{orders.length} pesanan</p>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-graky-dark font-semibold mb-4">Belum ada pesanan</p>
            <Link
              href="/"
              className="inline-block bg-graky-dark text-white px-6 py-2 rounded-lg hover:bg-graky-charcoal transition"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full p-6 text-left hover:bg-gray-50 transition flex justify-between items-center"
              >
                <div className="grid md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <p className="text-xs text-graky-brown/70">No. Pesanan</p>
                    <p className="font-semibold text-graky-dark">{order.id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-xs text-graky-brown/70">Tanggal</p>
                    <p className="font-semibold text-graky-dark">
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-graky-brown/70">Total</p>
                    <p className="font-bold text-graky-dark">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-graky-brown/70">Status</p>
                    <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                      order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      order.orderStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                      order.orderStatus === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                      order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-graky-brown transition transform ${
                    expandedOrder === order.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded Detail Section */}
              {expandedOrder === order.id && (
                <div className="border-t border-graky-brown/10 p-6 space-y-6 bg-gray-50">
                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-graky-dark mb-3">Item Pesanan</h3>
                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-graky-dark">{item.product?.name} x{item.quantity}</span>
                          <span className="font-semibold text-graky-dark">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h3 className="font-semibold text-graky-dark mb-2">Alamat Pengiriman</h3>
                    <p className="text-sm text-graky-dark">
                      {order.shippingAddress}, {order.shippingCity}, {order.shippingPostal}
                    </p>
                  </div>

                  {/* Karyawan Notes Section */}
                  {order.notes && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-2">📝 Catatan dari Tim</p>
                      <p className="text-sm text-blue-800">{order.notes}</p>
                    </div>
                  )}

                  {/* Review Section (only if DELIVERED and not reviewed) */}
                  {order.orderStatus === 'DELIVERED' && !order.reviewedAt && (
                    <div className="bg-white rounded-lg p-4 space-y-4 border border-yellow-200">
                      <p className="text-sm font-semibold text-graky-dark">Berikan Rating & Ulasan</p>

                      {/* Star Rating */}
                      <div>
                        <p className="text-xs text-graky-brown/70 mb-2">Rating</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() =>
                                setReviewData(prev => ({
                                  ...prev,
                                  [order.id]: {
                                    ...prev[order.id],
                                    rating: star
                                  }
                                }))
                              }
                              className={`p-2 rounded transition ${
                                (reviewData[order.id]?.rating || 0) >= star
                                  ? 'text-yellow-500'
                                  : 'text-gray-300 hover:text-yellow-300'
                              }`}
                            >
                              <Star size={24} fill="currentColor" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div>
                        <p className="text-xs text-graky-brown/70 mb-2">Ulasan (opsional)</p>
                        <textarea
                          value={reviewData[order.id]?.reviewText || ''}
                          onChange={(e) =>
                            setReviewData(prev => ({
                              ...prev,
                              [order.id]: {
                                ...prev[order.id],
                                reviewText: e.target.value
                              }
                            }))
                          }
                          placeholder="Bagikan pengalaman Anda dengan produk ini..."
                          className="w-full px-3 py-2 border border-graky-brown/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-graky-dark"
                          rows={3}
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={() => handleSubmitReview(order.id)}
                        disabled={submitting}
                        className="w-full bg-graky-dark text-white py-2 rounded-lg font-semibold hover:bg-graky-charcoal transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        <Send size={16} />
                        {submitting ? 'Mengirim...' : 'Kirim Review'}
                      </button>
                    </div>
                  )}

                  {/* Existing Review Display */}
                  {order.reviewedAt && (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-sm font-semibold text-graky-dark mb-2">✓ Review Anda</p>
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < (order.rating || 0) ? '#FFB800' : '#D1D5DB'}
                            color={i < (order.rating || 0) ? '#FFB800' : '#D1D5DB'}
                          />
                        ))}
                      </div>
                      {order.reviewText && (
                        <p className="text-sm text-graky-dark">{order.reviewText}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
