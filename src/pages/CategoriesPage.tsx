import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, type Category } from '../lib/api'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then(r => setCategories(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">หมวดหมู่สินค้า</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/search?category=${encodeURIComponent(cat.name)}`}
            className="card p-6 text-center hover:shadow-md transition-all group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon || '📦'}</div>
            <div className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{cat.name}</div>
            <div className="text-sm text-gray-400 mt-1">{cat.name_en}</div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          ยังไม่มีหมวดหมู่สินค้า
        </div>
      )}
    </div>
  )
}
