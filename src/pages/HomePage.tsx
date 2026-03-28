import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import { getCategories, getTrending, type Category } from '../lib/api'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [trending, setTrending] = useState<{ query: string; count: number }[]>([])

  useEffect(() => {
    getCategories().then(r => setCategories(r.data || [])).catch(() => {})
    getTrending().then(r => setTrending(r.data || [])).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">หาของ</h1>
          <p className="text-primary-200 text-lg mb-8">ค้นหาสินค้าจากร้านค้าใกล้คุณในกรุงเทพ</p>
          <div className="max-w-2xl mx-auto">
            <SearchBar size="large" autoFocus />
          </div>

          {/* Quick search tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['กระเบื้อง', 'กันดั้ม', 'อะไหล่รถ', 'หลอดไฟ', 'ปูนซีเมนต์'].map(tag => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm text-white/90 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">หมวดหมู่สินค้า</h2>
          <Link to="/categories" className="text-sm text-primary-600 hover:text-primary-700">ดูทั้งหมด →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/search?category=${encodeURIComponent(cat.name)}`}
              className="card p-5 text-center hover:shadow-md transition-shadow group"
            >
              <div className="text-3xl mb-2">{cat.icon || '📦'}</div>
              <div className="font-medium text-gray-800 group-hover:text-primary-600 transition-colors">{cat.name}</div>
              <div className="text-xs text-gray-400">{cat.name_en}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      {trending.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ค้นหายอดนิยม</h2>
          <div className="flex flex-wrap gap-2">
            {trending.map((t, i) => (
              <Link
                key={i}
                to={`/search?q=${encodeURIComponent(t.query)}`}
                className="btn-secondary flex items-center gap-2"
              >
                <span className="text-primary-500">🔥</span>
                {t.query}
                <span className="text-xs text-gray-400">({t.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">ใช้งานง่ายใน 3 ขั้นตอน</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'ค้นหาสินค้า', desc: 'พิมพ์ชื่อสินค้าที่ต้องการ' },
              { icon: '📍', title: 'เจอร้านใกล้คุณ', desc: 'ระบบแสดงร้านที่มีสินค้าพร้อมระยะทาง' },
              { icon: '🛒', title: 'ไปซื้อได้เลย', desc: 'ดูราคา สต็อก แล้วไปร้านได้ทันที' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
