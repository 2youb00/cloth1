"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  // Handle both Cloudinary URLs and local paths
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.jpg"
    if (imagePath.startsWith("http")) return imagePath // Cloudinary URL
    return `https://cloth1-1.onrender.com${imagePath}` // Local path
  }

  const mainImage = product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : "/placeholder.jpg"
  const hoverImage = product.images && product.images.length > 1 ? getImageUrl(product.images[1]) : mainImage

  // Fixed discount calculations using salePrice
  const isOnSale = product.salePrice && product.salePrice < product.price
  const finalPrice = isOnSale ? product.salePrice : product.price
  const discountPercentage = isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0

  return (
    <Link to={`/product/${product._id}`} className="group">
      <motion.div
        className="bg-white rounded-2xl shadow-lg overflow-hidden relative hover:shadow-xl transition-shadow duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Discount Badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              -{discountPercentage}%
            </div>
          </div>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute top-3 right-3 z-20">
            <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">Out of Stock</div>
          </div>
        )}

        <div className="relative w-full pb-[125%] overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.img
              key={isHovered ? "hoverImage" : "mainImage"}
              src={isHovered ? hoverImage : mainImage}
              alt={product.name}
              className="absolute top-0 left-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>

          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold mb-3 text-gray-900 line-clamp-2 leading-tight">{product.name}</h3>

          {/* Price Section - Fixed calculations */}
          <div className="mb-4">
            {isOnSale ? (
              <div className="flex flex-col space-y-1">
                <span className="text-xl font-bold text-gray-900">DZD {finalPrice.toFixed(2)}</span>
                <span className="text-sm text-red-500 line-through">DZD {product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-xl font-bold text-gray-900">DZD {finalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {category}
                </span>
              ))}
              {product.categories.length > 2 && (
                <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                  +{product.categories.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
