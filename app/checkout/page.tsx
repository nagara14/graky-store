'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/app/components/CartContext'
import { useLoading } from '@/app/context/LoadingContext'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, total, clear } = useCart()
  const { showLoading, hideLoading } = useLoading()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postal: '',
    phone: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/checkout')
    }
  }, [status, router])

  // Loading state
  if (status === 'loading') {
    return <div className="text-center py-12">Loading...</div>
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return null
  }

  // Cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-graky-dark font-semibold mb-4">Keranjang Anda kosong</p>
        <Link href="/keranjang" className="text-graky-brown hover:text-graky-dark">
          ← Kembali ke Keranjang
        </Link>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    showLoading('Memproses pembayaran...')

    try {
      if (!formData.address || !formData.city || !formData.postal || !formData.phone) {
        setError('Semua field harus diisi')
        setLoading(false)
        hideLoading()
        return
      }

      // Call checkout-pay API
      const res = await axios.post('/api/checkout-pay', {
        shippingData: formData,
      })

      // Clear cart
      await clear()

      hideLoading()

      // Redirect to HitPay Payment Page
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl
      } else {
        // Fallback if no payment URL (should not happen with HitPay)
        router.push(`/order-confirmation/${res.data.orderId}`)
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.response?.data?.error || err.message || 'Gagal membuat pesanan')
      hideLoading()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/keranjang" className="text-graky-brown hover:text-graky-dark">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-graky-dark">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-graky-dark">Alamat Pengiriman</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-graky-dark mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Jl. Example No. 123, Apt. 4B"
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-graky-dark mb-2">
                    Kota *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Jakarta"
                    className="w-full px-4 py-2 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-graky-dark mb-2">
                    Kode Pos *
                  </label>
                  <input
                    type="text"
                    name="postal"
                    value={formData.postal}
                    onChange={handleChange}
                    placeholder="12345"
                    className="w-full px-4 py-2 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-graky-dark mb-2">
                  Nomor Telepon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  className="w-full px-4 py-2 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-graky-dark text-white py-3 rounded-lg hover:bg-graky-charcoal transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Lanjut ke Pembayaran'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-graky-dark mb-4">Pesanan Anda</h2>

          <div className="space-y-3 mb-6 pb-6 border-b border-graky-brown/20 max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div key={item.cartId} className="text-sm">
                <p className="font-semibold text-graky-dark line-clamp-1">
                  {item.product.name}
                </p>
                <div className="flex justify-between text-graky-brown/70">
                  <span>{item.quantity}x</span>
                  <span>Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-6 pb-6 border-b border-graky-brown/20">
            <div className="flex justify-between text-sm">
              <span className="text-graky-brown/70">Subtotal</span>
              <span className="font-semibold">Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-graky-brown/70">Ongkir</span>
              <span className="font-semibold text-amber-600">Dihitung kemudian</span>
            </div>
          </div>

          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-graky-dark">
              Rp {total.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
