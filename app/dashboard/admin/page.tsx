'use client'

import { useEffect, useState } from 'react'
import { Users, Package } from 'lucide-react'
import axios from 'axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalKaryawan: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const usersRes = await axios.get('/api/users')
      const productsRes = await axios.get('/api/products')

      const karyawanCount = usersRes.data.filter((u: any) => u.role === 'KARYAWAN').length

      setStats({
        totalUsers: usersRes.data.length,
        totalProducts: productsRes.data.length,
        totalKaryawan: karyawanCount,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-graky-dark">Dashboard Admin</h1>
        <p className="text-sm sm:text-base text-graky-brown/70">Kelola seluruh sistem Graky Store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard icon={Users} label="Total User" value={stats.totalUsers} color="bg-blue-500" />
        <StatCard icon={Users} label="Total Karyawan" value={stats.totalKaryawan} color="bg-green-500" />
        <StatCard icon={Package} label="Total Produk" value={stats.totalProducts} color="bg-purple-500" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-graky-dark mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <a
            href="/dashboard/admin/users"
            className="p-3 sm:p-4 border-2 border-graky-brown/20 rounded-lg hover:border-graky-brown hover:bg-graky-tan/10 transition text-center"
          >
            <Users className="mx-auto mb-2 text-graky-brown" size={20} />
            <p className="font-semibold text-sm sm:text-base text-graky-dark">Manajemen User</p>
          </a>
          <a
            href="/dashboard/admin/karyawan"
            className="p-3 sm:p-4 border-2 border-graky-brown/20 rounded-lg hover:border-graky-brown hover:bg-graky-tan/10 transition text-center"
          >
            <Users className="mx-auto mb-2 text-graky-brown" size={20} />
            <p className="font-semibold text-sm sm:text-base text-graky-dark">Kelola Karyawan</p>
          </a>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-graky-brown/70 mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-graky-dark truncate">{value}</p>
        </div>
        <div className={`${color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
          <Icon size={20} className="text-white sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  )
}
