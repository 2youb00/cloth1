import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function AdminOrderList() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteOrderId, setDeleteOrderId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('http://localhost:5000/api/orders/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      const sortedOrders = response.data
        .filter(order => order.status !== 'cancelled')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setOrders(sortedOrders)
      setError(null)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to fetch orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter))
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      )
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      setError('Failed to update order status. Please try again.')
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      await axios.post(`http://localhost:5000/api/orders/${orderId}/cancel`, 
        { reason: 'Cancelled by admin' },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      )
      fetchOrders()
      setError(null)
    } catch (error) {
      console.error('Error cancelling order:', error)
      setError('Failed to cancel order. Please try again.')
    }
  }

  const deleteOrder = async (orderId) => {
    setIsLoading(true)
    try {
      await axios.delete(`http://localhost:5000/api/orders/delete-order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      setOrders(orders.filter(order => order._id !== orderId))
      setError(null)
      setDeleteOrderId(null)
    } catch (error) {
      console.error('Error deleting order:', error)
      if (error.response && error.response.status === 404) {
        setError(`Order not found. It may have been already deleted. Refreshing the order list.`)
        fetchOrders()
      } else {
        setError(error.response?.data?.message || 'Failed to delete order. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Orders</h1>
      <div className="flex justify-between items-center mb-4">
        <div>
          <Link to="/admin/cancelled-orders" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-4">
            View Cancelled Orders
          </Link>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <p className="text-gray-600">Total Orders: {filteredOrders.length}</p>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="bg-white shadow-md rounded my-6">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Order ID</th>
                <th className="py-3 px-6 text-left">Customer</th>
                <th className="py-3 px-6 text-center">Total Amount</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {filteredOrders.map((order) => (
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
                    <span>DZD {order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className={`py-1 px-3 rounded-full text-xs ${
                      order.status === 'pending' ? 'bg-yellow-200 text-yellow-600' :
                      order.status === 'processing' ? 'bg-blue-200 text-blue-600' :
                      order.status === 'shipped' ? 'bg-green-200 text-green-600' :
                      order.status === 'delivered' ? 'bg-purple-200 text-purple-600' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      disabled={order.status === 'shipped' || order.status === 'delivered'}
                    >
                      Cancel Order
                    </button>
                    <button
                      onClick={() => setDeleteOrderId(order._id)}
                      className="mt-2 ml-2 bg-red-700 text-white px-3 py-1 rounded hover:bg-red-800"
                    >
                      Delete Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {deleteOrderId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setDeleteOrderId(null)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteOrder(deleteOrderId)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}