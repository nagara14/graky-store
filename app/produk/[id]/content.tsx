'use client'

import { useState } from 'react'
import { Heart, Share2, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/app/components/CartContext'
import ProductGrid from '@/app/components/ProductGrid'
import { getCategoryName } from '@/lib/products'

interface ContentProps {
  product: any
  relatedProducts: any[]
}

export default function ProdukDetailContent({ product, relatedProducts }: ContentProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const { addItem } = useCart()

  const mainImage = product.photoUrls?.[selectedImageIndex] || product.photoUrls?.[0] || '/placeholder.jpg'
  const categoryName = getCategoryName(product.categoryId)

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    try {
      setAddingToCart(true)
      await addItem(product.id, quantity)
      alert('✓ Ditambahkan ke keranjang!')
    } catch (error) {
      alert('❌ Gagal menambah ke keranjang')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    try {
      setAddingToCart(true)
      await addItem(product.id, quantity)
      router.push('/keranjang')
    } catch (error) {
      alert('❌ Gagal menambah ke keranjang')
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm mb-8 text-graky-brown/70">
        <a href="/" className="hover:text-graky-brown">Home</a>
        <span>/</span>
        <a href={`/kategori/${product.categoryId}`} className="hover:text-graky-brown">
          {categoryName}
        </a>
        <span>/</span>
        <span className="text-graky-dark font-semibold">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-12 mb-12 sm:mb-20">
        {/* Product Image */}
        <div className="animate-fade-in">
          <div className="relative overflow-hidden rounded-lg bg-graky-tan/20 dark:bg-dark-border/20 aspect-square mb-4 flex items-center justify-center">
            <img
              src={mainImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${(product.stock ?? 0) === 0 ? 'opacity-40' : ''
                }`}
            />

            {/* Stok Habis Overlay */}
            {(product.stock ?? 0) === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 dark:bg-black/50 z-20">
                <div className="bg-red-500 dark:bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg sm:text-xl shadow-lg">
                  STOK HABIS
                </div>
              </div>
            )}

            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="bg-white/90 dark:bg-dark-surface/90 hover:bg-white dark:hover:bg-dark-surface p-2 sm:p-3 rounded-full shadow transition"
              >
                <Heart
                  size={20}
                  className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-graky-brown dark:text-dark-text-muted'}
                />
              </button>
              <button className="bg-white/90 dark:bg-dark-surface/90 hover:bg-white dark:hover:bg-dark-surface p-2 sm:p-3 rounded-full shadow transition">
                <Share2 size={20} className="text-graky-brown dark:text-dark-text-muted" />
              </button>
            </div>
          </div>

          {/* Image Thumbnails */}
          <div className="grid grid-cols-4 gap-2 relative z-10">
            {product.photoUrls && product.photoUrls.length > 0 ? (
              product.photoUrls.map((url: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition ${selectedImageIndex === i
                    ? 'ring-2 ring-graky-brown dark:ring-graky-tan'
                    : 'hover:ring-2 hover:ring-graky-brown/50 dark:hover:ring-graky-tan/50'
                    }`}
                >
                  <img
                    src={url}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))
            ) : (
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-graky-tan/20 dark:bg-dark-border/20" />
              ))
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="animate-fade-in">
          <div className="mb-6">
            <p className="text-xs sm:text-sm text-graky-brown/70 mb-2">{categoryName}</p>
            <h1 className="text-2xl sm:text-4xl font-bold text-graky-dark mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-graky-brown/70">
                ({product.sold || 0} terjual)
              </span>
            </div>

            <div className="bg-graky-tan/20 rounded-lg p-4 mb-6">
              <p className="text-xs text-graky-brown/60 mb-2">Harga</p>
              <p className="text-2xl sm:text-3xl font-bold text-graky-dark">
                Rp {product.price.toLocaleString('id-ID')}
              </p>
              {product.originalPrice && (
                <p className="text-sm text-graky-brown/50 line-through mt-2">
                  Rp {product.originalPrice.toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>

          {/* Condition Badge */}
          <div className="mb-6">
            <p className="text-xs text-graky-brown/70 mb-2">Kondisi</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${product.condition === 'A' ? 'bg-green-100 text-green-700' :
              product.condition === 'B' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
              Kondisi {product.condition}
            </span>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-graky-dark mb-3">Deskripsi</h2>
            <p className="text-graky-brown/70 leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>
          </div>

          {/* Sizes */}
          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-graky-dark dark:text-dark-text flex items-center gap-2">
                  Ukuran
                  <span className="text-xs font-normal text-graky-brown/60 dark:text-dark-text-muted bg-graky-tan/20 dark:bg-dark-surface px-2 py-0.5 rounded-full">
                    {product.sizes.length} varian
                  </span>
                </h2>
                <button
                  className="text-xs text-graky-brown hover:underline dark:text-graky-tan"
                  onClick={() => setSelectedSize('')}
                >
                  Reset
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size: string) => {
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        relative min-w-[3rem] px-4 py-3 flex items-center justify-center rounded-lg transition-all duration-200
                        font-medium text-sm sm:text-base group
                        ${isSelected
                          ? 'bg-graky-dark dark:bg-graky-tan text-white dark:text-dark-bg shadow-md ring-2 ring-graky-dark/20 dark:ring-graky-tan/20 transform scale-[1.02]'
                          : 'bg-white dark:bg-dark-surface border border-graky-brown/20 dark:border-dark-border text-graky-dark dark:text-dark-text hover:border-graky-brown dark:hover:border-graky-tan hover:bg-graky-tan/5'
                        }
                      `}
                    >
                      <span className="relative z-10 text-center">{size}</span>
                      {isSelected && (
                        <div className="absolute bottom-0 right-0 p-0.5">
                          <div className="w-1.5 h-1.5 bg-white dark:bg-dark-bg rounded-full mb-1 mr-1 opacity-50" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className={`mt-3 overflow-hidden transition-all duration-300 ${selectedSize ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-sm text-graky-brown dark:text-graky-tan flex items-center gap-2 bg-graky-tan/10 dark:bg-dark-surface/50 px-3 py-2 rounded-lg w-fit">
                  <span className="flex items-center justify-center w-4 h-4 bg-green-500 text-white rounded-full text-[10px]">✓</span>
                  Dipilih: <span className="font-bold text-graky-dark dark:text-dark-text">{selectedSize}</span>
                </p>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-graky-dark mb-3">Jumlah</h2>
            <div className="flex items-center gap-3 w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border-2 border-graky-brown/20 rounded-lg hover:border-graky-brown"
              >
                −
              </button>
              <span className="px-6 py-2 text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 border-2 border-graky-brown/20 rounded-lg hover:border-graky-brown"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-graky-dark dark:text-dark-text mb-3">Stok</h2>
            <p className={`text-lg font-bold ${(product.stock ?? 0) === 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-graky-brown dark:text-graky-tan'
              }`}>
              {(product.stock ?? 0) === 0 ? 'Stok Habis' : `${product.stock} tersedia`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleBuyNow}
              disabled={addingToCart || (product.stock ?? 0) === 0}
              className="flex-1 bg-graky-dark dark:bg-graky-tan text-white dark:text-dark-bg py-3 rounded-lg hover:bg-graky-charcoal dark:hover:bg-graky-brown transition font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              {addingToCart ? 'Menambahkan...' : 'Beli Sekarang'}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || (product.stock ?? 0) === 0}
              className="flex-1 border-2 border-graky-brown dark:border-graky-tan text-graky-brown dark:text-graky-tan py-3 rounded-lg hover:bg-graky-brown/10 dark:hover:bg-graky-tan/10 transition font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Keranjang
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t border-graky-charcoal/10 pt-12 sm:pt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-graky-dark mb-2">Produk Serupa</h2>
          <p className="text-graky-brown/70 mb-8">Produk lain dalam kategori yang sama</p>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  )
}
