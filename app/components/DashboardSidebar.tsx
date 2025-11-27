'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Users,
  Package,
  LogOut,
  Menu,
  X,
  Home,
  ShoppingCart,
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const userRole = (session?.user as any)?.role

  const adminMenus = [
    { label: 'Dashboard', href: '/dashboard/admin', icon: BarChart3 },
    { label: 'Manajemen User', href: '/dashboard/admin/users', icon: Users },
    { label: 'Produk', href: '/dashboard/admin/products', icon: Package },
  ]

  const karyawanMenus = [
    { label: 'Dashboard', href: '/dashboard/karyawan', icon: BarChart3 },
    { label: 'Produk Saya', href: '/dashboard/karyawan/produk', icon: Package },
    { label: 'Pesanan', href: '/dashboard/karyawan/pesanan', icon: ShoppingCart },
  ]

  const menus = userRole === 'ADMIN' ? adminMenus : karyawanMenus

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-graky-dark text-white rounded-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-graky-dark text-white pt-20 md:pt-8 md:relative z-40 transition-transform overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="p-6 space-y-8 pb-20 md:pb-6">
          {/* Logo */}
          <Link href="/dashboard/admin" className="block text-2xl font-bold">
            GRAKY
          </Link>

          {/* User Info */}
          <div className="bg-white/10 p-4 rounded-lg">
            <p className="text-sm text-white/70">Logged in as</p>
            <p className="font-semibold truncate">{session?.user?.name}</p>
            <p className="text-xs text-white/70 uppercase">{userRole}</p>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {menus.map((menu) => {
              const Icon = menu.icon
              const isActive = pathname === menu.href
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                      ? 'bg-graky-brown text-white'
                      : 'hover:bg-white/10 text-white/80'
                    }`}
                >
                  <Icon size={20} />
                  <span>{menu.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Back to Home */}
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-white/80 transition"
          >
            <Home size={20} />
            <span>Kembali ke Home</span>
          </Link>

          {/* Logout */}
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-graky-rust/20 text-graky-rust transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}