import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getProductById, updateProduct, deleteProduct } from '@/lib/db'
import { z } from 'zod'

// Validation schema for product updates
const updateProductSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  categoryId: z.string().optional(),
  price: z.number().positive().max(999999999).optional(),
  stock: z.number().int().min(0).max(99999).optional(),
  sizes: z.array(z.string()).max(10).optional(),
  condition: z.enum(['A', 'B', 'C']).optional(),
  photoUrls: z.array(z.string().url()).min(2).max(5).optional(),
}).strict() // Reject unknown fields to prevent prototype pollution

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil produk' },
      { status: 500 }
    )
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    // Check ownership or admin
    if (product.userId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // SECURITY FIX: Validate input with Zod schema
    const validatedData = updateProductSchema.parse(body)

    const updated = await updateProduct(id, validatedData)
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Gagal update produk' },
      { status: 500 }
    )
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    }

    // Check ownership or admin
    if (product.userId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Gagal delete produk' },
      { status: 500 }
    )
  }
}
