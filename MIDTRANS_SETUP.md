# 🚀 Midtrans Payment Gateway Migration

## ✅ Migration Complete!

Berhasil migrasi dari HitPay ke Midtrans Snap payment gateway.

---

## 📁 Files Changed

### Created
- ✨ `lib/payment/PaymentController.ts` - Midtrans Snap integration
- ✨ `app/api/webhook/midtrans/route.ts` - Webhook handler
- 📄 `.env.midtrans.example` - Environment template

### Modified
- 🔧 `lib/payment/PaymentController.ts` - Replaced HitPay with Midtrans

### Deprecated (can be removed)
- 🗑️ `app/api/webhook/hitpay/route.ts` - No longer used

---

## 🔧 Setup Instructions

### 1. Get Midtrans Sandbox Credentials

1. Sign up: https://dashboard.sandbox.midtrans.com/
2. Go to **Settings** > **Access Keys**
3. Copy your credentials:
   - **Server Key** (starts with `SB-Mid-server-`)
   - **Client Key** (starts with `SB-Mid-client-`)

### 2. Update Environment Variables

Add to `.env.local`:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY
MIDTRANS_IS_PRODUCTION=false

# App URL (already exists, just verify)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Configure Webhook URL (Important!)

In Midtrans Dashboard:
1. Go to **Settings** > **Configuration**
2. Set **Payment Notification URL** to:
   - Development: Use **ngrok** or **localtunnel** (see below)
   - Production: `https://your-domain.com/api/webhook/midtrans`

#### Local Development Webhook Testing

Since Midtrans can't reach `localhost`, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Run ngrok on port 3000
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Set webhook to: https://abc123.ngrok.io/api/webhook/midtrans
```

---

## 🎯 How It Works

### Payment Flow

1. **User clicks "Bayar"** → Calls `/api/checkout-pay`
2. **Create Midtrans transaction** → Get Snap redirect URL
3. **Redirect to Snap** → User completes payment
4. **Midtrans sends webhook** → Updates order status
5. **User redirected back** → Order confirmation page

### Supported Payment Methods

Midtrans Snap supports:
- 🏦 Bank Transfer (BCA, BNI, Mandiri, Permata, BRI)
- 💳 Credit Card (Visa, Mastercard)
- 💰 E-Wallets (GoPay, ShopeePay, QRIS)
- 🏪 Retail Stores (Indomaret, Alfamart)

---

## 🧪 Testing

### Test Payment (Sandbox)

1. **Create order** di aplikasi
2. **Click Bayar** → Akan redirect ke Snap payment page
3. **Choose payment method**, misal "Credit Card"
4. **Use test card numbers:**

   **Success:**
   ```
   Card Number: 4811 1111 1111 1114
   CVV: 123
   Exp: 01/25
   ```

   **Failure:**
   ```
   Card Number: 4911 1111 1111 1113
   CVV: 123
   Exp: 01/25
   ```

5. **Complete payment** → Webhook akan fire → Order status updated

### Verify Webhook

Check terminal/console for:
```
Midtrans Webhook: Order ORDER_ID - settlement
```

Check database:
```sql
SELECT id, paymentStatus, orderStatus FROM orders WHERE id = 'ORDER_ID';
```

Should show:
- `paymentStatus: 'PAID'`
- `orderStatus: 'PENDING'` (waiting for shipping)

---

## 📊 Status Mapping

| Midtrans Status | Order Status | Payment Status | Description |
|----------------|--------------|----------------|-------------|
| `pending` | PENDING | PENDING | Waiting payment |
| `settlement` | PENDING | PAID | ✅ Payment success |
| `capture` | PENDING | PAID | ✅ Card captured |
| `expire` | CANCELLED | FAILED | Payment expired |
| `cancel` | CANCELLED | CANCELLED | User cancelled |
| `deny` | CANCELLED | FAILED | Payment denied |

---

## 🔐 Security

### Webhook Verification

Setiap webhook dari Midtrans diverifikasi dengan signature:

```typescript
SHA512(order_id + status_code + gross_amount + ServerKey)
```

Jika signature tidak cocok → webhook ditolak (401).

---

## 🐛 Troubleshooting

### Issue: "Invalid signature" di webhook

**Solution:** 
- Pastikan `MIDTRANS_SERVER_KEY` di `.env.local` benar
- Jangan ada space di awal/akhir key

### Issue: Webhook tidak fire

**Solution:**
- Dalam development, pastikan ngrok running
- Cek Midtrans Dashboard > Settings > Configuration > Payment Notification URL
- Test webhook manually di Dashboard > Settings > Webhook

### Issue: Order status tidak update

**Solution:**
- Cek console/terminal untuk error messages
- Verify database connection
- Check webhook logs di Midtrans Dashboard

---

## 🚀 Production Deployment

Before going to production:

1. **Get Production Credentials:**
   - Sign up at https://dashboard.midtrans.com/ (production)
   - Complete merchant verification
   - Get production Server Key & Client Key

2. **Update Environment Variables:**
   ```env
   MIDTRANS_SERVER_KEY=Mid-server-PRODUCTION_KEY
   MIDTRANS_CLIENT_KEY=Mid-client-PRODUCTION_KEY
   MIDTRANS_IS_PRODUCTION=true
   NEXT_PUBLIC_APP_URL=https://your-production-domain.com
   ```

3. **Set Production Webhook:**
   ```
   https://your-production-domain.com/api/webhook/midtrans
   ```

4. **Test thoroughly** before enabling for real users!

---

## 📚 Resources

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Snap Integration Guide](https://docs.midtrans.com/docs/snap-integration-guide)
- [Testing Payment](https://docs.midtrans.com/docs/testing-payment-on-sandbox)
- [Webhook/Notification](https://docs.midtrans.com/docs/http-notification-webhooks)

---

**Migration Date:** November 25, 2025  
**Status:** ✅ Complete & Ready for Testing
