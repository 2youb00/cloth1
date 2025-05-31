import React from 'react'
import { useLocation, Link } from 'react-router-dom'

export default function OrderConfirmation() {
  const location = useLocation()
  const order = location.state?.order

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order Confirmation</h1>
        <p>No order information available. Please return to the shop.</p>
        <Link to="/" className="text-blue-500 hover:underline">Return to Shop</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Order Confirmation</h1>
      <p className="mb-4">Thank you for your order! Your order number is: {order._id}</p>
      <h2 className="text-xl font-semibold mb-2">Order Details:</h2>
      <ul className="list-disc list-inside mb-4">
        {order.products.map((item, index) => (
          <li key={index}>
            {item.product.name} - Quantity: {item.quantity}, Size: {item.size}, Color: {item.color}
          </li>
        ))}
      </ul>
      <p className="mb-2">Total Amount: ${order.totalAmount.toFixed(2)}</p>
      <p className="mb-4">Status: {order.status}</p>
      <h2 className="text-xl font-semibold mb-2">Shipping Address:</h2>
      <p>{order.shippingAddress.street}</p>
      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
      <p>{order.shippingAddress.country}</p>
      <Link to="/" className="text-blue-500 hover:underline">Return to Shop</Link>
    </div>
  )
}