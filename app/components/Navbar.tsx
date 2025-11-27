'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ShoppingCart, Moon, Sun, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCart } from './CartContext'
import { useTheme } from '../context/ThemeContext'

interface Category {
  id: string
  name: string
  icon: string
}

export default function Navbar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()
  const { items } = useCart()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    // Check localStorage first
    const cached = localStorage.getItem('navbar_categories')
    if (cached) {
      try {
        setCategories(JSON.parse(cached))
        setLoading(false)
        return
      } catch (e) {
        // Invalid cache, fetch fresh
      }
    }
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const res = await fetch('/api/categories', {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        console.warn(`[Navbar] Categories API returned status ${res.status}`)
      }

      const data = await res.json()
      const categories = Array.isArray(data) ? data : []
      setCategories(categories)
      // Cache untuk 1 hari
      localStorage.setItem('navbar_categories', JSON.stringify(categories))
      setError(null) // Clear error on success
    } catch (err) {
      // Ignore abort errors (component unmounted or timeout)
      if (err instanceof Error && err.name === 'AbortError') {
        console.debug('[Navbar] Fetch cancelled')
        setError(null)
        return
      }
      const errorMsg = err instanceof Error ? err.message : 'Gagal fetch kategori'
      console.warn('[Navbar] fetchCategories error (using fallback):', errorMsg)
      // Don't set error state, just use empty categories
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const handleCategoryClick = (catId: string) => {
    router.push(`/kategori/${catId}`)
  }

  const userRole = (session?.user as any)?.role

  // Memoize kategori menu untuk mencegah re-render
  const kategoriBadge = useMemo(() => {
    if (loading) return <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
    if (error) return <div className="px-4 py-3 text-sm text-red-600">Error</div>
    if (categories.length === 0) return <div className="px-4 py-3 text-sm text-gray-500">Tidak ada kategori</div>

    return categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => handleCategoryClick(cat.id)}
        className="block w-full text-left px-4 py-2 text-sm text-graky-brown dark:text-dark-text-muted hover:bg-graky-tan/50 dark:hover:bg-dark-border first:rounded-t-lg last:rounded-b-lg transition"
      >
        {cat.icon} {cat.name}
      </button>
    ))
  }, [categories, loading, error])

  return (
    <nav className="bg-graky-cream dark:bg-dark-surface border-b-2 border-graky-brown/20 dark:border-dark-border sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl text-graky-dark dark:text-dark-text transition-colors">
            GRAKY
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-graky-brown dark:text-dark-text-muted hover:text-graky-dark dark:hover:text-dark-text transition font-medium">
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="text-graky-brown dark:text-dark-text-muted hover:text-graky-dark dark:hover:text-dark-text transition font-medium">
                Kategori
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-lg dark:shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-10 border dark:border-dark-border">
                {kategoriBadge}
              </div>
            </div>

            <Link href="/#" className="text-graky-brown dark:text-dark-text-muted hover:text-graky-dark dark:hover:text-dark-text transition font-medium">
              Tentang
            </Link>

            {/* Riwayat Pesanan - only for logged in USER */}
            {session?.user && userRole === 'USER' && (
              <Link href="/riwayat-pesanan" className="text-graky-brown dark:text-dark-text-muted hover:text-graky-dark dark:hover:text-dark-text transition font-medium">
                Riwayat Pesanan
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-graky-brown dark:text-dark-text-muted hover:bg-graky-tan/20 dark:hover:bg-dark-border transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* WhatsApp Icon */}
            <a
              href="https://wa.me/6285173200841"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              aria-label="Hubungi via WhatsApp"
              title="Hubungi via WhatsApp"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-green-600 dark:text-green-400"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>

            {/* Cart Icon */}
            <Link href="/keranjang" className="relative text-graky-brown dark:text-dark-text-muted hover:text-graky-dark dark:hover:text-dark-text transition">
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-graky-rust dark:bg-graky-tan text-white dark:text-dark-bg text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {session?.user ? (
              <div className="relative group">
                <button className="text-graky-brown dark:text-dark-text-muted hover:text-graky-dark dark:hover:text-dark-text transition font-medium">
                  {session.user.name}
                </button>
                <div className="absolute right-0 mt-0 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-lg dark:shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-10 border dark:border-dark-border">
                  <Link
                    href={userRole === 'ADMIN' ? '/dashboard/admin' : '/dashboard/karyawan'}
                    className="block px-4 py-2 text-sm text-graky-brown dark:text-dark-text-muted hover:bg-graky-tan/50 dark:hover:bg-dark-border rounded-t-lg transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-graky-brown dark:text-dark-text-muted hover:text-graky-dark dark:hover:text-dark-text transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-graky-dark dark:bg-graky-tan text-graky-cream dark:text-dark-bg px-4 py-2 rounded-lg hover:bg-graky-charcoal dark:hover:bg-graky-brown transition font-semibold"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Header (Simplified) */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-graky-dark dark:text-dark-text hover:bg-graky-tan/20 dark:hover:bg-dark-border transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Cart Icon Mobile - Optional since it's in bottom nav, but good to have top right too or maybe search */}
            <Link href="/keranjang" className="relative text-graky-dark dark:text-dark-text">
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-graky-rust dark:bg-graky-tan text-white dark:text-dark-bg text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
