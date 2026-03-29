import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="หาของ logo" className="w-8 h-8" />
            <span className="font-bold text-xl text-gray-900">หาของ</span>
            <span className="text-sm text-gray-400 hidden sm:block">Find & Locate</span>
          </Link>
          <nav className="flex gap-1">
            <NavLink to="/" current={pathname} label="หน้าแรก" />
            <NavLink to="/categories" current={pathname} label="หมวดหมู่" />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
          Find & Locate — ค้นหาสินค้าจากร้านค้าใกล้คุณ
        </div>
      </footer>
    </div>
  )
}

function NavLink({ to, current, label }: { to: string; current: string; label: string }) {
  const active = to === '/' ? current === '/' : current.startsWith(to)
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  )
}
