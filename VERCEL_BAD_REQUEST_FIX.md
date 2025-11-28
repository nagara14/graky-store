# 🚨 Fix "Bad Request" Error di Vercel

## ❌ Error
Ketika login di Vercel muncul: **"Bad request."**

## 🔍 Root Cause
NextAuth membutuhkan environment variables yang **BELUM DISET** di Vercel, terutama:
- `NEXTAUTH_URL` - URL aplikasi Vercel Anda
- `NEXTAUTH_SECRET` - Secret key untuk enkripsi session
- Dan variables lainnya

## ✅ Solution - Step by Step

### Step 1: Generate NEXTAUTH_SECRET

Di komputer Anda, buka terminal dan jalankan:

**Windows (PowerShell):**
```powershell
# Buka PowerShell dan run:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Atau online:**
- Buka: https://generate-secret.vercel.app/32
- Copy secret yang di-generate

**Atau jika punya Git Bash/WSL:**
```bash
openssl rand -base64 32
```

📋 **Copy hasil secret nya!** Misal: `xK9mP2vB8nQ1wE7yT4uI6oL3aS5dF0hJ`

---

### Step 2: Dapatkan URL Vercel Anda

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik project Anda (graky-store)
3. Copy URL deployment Anda, contoh:
   - `https://graky-store.vercel.app`
   - atau `https://graky-store-xyz123.vercel.app`

📋 **Copy URL ini!**

---

### Step 3: Set Environment Variables di Vercel

1. **Buka Vercel Dashboard**: https://vercel.com/dashboard
2. **Pilih project** Anda (graky-store)
3. **Klik tab**: `Settings`
4. **Klik menu kiri**: `Environment Variables`
5. **Tambahkan/Update variables** berikut:

#### ✅ CRITICAL Variables (WAJIB untuk fix "Bad request"):

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | ⚠️ Ganti dengan URL Vercel Anda |
| `NEXTAUTH_SECRET` | `xK9mP2vB8nQ1...` | Secret yang di-generate di Step 1 |
| `DATABASE_URL` | `mysql://2gonWQBQYXkJmfK.root:e1oCFLjb7umKrfON@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/graky_web?ssl=true` | TiDB connection string |

#### ✅ Google OAuth (untuk Google Login):

| Variable Name | Value |
|--------------|-------|
| `GOOGLE_CLIENT_ID` | `1031142005840-oq09mjp3ttu1t0pn07shtmqrtjbol1dp.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `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` |

#### ✅ Midtrans Payment (untuk Checkout):

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `MIDTRANS_SERVER_KEY` | `SB-Mid-server-xxxxx` | Dari Midtrans Dashboard |
| `MIDTRANS_CLIENT_KEY` | `SB-Mid-client-xxxxx` | Dari Midtrans Dashboard |
| `MIDTRANS_IS_PRODUCTION` | `false` | `false` untuk sandbox, `true` untuk production |

#### ✅ App Configuration:

| Variable Name | Value |
|--------------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

---

### Step 4: Update Google OAuth Callback URL

**PENTING:** Google OAuth harus tahu URL Vercel Anda!

1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Pilih project Anda
3. Klik **OAuth 2.0 Client IDs** yang Anda gunakan
4. Di section **Authorized redirect URIs**, tambahkan:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
   ⚠️ Ganti `your-app.vercel.app` dengan URL Vercel Anda!
5. Klik **Save**

---

### Step 5: Redeploy Vercel

Setelah semua environment variables di-set:

1. Kembali ke Vercel Dashboard
2. Klik tab **Deployments**
3. Klik tombol **⋯** (titik tiga) pada deployment terbaru
4. Klik **Redeploy**
5. Tunggu hingga deployment selesai (biasanya 1-2 menit)

---

## 🧪 Test Login

Setelah redeploy selesai:

1. Buka aplikasi Vercel Anda
2. Coba login dengan:
   - ✅ Email & Password (credentials)
   - ✅ Google OAuth
3. Seharusnya **tidak ada error "Bad request"** lagi!

---

## 🔍 Troubleshooting

### Masih "Bad request"?

Cek logs di Vercel:
1. Vercel Dashboard > Deployments > Klik deployment terbaru
2. Scroll ke section **Function Logs**
3. Cari error messages

### Google OAuth tidak berfungsi?

Pastikan:
- ✅ `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` sudah di-set
- ✅ Callback URL sudah ditambahkan di Google Console
- ✅ `NEXTAUTH_URL` sesuai dengan domain Vercel
- ✅ Sudah redeploy setelah update variables

### Database connection error?

Pastikan:
- ✅ `DATABASE_URL` sudah di-set dengan benar
- ✅ TiDB Cloud database masih aktif
- ✅ SSL enabled (`?ssl=true` di connection string)

---

## 📋 Quick Checklist

Sebelum redeploy, pastikan semua ini sudah:

- [ ] `NEXTAUTH_URL` = URL Vercel Anda
- [ ] `NEXTAUTH_SECRET` = Secret yang di-generate
- [ ] `DATABASE_URL` = Connection string TiDB
- [ ] `GOOGLE_CLIENT_ID` = Client ID dari Google Console
- [ ] `GOOGLE_CLIENT_SECRET` = Client Secret dari Google Console
- [ ] Google OAuth callback URL sudah ditambahkan
- [ ] Sudah klik **Redeploy**

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [NextAuth Documentation](https://next-auth.js.org/deployment)
- [Generate Secret Online](https://generate-secret.vercel.app/32)

---

## 💡 Tips

### Untuk Testing Lokal

Pastikan `.env.local` Anda juga memiliki:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-generated-secret>
```

### Untuk Production

Ketika sudah production:
- Ganti `MIDTRANS_IS_PRODUCTION=true`
- Update Midtrans keys dengan production keys
- Update Google OAuth callback untuk production domain

---

**Good luck! 🚀**

Jika masih ada masalah, attach screenshot error atau logs dari Vercel.
