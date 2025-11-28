# Troubleshooting: Midtrans Checkout Error

## ❌ Error
```
Midtrans Error: ["Access denied due to unauthorized transaction, please check client or server key"]
```

## 🔍 Root Cause
Midtrans Server Key dan Client Key tidak dikonfigurasi di `.env.local`

## ✅ Solution

### Step 1: Get Your Midtrans Keys

**For Sandbox (Testing):**
1. Go to: https://dashboard.sandbox.midtrans.com/
2. Login
3. Navigate to **Settings** → **Access Keys**
4. Copy both keys:
   - Server Key (starts with `SB-Mid-server-`)
   - Client Key (starts with `SB-Mid-client-`)

**For Production (Live):**
1. Go to: https://dashboard.midtrans.com/
2. Login  
3. Navigate to **Settings** → **Access Keys**
4. Copy both keys:
   - Server Key (starts with `Mid-server-`)
   - Client Key (starts with `Mid-client-`)

### Step 2: Update `.env.local`

Add or update these lines in your `.env.local` file:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR-ACTUAL-KEY-HERE
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR-ACTUAL-KEY-HERE
MIDTRANS_IS_PRODUCTION=false
```

**Important:** Replace `YOUR-ACTUAL-KEY-HERE` with your actual keys from Midtrans dashboard!

### Step 3: Restart Dev Server

Stop the current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

### Step 4: Test Again

Try checkout again - it should work now!

## 🧪 Verify Configuration

Run this command to check if your keys are set correctly:

```bash
npx tsx scripts/test-midtrans-key.ts
```

You should see:
- ✅ Server Key format looks correct
- ✅ Client Key format looks correct

## 📝 Notes

- Use **Sandbox** keys for testing (starts with `SB-`)
- Use **Production** keys for live website
- Never commit `.env.local` to git
- Keys are case-sensitive and must be copied exactly

## 🔗 References

- [Midtrans Sandbox Dashboard](https://dashboard.sandbox.midtrans.com/)
- [Midtrans Production Dashboard](https://dashboard.midtrans.com/)
- [Midtrans Documentation](https://docs.midtrans.com/)
