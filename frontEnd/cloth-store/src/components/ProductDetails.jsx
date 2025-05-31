import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColors, setSelectedColors] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`https://cloth1-1.onrender.com/api/products/${id}`)
        setProduct(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch product details. Please try again later.')
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      alert('Please select a size')
      return
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItemIndex = cart.findIndex(item => 
      item.product._id === product._id && item.size === selectedSize && item.color === selectedColors
    )

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1
    } else {
      cart.push({
        product: product,
        quantity: 1,
        size: selectedSize,
        color: selectedColors,
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Product added to cart!')
  }

  if (loading) return <div className="text-center mt-8">Loading...</div>
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>
  if (!product) return <div className="text-center mt-8">Product not found.</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img 
            src={`https://cloth1-1.onrender.com${product.images[selectedImage]}`} 
            alt={product.name} 
            className="w-full h-auto object-cover rounded-lg shadow-lg"
          />
          <div className="mt-4 flex space-x-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={`https://cloth1-1.onrender.com${image}`}
                alt={`${product.name} ${index + 1}`}
                className={`w-20 h-20 object-cover cursor-pointer ${selectedImage === index ? 'border-2 border-blue-500' : ''}`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>
        <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl font-semibold mb-4">DZD {product.price.toFixed(2)}</p>
          <div className="mb-4" style={{ whiteSpace: 'pre-line' }}>
          {product.description}
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Categories:</h2>
            {product.categories.map((category, index) => (
              <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {category}
              </span>
            ))}
          </div>
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Size:</h2>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="block w-full px-4 py-3 mt-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="">Select a size</option>
                {product.sizes.map((size, index) => (
                  <option key={index} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">color:</h2>
              <select
                value={selectedColors}
                onChange={(e) => setSelectedColors(e.target.value)}
                className="block w-full px-4 py-3 mt-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm appearance-none hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="">Select a color</option>
                {product.colors.map((color, index) => (
                  <option key={index} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          )}
          <p className="mb-4">In Stock: {product.inStock ? 'Yes' : 'No'}</p>
          <button
            onClick={handleAddToCart}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}