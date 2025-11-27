'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import ProductGrid from '@/app/components/ProductGrid'
import axios from 'axios'

interface Product {
  id: string
  name: string
  categoryId: string
  condition: string
  price: number
  photoUrls?: string[]
  description: string
  rating?: number
  sold?: number
  sizes?: string[]
  createdAt: string
}

interface ContentProps {
  category: string
}

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular'
type ConditionFilter = 'all' | 'A' | 'B' | 'C'

export default function KategoriContent({ category }: ContentProps) {
  const categoryId = category

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all')
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000000)
  const [showFilters, setShowFilters] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products')
      setProducts(res.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get products untuk kategori ini
  const categoryProducts = useMemo(
    () => products.filter((p) => p.categoryId === categoryId),
    [products, categoryId]
  )

  // Calculate price range
  const priceRange = useMemo(() => {
    if (categoryProducts.length === 0) return { min: 0, max: 1000000 }
    const prices = categoryProducts.map((p) => p.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [categoryProducts])

  // Initialize price range
  useEffect(() => {
    setMinPrice(priceRange.min)
    setMaxPrice(priceRange.max)
  }, [priceRange])

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts]

    // Search filter
    if (searchQuery) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Condition filter
    if (conditionFilter !== 'all') {
      result = result.filter((p) => p.condition === conditionFilter)
    }

    // Price filter
    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice)

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'popular':
        result.sort((a, b) => (b.sold || 0) - (a.sold || 0))
        break
      case 'newest':
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return result
  }, [categoryProducts, searchQuery, conditionFilter, minPrice, maxPrice, sortBy])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-graky-dark">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-graky-dark">
            Kategori
          </h1>
        </div>
        <p className="text-graky-brown/70">
          {filteredProducts.length} produk ditemukan
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-graky-charcoal/5 rounded-lg p-6 space-y-6 sticky top-24">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-graky-dark mb-3">
                Cari Produk
              </label>
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-3 text-graky-brown"
                />
                <input
                  type="text"
                  placeholder="Ketik nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-graky-brown/20 rounded-lg bg-graky-cream focus:outline-none focus:border-graky-brown text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-graky-dark mb-3">
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-graky-brown/20 rounded-lg bg-graky-cream focus:outline-none focus:border-graky-brown text-sm"
              >
                <option value="newest">Terbaru</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
                <option value="popular">Paling Laris</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-graky-dark mb-3">
                Harga
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-graky-brown/60">
                    Min: Rp {minPrice.toLocaleString('id-ID')}
                  </label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step={10000}
                    value={minPrice}
                    onChange={(e) => setMinPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-graky-brown/20 rounded-lg appearance-none cursor-pointer accent-graky-brown"
                  />
                </div>
                <div>
                  <label className="text-xs text-graky-brown/60">
                    Max: Rp {maxPrice.toLocaleString('id-ID')}
                  </label>
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    step={10000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-graky-brown/20 rounded-lg appearance-none cursor-pointer accent-graky-brown"
                  />
                </div>
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-sm font-semibold text-graky-dark mb-3">
                Kondisi Barang
              </label>
              <div className="space-y-2">
                {(['all', 'A', 'B', 'C'] as const).map((condition) => (
                  <label
                    key={condition}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={condition}
                      checked={conditionFilter === condition}
                      onChange={(e) =>
                        setConditionFilter(e.target.value as ConditionFilter)
                      }
                      className="w-4 h-4 accent-graky-brown cursor-pointer"
                    />
                    <span className="text-sm text-graky-dark group-hover:text-graky-brown transition">
                      {condition === 'all' ? 'Semua' : `Grade ${condition}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchQuery('')
                setSortBy('newest')
                setConditionFilter('all')
                setMinPrice(priceRange.min)
                setMaxPrice(priceRange.max)
              }}
              className="w-full py-2 border border-graky-brown text-graky-brown rounded-lg hover:bg-graky-brown/10 transition text-sm font-semibold"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6 flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 py-2 px-4 border border-graky-brown rounded-lg text-graky-brown font-semibold text-sm hover:bg-graky-brown/10 transition flex items-center justify-center gap-2"
            >
              🔍 Filter <ChevronDown size={18} />
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex-1 px-4 py-2 border border-graky-brown/20 rounded-lg bg-graky-cream text-sm"
            >
              <option value="newest">Terbaru</option>
              <option value="price-asc">Harga ↓</option>
              <option value="price-desc">Harga ↑</option>
              <option value="popular">Laris</option>
            </select>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mb-6 bg-graky-charcoal/5 rounded-lg p-4 space-y-4 animate-fade-in">
              {/* Search */}
              <div>
                <label className="text-xs font-semibold text-graky-dark mb-2 block">
                  Cari
                </label>
                <input
                  type="text"
                  placeholder="Nama produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-graky-brown/20 rounded-lg bg-graky-cream text-sm"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-semibold text-graky-dark mb-2 block">
                  Harga: Rp {minPrice.toLocaleString('id-ID')} - Rp{' '}
                  {maxPrice.toLocaleString('id-ID')}
                </label>
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  step={10000}
                  value={minPrice}
                  onChange={(e) => setMinPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-graky-brown/20 rounded-lg"
                />
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  step={10000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-graky-brown/20 rounded-lg mt-2"
                />
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs font-semibold text-graky-dark mb-2 block">
                  Kondisi
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['all', 'A', 'B', 'C'] as const).map((condition) => (
                    <button
                      key={condition}
                      onClick={() => setConditionFilter(condition)}
                      className={`py-2 rounded text-xs font-semibold transition ${
                        conditionFilter === condition
                          ? 'bg-graky-brown text-graky-cream'
                          : 'bg-graky-brown/10 text-graky-brown hover:bg-graky-brown/20'
                      }`}
                    >
                      {condition === 'all' ? 'Semua' : `Grade ${condition}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <ProductGrid
            products={filteredProducts}
            emptyMessage={
              searchQuery
                ? `Tidak ada produk "${searchQuery}" di kategori ini`
                : 'Tidak ada produk yang sesuai dengan filter Anda'
            }
          />
        </div>
      </div>
    </div>
  )
}
