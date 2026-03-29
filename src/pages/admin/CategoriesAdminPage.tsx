import { useEffect, useState } from 'react'
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../lib/adminApi'

const EMPTY_CAT = { name: '', name_en: '', icon: '', parent_id: '' }

export default function CategoriesAdminPage() {
  const [cats, setCats] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<{ open: boolean; cat: any; mode: 'create' | 'edit' }>({ open: false, cat: EMPTY_CAT, mode: 'create' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminGetCategories()
      setCats(res.data || [])
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const payload = { ...modal.cat, parent_id: modal.cat.parent_id || null }
      if (modal.mode === 'create') await adminCreateCategory(payload)
      else await adminUpdateCategory(modal.cat.id, payload)
      setModal(m => ({ ...m, open: false }))
      load()
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    try { await adminDeleteCategory(id); load() } catch { }
    setDeleteConfirm(null)
  }

  // Group: parent vs children
  const parents = cats.filter(c => !c.parent_id)
  const children = cats.filter(c => c.parent_id)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🗂️ จัดการหมวดหมู่</h1>
          <p className="text-sm text-gray-500 mt-0.5">ทั้งหมด {cats.length} หมวดหมู่</p>
        </div>
        <button
          onClick={() => { setModal({ open: true, cat: { ...EMPTY_CAT }, mode: 'create' }); setError('') }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + เพิ่มหมวดหมู่
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {parents.length === 0 && cats.length === 0 ? (
            <div className="bg-white rounded-2xl border text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🗂️</div>
              <p className="text-sm">ยังไม่มีหมวดหมู่</p>
            </div>
          ) : (
            <>
              {/* Parent categories */}
              {parents.map(parent => (
                <div key={parent.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Parent row */}
                  <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-50">
                    <span className="text-2xl">{parent.icon || '📁'}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{parent.name}</div>
                      {parent.name_en && <div className="text-xs text-gray-400">{parent.name_en}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setModal({ open: true, cat: { ...EMPTY_CAT, parent_id: parent.id }, mode: 'create' })
                          setError('')
                        }}
                        className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded-lg hover:bg-green-50"
                      >
                        + ย่อย
                      </button>
                      <button onClick={() => { setModal({ open: true, cat: { ...parent }, mode: 'edit' }); setError('') }}
                        className="text-xs text-primary-600 hover:text-primary-800 font-medium px-2 py-1 rounded-lg hover:bg-primary-50">
                        แก้ไข
                      </button>
                      <button onClick={() => setDeleteConfirm(parent.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50">
                        ลบ
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  {children.filter(c => c.parent_id === parent.id).map(child => (
                    <div key={child.id} className="px-5 py-3 flex items-center gap-3 border-b border-gray-50 last:border-0 bg-gray-50/50">
                      <span className="w-5 text-center text-gray-300 text-xs">└</span>
                      <span className="text-base">{child.icon || '•'}</span>
                      <div className="flex-1">
                        <div className="text-sm text-gray-700">{child.name}</div>
                        {child.name_en && <div className="text-xs text-gray-400">{child.name_en}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setModal({ open: true, cat: { ...child }, mode: 'edit' }); setError('') }}
                          className="text-xs text-primary-600 font-medium px-2 py-1 rounded-lg hover:bg-primary-50">แก้ไข</button>
                        <button onClick={() => setDeleteConfirm(child.id)}
                          className="text-xs text-red-500 font-medium px-2 py-1 rounded-lg hover:bg-red-50">ลบ</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Orphan children (parent_id set but parent not in list) */}
              {children.filter(c => !parents.find(p => p.id === c.parent_id)).map(child => (
                <div key={child.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                  <span className="text-2xl">{child.icon || '📄'}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{child.name}</div>
                    {child.name_en && <div className="text-xs text-gray-400">{child.name_en}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setModal({ open: true, cat: { ...child }, mode: 'edit' }); setError('') }}
                      className="text-xs text-primary-600 font-medium">แก้ไข</button>
                    <button onClick={() => setDeleteConfirm(child.id)} className="text-xs text-red-500 font-medium">ลบ</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">{modal.mode === 'create' ? '➕ เพิ่มหมวดหมู่' : '✏️ แก้ไขหมวดหมู่'}</h2>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
              {[
                { key: 'name', label: 'ชื่อ (ภาษาไทย) *' },
                { key: 'name_en', label: 'ชื่อ (English)' },
                { key: 'icon', label: 'Icon (emoji)' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={modal.cat[f.key] ?? ''}
                    onChange={e => setModal(m => ({ ...m, cat: { ...m.cat, [f.key]: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">หมวดหมู่หลัก (ถ้าเป็นย่อย)</label>
                <select
                  value={modal.cat.parent_id || ''}
                  onChange={e => setModal(m => ({ ...m, cat: { ...m.cat, parent_id: e.target.value } }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">— ไม่มี (หมวดหลัก) —</option>
                  {parents.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving || !modal.cat.name} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg disabled:opacity-60">
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
            <h3 className="font-semibold text-gray-800 mb-2">ลบหมวดหมู่?</h3>
            <p className="text-sm text-gray-500 mb-5">หมวดหมู่ย่อยจะยังคงอยู่ (ต้องลบแยก)</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 text-sm border rounded-lg">ยกเลิก</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
