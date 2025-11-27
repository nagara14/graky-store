import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Katalog - Graky Store',
  description: 'Jelajahi koleksi vintage dan thrifting terbaik kami',
}

export default function KategoriLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
