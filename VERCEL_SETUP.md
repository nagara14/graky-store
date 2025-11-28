# Vercel Deployment Setup

Complete guide to deploy and configure your app on Vercel.

## 🚨 Common Errors & Fixes

- **"Bad request"** during login → Missing `NEXTAUTH_SECRET` (see below)
- **"Access denied"** database error → Wrong `DATABASE_URL`
- **Google login not working** → Missing Google OAuth variables or callback URL

📖 **Detailed guide**: See `VERCEL_BAD_REQUEST_FIX.md` for complete troubleshooting.

---

## 1. Go to Vercel Dashboard
Open [https://vercel.com/dashboard](https://vercel.com/dashboard) and select your project (`graky-store`).

## 2. Go to Settings > Environment Variables
Click on the **Settings** tab, then **Environment Variables** on the left.

## 3. Add/Update These Variables

### 🔐 NextAuth Configuration (CRITICAL - fixes "Bad request")

#### NEXTAUTH_URL
```
https://your-app-domain.vercel.app
```
⚠️ **Replace with your actual Vercel domain!** (e.g., `https://graky-store.vercel.app`)

#### NEXTAUTH_SECRET
```
<GENERATE THIS - see below>
```

**How to generate:**
- **Option 1**: Open PowerShell and run:
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
  ```
- **Option 2**: Visit https://generate-secret.vercel.app/32
- **Option 3**: If you have Git Bash/WSL:
  ```bash
  openssl rand -base64 32
  ```

Copy the generated secret and paste as the value for `NEXTAUTH_SECRET`.

---

### 🗄️ Database Configuration

#### DATABASE_URL
```
mysql://2gonWQBQYXkJmfK.root:e1oCFLjb7umKrfON@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/graky_web?ssl=true
```

---

### 🔑 Google OAuth (for Google Login)

#### GOOGLE_CLIENT_ID
```
1031142005840-oq09mjp3ttu1t0pn07shtmqrtjbol1dp.apps.googleusercontent.com
```

#### GOOGLE_CLIENT_SECRET
```
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
```

**Important:** After setting these, you MUST also:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://your-app-domain.vercel.app/api/auth/callback/google
   ```
4. Save

---

### 💳 Midtrans Payment (for Checkout)

#### MIDTRANS_SERVER_KEY
```
SB-Mid-server-YOUR-KEY-HERE
```
Get from: https://dashboard.sandbox.midtrans.com/ → Settings → Access Keys

#### MIDTRANS_CLIENT_KEY
```
SB-Mid-client-YOUR-KEY-HERE
```
Get from: https://dashboard.sandbox.midtrans.com/ → Settings → Access Keys

#### MIDTRANS_IS_PRODUCTION
```
false
```
Use `false` for sandbox/testing, `true` for production.

---

### 🌐 App Configuration

#### NEXT_PUBLIC_APP_URL
```
https://your-app-domain.vercel.app
```
⚠️ Same as `NEXTAUTH_URL`

---

## 4. Redeploy

After updating ALL variables:

1. Go to the **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~1-2 minutes)

---

## 5. Test Your Deployment

Once redeployed, test these features:

- ✅ Login with email/password
- ✅ Login with Google
- ✅ Checkout with Midtrans
- ✅ View products/cart

---

## 📋 Environment Variables Checklist

Before redeploying, ensure these are all set:

- [ ] `NEXTAUTH_URL` - Your Vercel domain
- [ ] `NEXTAUTH_SECRET` - Generated secret (32+ characters)
- [ ] `DATABASE_URL` - TiDB connection string
- [ ] `GOOGLE_CLIENT_ID` - From Google Console
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Console
- [ ] `MIDTRANS_SERVER_KEY` - From Midtrans Dashboard
- [ ] `MIDTRANS_CLIENT_KEY` - From Midtrans Dashboard
- [ ] `MIDTRANS_IS_PRODUCTION` - false or true
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel domain
- [ ] Google OAuth callback URL added to Google Console

---

## 🔧 Troubleshooting

### Still getting "Bad request"?
- Verify `NEXTAUTH_SECRET` is set (not empty)
- Verify `NEXTAUTH_URL` matches your Vercel domain exactly
- Check Function Logs in Vercel for detailed errors

### Google login not working?
- Verify callback URL in Google Console
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check both are set for **all environments** (Production, Preview, Development)

### Database errors?
- Verify `DATABASE_URL` is correct
- Check TiDB Cloud database is active
- Ensure `?ssl=true` is in the connection string

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [NextAuth Deployment Guide](https://next-auth.js.org/deployment)
- [VERCEL_BAD_REQUEST_FIX.md](./VERCEL_BAD_REQUEST_FIX.md) - Detailed troubleshooting
- [MIDTRANS_ERROR_FIX.md](./MIDTRANS_ERROR_FIX.md) - Midtrans setup guide
