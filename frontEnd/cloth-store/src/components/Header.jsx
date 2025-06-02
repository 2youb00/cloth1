"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { ShoppingCart, User, LogIn, LogOut, Menu, X, Search } from "lucide-react"

export default function Header({ siteSettings }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token")
      setIsLoggedIn(!!token)
      if (token) {
        const cart = JSON.parse(localStorage.getItem("cart")) || []
        setCartCount(cart.length)
      } else {
        setCartCount(0)
      }
    }

    checkLoginStatus()

    // Listen for storage changes (when login happens in another tab)
    window.addEventListener("storage", checkLoginStatus)

    return () => window.removeEventListener("storage", checkLoginStatus)
  }, [location]) // Re-check when route changes

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setCartCount(0)
    navigate("/")
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-black text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            {siteSettings.siteName}
          </Link>
          <div className="hidden md:flex justify-center items-center mx-auto space-x-6">
            {siteSettings.categories &&
              siteSettings.categories.map((category, index) => (
                <Link
                  key={index}
                  to={`/category/${category.toLowerCase()}`}
                  className="hover:text-gray-300 transition-colors"
                >
                  {category}
                </Link>
              ))}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-800 text-white px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-600"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {isLoggedIn ? (
              <>
            <Link to="/cart" className="hover:text-gray-300 transition-colors flex items-center">
             <span className="bg-gray-200 rounded-full p-1.5 flex items-center justify-center mr-1">
             <ShoppingCart size={20} className="text-black" />
             </span>
             </Link>


                <button onClick={handleLogout} className="hover:text-gray-300 transition-colors flex items-center">
                  <LogOut size={20} className="mr-1" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-300 transition-colors flex items-center">
                  <LogIn size={20} className="mr-1" />
                  <span>Login</span>
                </Link>

                <Link to="/register" className="hover:text-gray-300 transition-colors flex items-center">
                  <User size={20} className="mr-1" />
                  <span>Register</span>
                </Link>
                  <Link to="/cart" className="hover:text-gray-300 transition-colors flex items-center">
             <span className="bg-gray-200 rounded-full p-1.5 flex items-center justify-center mr-1">
             <ShoppingCart size={20} className="text-black" />
             </span>
             </Link>

              </>
            )}
          </div>
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 py-4">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-4">
              {siteSettings.categories &&
                siteSettings.categories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/category/${category.toLowerCase()}`}
                    className="hover:text-gray-300 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-gray-800 text-white px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {isLoggedIn ? (
                <>
                  <Link to="/cart" className="hover:text-gray-300 transition-colors flex items-center">
                    <ShoppingCart size={20} className="mr-2" />
                    <span>Cart </span>
                  </Link>
                  <button onClick={handleLogout} className="hover:text-gray-300 transition-colors flex items-center">
                    <LogOut size={20} className="mr-2" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-gray-300 transition-colors flex items-center">
                    <LogIn size={20} className="mr-2" />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="hover:text-gray-300 transition-colors flex items-center">
                    <User size={20} className="mr-2" />
                    <span>Register</span>
                  </Link>
                   <Link to="/cart" className="hover:text-gray-300 transition-colors flex items-center">
                    <ShoppingCart size={20} className="mr-2" />
                    <span>Cart </span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
