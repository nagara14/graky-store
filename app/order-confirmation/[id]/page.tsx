'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/${orderId}`)
        setOrder(res.data)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  if (loading) return <div className="text-center py-12">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg p-8 text-center space-y-6">
        <CheckCircle size={64} className="mx-auto text-green-500" />
        <h1 className="text-3xl font-bold text-graky-dark">Pesanan Berhasil!</h1>
        <p className="text-graky-brown/70">
          Terima kasih telah berbelanja di Graky Store
        </p>

        {order && (
          <div className="bg-graky-tan/10 rounded-lg p-6 text-left space-y-3 my-6">
            <div className="flex justify-between">
              <span className="text-graky-brown/70">No. Pesanan</span>
              <span className="font-semibold text-graky-dark">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-graky-brown/70">Total</span>
              <span className="font-bold text-graky-dark">
                Rp {order.totalAmount?.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-graky-brown/70">Status</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-semibold">
                {order.orderStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-graky-brown/70">Alamat Pengiriman</span>
              <span className="font-semibold text-graky-dark text-right max-w-xs">
                {order.shippingAddress}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link
            href="/riwayat-pesanan"
            className="bg-graky-dark text-white px-6 py-2 rounded-lg hover:bg-graky-charcoal transition font-semibold"
          >
            Lihat Pesanan
          </Link>
          <Link
            href="/"
            className="border border-graky-brown text-graky-brown px-6 py-2 rounded-lg hover:bg-graky-brown/10 transition font-semibold"
          >
            Kembali Home
          </Link>
        </div>
      </div>
    </div>
  )
}
