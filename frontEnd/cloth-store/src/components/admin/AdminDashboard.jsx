import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    recentOrders: []
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-2">
            <p>Total Products: {stats.totalProducts}</p>
            <p>Total Orders: {stats.totalOrders}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <ul className="space-y-2">
            {stats.recentOrders.map(order => (
              <li key={order._id}>
                <Link to={`/admin/orders/${order._id}`} className="text-blue-600 hover:text-blue-800">
                  Order {order._id.slice(-6)} - 
                  {order.user ? ` ${order.user.firstName || ''} ${order.user.lastName || ''}` : ' Unknown User'} - 
                  ${order.totalAmount.toFixed(2)} - 
                  {formatDate(order.createdAt)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Link
          to="/admin/products"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Manage Products
        </Link>
        <Link
          to="/admin/orders"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          View All Orders
        </Link>
      </div>
    </div>
  )
}