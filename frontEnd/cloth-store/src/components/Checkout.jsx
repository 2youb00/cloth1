import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Checkout() {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '14',
    country: ''
  })
  const [cartItems, setCartItems] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Load cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)

    // Load saved shipping address
    const savedAddress = JSON.parse(localStorage.getItem('shippingAddress') || '{}')
    if (Object.keys(savedAddress).length > 0) {
      setFormData(savedAddress)
    }

    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } })
    }
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      
      const response = await axios.post('https://cloth1-1.onrender.com/api/orders', 
        {
          products: cartItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          })),
          totalAmount,
          shippingAddress: formData
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      // Save shipping address for future use
      localStorage.setItem('shippingAddress', JSON.stringify(formData))

      // Clear the cart
      localStorage.removeItem('cart')

      // Navigate to order confirmation page
      navigate('/order-confirmation', { state: { order: response.data } })
    } catch (err) {
      console.error('Error placing order:', err)
      if (err.response && err.response.status === 401) {
        setError('Your session has expired. Please log in again.')
        navigate('/login', { state: { from: '/checkout' } })
      } else {
        setError('Failed to place order. Please try again.')
      }
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        <p>Your cart is empty. Please add some items before checking out.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.product._id} className="flex justify-between items-center mb-2">
            <span>{item.product.name} x {item.quantity}</span>
            <span>DZD {(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="text-xl font-bold mt-4">
          Total: DZD {cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label htmlFor="street" className="block mb-2">Street Address</label>
          <input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="city" className="block mb-2">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="state" className="block mb-2">Wilaya</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
       
        <div className="mb-4">
          <label htmlFor="country" className="block mb-2">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value="Algeria"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Place Order
        </button>
      </form>
    </div>
  )
}