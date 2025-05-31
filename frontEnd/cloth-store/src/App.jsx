import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import Header from './components/Header'
import Footer from './components/Footer'
import HeroSection from './components/HeroSection'
import ProductGrid from './components/ProductGrid'
import AllProducts from './components/AllProducts'
import ProductDetails from './components/ProductDetails'
import CategoryPage from './components/CategoryPage'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import UserRegistration from './components/UserRegistration'
import UserLogin from './components/UserLogin'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import OrderConfirmation from './components/OrderConfirmation'
import AdminLogin from './components/admin/AdminLogin'
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminProductList from './components/admin/AdminProductList'
import AdminProductForm from './components/admin/AdminProductForm'
import AdminOrderList from './components/admin/AdminOrderList'
import AdminOrderDetails from './components/admin/AdminOrderDetails'
import AdminShippedOrders from './components/admin/AdminShippedOrders'
import AdminCancelledOrders from './components/admin/AdminCancelledOrders'
import SiteSettingsForm from './components/admin/SiteSettingsForm'

export default function App() {
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Vintage Shop',
    heroImage: '/placeholder.svg?height=400&width=800',
    heroTitle: 'Welcome to our Vintage Shop',
    heroSubtitle: 'Discover timeless fashion pieces',
    categories: ['Shirts', 'Pants', 'Accessories'],
    footerText: 'Find unique vintage clothing',
    contactEmail: 'contact@vintageshop.com',
    contactPhone: '123-456-7890',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSiteSettings()
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/site-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setSiteSettings(prevSettings => ({
        ...prevSettings,
        ...response.data
      }));
    } catch (error) {
      console.error('Error fetching site settings:', error);
      // Keep the default settings if there's an error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="shipped-orders" element={<AdminShippedOrders />} />
            <Route path="cancelled-orders" element={<AdminCancelledOrders />} />
            <Route path="products" element={<AdminProductList />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/edit/:id" element={<AdminProductForm />} />
            <Route path="orders" element={<AdminOrderList />} />
            <Route path="site-settings" element={<SiteSettingsForm />} />
          </Route>
        </Route>

        {/* Public routes */}
        <Route path="/" element={
          <>
            <Header siteSettings={siteSettings} />
            <main className="flex-grow">
              <HeroSection siteSettings={siteSettings} />
              <ProductGrid title="Featured Products" />
            </main>
            <Footer siteSettings={siteSettings} />
          </>
        } />
        <Route path="*" element={
          <>
            <Header siteSettings={siteSettings} />
            <main className="flex-grow">
              <Routes>
                <Route path="/all" element={<AllProducts title="All Products" />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/register" element={<UserRegistration />} />
                <Route path="/login" element={<UserLogin />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="*" element={<h1>404: Page Not Found</h1>} />
              </Routes>
            </main>
            <Footer siteSettings={siteSettings} />
          </>
        } />
      </Routes>
    </Router>
  )
}