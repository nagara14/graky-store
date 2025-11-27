import { auth } from '@/lib/auth'
import { getOrderById, updateOrderDetails, deleteOrder } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET order detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (!['ADMIN', 'KARYAWAN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const order = await getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil detail pesanan', details: String(error) },
      { status: 500 }
    )
  }
}

// PATCH update order status (for karyawan to update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (!['ADMIN', 'KARYAWAN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { orderStatus, paymentStatus, notes } = body

    await updateOrderDetails(id, {
      orderStatus,
      paymentStatus,
      notes,
      processedBy: (session.user as any).id
    })

    // Fetch and return updated order
    const updatedOrder = await getOrderById(id)

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil diupdate',
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate pesanan', details: String(error) },
      { status: 500 }
    )
  }
}

// DELETE order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (!['ADMIN', 'KARYAWAN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const success = await deleteOrder(id)

    if (!success) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Pesanan berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus pesanan', details: String(error) },
      { status: 500 }
    )
  }
}
