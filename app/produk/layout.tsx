import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Detail Produk - Graky Store',
  description: 'Lihat detail lengkap produk vintage dan thrifting kami',
}

export default function ProdukLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
