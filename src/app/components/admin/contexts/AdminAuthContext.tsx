'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// API utility function - same pattern as other components
const apiUrl = (path: string) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
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
      console.log('🔍 Checking admin authentication status...')
      console.log('Current domain:', typeof window !== 'undefined' ? window.location.origin : 'server')
      console.log('Current protocol:', typeof window !== 'undefined' ? window.location.protocol : 'server')
      console.log('Available cookies:', typeof window !== 'undefined' ? document.cookie : 'server')
      
      const response = await fetch(apiUrl('/admin/auth/verify'), {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      })

      console.log('Auth check response status:', response.status)
      console.log('Auth check response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.admin) {
          console.log('✅ Admin authentication successful:', {
            adminId: data.data.admin.id,
            email: data.data.admin.email,
            role: data.data.admin.role
          })
          setAdmin(data.data.admin)
          setIsAuthenticated(true)
          return true
        }
      }
      
      console.log('❌ Admin authentication failed:', {
        status: response.status,
        statusText: response.statusText
      })
      
      setAdmin(null)
      setIsAuthenticated(false)
      return false
    } catch (err) {
      console.error('❌ Error checking admin auth status:', err)
      setAdmin(null)
      setIsAuthenticated(false)
      return false
    }
  }

  const loginAdmin = async (email: string, password: string) => {
    try {
      setError(null)
      setIsLoading(true)

      console.log('🔐 Attempting admin login for:', email)

      const response = await fetch(apiUrl('/auth/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.data) {
        console.log('✅ Admin login successful:', {
          adminId: data.data.admin.id,
          email: data.data.admin.email,
          role: data.data.admin.role
        })
        setAdmin(data.data.admin)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        const errorMessage = data.error || data.message || 'Login failed'
        console.log('❌ Admin login failed:', errorMessage)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error occurred'
      console.error('❌ Admin login error:', err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logoutAdmin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🚪 Attempting admin logout...')

      const response = await fetch(apiUrl('/auth/admin/logout'), {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          console.log('✅ Admin logout successful')
          setAdmin(null)
          setIsAuthenticated(false)
          return { success: true }
        }
      }
      
      console.log('❌ Admin logout failed')
      return { success: false, error: 'Logout failed' }
    } catch (err: any) {
      console.error('❌ Admin logout error:', err)
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