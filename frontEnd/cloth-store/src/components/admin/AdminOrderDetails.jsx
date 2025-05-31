import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function AdminOrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      })
      setOrder(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching order details:', error)
      setError('Failed to fetch order details. Please try again.')
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center mt-8">Loading...</div>
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>
  if (!order) return <div className="text-center mt-8">Order not found</div>

  return (
    <div className="bg-white shadow-md rounded my-6 p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Order Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Customer Information</h2>
          <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
          <p><strong>Name:</strong> {`${order.user?.firstName || ''} ${order.user?.lastName || ''}`}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Order Information</h2>
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total Amount:</strong> DZD {order.totalAmount.toFixed(2)}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Products</h2>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Product</th>
              <th className="py-3 px-6 text-center">Quantity</th>
              <th className="py-3 px-6 text-center">Size</th>
              <th className="py-3 px-6 text-center">Color</th>
              <th className="py-3 px-6 text-center">Price</th>
              <th className="py-3 px-6 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {order.products.map((item) => (
              <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <span className="font-medium">{item.product.name}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span>{item.quantity}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span>{item.size}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span>{item.color}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span>DZD {item.product.price.toFixed(2)}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span>DZD {(item.quantity * item.product.price).toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
        <p>{order.shippingAddress.street}</p>
        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
        <p>{order.shippingAddress.country}</p>
      </div>
    </div>
  )
}