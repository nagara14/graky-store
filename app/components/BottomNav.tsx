'use client'

import Link from 'next/link'
import { Home, ClipboardList, User, LogIn } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function BottomNav() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const isActive = (path: string) => pathname === path

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-graky-dark dark:bg-dark-surface border-t-2 border-graky-tan dark:border-graky-tan z-50 shadow-lg">
            <div className="flex justify-around items-center h-16">
                <Link
                    href="/"
                    prefetch={true}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/')
                            ? 'text-graky-tan dark:text-graky-tan'
                            : 'text-graky-cream/70 dark:text-dark-text-muted hover:text-graky-cream dark:hover:text-dark-text'
                        }`}
                >
                    <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link
                    href="/riwayat-pesanan"
                    prefetch={true}
                    className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/riwayat-pesanan')
                            ? 'text-graky-tan dark:text-graky-tan'
                            : 'text-graky-cream/70 dark:text-dark-text-muted hover:text-graky-cream dark:hover:text-dark-text'
                        }`}
                >
                    <ClipboardList size={20} strokeWidth={pathname.startsWith('/riwayat-pesanan') ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Pesanan</span>
                </Link>

                {session?.user ? (
                    <Link
                        href="/profil"
                        prefetch={true}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname.startsWith('/profil')
                                ? 'text-graky-tan dark:text-graky-tan'
                                : 'text-graky-cream/70 dark:text-dark-text-muted hover:text-graky-cream dark:hover:text-dark-text'
                            }`}
                    >
                        <User size={20} strokeWidth={pathname.startsWith('/profil') ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Akun</span>
                    </Link>
                ) : (
                    <Link
                        href="/auth/login"
                        prefetch={true}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/auth/login')
                                ? 'text-graky-tan dark:text-graky-tan'
                                : 'text-graky-cream/70 dark:text-dark-text-muted hover:text-graky-cream dark:hover:text-dark-text'
                            }`}
                    >
                        <LogIn size={20} strokeWidth={isActive('/auth/login') ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Masuk</span>
                    </Link>
                )}
            </div>
        </div>
    )
}
