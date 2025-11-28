# ☁️ Setup Cloudinary untuk Upload Foto

## ❌ Masalah
Di Vercel, Anda **TIDAK BISA** upload foto ke folder lokal (`public/uploads`) karena file system bersifat read-only/sementara. Foto akan gagal di-upload atau hilang setelah beberapa saat.

## ✅ Solusi: Gunakan Cloudinary (Gratis)
Saya sudah mengupdate kode untuk menggunakan Cloudinary. Sekarang Anda hanya perlu mendaftar dan memasukkan API Key.

---

### Step 1: Daftar Cloudinary (Gratis)
1. Buka [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Daftar akun gratis
3. Setelah login, Anda akan melihat **Dashboard** dengan credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 2: Masukkan ke Vercel Environment Variables
1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **graky-store**
3. Settings → Environment Variables
4. Tambahkan 3 variables ini:

| Variable Name | Value |
|---------------|-------|
| `CLOUDINARY_CLOUD_NAME` | `(copy dari dashboard)` |
| `CLOUDINARY_API_KEY` | `(copy dari dashboard)` |
| `CLOUDINARY_API_SECRET` | `(copy dari dashboard)` |

**Pastikan dicentang untuk:** ✅ Production, ✅ Preview, ✅ Development

### Step 3: Redeploy
1. Tab **Deployments**
2. Klik **⋯** pada deployment terbaru
3. Klik **Redeploy**

---

## 🧪 Cara Kerja
- **Di Local (Komputer Anda):** Jika API Key Cloudinary tidak ada, kode akan otomatis fallback menyimpan ke folder `public/uploads` (seperti biasa).
- **Di Vercel:** Kode akan mendeteksi API Key Cloudinary dan otomatis meng-upload ke Cloudinary. URL gambar akan berubah menjadi `https://res.cloudinary.com/...` yang permanen dan cepat.

## 📋 Checklist
- [ ] Daftar Cloudinary
- [ ] Copy Cloud Name, API Key, API Secret
- [ ] Add ke Vercel Environment Variables
- [ ] Redeploy Vercel
- [ ] Test upload foto produk

**Selesai! Foto produk Anda sekarang akan aman tersimpan.** 🚀
