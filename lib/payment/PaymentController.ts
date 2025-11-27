import crypto from 'crypto'
const midtransClient = require('midtrans-client')

// Midtrans Configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YOUR_SERVER_KEY'
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-YOUR_CLIENT_KEY'
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
    isProduction: MIDTRANS_IS_PRODUCTION,
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY,
})

export class PaymentController {
    /**
     * Create Midtrans Snap payment transaction
     */
    static async createPayment(order: any) {
        try {
            // Prepare Midtrans transaction parameter
            const parameter = {
                transaction_details: {
                    order_id: order.id,
                    gross_amount: order.totalAmount,
                },
                customer_details: {
                    first_name: order.userName || 'Guest',
                    email: order.userEmail || 'guest@example.com',
                    phone: (order.shippingPhone || '').replace(/\D/g, '').substring(0, 15) || '081234567890',
                    billing_address: {
                        first_name: order.userName || 'Guest',
                        email: order.userEmail || 'guest@example.com',
                        phone: (order.shippingPhone || '').replace(/\D/g, '').substring(0, 15) || '081234567890',
                        address: (order.shippingAddress || 'N/A').substring(0, 100),
                        city: order.shippingCity || 'Jakarta',
                        postal_code: order.shippingPostal || '10000',
                        country_code: 'IDN',
                    },
                },
                item_details: order.items?.map((item: any) => ({
                    id: item.productId,
                    price: item.price,
                    quantity: item.quantity,
                    name: (item.name || 'Product').substring(0, 50),
                })) || [],
                callbacks: {
                    finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-confirmation/${order.id}`,
                },
            }

            // Create transaction
            const transaction = await snap.createTransaction(parameter)

            return {
                paymentId: order.id, // Midtrans uses order_id as reference
                paymentUrl: transaction.redirect_url,
                token: transaction.token,
                status: 'pending',
            }
        } catch (error: any) {
            const errorMessage = error.ApiResponse?.error_messages || error.message

            console.error('Midtrans create payment error:', {
                message: errorMessage,
                orderId: order.id,
                timestamp: new Date().toISOString(),
            })

            throw new Error(`Midtrans Error: ${JSON.stringify(errorMessage)}`)
        }
    }

    /**
     * Verify Midtrans webhook notification signature
     */
    static verifyWebhook(data: any): boolean {
        try {
            const { order_id, status_code, gross_amount, signature_key } = data

            // Create signature hash
            // SHA512(order_id + status_code + gross_amount + ServerKey)
            const hash = crypto
                .createHash('sha512')
                .update(`${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`)
                .digest('hex')

            return hash === signature_key
        } catch (error) {
            console.error('Webhook verification error:', error)
            return false
        }
    }

    /**
     * Map Midtrans transaction status to our order status
     */
    static mapTransactionStatus(transactionStatus: string, fraudStatus?: string): {
        orderStatus: string
        paymentStatus: string
    } {
        // Reference: https://docs.midtrans.com/docs/transaction-status

        // Credit Card transactions with fraud detection
        if (transactionStatus === 'capture') {
            if (fraudStatus === 'accept') {
                return { orderStatus: 'PENDING', paymentStatus: 'PAID' }
            } else if (fraudStatus === 'challenge') {
                // Needs manual review
                return { orderStatus: 'PENDING', paymentStatus: 'REVIEW' }
            } else {
                // Denied by FDS (fraud detection)
                return { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' }
            }
        }

        // Successful payment (non-credit card or after challenge accepted)
        if (transactionStatus === 'settlement') {
            return { orderStatus: 'PENDING', paymentStatus: 'PAID' }
        }

        // Payment initiated but not completed yet
        if (transactionStatus === 'pending') {
            return { orderStatus: 'PENDING', paymentStatus: 'PENDING' }
        }

        // Failed/cancelled/expired payments
        if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
            return { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' }
        }

        // Unknown status - log for investigation
        console.warn(`[PaymentController] Unknown transaction status: ${transactionStatus}`)
        return { orderStatus: 'PENDING', paymentStatus: 'PENDING' }
    }
}
