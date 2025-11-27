import { getProductById, getRelatedProducts } from '@/lib/products'
import ProdukDetailContent from './content'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan - Graky Store',
      description: 'Produk yang Anda cari tidak tersedia.',
    }
  }

  return {
    title: `${product.name} - Graky Store`,
    description: product.description,
  }
}

export default async function ProdukDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-graky-dark mb-2">
          Produk tidak ditemukan
        </h1>
        <a
          href="/"
          className="text-graky-brown hover:text-graky-dark transition inline-flex items-center gap-2 mt-4"
        >
          ← Kembali ke Home
        </a>
      </div>
    )
  }

  const relatedProducts = await getRelatedProducts(id)

  return <ProdukDetailContent product={product} relatedProducts={relatedProducts} />
}
