import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ProductCard from './ProductCard'

export default function ProductGrid({ title, category }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const url = category 
          ? `http://localhost:5000/api/products?category=${category}&featured=true`
          : 'http://localhost:5000/api/products?featured=true'
        const response = await axios.get(url)
        setProducts(response.data.products)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError('Failed to fetch products. Please try again later.')
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category])

  if (loading) return <div className="text-center mt-8">Loading...</div>
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      {products.length === 0 ? (
        <p className="text-center">No featured products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}