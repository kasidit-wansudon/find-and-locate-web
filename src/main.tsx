import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

// Public
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ShopPage from './pages/ShopPage'
import CategoriesPage from './pages/CategoriesPage'

// Admin
import AdminLayout from './components/AdminLayout'
import AdminLoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import ShopsAdminPage from './pages/admin/ShopsAdminPage'
import ProductsAdminPage from './pages/admin/ProductsAdminPage'
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage'
import ClaimsAdminPage from './pages/admin/ClaimsAdminPage'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/shop/:id" element={<ShopPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Route>

        {/* Admin login (standalone, no sidebar) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin dashboard routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="shops" element={<ShopsAdminPage />} />
          <Route path="products" element={<ProductsAdminPage />} />
          <Route path="categories" element={<CategoriesAdminPage />} />
          <Route path="claims" element={<ClaimsAdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
