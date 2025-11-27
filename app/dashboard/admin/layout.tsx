import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Check if user is authenticated and is ADMIN
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/auth/login')
  }

  return <div>{children}</div>
}
