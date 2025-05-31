import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function AdminShippedOrders() {
  const [shippedOrders, setShippedOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchShippedOrders()
  }, [])

  const fetchShippedOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      // Filter shipped orders and sort by createdAt in descending order
      const filteredOrders = response.data
        .filter(order => order.status === 'shipped')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setShippedOrders(filteredOrders)
    } catch (error) {
      console.error('Error fetching shipped orders:', error)
      setError('Failed to fetch shipped orders. Please try again.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Shipped Orders</h1>
      <Link to="/admin/orders" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4 inline-block">
        Back to All Orders
      </Link>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Order ID</th>
              <th className="py-3 px-6 text-left">Customer</th>
              <th className="py-3 px-6 text-center">Total Amount</th>
              <th className="py-3 px-6 text-center">Shipped At</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {shippedOrders.map((order) => (
              <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <Link to={`/admin/orders/${order._id}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {order._id}
                  </Link>
                </td>
                <td className="py-3 px-6 text-left">
                  <span>{order.user.email}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span>${order.totalAmount.toFixed(2)}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span>{new Date(order.updatedAt).toLocaleString()}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <Link to={`/admin/orders/${order._id}`} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}