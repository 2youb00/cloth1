import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function AdminCancelledOrders() {
  const [cancelledOrders, setCancelledOrders] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCancelledOrders()
  }, [])

  const fetchCancelledOrders = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching cancelled orders...');
      const response = await axios.get('http://localhost:5000/api/orders/get/cancelled', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      console.log('Response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        // Sort cancelled orders by cancelledAt in descending order
        const sortedOrders = response.data.sort((a, b) => new Date(b.cancelledAt) - new Date(a.cancelledAt))
        setCancelledOrders(sortedOrders)
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Unexpected response format from server')
      }
    } catch (error) {
      console.error('Error fetching cancelled orders:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(`Failed to fetch cancelled orders: ${error.response.data.message || error.message}`)
      } else {
        setError(`Failed to fetch cancelled orders: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Cancelled Orders</h1>
      <Link to="/admin/orders" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4 inline-block">
        Back to All Orders
      </Link>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {cancelledOrders.length === 0 && !error && <p>No cancelled orders found.</p>}
      {cancelledOrders.length > 0 && (
        <div className="bg-white shadow-md rounded my-6">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Order ID</th>
                <th className="py-3 px-6 text-left">Customer</th>
                <th className="py-3 px-6 text-center">Cancelled At</th>
                <th className="py-3 px-6 text-center">Reason</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {cancelledOrders.map((order) => (
                <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {order.originalOrder?._id || 'N/A'}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span>{order.originalOrder?.user?.email || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    {order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {order.reason || 'No reason provided'}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {order.originalOrder?._id ? (
                      <Link to={`/admin/orders/${order.originalOrder._id}`} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                        View Details
                      </Link>
                    ) : (
                      <span className="text-gray-400">No details available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}