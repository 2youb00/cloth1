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

  return (
    <Link to={`/product/${product._id}`} className="group">
      <motion.div
        className="bg-white rounded-lg shadow-md overflow-hidden relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {!product.inStock && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1 z-10">Out of Stock</div>
        )}
        <div className="relative w-full pb-[125%]">
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
        <div className="p-4">
          <h3 className="text-sm font-semibold mb-2 truncate">{product.name}</h3>
          <p className="text-gray-600">DZD {product.price.toFixed(2)}</p>
          {product.categories && product.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap">
              {product.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
