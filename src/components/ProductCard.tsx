import { Link } from 'react-router-dom'
import type { SearchResult } from '../lib/api'

export default function ProductCard({ result }: { result: SearchResult }) {
  const { shop, product, inventory, distance_km } = result

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Product info */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
            {product.name_normalized && (
              <p className="text-sm text-gray-500 truncate">{product.name_normalized}</p>
            )}
            {product.brand && (
              <span className="text-xs text-gray-400">{product.brand}</span>
            )}
          </div>
          <div className="text-right shrink-0">
            {inventory.price ? (
              <div>
                <span className="text-lg font-bold text-primary-600">
                  {inventory.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 ml-1">/{inventory.price_unit}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">สอบถามราคา</span>
            )}
          </div>
        </div>

        {/* Stock status */}
        <div className="flex items-center gap-2 mb-3">
          {inventory.in_stock ? (
            <span className="badge-green">มีสินค้า</span>
          ) : (
            <span className="badge-red">สินค้าหมด</span>
          )}
          {inventory.stock_quantity != null && inventory.stock_quantity > 0 && (
            <span className="text-xs text-gray-400">เหลือ {inventory.stock_quantity} {inventory.price_unit}</span>
          )}
        </div>

        {/* Shop info */}
        <Link to={`/shop/${shop.id}`} className="block group">
          <div className="bg-gray-50 rounded-xl p-3 group-hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800 truncate">{shop.name}</span>
                  {shop.is_verified && (
                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{shop.district}</p>
              </div>
              <div className="text-right shrink-0 ml-3">
                {shop.google_rating && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">★</span>
                    <span className="text-gray-600">{shop.google_rating.toFixed(1)}</span>
                  </div>
                )}
                {distance_km > 0 && (
                  <div className="text-xs text-gray-400">{distance_km.toFixed(1)} km</div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
