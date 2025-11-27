import { getAllProducts } from './db'

export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  description: string
  category?: string
  categoryId: string
  condition: string
  sizes: string[]
  photoUrls: string[]
  rating?: number
  sold?: number
  userId?: string
  createdAt?: string
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const products = await getAllProducts()
    const product = products.find((p) => p.id === id)
    return product || null
  } catch (error) {
    console.error('Error getting product by ID:', error)
    return null
  }
}

export async function getRelatedProducts(productId: string): Promise<Product[]> {
  try {
    const products = await getAllProducts()
    const currentProduct = products.find((p) => p.id === productId)

    if (!currentProduct) return []

    return products
      .filter((p) => p.categoryId === currentProduct.categoryId && p.id !== productId)
      .slice(0, 8)
  } catch (error) {
    console.error('Error getting related products:', error)
    return []
  }
}

export function getCategoryName(categoryId: string): string {
  const categoryMap: Record<string, string> = {
    'cat-topi': 'Topi',
    'cat-kaos': 'Kaos',
    'cat-kemeja': 'Kemeja',
    'cat-jacket': 'Jacket',
    'cat-hoodie': 'Hoodie',
    'cat-jeans': 'Celana Jeans',
    'cat-shorts': 'Celana Pendek',
    'cat-shoes': 'Sepatu',
  }
  return categoryMap[categoryId] || 'Produk'
}
