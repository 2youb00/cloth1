import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          localStorage.removeItem('adminToken')
        }
      } catch (error) {
        console.error('Error verifying admin token:', error)
        setIsAuthenticated(false)
        localStorage.removeItem('adminToken')
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
    navigate('/admin/login')
  }

  return { isAuthenticated, isLoading, logout }
}