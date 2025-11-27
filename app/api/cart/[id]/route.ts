import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { updateCartQuantity, removeFromCart } from '@/lib/db'

// PUT update quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { quantity } = body

    await updateCartQuantity(id, quantity)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Gagal update keranjang' },
      { status: 500 }
    )
  }
}

// DELETE remove from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await removeFromCart(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Gagal hapus dari keranjang' },
      { status: 500 }
    )
  }
}
