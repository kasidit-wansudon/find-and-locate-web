import { useEffect, useState } from 'react'
import { adminGetClaims, adminUpdateClaim } from '../../lib/adminApi'

const STATUSES = [
  { value: 'pending', label: '⏳ รอตรวจสอบ' },
  { value: 'approved', label: '✅ อนุมัติแล้ว' },
  { value: 'rejected', label: '❌ ปฏิเสธ' },
]

export default function ClaimsAdminPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminGetClaims(status)
      setClaims(res.data || [])
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  async function handleUpdate(id: string, newStatus: 'approved' | 'rejected') {
    setUpdating(id)
    try {
      await adminUpdateClaim(id, newStatus)
      load()
    } catch { }
    setUpdating(null)
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">✅ Claims ร้านค้า</h1>
        <p className="text-sm text-gray-500 mt-0.5">คำขอยืนยันเจ้าของร้าน</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5">
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              status === s.value
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-2xl border text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">ไม่มี claims ในสถานะนี้</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map(claim => (
            <div key={claim.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800">{claim.shop_name}</span>
                    {claim.status === 'approved' && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Verified</span>}
                    {claim.status === 'rejected' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">✕ Rejected</span>}
                    {claim.status === 'pending' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⏳ Pending</span>}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">อีเมล:</span> {claim.email}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    ส่งเมื่อ: {new Date(claim.claimed_at).toLocaleString('th-TH')}
                    {claim.verified_at && ` · ตรวจสอบ: ${new Date(claim.verified_at).toLocaleString('th-TH')}`}
                  </div>
                </div>

                {claim.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleUpdate(claim.id, 'approved')}
                      disabled={updating === claim.id}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-60"
                    >
                      {updating === claim.id ? '...' : '✓ อนุมัติ'}
                    </button>
                    <button
                      onClick={() => handleUpdate(claim.id, 'rejected')}
                      disabled={updating === claim.id}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 disabled:opacity-60"
                    >
                      ✕ ปฏิเสธ
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
