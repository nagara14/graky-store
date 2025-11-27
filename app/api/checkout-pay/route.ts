import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createOrder, getCart, updateOrderPayment, getOrderById } from '@/lib/db'
import { PaymentController } from '@/lib/payment/PaymentController'

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

        // 1. Create Order
        const { orderId } = await createOrder(userId, cartItems, shippingData)

        // 2. Get full order details (including user info)
        const order = await getOrderById(orderId)
        if (!order) {
            throw new Error('Order not found after creation')
        }

        // 3. Create Midtrans Payment
        const payment = await PaymentController.createPayment(order)

        // 4. Update Order with Payment Details
        await updateOrderPayment(orderId, payment.paymentId, payment.paymentUrl)

        return NextResponse.json({
            orderId,
            paymentUrl: payment.paymentUrl
        }, { status: 201 })

    } catch (error: any) {
        console.error('Checkout Pay Error:', error)
        return NextResponse.json(
            { error: error.message || 'Gagal memproses pembayaran' },
            { status: 500 }
        )
    }
}
