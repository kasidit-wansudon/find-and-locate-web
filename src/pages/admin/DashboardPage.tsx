import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStats } from '../../lib/adminApi'

interface Stats {
  shops: number
  products: number
  inventory_total: number
  inventory_in_stock: number
  searches_7d: number
  pending_claims: number
  top_searches: { query: string; count: number }[]
  shops_by_district: { district: string; count: number }[]
}

function StatCard({ icon, label, value, sub, color, to }: {
  icon: string; label: string; value: number | string; sub?: string; color: string; to?: string
}) {
  const inner = (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  const stockPct = stats?.inventory_total
    ? Math.round((stats.inventory_in_stock / stats.inventory_total) * 100)
    : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">ภาพรวมระบบ Find & Locate</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon="🏪" label="ร้านค้าทั้งหมด" value={stats?.shops || 0} color="text-blue-600" to="/admin/shops" />
        <StatCard icon="📦" label="สินค้าทั้งหมด" value={stats?.products || 0} color="text-purple-600" to="/admin/products" />
        <StatCard
          icon="✅"
          label="สินค้ามีของ"
          value={`${stats?.inventory_in_stock || 0}`}
          sub={`${stockPct}% จาก ${stats?.inventory_total || 0} รายการ`}
          color="text-green-600"
          to="/admin/products"
        />
        <StatCard
          icon="🔍"
          label="การค้นหา 7 วัน"
          value={stats?.searches_7d || 0}
          color="text-orange-600"
        />
        <StatCard
          icon="📋"
          label="Claims รอตรวจสอบ"
          value={stats?.pending_claims || 0}
          color={stats?.pending_claims ? 'text-red-600' : 'text-gray-600'}
          to="/admin/claims"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">🔥 คำค้นหายอดนิยม (7 วัน)</h2>
          {stats?.top_searches?.length ? (
            <div className="space-y-2">
              {stats.top_searches.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-gray-400 text-right">{i + 1}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary-500 h-full rounded-full"
                      style={{ width: `${Math.round((s.count / (stats.top_searches[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 w-32 truncate">{s.query}</span>
                  <span className="text-xs text-gray-400 w-8 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีข้อมูล</p>
          )}
        </div>

        {/* Shops by District */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">📍 ร้านค้าตามเขต</h2>
          {stats?.shops_by_district?.length ? (
            <div className="space-y-2">
              {stats.shops_by_district.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-accent-500 h-full rounded-full"
                      style={{ width: `${Math.round((d.count / (stats.shops_by_district[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 w-32 truncate">{d.district}</span>
                  <span className="text-xs text-gray-400 w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">⚡ Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/shops" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
            + เพิ่มร้านค้า
          </Link>
          <Link to="/admin/products" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100">
            + เพิ่มสินค้า
          </Link>
          <Link to="/admin/categories" className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100">
            + เพิ่มหมวดหมู่
          </Link>
          {(stats?.pending_claims || 0) > 0 && (
            <Link to="/admin/claims" className="px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">
              ✅ ตรวจสอบ Claims ({stats?.pending_claims})
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
