'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/app/components/CartContext'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function CartPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, total, removeItem, updateQuantity } = useCart()

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
    }
  }, [session, router])

  if (!session) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-graky-brown hover:text-graky-dark">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-graky-dark">Keranjang Belanja</h1>
          <p className="text-graky-brown/70">{items.length} item</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-graky-dark font-semibold mb-4">Keranjang Anda kosong</p>
              <Link
                href="/"
                className="inline-block bg-graky-dark text-white px-6 py-2 rounded-lg hover:bg-graky-charcoal transition"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartId} className="bg-white rounded-lg p-4 sm:p-6 flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.photoUrl || '/placeholder.jpg'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produk/${item.product.id}`}
                    className="text-graky-dark font-semibold hover:text-graky-brown text-sm sm:text-base line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-graky-brown/70 text-xs sm:text-sm mt-1">
                    Grade {item.product.condition}
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-graky-dark mt-2">
                    Rp {item.product.price.toLocaleString('id-ID')}
                  </p>

                  {/* Quantity & Price */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                      className="px-2 py-1 border border-graky-brown/20 rounded hover:border-graky-brown text-sm"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 bg-graky-tan/20 rounded text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                      className="px-2 py-1 border border-graky-brown/20 rounded hover:border-graky-brown text-sm"
                    >
                      +
                    </button>
                    <span className="ml-auto font-semibold text-graky-dark">
                      Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-graky-dark mb-6">Ringkasan</h2>

            <div className="space-y-3 mb-6 pb-6 border-b border-graky-brown/20">
              <div className="flex justify-between text-sm text-graky-brown/70">
                <span>Subtotal</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm text-graky-brown/70">
                <span>Ongkir</span>
                <span>Dihitung saat checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 text-lg">
              <span className="font-semibold text-graky-dark">Total</span>
              <span className="font-bold text-graky-dark">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-graky-dark text-white text-center py-3 rounded-lg hover:bg-graky-charcoal transition font-semibold"
            >
              Lanjut ke Checkout
            </Link>

            <Link
              href="/"
              className="block w-full text-center py-3 mt-3 border border-graky-brown/20 text-graky-brown rounded-lg hover:bg-graky-brown/10 transition text-sm font-semibold"
            >
              Lanjut Belanja
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
