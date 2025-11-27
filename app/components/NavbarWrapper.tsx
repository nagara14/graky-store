'use client'

import dynamic from 'next/dynamic'

const Navbar = dynamic(() => import('./Navbar'), {
  ssr: false,
  loading: () => <div className="h-16 bg-graky-cream border-b-2 border-graky-brown/20" />
})

export default function NavbarWrapper() {
  return <Navbar />
}
