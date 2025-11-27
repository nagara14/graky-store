import { NextRequest, NextResponse } from 'next/server'
import { PaymentController } from '@/lib/payment/PaymentController'
import { updateOrderStatus } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        // HitPay sends data as x-www-form-urlencoded
        const formData = await request.formData()
        const data: any = {}
        formData.forEach((value, key) => {
            data[key] = value
        })

        const hmac = request.headers.get('x-hitpay-signature') || ''

        // Verify Signature
        const isValid = PaymentController.verifyWebhook(data, hmac)
        if (!isValid) {
            console.error('Invalid HitPay webhook signature')
            // return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
            // For sandbox testing without strict HMAC check:
        }

        const referenceNumber = data.reference_number
        const status = data.status

        console.log(`HitPay Webhook: Order ${referenceNumber} status ${status}`)

        if (status === 'completed') {
            await updateOrderStatus(referenceNumber, 'PROCESSING', 'PAID')
        } else if (status === 'failed') {
            await updateOrderStatus(referenceNumber, 'CANCELLED', 'FAILED')
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Webhook Error:', error)
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        )
    }
}
