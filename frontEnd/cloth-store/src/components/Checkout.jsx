"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import wilayasData from "./wilayas.json"

export default function Checkout() {
  const [formData, setFormData] = useState({
    deliveryType: "office",
    wilaya: "",
    daira: "",
    homeAddress: "",
    phoneNumber: "",
    notes: "",
    country: "Algeria",
  })
  const [cartItems, setCartItems] = useState([])
  const [error, setError] = useState(null)
  const [availableDairas, setAvailableDairas] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartItems(cart)

    const savedAddress = JSON.parse(localStorage.getItem("shippingAddress") || "{}")
    if (Object.keys(savedAddress).length > 0) {
      setFormData((prev) => ({ ...prev, ...savedAddress }))
    }

    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { state: { from: "/checkout" } })
    }
  }, [navigate])

  useEffect(() => {
    if (formData.wilaya) {
      const selectedWilaya = wilayasData.find((w) => w.wilaya_name === formData.wilaya)
      setAvailableDairas(selectedWilaya ? selectedWilaya.dairas : [])
      setFormData((prev) => ({ ...prev, daira: "" }))
    }
  }, [formData.wilaya])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    // Validation
    if (!formData.phoneNumber.trim()) {
      setError("Phone number is required")
      setIsSubmitting(false)
      return
    }

    if (!formData.wilaya) {
      setError("Please select a wilaya")
      setIsSubmitting(false)
      return
    }

    if (!formData.daira) {
      setError("Please select a daira/city")
      setIsSubmitting(false)
      return
    }

    if (formData.deliveryType === "home" && !formData.homeAddress.trim()) {
      setError("Home address is required for home delivery")
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

      const orderData = {
        products: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size || "",
          color: item.color || "",
        })),
        totalAmount,
        shippingAddress: {
          deliveryType: formData.deliveryType,
          wilaya: formData.wilaya,
          daira: formData.daira,
          homeAddress: formData.deliveryType === "home" ? formData.homeAddress : "",
          phoneNumber: formData.phoneNumber,
          notes: formData.notes || "",
          country: formData.country,
        },
      }

      const response = await axios.post("https://cloth1-1.onrender.com/api/orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      localStorage.setItem("shippingAddress", JSON.stringify(formData))
      localStorage.removeItem("cart")
      navigate("/order-confirmation", { state: { order: response.data } })
    } catch (err) {
      console.error("Error placing order:", err)
      if (err.response) {
        setError(err.response.data.message || "Failed to place order. Please try again.")
      } else if (err.response && err.response.status === 401) {
        setError("Your session has expired. Please log in again.")
        navigate("/login", { state: { from: "/checkout" } })
      } else {
        setError("Failed to place order. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order below</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Order Summary
            </h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.product._id}-${item.size}-${item.color}`}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl"
                >
              
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
                    <div className="text-sm text-gray-500 space-x-2">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">DZD {(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-indigo-600">
                  DZD {cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Shipping Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Delivery Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.deliveryType === "office"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryType"
                      value="office"
                      checked={formData.deliveryType === "office"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="font-medium">Office Delivery</span>
                    </div>
                  </label>
                  <label
                    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.deliveryType === "home"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryType"
                      value="home"
                      checked={formData.deliveryType === "home"}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      <span className="font-medium">Home Delivery</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-900 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="0555 123 456"
                />
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="wilaya" className="block text-sm font-semibold text-gray-900 mb-2">
                    Wilaya *
                  </label>
                  <select
                    id="wilaya"
                    name="wilaya"
                    value={formData.wilaya}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select Wilaya</option>
                    {wilayasData.map((wilaya) => (
                      <option key={wilaya.wilaya_code} value={wilaya.wilaya_name}>
                        {wilaya.wilaya_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="daira" className="block text-sm font-semibold text-gray-900 mb-2">
                    Daira/City *
                  </label>
                  <select
                    id="daira"
                    name="daira"
                    value={formData.daira}
                    onChange={handleChange}
                    required
                    disabled={!formData.wilaya}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Daira/City</option>
                    {availableDairas.map((daira) => (
                      <option key={daira} value={daira}>
                        {daira}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Home Address (conditional) */}
              {formData.deliveryType === "home" && (
                <div>
                  <label htmlFor="homeAddress" className="block text-sm font-semibold text-gray-900 mb-2">
                    Home Address *
                  </label>
                  <textarea
                    id="homeAddress"
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleChange}
                    required={formData.deliveryType === "home"}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                    placeholder="Enter your full home address..."
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Any special instructions or notes..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Placing Order...
                  </div>
                ) : (
                  "Complete Order"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
