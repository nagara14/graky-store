import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { initializeDatabase } from '@/lib/db'

export default async function KaryawanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await initializeDatabase()
  const session = await auth()

  if (!session) {
    redirect('/auth/login')
  }

  const userRole = (session.user as any).role
  if (userRole !== 'KARYAWAN') {
    redirect('/')
  }

  // DashboardSidebar is already rendered in parent dashboard layout
  // This layout just needs to render children
  return <>{children}</>
}
