import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getShopDetail } from '../lib/api'

export default function ShopPage() {
  const { id } = useParams<{ id: string }>()
  const [shop, setShop] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getShopDetail(id)
      .then(res => {
        setShop(res.data.shop)
        setProducts(res.data.products || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-medium text-gray-700">ไม่พบร้านค้า</h2>
        <Link to="/" className="text-primary-600 hover:underline mt-4 inline-block">← กลับหน้าแรก</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-4">
        <Link to="/" className="hover:text-gray-600">หน้าแรก</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{shop.name}</span>
      </nav>

      {/* Shop header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              {shop.is_verified && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            {shop.name_en && <p className="text-sm text-gray-400 mb-2">{shop.name_en}</p>}
            <p className="text-gray-600 mb-3">{shop.address}, {shop.district}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {shop.phone && (
                <a href={`tel:${shop.phone}`} className="flex items-center gap-1 text-primary-600 hover:underline">
                  📞 {shop.phone}
                </a>
              )}
              {shop.line_id && (
                <span className="flex items-center gap-1 text-green-600">
                  💬 LINE: {shop.line_id}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            {shop.google_rating && (
              <div className="flex items-center gap-1 text-lg">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{shop.google_rating.toFixed(1)}</span>
              </div>
            )}
            <a
              href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-sm text-primary-600 hover:underline"
            >
              🗺️ เปิดแผนที่
            </a>
          </div>
        </div>
      </div>

      {/* Products at this shop */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">สินค้าในร้าน ({products.length})</h2>
      {products.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((p: any) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">{p.name}</h3>
                  {p.brand && <span className="text-xs text-gray-400">{p.brand}</span>}
                </div>
                <div className="text-right shrink-0 ml-3">
                  {p.price ? (
                    <div>
                      <span className="font-bold text-primary-600">{p.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-1">/{p.price_unit}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">สอบถาม</span>
                  )}
                  <div className="mt-1">
                    {p.in_stock ? (
                      <span className="text-xs text-green-600">✓ มีสินค้า</span>
                    ) : (
                      <span className="text-xs text-red-500">✗ หมด</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">ยังไม่มีสินค้าในระบบ</p>
      )}
    </div>
  )
}
