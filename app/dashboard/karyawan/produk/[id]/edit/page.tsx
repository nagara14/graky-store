'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, X, Upload } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  icon: string
}

interface Product {
  id: string
  name: string
  categoryId: string
  description: string
  sizes: string[]
  condition: string
  price: number
  stock?: number
  photoUrls: string[]
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    sizes: [] as string[],
    condition: 'A',
    price: '',
    stock: '',
    photoUrls: [] as string[],
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [productId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Fetch categories
      const categoriesRes = await axios.get('/api/categories')
      setCategories(categoriesRes.data)

      // Fetch single product
      const productRes = await axios.get(`/api/products/${productId}`)
      const prod = productRes.data
      
      if (prod) {
        setProduct(prod)
        setFormData({
          name: prod.name,
          categoryId: prod.categoryId,
          description: prod.description,
          sizes: Array.isArray(prod.sizes) ? prod.sizes : [],
          condition: prod.condition,
          price: prod.price.toString(),
          stock: (prod.stock ?? 0).toString(),
          photoUrls: prod.photoUrls || [],
        })
      } else {
        setError('Produk tidak ditemukan')
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.response?.data?.error || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    if (formData.photoUrls.length + files.length > 5) {
      setError(`Maksimal 5 foto. Anda sudah upload ${formData.photoUrls.length} foto.`)
      return
    }

    setError('')
    setUploading(true)

    try {
      const formDataToSend = new FormData()
      for (let i = 0; i < files.length; i++) {
        formDataToSend.append('files', files[i])
      }

      const res = await axios.post('/api/upload', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setFormData(prev => ({
        ...prev,
        photoUrls: [...prev.photoUrls, ...res.data.urls],
      }))
      setSuccess('Foto berhasil diupload')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal upload foto')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validation
    if (!formData.categoryId) {
      setError('Pilih kategori terlebih dahulu')
      return
    }
    if (formData.sizes.length === 0) {
      setError('Pilih minimal 1 ukuran')
      return
    }
    if (formData.photoUrls.length < 2) {
      setError('Minimal 2 foto')
      return
    }
    if (formData.photoUrls.length > 5) {
      setError('Maksimal 5 foto')
      return
    }

    setSubmitting(true)

    try {
      const updateData = {
        name: formData.name,
        categoryId: formData.categoryId,
        description: formData.description,
        sizes: formData.sizes,
        condition: formData.condition,
        price: parseInt(formData.price),
        stock: parseInt(formData.stock) || 0,
        photoUrls: formData.photoUrls,
      }

      console.log('Sending update:', updateData)

      const res = await axios.put(`/api/products/${productId}`, updateData)
      
      console.log('Update response:', res.data)
      setSuccess('Produk berhasil diperbarui!')
      
      setTimeout(() => {
        router.push('/dashboard/karyawan/produk')
      }, 1500)
    } catch (err: any) {
      console.error('Update error:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Gagal mengupdate produk'
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-graky-brown mx-auto mb-4"></div>
          <p className="text-graky-brown">Loading produk...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-semibold mb-4">{error || 'Produk tidak ditemukan'}</p>
        <Link href="/dashboard/karyawan/produk" className="text-graky-brown hover:text-graky-dark">
          ← Kembali ke Produk Saya
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/karyawan/produk" className="text-graky-brown hover:text-graky-dark">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-graky-dark">Edit Produk</h1>
          <p className="text-graky-brown/70">{product.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Nama Produk *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              required
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Kategori *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Deskripsi *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              required
            />
          </div>

          {/* Ukuran */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-3">
              Ukuran Tersedia *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map(size => (
                <label key={size} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sizes.includes(size)}
                    onChange={() => handleSizeToggle(size)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-graky-dark">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Kondisi */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Kondisi *
            </label>
            <div className="space-y-2">
              { [
                { value: 'A', label: 'A - Seperti Baru' },
                { value: 'B', label: 'B - Bagus' },
                { value: 'C', label: 'C - Ada Cacat' },
              ].map((option) => (
                 <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                   <input
                     type="radio"
                     name="condition"
                     value={option.value}
                     checked={formData.condition === option.value}
                     onChange={handleChange}
                     className="w-4 h-4"
                   />
                   <span className="text-sm text-graky-dark">{option.label}</span>
                 </label>
               ))}
            </div>
          </div>

          {/* Harga */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Harga (Rp) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              required
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Stok *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              required
            />
            <p className="text-xs text-graky-brown/60 mt-1">
              Masukkan jumlah stok produk yang tersedia
            </p>
          </div>

          {/* Foto Produk */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-3">
              Foto Produk * <span className="text-xs text-graky-brown/60">(Min 2 - Max 5 foto)</span>
            </label>
            <div className="space-y-4">
              {/* Upload Area */}
              <label className="block border-2 border-dashed border-graky-brown/30 rounded-lg p-6 text-center cursor-pointer hover:border-graky-brown hover:bg-graky-tan/5 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || formData.photoUrls.length >= 5}
                  className="hidden"
                />
                <Upload size={32} className="mx-auto mb-2 text-graky-brown/60" />
                <p className="text-sm font-semibold text-graky-dark">
                  {uploading ? 'Mengupload...' : 'Klik untuk upload atau drag foto di sini'}
                </p>
                <p className="text-xs text-graky-brown/60 mt-1">
                  Foto: {formData.photoUrls.length}/5 | Max 5MB per file
                </p>
              </label>

              {/* Preview Foto */}
              {formData.photoUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.photoUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                      <p className="text-xs text-graky-brown/60 mt-1 text-center">Foto {index + 1}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              ❌ {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              ✓ {success}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/dashboard/karyawan/produk"
              className="flex-1 px-4 py-3 border-2 border-graky-brown/20 rounded-lg hover:bg-gray-50 transition font-semibold text-graky-dark text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 px-4 py-3 bg-graky-dark text-white rounded-lg hover:bg-graky-charcoal transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
