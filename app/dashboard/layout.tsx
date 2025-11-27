import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import DashboardSidebar from '@/app/components/DashboardSidebar'
import { initializeDatabase } from '@/lib/db'

export default async function DashboardLayout({
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
  if (!['ADMIN', 'KARYAWAN'].includes(userRole)) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />
      <main className="flex-1 pt-20 md:pt-0">
        <div className="p-6">
          {/* Top navbar/header untuk dashboard */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 md:hidden">
            <p className="text-sm font-semibold text-graky-dark">
              {userRole === 'ADMIN' ? 'Dashboard Admin' : 'Dashboard Karyawan'}
            </p>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
