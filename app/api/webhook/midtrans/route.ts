import { NextRequest, NextResponse } from 'next/server'
import { PaymentController } from '@/lib/payment/PaymentController'
import { updateOrderStatus, getOrderById } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        // SECURITY FIX 1: Verify Midtrans signature first
        const isValid = PaymentController.verifyWebhook(data)
        if (!isValid) {
            console.error('[Webhook] Invalid Midtrans signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
        }

        const orderId = data.order_id
        const grossAmount = parseInt(data.gross_amount)
        const transactionStatus = data.transaction_status
        const fraudStatus = data.fraud_status

        console.log(`[Webhook] Midtrans notification: Order ${orderId} - ${transactionStatus} - Amount: ${grossAmount}`)

        // SECURITY FIX 2: Verify order exists in database
        const order = await getOrderById(orderId)
        if (!order) {
            console.error(`[Webhook] Order ${orderId} not found in database`)
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // SECURITY FIX 3: Verify amount matches (CRITICAL - prevents amount tampering)
        if (grossAmount !== order.totalAmount) {
            console.error(`[Webhook] CRITICAL: Amount mismatch for order ${orderId}!`)
            console.error(`[Webhook] Database amount: Rp ${order.totalAmount}`)
            console.error(`[Webhook] Webhook amount: Rp ${grossAmount}`)
            return NextResponse.json({
                error: 'Amount mismatch detected',
                details: {
                    expected: order.totalAmount,
                    received: grossAmount
                }
            }, { status: 400 })
        }

        // SECURITY FIX 4: Prevent replay attacks - check if already paid
        if (order.paymentStatus === 'PAID') {
            console.log(`[Webhook] Order ${orderId} already marked as PAID, ignoring duplicate webhook`)
            return NextResponse.json({
                success: true,
                message: 'Order already processed'
            })
        }

        // Map Midtrans status to our order status
        const { orderStatus, paymentStatus } = PaymentController.mapTransactionStatus(
            transactionStatus,
            fraudStatus
        )

        console.log(`[Webhook] Updating order ${orderId}: ${orderStatus} / ${paymentStatus}`)

        // Update order in database
        await updateOrderStatus(orderId, orderStatus, paymentStatus)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Webhook] Error processing Midtrans webhook:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
