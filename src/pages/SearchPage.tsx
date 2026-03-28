import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'
import { searchProducts, type SearchResult } from '../lib/api'
import { useGeolocation } from '../hooks/useGeolocation'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''

  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState<string>('distance')
  const geo = useGeolocation()

  useEffect(() => {
    if (!query && !category) return
    setLoading(true)

    searchProducts(query, {
      lat: geo.lat ?? undefined,
      lng: geo.lng ?? undefined,
      category: category || undefined,
      sort,
    })
      .then(res => {
        setResults(res.data || [])
        setTotal(res.meta?.total || 0)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [query, category, sort, geo.lat, geo.lng])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar initialQuery={query} />
      </div>

      {/* Filters & sort */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          {loading ? (
            'กำลังค้นหา...'
          ) : (
            <>พบ <span className="font-semibold text-gray-800">{total}</span> รายการ {query && <>สำหรับ "<span className="text-primary-600">{query}</span>"</>}</>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">เรียงตาม:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="distance">ระยะทาง</option>
            <option value="price">ราคา</option>
            <option value="rating">คะแนน</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-400">กำลังค้นหาร้านค้า...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((r, i) => (
            <ProductCard key={`${r.shop.id}-${r.product.id}-${i}`} result={r} />
          ))}
        </div>
      ) : query || category ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">ไม่พบผลลัพธ์</h3>
          <p className="text-gray-400">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📍</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">ค้นหาสินค้าที่ต้องการ</h3>
          <p className="text-gray-400">พิมพ์ชื่อสินค้าด้านบนเพื่อเริ่มค้นหา</p>
        </div>
      )}
    </div>
  )
}
