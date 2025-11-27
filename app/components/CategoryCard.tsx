'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Props {
  name: string
  icon: string
  id: string
  count: number
}

export default function CategoryCard({ name, icon, id, count }: Props) {
  const { data: session } = useSession()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault()
      router.push('/auth/login?redirect=/kategori/' + id)
    }
  }

  return (
    <Link
      href={`/kategori/${id}`}
      onClick={handleClick}
      className="group bg-graky-cream dark:bg-dark-surface border-2 border-graky-brown/20 dark:border-dark-border rounded-xl p-4 sm:p-6 hover:border-graky-brown dark:hover:border-graky-tan hover:shadow-lg dark:hover:shadow-xl transition cursor-pointer"
    >
      <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition">{icon}</div>
      <h3 className="font-bold text-graky-dark dark:text-dark-text text-sm sm:text-base mb-1">{name}</h3>
      <p className="text-xs sm:text-sm text-graky-brown/70 dark:text-dark-text-muted">{count} item</p>
    </Link>
  )
}
