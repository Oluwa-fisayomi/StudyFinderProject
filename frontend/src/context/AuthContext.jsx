
import { createContext, useContext, useEffect, useState } from 'react'
import apiRequest from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check whether the user already has an active session
  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      try {
        const data = await apiRequest('/auth/me')

        if (!cancelled) {
          setUser(data.user || null)
        }
      } catch {
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [])

  // Update the authenticated user
  function login(userData) {
    setUser(userData)
  }

  // Clear the authenticated user
  async function logout() {
    await apiRequest('/auth/logout', {
      method: 'POST',
    })

    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Access authentication information from any component
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.')
  }

  return context
}
