import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSuggestions } from '../lib/api'

interface Props {
  initialQuery?: string
  size?: 'large' | 'normal'
  autoFocus?: boolean
}

export default function SearchBar({ initialQuery = '', size = 'normal', autoFocus = false }: Props) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<{ name: string; name_normalized: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return }
    const timer = setTimeout(async () => {
      try {
        const res = await getSuggestions(query)
        setSuggestions(res.data || [])
      } catch { setSuggestions([]) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      setShowSuggestions(false)
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function selectSuggestion(name: string) {
    setQuery(name)
    setShowSuggestions(false)
    navigate(`/search?q=${encodeURIComponent(name)}`)
  }

  const inputClass = size === 'large'
    ? 'w-full px-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-xl transition-all pr-14'
    : 'w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none text-base transition-all pr-12'

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="ค้นหาสินค้า เช่น กระเบื้อง, กันดั้ม, อะไหล่รถ..."
          className={inputClass}
          autoFocus={autoFocus}
        />
        <button
          type="submit"
          className={`absolute right-3 ${size === 'large' ? 'top-4' : 'top-2.5'} bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => selectSuggestion(s.name)}
              className="w-full px-5 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>
                <div className="text-gray-900">{s.name}</div>
                {s.name_normalized && <div className="text-sm text-gray-400">{s.name_normalized}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
