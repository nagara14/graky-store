'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Mail, ShieldCheck, LogOut, ShoppingBag, Settings, Home } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
    const { data: session } = useSession()
    const router = useRouter()
    const userRole = (session?.user as any)?.role

    if (!session) {
        router.push('/auth/login')
        return null
    }

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: '/' })
    }

    return (
        <div className="min-h-screen bg-graky-tan/10 dark:bg-dark-bg pb-20 md:pb-0">
            <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-graky-dark dark:text-dark-text">Profil Saya</h1>
                    <p className="text-sm text-graky-brown dark:text-dark-text-muted mt-1">Kelola akun dan preferensi Anda</p>
                </div>

                {/* User Info Card */}
                <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-md p-6 mb-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-graky-brown dark:bg-graky-tan rounded-full flex items-center justify-center">
                            <User size={32} className="text-white dark:text-dark-bg" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl md:text-2xl font-bold text-graky-dark dark:text-dark-text">{session.user?.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail size={14} className="text-graky-brown dark:text-dark-text-muted" />
                                <p className="text-sm text-graky-brown dark:text-dark-text-muted">{session.user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Role Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-graky-brown/10 dark:bg-graky-tan/20 rounded-lg">
                        <ShieldCheck size={16} className="text-graky-brown dark:text-graky-tan" />
                        <span className="text-sm font-semibold text-graky-brown dark:text-graky-tan uppercase">{userRole}</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-graky-brown dark:text-dark-text-muted uppercase tracking-wide px-2">Menu</h3>

                    {/* Dashboard Link (for admin/karyawan) */}
                    {(userRole === 'ADMIN' || userRole === 'KARYAWAN') && (
                        <Link
                            href={userRole === 'ADMIN' ? '/dashboard/admin' : '/dashboard/karyawan'}
                            className="flex items-center gap-4 p-4 bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-md transition"
                        >
                            <div className="w-10 h-10 bg-graky-brown/10 dark:bg-graky-tan/20 rounded-lg flex items-center justify-center">
                                <Settings size={20} className="text-graky-brown dark:text-graky-tan" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-graky-dark dark:text-dark-text">Dashboard</p>
                                <p className="text-xs text-graky-brown dark:text-dark-text-muted">Kelola toko dan produk</p>
                            </div>
                        </Link>
                    )}

                    {/* Order History */}
                    <Link
                        href="/riwayat-pesanan"
                        className="flex items-center gap-4 p-4 bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-md transition"
                    >
                        <div className="w-10 h-10 bg-graky-brown/10 dark:bg-graky-tan/20 rounded-lg flex items-center justify-center">
                            <ShoppingBag size={20} className="text-graky-brown dark:text-graky-tan" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-graky-dark dark:text-dark-text">Riwayat Pesanan</p>
                            <p className="text-xs text-graky-brown dark:text-dark-text-muted">Lihat pesanan Anda</p>
                        </div>
                    </Link>

                    {/* Back to Home */}
                    <Link
                        href="/"
                        className="flex items-center gap-4 p-4 bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-md transition"
                    >
                        <div className="w-10 h-10 bg-graky-brown/10 dark:bg-graky-tan/20 rounded-lg flex items-center justify-center">
                            <Home size={20} className="text-graky-brown dark:text-graky-tan" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-graky-dark dark:text-dark-text">Kembali ke Home</p>
                            <p className="text-xs text-graky-brown dark:text-dark-text-muted">Jelajahi produk</p>
                        </div>
                    </Link>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm hover:shadow-md transition border border-red-200 dark:border-red-800"
                    >
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                            <LogOut size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-semibold text-red-600 dark:text-red-400">Logout</p>
                            <p className="text-xs text-red-500 dark:text-red-400/70">Keluar dari akun</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}
