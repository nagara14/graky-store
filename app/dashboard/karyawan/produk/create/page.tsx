'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X, Upload } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  icon: string
}

export default function CreateProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])

  const initialFormState = {
    name: '',
    categoryId: '',
    description: '',
    productType: '', // sepatu, baju, topi
    sizes: [] as string[],
    // Untuk sepatu: insolenya
    shoeInsoles: [] as string[],
    // Untuk topi: ukuran US dan lingkar kepala
    hatUsSizes: [] as string[],
    hatHeadCircumferences: [] as string[],
    // Untuk baju: lingkar dada dan panjang
    shirtChestCircumferences: [] as string[],
    shirtLengths: [] as string[],
    condition: 'A',
    price: '',
    stock: '',
    photoUrls: [] as string[],
  }

  const [forms, setForms] = useState(Array(5).fill(null).map(() => ({ ...initialFormState })))
  const [activeTab, setActiveTab] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingCategories, setFetchingCategories] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories')
      setCategories(res.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setFetchingCategories(false)
    }
  }

  const updateCurrentForm = (updates: Partial<typeof initialFormState>) => {
    setForms(prev => {
      const newForms = [...prev]
      newForms[activeTab] = { ...newForms[activeTab], ...updates }
      return newForms
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const currentForm = forms[activeTab]

    let updates: any = { [name]: value }

    // Auto-set sizes berdasarkan productType
    if (name === 'productType') {
      let defaultSizes: string[] = []
      if (value === 'sepatu') {
        defaultSizes = ['38', '39', '40', '41', '42', '43', '44', '45']
        updates.shoeInsoles = []
      } else if (value === 'baju') {
        defaultSizes = ['S', 'M', 'L', 'XL', 'XXL']
        updates.shirtChestCircumferences = []
        updates.shirtLengths = []
      } else if (value === 'topi') {
        updates.sizes = []
        updates.hatUsSizes = []
        updates.hatHeadCircumferences = []
      }
      if (value !== 'topi') {
        updates.sizes = defaultSizes
      }
    }

    updateCurrentForm(updates)
  }

  const toggleArrayItem = (field: keyof typeof initialFormState, item: string) => {
    const currentList = forms[activeTab][field] as string[]
    const newList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item]
    updateCurrentForm({ [field]: newList })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const currentForm = forms[activeTab]

    // Check total photos
    if (currentForm.photoUrls.length + files.length > 5) {
      setError(`Maksimal 5 foto. Anda sudah upload ${currentForm.photoUrls.length} foto.`)
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

      updateCurrentForm({
        photoUrls: [...currentForm.photoUrls, ...res.data.urls]
      })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal upload foto')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemovePhoto = (index: number) => {
    const currentForm = forms[activeTab]
    updateCurrentForm({
      photoUrls: currentForm.photoUrls.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Filter forms that have at least a name filled
      const filledForms = forms.filter(f => f.name.trim() !== '')

      if (filledForms.length === 0) {
        setError('Mohon isi minimal satu produk')
        setLoading(false)
        return
      }

      const productsToSubmit = []

      for (const [index, formData] of filledForms.entries()) {
        // Validation logic (simplified from original)
        if (!formData.categoryId) throw new Error(`Produk "${formData.name}": Pilih kategori`)
        if (!formData.productType) throw new Error(`Produk "${formData.name}": Pilih jenis produk`)
        if (formData.photoUrls.length < 2) throw new Error(`Produk "${formData.name}": Minimal 2 foto`)

        // Gabungkan ukuran
        let finalSizes: string[] = []
        if (formData.productType === 'sepatu') {
          formData.sizes.forEach(size => {
            formData.shoeInsoles.forEach(insole => {
              finalSizes.push(`${size} (Insole: ${insole}cm)`)
            })
          })
        } else if (formData.productType === 'topi') {
          formData.hatUsSizes.forEach(usSize => {
            formData.hatHeadCircumferences.forEach(circumference => {
              finalSizes.push(`${usSize} (Lingkar: ${circumference}cm)`)
            })
          })
        } else if (formData.productType === 'baju') {
          formData.sizes.forEach(size => {
            formData.shirtChestCircumferences.forEach(chest => {
              formData.shirtLengths.forEach(length => {
                finalSizes.push(`${size} (Lingkar Dada: ${chest}cm, Panjang: ${length}cm)`)
              })
            })
          })
        }

        if (finalSizes.length === 0) throw new Error(`Produk "${formData.name}": Kombinasi ukuran tidak valid`)

        const { productType, shoeInsoles, hatUsSizes, hatHeadCircumferences, shirtChestCircumferences, shirtLengths, ...submitData } = formData

        productsToSubmit.push({
          ...submitData,
          sizes: finalSizes,
          price: parseInt(formData.price),
          stock: parseInt(formData.stock) || 0,
        })
      }

      await axios.post('/api/products', productsToSubmit)

      router.push('/dashboard/karyawan')
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || 'Gagal membuat produk')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingCategories) return <div className="text-center py-12">Loading...</div>

  const currentForm = forms[activeTab]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/karyawan" className="text-graky-brown hover:text-graky-dark">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-graky-dark">Buat Produk Baru</h1>
          <p className="text-graky-brown/70">Input hingga 5 produk sekaligus</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {forms.map((form, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${activeTab === index
                ? 'bg-graky-dark text-white shadow-md'
                : 'bg-white text-graky-brown hover:bg-graky-tan/20 border border-graky-brown/10'
              }`}
          >
            {form.name ? form.name.substring(0, 15) + (form.name.length > 15 ? '...' : '') : `Produk ${index + 1}`}
            {form.name && <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">✓</span>}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 border-t-4 border-graky-dark">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center border-b border-graky-brown/10 pb-4 mb-4">
            <h2 className="text-xl font-bold text-graky-dark">Detail Produk {activeTab + 1}</h2>
            <button
              type="button"
              onClick={() => updateCurrentForm(initialFormState)}
              className="text-sm text-red-500 hover:underline"
            >
              Reset Form Ini
            </button>
          </div>

          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Nama Produk *
            </label>
            <input
              type="text"
              name="name"
              value={currentForm.name}
              onChange={handleChange}
              placeholder="Contoh: Vintage Corduroy Cap"
              className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Kategori *
            </label>
            <select
              name="categoryId"
              value={currentForm.categoryId}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {/* Jenis Produk */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Jenis Produk *
            </label>
            <select
              name="productType"
              value={currentForm.productType}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
            >
              <option value="">-- Pilih Jenis Produk --</option>
              <option value="sepatu">👟 Sepatu</option>
              <option value="baju">👕 Baju/Kaos</option>
              <option value="topi">🧢 Topi</option>
            </select>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-2">
              Deskripsi *
            </label>
            <textarea
              name="description"
              value={currentForm.description}
              onChange={handleChange}
              placeholder="Jelaskan kondisi, material, dan detail produk..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
            />
          </div>

          {/* Ukuran */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-3">
              Ukuran Tersedia *
            </label>
            {!currentForm.productType ? (
              <p className="text-sm text-graky-brown/60 py-4 bg-gray-50 rounded-lg text-center border-2 border-dashed border-gray-200">
                Pilih jenis produk terlebih dahulu untuk menampilkan opsi ukuran
              </p>
            ) : (
              <div className="space-y-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                {/* Sepatu */}
                {currentForm.productType === 'sepatu' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-graky-dark mb-2">Ukuran Sepatu (EU)</label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {['38', '39', '40', '41', '42', '43', '44', '45'].map(size => (
                          <label key={size} className={`flex items-center justify-center p-2 rounded cursor-pointer border transition ${currentForm.sizes.includes(size) ? 'bg-graky-dark text-white border-graky-dark' : 'bg-white hover:border-graky-brown'}`}>
                            <input type="checkbox" checked={currentForm.sizes.includes(size)} onChange={() => toggleArrayItem('sizes', size)} className="hidden" />
                            <span className="text-sm font-bold">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graky-dark mb-2">Insole (cm)</label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {['24', '24.5', '25', '25.5', '26', '26.5', '27', '27.5', '28', '28.5', '29', '29.5'].map(insole => (
                          <label key={insole} className={`flex items-center justify-center p-2 rounded cursor-pointer border transition ${currentForm.shoeInsoles.includes(insole) ? 'bg-graky-dark text-white border-graky-dark' : 'bg-white hover:border-graky-brown'}`}>
                            <input type="checkbox" checked={currentForm.shoeInsoles.includes(insole)} onChange={() => toggleArrayItem('shoeInsoles', insole)} className="hidden" />
                            <span className="text-xs font-bold">{insole}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Baju */}
                {currentForm.productType === 'baju' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-graky-dark mb-2">Ukuran Standar</label>
                      <div className="flex gap-2">
                        {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                          <label key={size} className={`flex-1 flex items-center justify-center p-2 rounded cursor-pointer border transition ${currentForm.sizes.includes(size) ? 'bg-graky-dark text-white border-graky-dark' : 'bg-white hover:border-graky-brown'}`}>
                            <input type="checkbox" checked={currentForm.sizes.includes(size)} onChange={() => toggleArrayItem('sizes', size)} className="hidden" />
                            <span className="text-sm font-bold">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-graky-dark mb-2">Lingkar Dada (cm)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['90', '95', '100', '105', '110', '115', '120', '125', '130'].map(val => (
                            <label key={val} className={`flex items-center justify-center p-1.5 rounded cursor-pointer border transition ${currentForm.shirtChestCircumferences.includes(val) ? 'bg-graky-dark text-white border-graky-dark' : 'bg-white hover:border-graky-brown'}`}>
                              <input type="checkbox" checked={currentForm.shirtChestCircumferences.includes(val)} onChange={() => toggleArrayItem('shirtChestCircumferences', val)} className="hidden" />
                              <span className="text-xs">{val}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-graky-dark mb-2">Panjang (cm)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['60', '62', '64', '66', '68', '70', '72', '74', '76'].map(val => (
                            <label key={val} className={`flex items-center justify-center p-1.5 rounded cursor-pointer border transition ${currentForm.shirtLengths.includes(val) ? 'bg-graky-dark text-white border-graky-dark' : 'bg-white hover:border-graky-brown'}`}>
                              <input type="checkbox" checked={currentForm.shirtLengths.includes(val)} onChange={() => toggleArrayItem('shirtLengths', val)} className="hidden" />
                              <span className="text-xs">{val}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Topi */}
                {currentForm.productType === 'topi' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-graky-dark mb-2">Ukuran US</label>
                      <div className="grid grid-cols-5 gap-2">
                        {['6 5/8', '6 3/4', '6 7/8', '7', '7 1/8', '7 1/4', '7 3/8', '7 1/2', '7 5/8', '7 3/4'].map(size => (
                          <label key={size} className={`flex items-center justify-center p-2 rounded cursor-pointer border transition ${currentForm.hatUsSizes.includes(size) ? 'bg-graky-dark text-white border-graky-dark' : 'bg-white hover:border-graky-brown'}`}>
                            <input type="checkbox" checked={currentForm.hatUsSizes.includes(size)} onChange={() => toggleArrayItem('hatUsSizes', size)} className="hidden" />
                            <span className="text-xs font-bold">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graky-dark mb-2">Lingkar Kepala (cm)</label>
                      <div className="grid grid-cols-6 gap-2">
                        {['52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62'].map(val => (
                          <label key={val} className={`flex items-center justify-center p-2 rounded cursor-pointer border transition ${currentForm.hatHeadCircumferences.includes(val) ? 'bg-graky-dark text-white border-graky-dark' : 'bg-white hover:border-graky-brown'}`}>
                            <input type="checkbox" checked={currentForm.hatHeadCircumferences.includes(val)} onChange={() => toggleArrayItem('hatHeadCircumferences', val)} className="hidden" />
                            <span className="text-xs font-bold">{val}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Kondisi & Harga & Stok */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-graky-dark mb-2">Kondisi *</label>
              <div className="flex flex-col gap-2">
                {[
                  { value: 'A', label: 'A - Seperti Baru' },
                  { value: 'B', label: 'B - Bagus' },
                  { value: 'C', label: 'C - Ada Cacat' },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value={option.value}
                      checked={currentForm.condition === option.value}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-graky-dark">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-graky-dark mb-2">Harga (Rp) *</label>
              <input
                type="number"
                name="price"
                value={currentForm.price}
                onChange={handleChange}
                placeholder="50000"
                className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-graky-dark mb-2">Stok *</label>
              <input
                type="number"
                name="stock"
                value={currentForm.stock}
                onChange={handleChange}
                placeholder="1"
                min="0"
                className="w-full px-4 py-3 border-2 border-graky-brown/20 rounded-lg focus:outline-none focus:border-graky-brown"
              />
            </div>
          </div>

          {/* Foto Produk */}
          <div>
            <label className="block text-sm font-semibold text-graky-dark mb-3">
              Foto Produk * <span className="text-xs text-graky-brown/60">(Min 2 - Max 5 foto)</span>
            </label>
            <div className="space-y-4">
              <label className="block border-2 border-dashed border-graky-brown/30 rounded-lg p-6 text-center cursor-pointer hover:border-graky-brown hover:bg-graky-tan/5 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || currentForm.photoUrls.length >= 5}
                  className="hidden"
                />
                <Upload size={32} className="mx-auto mb-2 text-graky-brown/60" />
                <p className="text-sm font-semibold text-graky-dark">
                  {uploading ? 'Mengupload...' : 'Klik untuk upload foto'}
                </p>
                <p className="text-xs text-graky-brown/60 mt-1">
                  {currentForm.photoUrls.length}/5 Foto
                </p>
              </label>

              {currentForm.photoUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {currentForm.photoUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-graky-brown/10">
            <Link
              href="/dashboard/karyawan"
              className="flex-1 px-4 py-3 border-2 border-graky-brown/20 rounded-lg hover:bg-gray-50 transition font-semibold text-graky-dark text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-[2] px-4 py-3 bg-graky-dark text-white rounded-lg hover:bg-graky-charcoal transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Menyimpan...' : `Simpan ${forms.filter(f => f.name).length > 0 ? forms.filter(f => f.name).length : ''} Produk`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
