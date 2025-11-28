# 🚀 Quick Fix: "Bad Request" Error di Vercel

## TL;DR - Langkah Cepat

Error "Bad request" terjadi karena **NEXTAUTH_SECRET tidak di-set** di Vercel.

### 1️⃣ Generate Secret (pilih salah satu):

**PowerShell (Windows):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Online Generator:**
https://generate-secret.vercel.app/32

**Hasil contoh:** `Vs0Faqj2iMKhT9tLzJ61f5lkRmUQSroW`

---

### 2️⃣ Set di Vercel

1. Buka: https://vercel.com/dashboard
2. Pilih project Anda
3. Settings > Environment Variables
4. Klik **Add New**

Tambahkan variables berikut:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `<secret dari step 1>` | Production, Preview, Development |

⚠️ **PENTING**: Ganti `your-app.vercel.app` dengan URL Vercel Anda yang sebenarnya!

---

### 3️⃣ Redeploy

1. Tab **Deployments**
2. Klik **⋯** pada deployment terbaru
3. Klik **Redeploy**

---

### 4️⃣ Test

Setelah redeploy selesai, coba login → Seharusnya tidak ada error "Bad request" lagi! ✅

---

## ⚙️ Environment Variables Lengkap

Jika Anda ingin setup lengkap sekaligus, tambahkan semua ini:

```env
# Auth (WAJIB)
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generated-secret-here>

# Database
DATABASE_URL=mysql://2gonWQBQYXkJmfK.root:e1oCFLjb7umKrfON@gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000/graky_web?ssl=true

# Google OAuth
GOOGLE_CLIENT_ID=1031142005840-oq09mjp3ttu1t0pn07shtmqrtjbol1dp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Midtrans Payment
MIDTRANS_SERVER_KEY=<your-midtrans-server-key>
MIDTRANS_CLIENT_KEY=<your-midtrans-client-key>
MIDTRANS_IS_PRODUCTION=false

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## 📖 Panduan Lengkap

Lihat file berikut untuk panduan detail:
- `VERCEL_SETUP.md` - Setup lengkap Vercel
- `VERCEL_BAD_REQUEST_FIX.md` - Troubleshooting detail

---

## ✅ Checklist Cepat

- [ ] Generate NEXTAUTH_SECRET
- [ ] Set NEXTAUTH_URL ke domain Vercel
- [ ] Set NEXTAUTH_SECRET di Vercel
- [ ] Redeploy
- [ ] Test login

**Done!** 🎉
