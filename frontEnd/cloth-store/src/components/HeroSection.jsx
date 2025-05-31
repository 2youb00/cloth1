"use client"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function HeroSection({ siteSettings }) {
  const isMobile = window.innerWidth < 768
  const heroImage = isMobile ? siteSettings?.heroImageMobile : siteSettings?.heroImageDesktop
  const imageSrc = heroImage?.startsWith("/uploads") ? `https://cloth1-1.onrender.com${heroImage}` : heroImage

  return (
    <div className="relative h-screen">
      <img src={imageSrc || "/placeholder.svg"} alt="Hero" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-white mb-4"
          >
            {siteSettings?.heroTitle}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-white mb-8"
          >
            {siteSettings?.heroSubtitle}
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
