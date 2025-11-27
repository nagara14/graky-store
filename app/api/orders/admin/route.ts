import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/db'

// GET orders list (for karyawan dashboard)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (!['ADMIN', 'KARYAWAN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'ALL'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 10

    const result = await getAllOrders(page, limit, status)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil pesanan' },
      { status: 500 }
    )
  }
}
