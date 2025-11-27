import { Suspense } from 'react'
import { getAllProducts, getCategories } from '@/lib/db'
import ProductGrid from '@/app/components/ProductGrid'
import KategoriContent from './content'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    category: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const dbCategories = await getCategories()
  
  const categoryData = dbCategories.find((c: any) => c.id === category)

  return {
    title: `${categoryData?.name || 'Kategori'} - Graky Store`,
    description: `Jelajahi koleksi ${categoryData?.name || 'produk'} vintage dan thrifting terbaik kami`,
  }
}

export default async function KategoriPage({ params }: PageProps) {
  const { category } = await params
  const allProducts = await getAllProducts()
  const dbCategories = await getCategories()

  // Find the category by slug
  const currentCategory = dbCategories.find(
    (cat: any) => cat.id === category || cat.id.replace(/^cat-/, '') === category
  )

  if (!currentCategory) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-graky-dark text-lg">Kategori tidak ditemukan</p>
        <a href="/" className="text-graky-brown hover:text-graky-dark transition mt-4 inline-block">
          Kembali ke Home
        </a>
      </div>
    )
  }

  // Filter products by category
  const categoryProducts = allProducts.filter(
    (product) => product.categoryId === currentCategory.id
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-graky-dark mb-2">
          {currentCategory.name}
        </h1>
        <p className="text-graky-brown/70">
          Menampilkan {categoryProducts.length} produk
        </p>
      </div>

      <ProductGrid products={categoryProducts} />
    </div>
  )
}
