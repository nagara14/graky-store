'use client'

import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { useState } from 'react'
import { Product } from '@/lib/products'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  // fix: use sizes (array) instead of non-existent size
  const sizeArray = Array.isArray((product as any).sizes) ? (product as any).sizes : []

  // Get images for transition
  const photoUrls = product.photoUrls || []
  const primaryImage = (product as any).image ?? photoUrls[0] ?? '/placeholder.jpg'
  const secondaryImage = photoUrls[1] ?? primaryImage // Fallback to primary if no second image

  // Show secondary image on hover if it exists
  const displayedImage = isHovered && photoUrls.length > 1 ? secondaryImage : primaryImage

  return (
    <Link href={`/produk/${product.id}`}>
      <div
        className="group cursor-pointer animate-fade-in bg-white dark:bg-dark-surface rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-graky-brown/10 dark:border-dark-border"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - Compact */}
        <div className="relative aspect-square bg-graky-charcoal/5 dark:bg-dark-border/20 overflow-hidden">
          {/* Render actual image dengan lazy loading dan smooth transition */}
          <img
            src={displayedImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              // fallback to placeholder jika gagal load
              try { (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg' } catch { }
            }}
            className="w-full h-full object-cover transition-all duration-300 ease-in-out"
          />

          {/* Badge Discount - Smaller */}
          {discount > 0 && (
            <div className="absolute top-1 right-1 md:top-1.5 md:right-1.5 bg-graky-rust text-graky-cream px-1 py-0.5 rounded text-[10px] md:text-xs font-bold">
              {discount}%
            </div>
          )}

          {/* Badge Condition - Smaller */}
          <div className="absolute top-1 left-1 md:top-1.5 md:left-1.5 bg-graky-olive text-graky-cream px-1 py-0.5 rounded text-[10px] md:text-xs font-semibold">
            {product.condition}
          </div>

          {/* Wishlist Button - Smaller */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
            className="absolute bottom-1 right-1 md:bottom-2 md:right-2 p-1 md:p-1.5 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition"
          >
            <Heart
              size={14}
              className={`transition ${isWishlisted ? 'fill-graky-rust text-graky-rust dark:fill-graky-tan dark:text-graky-tan' : 'text-graky-brown dark:text-dark-text-muted'}`}
            />
          </button>

          {/* Sold Badge - Smaller */}
          {(product.sold ?? 0) > 30 && (
            <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-graky-brown/80 text-graky-cream text-[10px] px-1 py-0.5 rounded">
              Sold {product.sold}
            </div>
          )}

          {/* Image Indicator - Show if multiple images */}
          {photoUrls.length > 1 && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              <div className={`w-1 h-1 rounded-full transition-all ${!isHovered ? 'bg-white' : 'bg-white/50'}`} />
              <div className={`w-1 h-1 rounded-full transition-all ${isHovered ? 'bg-white' : 'bg-white/50'}`} />
            </div>
          )}
        </div>

        {/* Info - Compact */}
        <div className="p-2 md:p-3 space-y-1">
          <p className="text-[10px] md:text-xs font-semibold text-graky-brown/70 dark:text-dark-text-muted uppercase tracking-wide line-clamp-1">
            {product.category}
          </p>
          <h3 className="font-semibold text-xs md:text-sm text-graky-dark dark:text-dark-text line-clamp-2 group-hover:text-graky-brown dark:group-hover:text-graky-tan transition h-8 md:h-10 leading-tight">
            {product.name}
          </h3>

          {/* Rating - Smaller */}
          <div className="flex items-center gap-0.5">
            <Star size={10} className="fill-graky-tan text-graky-tan" />
            <span className="text-[10px] md:text-xs text-graky-brown dark:text-dark-text-muted">{product.rating}</span>
          </div>

          {/* Price - Compact */}
          <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-1">
            <span className="text-sm md:text-base font-bold text-graky-dark dark:text-dark-text">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] line-through text-graky-brown/50 dark:text-dark-text-muted/50">
                Rp {product.originalPrice.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {/* Sizes - More Prominent */}
          {/* Sizes - Minimalist & Clean */}
          {sizeArray.length > 0 && (
            <div className="mt-2 pt-2 border-t border-dashed border-graky-brown/10 dark:border-dark-border flex flex-wrap items-center gap-1.5">
              {sizeArray.slice(0, 4).map((size: string, idx: number) => (
                <span
                  key={idx}
                  className="text-[10px] font-medium text-graky-dark dark:text-graky-tan bg-graky-tan/20 dark:bg-dark-border/30 px-1.5 py-0.5 rounded-md"
                >
                  {size}
                </span>
              ))}
              {sizeArray.length > 4 && (
                <span className="text-[10px] text-graky-brown/60 dark:text-dark-text-muted font-medium">
                  +{sizeArray.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
