'use client'

import { redirect } from 'next/navigation'

export default function ProdukPage() {
  // Redirect to main dashboard
  redirect('/dashboard/karyawan')
}
