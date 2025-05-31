import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, User, LogIn, LogOut, Menu, X, Search } from 'lucide-react'

export default function Header({ siteSettings }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(cart.length);
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-black text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">{siteSettings.siteName}</Link>
          <div className="hidden md:flex items-center space-x-6">
            {siteSettings.categories && siteSettings.categories.map((category, index) => (
              <Link key={index} to={`/category/${category.toLowerCase()}`} className="hover:text-gray-300 transition-colors">
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
                  <ShoppingBag size={20} className="mr-1" />
                  <span>Cart ({cartCount})</span>
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
              {siteSettings.categories && siteSettings.categories.map((category, index) => (
                <Link key={index} to={`/category/${category.toLowerCase()}`} className="hover:text-gray-300 transition-colors">
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
                    <ShoppingBag size={20} className="mr-2" />
                    <span>Cart ({cartCount})</span>
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
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}