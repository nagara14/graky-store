import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrders, createOrder, getCart } from '@/lib/db'

// GET user orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await getOrders((session.user as any).id)
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil pesanan' },
      { status: 500 }
    )
  }
}

// POST create order
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { shippingData } = body

    if (!shippingData || !shippingData.address || !shippingData.phone) {
      return NextResponse.json(
        { error: 'Data pengiriman tidak lengkap' },
        { status: 400 }
      )
    }

    const userId = (session.user as any).id
    const cartItems = await getCart(userId)

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Keranjang kosong' },
        { status: 400 }
      )
    }

    const result = await createOrder(userId, cartItems, shippingData)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    )
  }
}
