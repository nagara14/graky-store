import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Verify file is actually an image by checking magic bytes (file signature)
 * This prevents MIME type spoofing attacks
 */
function verifyImageMagicBytes(buffer: ArrayBuffer): boolean {
  const arr = new Uint8Array(buffer.slice(0, 12))

  // JPEG: FF D8 FF
  if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) return true

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) return true

  // GIF: 47 49 46 38 (GIF8)
  if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) return true

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
    arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50) return true

  return false
}

/**
 * Map MIME type to file extension
 * Forces correct extension to prevent double extension attacks
 */
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !['ADMIN', 'KARYAWAN'].includes((session.user as any).role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada file yang diunggah' },
        { status: 400 }
      )
    }

    if (files.length < 2 || files.length > 5) {
      return NextResponse.json(
        { error: 'Foto harus minimal 2 dan maksimal 5' },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []

    // Check if Cloudinary is configured
    const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)

    // Import Cloudinary helper (using require to avoid top-level await issues in some envs)
    let uploadToCloudinary: any = null
    if (useCloudinary) {
      try {
        const cloudinaryLib = require('@/lib/cloudinary')
        uploadToCloudinary = cloudinaryLib.uploadToCloudinary
      } catch (e) {
        console.error('Failed to require cloudinary lib', e)
      }
    }

    for (const file of files) {
      // SECURITY FIX 1: Validate MIME type against whitelist
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Format file ${file.type} tidak diizinkan. Hanya JPG, PNG, GIF, WebP.` },
          { status: 400 }
        )
      }

      // SECURITY FIX 2: Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'Ukuran file maksimal 5MB' },
          { status: 400 }
        )
      }

      // SECURITY FIX 3: Verify magic bytes (real file content)
      const buffer = await file.arrayBuffer()
      if (!verifyImageMagicBytes(buffer)) {
        return NextResponse.json(
          { error: `File "${file.name}" bukan gambar valid (magic bytes verification failed)` },
          { status: 400 }
        )
      }

      const fileBuffer = Buffer.from(buffer)

      if (useCloudinary && uploadToCloudinary) {
        // Upload to Cloudinary (Production / Vercel)
        try {
          console.log(`[Upload] Uploading ${file.name} to Cloudinary...`)
          const url = await uploadToCloudinary(fileBuffer, 'graky-store/products')
          uploadedUrls.push(url)
        } catch (error: any) {
          console.error('[Upload] Cloudinary error:', error)
          // Return specific error message for debugging
          const errorMessage = error.message || JSON.stringify(error)
          return NextResponse.json(
            { error: `[DEBUG] Gagal Cloudinary: ${errorMessage}` },
            { status: 500 }
          )
        }
      } else {
        // Fallback to Local Storage (Dev only)
        // Note: This won't work on Vercel!
        if (process.env.NODE_ENV === 'production') {
          console.error('[Upload] CRITICAL: Cloudinary keys missing in production!')
          return NextResponse.json(
            { error: 'Server configuration error: Storage not configured (Cloudinary keys missing)' },
            { status: 500 }
          )
        }

        const uploadDir = path.join(process.cwd(), 'public/uploads/products')
        await fs.mkdir(uploadDir, { recursive: true })

        // SECURITY FIX 4: Force extension based on MIME
        const extension = MIME_TO_EXT[file.type]
        if (!extension) {
          return NextResponse.json(
            { error: 'Tipe file tidak didukung' },
            { status: 400 }
          )
        }

        // SECURITY FIX 5: Generate safe filename
        const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`
        const filepath = path.join(uploadDir, filename)

        await fs.writeFile(filepath, fileBuffer)
        uploadedUrls.push(`/uploads/products/${filename}`)
      }
    }

    console.log(`[Upload] Successfully uploaded ${uploadedUrls.length} files`)
    return NextResponse.json({ urls: uploadedUrls }, { status: 200 })
  } catch (error) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupload foto (General Error)' },
      { status: 500 }
    )
  }
}
