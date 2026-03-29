const API_BASE = import.meta.env.PROD
  ? 'https://find-and-locate.kasidit-wans.workers.dev/api/admin'
  : '/api/admin';

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

async function fetchAdmin<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(opts?.headers || {}),
    },
  });
  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any;
    throw new Error(err.error || `API error ${res.status}`);
  }
  return res.json();
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data: any = await res.json();
  if (!data.success) throw new Error(data.error || 'Login failed');
  localStorage.setItem('admin_token', data.data.token);
  return data.data;
}

export function adminLogout() {
  localStorage.removeItem('admin_token');
}

export function isAdminLoggedIn() {
  return !!localStorage.getItem('admin_token');
}

export async function getAdminMe() {
  return fetchAdmin<any>('/me');
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  return fetchAdmin<any>('/stats');
}

// ─── Shops ───────────────────────────────────────────────────────────────────

export async function adminGetShops(page = 1, q = '') {
  return fetchAdmin<any>(`/shops?page=${page}&per_page=20&q=${encodeURIComponent(q)}`);
}

export async function adminCreateShop(data: any) {
  return fetchAdmin<any>('/shops', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateShop(id: string, data: any) {
  return fetchAdmin<any>(`/shops/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteShop(id: string) {
  return fetchAdmin<any>(`/shops/${id}`, { method: 'DELETE' });
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function adminGetProducts(page = 1, q = '') {
  return fetchAdmin<any>(`/products?page=${page}&per_page=20&q=${encodeURIComponent(q)}`);
}

export async function adminCreateProduct(data: any) {
  return fetchAdmin<any>('/products', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateProduct(id: string, data: any) {
  return fetchAdmin<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteProduct(id: string) {
  return fetchAdmin<any>(`/products/${id}`, { method: 'DELETE' });
}

export async function adminGetProductInventory(productId: string) {
  return fetchAdmin<any>(`/products/${productId}/inventory`);
}

export async function adminUpdateInventory(id: string, data: any) {
  return fetchAdmin<any>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminCreateInventory(data: any) {
  return fetchAdmin<any>('/inventory', { method: 'POST', body: JSON.stringify(data) });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function adminGetCategories() {
  return fetchAdmin<any>('/categories');
}

export async function adminCreateCategory(data: any) {
  return fetchAdmin<any>('/categories', { method: 'POST', body: JSON.stringify(data) });
}

export async function adminUpdateCategory(id: string, data: any) {
  return fetchAdmin<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function adminDeleteCategory(id: string) {
  return fetchAdmin<any>(`/categories/${id}`, { method: 'DELETE' });
}

// ─── Claims ───────────────────────────────────────────────────────────────────

export async function adminGetClaims(status = 'pending') {
  return fetchAdmin<any>(`/claims?status=${status}`);
}

export async function adminUpdateClaim(id: string, status: 'approved' | 'rejected') {
  return fetchAdmin<any>(`/claims/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
}
