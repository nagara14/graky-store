import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductGrid from './components/ProductGrid'
import CategoryCard from './components/CategoryCard'
import HeroSlider from './components/HeroSlider'

import { getAllProducts, getCategories } from '@/lib/db'

async function getProducts() {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Products query timeout')), 5000)
    )
    
    const products = await Promise.race([
      getAllProducts(),
      timeoutPromise,
    ]) as any[]
    
    return Array.isArray(products) ? products : []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

async function getCategoriesList() {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Categories query timeout')), 5000)
    )
    
    const categories = await Promise.race([
      getCategories(),
      timeoutPromise,
    ]) as any[]
    
    return Array.isArray(categories) ? categories : []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function Home() {
  const dbProducts = await getProducts()
  const dbCategories = await getCategoriesList()

  const latestProducts = dbProducts.slice(0, 8)

  const categoryCount = (catId: string) => {
    return dbProducts.filter((p: any) => p.categoryId === catId).length
  }

  return (
    <div className="relative">

      
      {/* Hero Slider Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <HeroSlider />
      </section>

      {/* CTA Buttons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
          <Link
            href="/kategori/cat-kaos"
            className="bg-graky-dark dark:bg-graky-tan text-graky-cream dark:text-dark-bg px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-graky-charcoal dark:hover:bg-graky-brown transition flex items-center gap-2 text-sm"
          >
            Mulai Belanja <ArrowRight size={16} />
          </Link>
          <Link
            href="#categories"
            className="border-2 border-graky-brown dark:border-graky-tan text-graky-brown dark:text-graky-tan px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-graky-brown/10 dark:hover:bg-graky-tan/10 transition text-sm"
          >
            Jelajahi Kategori
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section
        id="categories"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 border-t border-graky-charcoal/10 dark:border-dark-border"
      >
        <div className="mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-graky-dark dark:text-dark-text mb-2">
            Jelajahi Kategori
          </h2>
          <p className="text-xs sm:text-base text-graky-brown/70 dark:text-dark-text-muted">
            Pilih kategori favorit Anda dan temukan item vintage terbaik.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {dbCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              icon={cat.icon}
              id={cat.id}
              count={categoryCount(cat.id)}
            />
          ))}
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 border-t border-graky-charcoal/10 dark:border-dark-border">
        <div className="mb-6 sm:mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-graky-dark dark:text-dark-text mb-2">
              Produk Terbaru
            </h2>
            <p className="text-xs sm:text-base text-graky-brown/70 dark:text-dark-text-muted">
              {latestProducts.length > 0
                ? 'Koleksi terbaru yang baru aja masuk ke toko kami.'
                : 'Belum ada produk tersedia'}
            </p>
          </div>
          <Link
            href="/kategori/cat-kaos"
            className="text-graky-brown dark:text-graky-tan font-semibold hover:text-graky-dark dark:hover:text-dark-text transition hidden md:flex items-center gap-2 text-sm"
          >
            Lihat Semua <ArrowRight size={18} />
          </Link>
        </div>

        <ProductGrid products={latestProducts} />

        <div className="mt-8 sm:mt-12 text-center md:hidden">
          <Link
            href="/kategori/cat-kaos"
            className="inline-block bg-graky-dark dark:bg-graky-tan text-graky-cream dark:text-dark-bg px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-graky-charcoal dark:hover:bg-graky-brown transition text-sm"
          >
            Lihat Semua Produk
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20 border-t border-graky-charcoal/10 dark:border-dark-border">
        <div className="bg-gradient-to-r from-graky-brown to-graky-rust dark:from-graky-tan dark:to-graky-brown rounded-2xl p-6 sm:p-8 lg:p-12 text-graky-cream dark:text-dark-bg text-center space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Punya Item Vintage Bagus?
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-graky-cream/90 dark:text-dark-bg/80">
            Jual barang vintage Anda ke kami dan dapatkan harga terbaik. Kami membeli berbagai kategori dalam kondisi apapun.
          </p>
          <button className="bg-graky-cream dark:bg-dark-bg text-graky-brown dark:text-graky-tan px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-graky-cream/90 dark:hover:bg-dark-surface transition text-sm">
            Hubungi Kami Sekarang
          </button>
        </div>
      </section>
    </div>
  )
}
