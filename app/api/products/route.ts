import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createProduct, getAllProducts, getProductsByUserId } from '@/lib/db'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(3),
  categoryId: z.string(),
  description: z.string().min(10),
  sizes: z.array(z.string()),
  condition: z.enum(['A', 'B', 'C']),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  photoUrls: z.array(z.string()).min(2).max(5),
})

// GET all products (public) - tidak perlu login
export async function GET(request: NextRequest) {
  try {
    // Return semua produk untuk public view (home, kategori, etc)
    const products = await getAllProducts()

    // Set cache headers untuk meningkatkan performance
    const response = NextResponse.json(products)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    )
    return response
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    )
  }
}

// POST create product (KARYAWAN & ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'KARYAWAN'].includes((session.user as any).role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Handle bulk creation
    if (Array.isArray(body)) {
      const createdProducts = []
      const errors = []

      for (const item of body) {
        try {
          const validatedData = createProductSchema.parse(item)
          const product = await createProduct({
            ...validatedData,
            userId: (session.user as any).id,
          })
          createdProducts.push(product)
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push({ item, error: error.errors[0].message })
          } else {
            errors.push({ item, error: 'Gagal membuat produk' })
          }
        }
      }

      if (createdProducts.length === 0 && errors.length > 0) {
        return NextResponse.json(
          { error: 'Gagal membuat semua produk', details: errors },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        created: createdProducts,
        errors: errors.length > 0 ? errors : undefined
      }, { status: 201 })
    }

    // Handle single creation (legacy support)
    const validatedData = createProductSchema.parse(body)
    const product = await createProduct({
      ...validatedData,
      userId: (session.user as any).id,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat produk' },
      { status: 500 }
    )
  }
}
