'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

function apiUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

// Admin user interface
interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  permissions: string[]
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

// API response interfaces
interface AdminLoginResponse {
  success: boolean
  message: string
  data?: {
    admin: AdminUser
    accessToken: string
  }
  error?: string
}

interface AdminAuthContextType {
  admin: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  loginAdmin: (email: string, password: string) => Promise<{
    success: boolean
    error?: string
  }>
  
  logoutAdmin: () => Promise<{ success: boolean; error?: string }>
  checkAdminAuthStatus: () => Promise<boolean>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAdminAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch(apiUrl('/admin/auth/verify'), {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.admin) {
          setAdmin(data.data.admin)
          setIsAuthenticated(true)
          return true
        }
      }
      
      setAdmin(null)
      setIsAuthenticated(false)
      return false
    } catch (err) {
      console.error('Error checking admin auth status:', err)
      setAdmin(null)
      setIsAuthenticated(false)
      return false
    }
  }

  const loginAdmin = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await fetch(apiUrl('/auth/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ email, password }),
      })

      const data: AdminLoginResponse = await response.json()

      if (data.success && data.data) {
        setAdmin(data.data.admin)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        const errorMessage = data.error || data.message || 'Login failed'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logoutAdmin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(apiUrl('/auth/admin/logout'), {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      })

      if (response.ok) {
        setAdmin(null)
        setIsAuthenticated(false)
        return { success: true }
      } else {
        return { success: false, error: 'Logout failed' }
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' }
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      await checkAdminAuthStatus()
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const value: AdminAuthContextType = {
    admin,
    isAuthenticated,
    isLoading,
    error,
    loginAdmin,
    logoutAdmin,
    checkAdminAuthStatus,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
} 