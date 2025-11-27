import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCart, addToCart, clearCart, getProductById } from '@/lib/db'

// GET cart items
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const cart = await getCart((session.user as any).id)
    return NextResponse.json(cart || [])
  } catch (error) {
    console.error('[Cart GET] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil keranjang', details: String(error) },
      { status: 500 }
    )
  }
}

// POST add to cart
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID required' },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      )
    }

    // SECURITY FIX 1: Validate product exists
    const product = await getProductById(productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // SECURITY FIX 2: Check stock availability
    if (quantity > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available in stock` },
        { status: 400 }
      )
    }

    // SECURITY FIX 3: Prevent abuse with reasonable max limit
    if (quantity > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 items per transaction' },
        { status: 400 }
      )
    }

    await addToCart((session.user as any).id, productId, quantity)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Cart POST] Error:', error)
    return NextResponse.json(
      { error: 'Gagal menambah ke keranjang', details: String(error) },
      { status: 500 }
    )
  }
}
