"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

export default function HeroSection({ siteSettings }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Choose appropriate image based on device
  const heroImage = isMobile ? siteSettings?.heroImageMobile : siteSettings?.heroImageDesktop

  return (
    <div className="relative h-screen">
      <img src={heroImage || "/placeholder.svg"} alt="Hero" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-white mb-4"
          >
            {siteSettings?.heroTitle || "Welcome to our Vintage Shop"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white mb-8"
          >
            {siteSettings?.heroSubtitle || "Discover timeless fashion pieces"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/all"
              className="inline-block bg-white w-72 h-11 text-gray-500 text-lg font-black px-6 py-2 rounded-full hover:bg-gray-200 transition duration-300"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
