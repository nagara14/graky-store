'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image?: string
  photoUrls?: string[]
  condition: string
  sizes?: string[]
  description: string
  rating?: number
  sold?: number
  category?: string
  categoryId?: string
}

interface ProductGridProps {
  products: Product[]
  emptyMessage?: string
}

export default function ProductGrid({ products, emptyMessage }: ProductGridProps) {
  const mappedProducts = products.map((product) => ({
    ...product,
    image: product.image || (product.photoUrls?.[0] ?? '/placeholder.jpg'),
    rating: product.rating ?? 4.5,
    sold: product.sold ?? 0,
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    categoryId: product.categoryId ?? '',
    photoUrls: Array.isArray(product.photoUrls) ? product.photoUrls : [],
  }))

  if (mappedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-graky-dark text-sm sm:text-base">
          {emptyMessage || 'Tidak ada produk ditemukan'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {mappedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
