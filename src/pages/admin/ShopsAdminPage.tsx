import { useEffect, useState, useCallback } from 'react'
import { adminGetShops, adminCreateShop, adminUpdateShop, adminDeleteShop } from '../../lib/adminApi'

const EMPTY_SHOP = {
  name: '', name_en: '', address: '', district: '', province: 'กรุงเทพ',
  lat: 0, lng: 0, phone: '', line_id: '', google_rating: '', photo_url: '', opening_hours: '', is_verified: false,
}

export default function ShopsAdminPage() {
  const [shops, setShops] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; shop: any; mode: 'create' | 'edit' }>({ open: false, shop: EMPTY_SHOP, mode: 'create' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadShops = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminGetShops(page, q)
      setShops(res.data || [])
      setTotal(res.meta?.total || 0)
    } catch { }
    setLoading(false)
  }, [page, q])

  useEffect(() => { loadShops() }, [loadShops])

  function openCreate() {
    setModal({ open: true, shop: { ...EMPTY_SHOP }, mode: 'create' })
    setError('')
  }
  function openEdit(shop: any) {
    setModal({ open: true, shop: { ...shop }, mode: 'edit' })
    setError('')
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...modal.shop,
        lat: parseFloat(modal.shop.lat) || 0,
        lng: parseFloat(modal.shop.lng) || 0,
        google_rating: modal.shop.google_rating ? parseFloat(modal.shop.google_rating) : null,
      }
      if (modal.mode === 'create') {
        await adminCreateShop(payload)
      } else {
        await adminUpdateShop(modal.shop.id, payload)
      }
      setModal(m => ({ ...m, open: false }))
      loadShops()
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    try { await adminDeleteShop(id); loadShops() } catch { }
    setDeleteConfirm(null)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🏪 จัดการร้านค้า</h1>
          <p className="text-sm text-gray-500 mt-0.5">ทั้งหมด {total} ร้าน</p>
        </div>
        <button onClick={openCreate} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + เพิ่มร้านค้า
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 flex gap-3">
        <input
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1) }}
          placeholder="ค้นหาชื่อร้าน..."
          className="flex-1 text-sm border-none outline-none"
        />
        {q && <button onClick={() => { setQ(''); setPage(1) }} className="text-gray-400 hover:text-gray-600 text-xs">✕ ล้าง</button>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🏪</div>
            <p className="text-sm">ยังไม่มีร้านค้า</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">ชื่อร้าน</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">เขต</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">เบอร์</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">คะแนน</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Verified</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shops.map(shop => (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{shop.name}</div>
                      {shop.name_en && <div className="text-xs text-gray-400">{shop.name_en}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{shop.district}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{shop.phone || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {shop.google_rating ? (
                        <span className="text-yellow-500 font-medium">⭐ {shop.google_rating}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {shop.is_verified ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ ยืนยัน</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">รอ</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(shop)} className="text-primary-600 hover:text-primary-800 text-xs font-medium mr-3">แก้ไข</button>
                      <button onClick={() => setDeleteConfirm(shop.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">← ก่อน</button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">ถัดไป →</button>
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">{modal.mode === 'create' ? '➕ เพิ่มร้านค้า' : '✏️ แก้ไขร้านค้า'}</h2>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
              {[
                { key: 'name', label: 'ชื่อร้าน *', required: true },
                { key: 'name_en', label: 'ชื่อภาษาอังกฤษ' },
                { key: 'address', label: 'ที่อยู่' },
                { key: 'district', label: 'เขต' },
                { key: 'province', label: 'จังหวัด' },
                { key: 'lat', label: 'Latitude', type: 'number' },
                { key: 'lng', label: 'Longitude', type: 'number' },
                { key: 'phone', label: 'เบอร์โทร' },
                { key: 'line_id', label: 'LINE ID' },
                { key: 'google_rating', label: 'Google Rating', type: 'number' },
                { key: 'photo_url', label: 'Photo URL' },
                { key: 'opening_hours', label: 'เวลาทำการ' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={modal.shop[f.key] ?? ''}
                    onChange={e => setModal(m => ({ ...m, shop: { ...m.shop, [f.key]: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_verified"
                  checked={!!modal.shop.is_verified}
                  onChange={e => setModal(m => ({ ...m, shop: { ...m.shop, is_verified: e.target.checked } }))}
                  className="rounded"
                />
                <label htmlFor="is_verified" className="text-sm text-gray-700">ร้านยืนยันแล้ว (Verified)</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-800 mb-2">ลบร้านค้า?</h3>
            <p className="text-sm text-gray-500 mb-5">ข้อมูลร้านและ inventory ทั้งหมดจะถูกลบออก</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg">ยกเลิก</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
