import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/admin/logout', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      localStorage.removeItem('adminToken')
      navigate('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <Link
            to="/admin/dashboard"
            className="block py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/products"
            className="block py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            className="block py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
          >
            Orders
          </Link>
          <Link
            to="/admin/site-settings"
            className="block py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
          >
            Site Settings
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left py-2 px-4 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
          >
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
        <div className="container mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}