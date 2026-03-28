const API_BASE = import.meta.env.PROD
  ? 'https://find-api.kasidit-wans.com'
  : '/api';

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface SearchResult {
  shop: {
    id: string;
    name: string;
    name_en: string | null;
    address: string;
    district: string;
    lat: number;
    lng: number;
    phone: string | null;
    line_id: string | null;
    google_rating: number | null;
    is_verified: boolean;
    photo_url: string | null;
    opening_hours: string | null;
  };
  product: {
    id: string;
    name: string;
    name_normalized: string | null;
    brand: string | null;
    image_url: string | null;
  };
  inventory: {
    price: number | null;
    price_unit: string;
    in_stock: boolean;
    stock_quantity: number | null;
  };
  distance_km: number;
}

export interface Category {
  id: string;
  name: string;
  name_en: string;
  icon: string | null;
}

export interface Shop {
  id: string;
  name: string;
  name_en: string | null;
  address: string;
  district: string;
  lat: number;
  lng: number;
  phone: string | null;
  google_rating: number | null;
  is_verified: boolean;
  photo_url: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page: number; per_page: number; total: number };
}

export async function searchProducts(q: string, opts?: {
  lat?: number; lng?: number; category?: string; district?: string;
  sort?: string; page?: number;
}) {
  const params = new URLSearchParams({ q });
  if (opts?.lat) params.set('lat', String(opts.lat));
  if (opts?.lng) params.set('lng', String(opts.lng));
  if (opts?.category) params.set('category', opts.category);
  if (opts?.district) params.set('district', opts.district);
  if (opts?.sort) params.set('sort', opts.sort);
  if (opts?.page) params.set('page', String(opts.page));
  return fetchApi<ApiResponse<SearchResult[]>>(`/search?${params}`);
}

export async function getSuggestions(q: string) {
  return fetchApi<ApiResponse<{ name: string; name_normalized: string }[]>>(`/search/suggestions?q=${encodeURIComponent(q)}`);
}

export async function getTrending() {
  return fetchApi<ApiResponse<{ query: string; count: number }[]>>('/search/trending');
}

export async function getCategories() {
  return fetchApi<ApiResponse<Category[]>>('/categories');
}

export async function getShops(opts?: { district?: string; page?: number }) {
  const params = new URLSearchParams();
  if (opts?.district) params.set('district', opts.district);
  if (opts?.page) params.set('page', String(opts.page));
  const qs = params.toString();
  return fetchApi<ApiResponse<Shop[]>>(`/shops${qs ? '?' + qs : ''}`);
}

export async function getShopDetail(id: string) {
  return fetchApi<ApiResponse<{ shop: Shop; products: any[] }>>(`/shops/${id}`);
}
