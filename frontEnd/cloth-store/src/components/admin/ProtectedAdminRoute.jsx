import React, { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import axios from 'axios'

export default function ProtectedAdminRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        await axios.get('http://localhost:5000/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error verifying admin token:', error)
        setIsAuthenticated(false)
        localStorage.removeItem('adminToken')
      }
      setIsLoading(false)
    }

    verifyToken()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />
}