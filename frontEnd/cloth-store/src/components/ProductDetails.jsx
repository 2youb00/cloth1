"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react"

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColors, setSelectedColors] = useState("")
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`https://cloth1-1.onrender.com/api/products/${id}`)
        setProduct(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch product details. Please try again later.")
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // Handle both Cloudinary URLs and local paths
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith("http")) return imagePath // Cloudinary URL
    return `https://cloth1-1.onrender.com${imagePath}` // Local path
  }

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert("Please select a size")
      return
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItemIndex = cart.findIndex(
      (item) => item.product._id === product._id && item.size === selectedSize && item.color === selectedColors,
    )

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity
    } else {
      cart.push({
        product: product,
        quantity: quantity,
        size: selectedSize,
        color: selectedColors,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))

    // Dispatch custom event for cart update
    window.dispatchEvent(new Event("cartUpdated"))

    alert("Product added to cart!")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl">Product not found.</div>
        </div>
      </div>
    )
  }

  // Fixed discount calculations using salePrice
  const isOnSale = product.salePrice && product.salePrice < product.price
  const finalPrice = isOnSale ? product.salePrice : product.price
  const discountPercentage = isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={getImageUrl(product.images[selectedImage]) || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-cover rounded-2xl"
                />
                {isOnSale && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                      -{discountPercentage}% OFF
                    </div>
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
                    <span className="text-white text-2xl font-bold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={getImageUrl(image) || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-20 h-20 object-cover cursor-pointer rounded-lg flex-shrink-0 transition-all ${
                      selectedImage === index ? "ring-4 ring-indigo-500 ring-offset-2" : "hover:opacity-75"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                {/* Price Section - Fixed calculations */}
                <div className="mb-6">
                  {isOnSale ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl font-bold text-gray-900">DZD {finalPrice.toFixed(2)}</span>
                        <span className="text-xl text-red-500 line-through">DZD {product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          Save DZD {(product.price - product.salePrice).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-600">({discountPercentage}% off)</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">DZD {finalPrice.toFixed(2)}</span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.inStock ? (
                    <div className="flex items-center text-green-600">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="font-medium">In Stock</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 px-4 border-2 rounded-xl font-medium transition-all ${
                          selectedSize === size
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColors(color)}
                        className={`py-2 px-4 border-2 rounded-xl font-medium transition-all ${
                          selectedColors === color
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>

              {/* Features */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="w-5 h-5 mr-2 text-blue-600" />
                    Free Shipping
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Secure Payment
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <RotateCcw className="w-5 h-5 mr-2 text-blue-600" />
                    Easy Returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
