import { useEffect, useState, useCallback } from 'react'
import {
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminGetProductInventory, adminUpdateInventory, adminCreateInventory,
  adminGetCategories,
} from '../../lib/adminApi'
import { adminGetShops } from '../../lib/adminApi'

const EMPTY_PRODUCT = { name: '', brand: '', description: '', image_url: '', tags: '', category_id: '' }

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [shops, setShops] = useState<any[]>([])

  // Product modal
  const [modal, setModal] = useState<{ open: boolean; product: any; mode: 'create' | 'edit' }>({ open: false, product: EMPTY_PRODUCT, mode: 'create' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Inventory panel
  const [invPanel, setInvPanel] = useState<{ open: boolean; product: any; items: any[] }>({ open: false, product: null, items: [] })
  const [invLoading, setInvLoading] = useState(false)
  const [newInv, setNewInv] = useState({ shop_id: '', price: '', price_unit: 'บาท', in_stock: true, stock_quantity: '' })
  const [invSaving, setInvSaving] = useState(false)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminGetProducts(page, q)
      setProducts(res.data || [])
      setTotal(res.meta?.total || 0)
    } catch { }
    setLoading(false)
  }, [page, q])

  useEffect(() => { loadProducts() }, [loadProducts])

  useEffect(() => {
    adminGetCategories().then(r => setCategories(r.data || [])).catch(() => {})
    adminGetShops(1, '').then(r => setShops(r.data || [])).catch(() => {})
  }, [])

  async function openInventory(product: any) {
    setInvPanel({ open: true, product, items: [] })
    setInvLoading(true)
    try {
      const res = await adminGetProductInventory(product.id)
      setInvPanel(p => ({ ...p, items: res.data || [] }))
    } catch { }
    setInvLoading(false)
  }

  async function handleInvUpdate(inv: any, field: string, value: any) {
    const updated = { ...inv, [field]: value }
    setInvPanel(p => ({ ...p, items: p.items.map(i => i.id === inv.id ? updated : i) }))
    try {
      await adminUpdateInventory(inv.id, updated)
    } catch { }
  }

  async function handleAddInventory() {
    setInvSaving(true)
    try {
      await adminCreateInventory({
        shop_id: newInv.shop_id,
        product_id: invPanel.product?.id,
        price: newInv.price ? parseFloat(newInv.price) : null,
        price_unit: newInv.price_unit,
        in_stock: newInv.in_stock,
        stock_quantity: newInv.stock_quantity ? parseInt(newInv.stock_quantity) : null,
      })
      setNewInv({ shop_id: '', price: '', price_unit: 'บาท', in_stock: true, stock_quantity: '' })
      const res = await adminGetProductInventory(invPanel.product?.id)
      setInvPanel(p => ({ ...p, items: res.data || [] }))
    } catch { }
    setInvSaving(false)
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      if (modal.mode === 'create') await adminCreateProduct(modal.product)
      else await adminUpdateProduct(modal.product.id, modal.product)
      setModal(m => ({ ...m, open: false }))
      loadProducts()
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    try { await adminDeleteProduct(id); loadProducts() } catch { }
    setDeleteConfirm(null)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">📦 สินค้า & Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">ทั้งหมด {total} รายการ</p>
        </div>
        <button
          onClick={() => { setModal({ open: true, product: { ...EMPTY_PRODUCT }, mode: 'create' }); setError('') }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + เพิ่มสินค้า
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 flex gap-3">
        <input value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="ค้นหาชื่อสินค้า..." className="flex-1 text-sm outline-none" />
        {q && <button onClick={() => { setQ(''); setPage(1) }} className="text-gray-400 text-xs">✕</button>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><div className="text-4xl mb-3">📦</div><p className="text-sm">ยังไม่มีสินค้า</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">สินค้า</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">หมวดหมู่</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">แบรนด์</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{p.name}</div>
                      {p.tags && <div className="text-xs text-gray-400 truncate max-w-xs">{p.tags}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.category_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{p.brand || '—'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openInventory(p)} className="text-green-600 hover:text-green-800 text-xs font-medium">📦 Inventory</button>
                      <button onClick={() => { setModal({ open: true, product: { ...p }, mode: 'edit' }); setError('') }} className="text-primary-600 hover:text-primary-800 text-xs font-medium">แก้ไข</button>
                      <button onClick={() => setDeleteConfirm(p.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">ลบ</button>
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

      {/* Product Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">{modal.mode === 'create' ? '➕ เพิ่มสินค้า' : '✏️ แก้ไขสินค้า'}</h2>
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
              {[
                { key: 'name', label: 'ชื่อสินค้า *' },
                { key: 'brand', label: 'แบรนด์' },
                { key: 'description', label: 'รายละเอียด' },
                { key: 'image_url', label: 'Image URL' },
                { key: 'tags', label: 'Tags (คั่นด้วย comma)' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={modal.product[f.key] ?? ''}
                    onChange={e => setModal(m => ({ ...m, product: { ...m.product, [f.key]: e.target.value } }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">หมวดหมู่</label>
                <select
                  value={modal.product.category_id || ''}
                  onChange={e => setModal(m => ({ ...m, product: { ...m.product, category_id: e.target.value } }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">— ไม่ระบุ —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setModal(m => ({ ...m, open: false }))} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg disabled:opacity-60">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Panel */}
      {invPanel.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">📦 Inventory — {invPanel.product?.name}</h2>
              <button onClick={() => setInvPanel(p => ({ ...p, open: false }))} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="px-6 py-4">
              {invLoading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
              ) : invPanel.items.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีร้านขายสินค้านี้</p>
              ) : (
                <div className="space-y-3">
                  {invPanel.items.map(inv => (
                    <div key={inv.id} className="border border-gray-100 rounded-xl p-3 space-y-2">
                      <div className="font-medium text-sm text-gray-700">{inv.shop_name}</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">ราคา</label>
                          <input
                            type="number"
                            value={inv.price ?? ''}
                            onChange={e => handleInvUpdate(inv, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">จำนวน</label>
                          <input
                            type="number"
                            value={inv.stock_quantity ?? ''}
                            onChange={e => handleInvUpdate(inv, 'stock_quantity', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-200"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!inv.in_stock}
                              onChange={e => handleInvUpdate(inv, 'in_stock', e.target.checked)}
                            />
                            มีของ
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add inventory */}
              <div className="mt-5 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">➕ เพิ่มร้านค้าใหม่</h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs text-gray-500">ร้านค้า</label>
                    <select
                      value={newInv.shop_id}
                      onChange={e => setNewInv(n => ({ ...n, shop_id: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                    >
                      <option value="">— เลือกร้าน —</option>
                      {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">ราคา (บาท)</label>
                    <input type="number" value={newInv.price} onChange={e => setNewInv(n => ({ ...n, price: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">จำนวน</label>
                    <input type="number" value={newInv.stock_quantity} onChange={e => setNewInv(n => ({ ...n, stock_quantity: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={newInv.in_stock} onChange={e => setNewInv(n => ({ ...n, in_stock: e.target.checked }))} />
                      มีของ
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleAddInventory}
                  disabled={!newInv.shop_id || invSaving}
                  className="w-full py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {invSaving ? 'กำลังเพิ่ม...' : '+ เพิ่ม'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-800 mb-2">ลบสินค้า?</h3>
            <p className="text-sm text-gray-500 mb-5">inventory ที่เกี่ยวข้องจะถูกลบออกด้วย</p>
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
