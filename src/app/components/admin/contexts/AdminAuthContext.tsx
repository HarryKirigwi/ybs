'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// API utility function - use same-origin to enable SW and rewrites
const apiUrl = (path: string) => {
  if (path.startsWith('http')) return path
  const clean = path.startsWith('/') ? path : `/${path}`
  return `/api${clean}`
}

// Admin user interface
interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'super_admin'
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
    token: string
    refreshToken: string
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

  // Helper function to get stored token
  const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('adminToken')
  }

  // Helper function to store token
  const storeToken = (token: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('adminToken', token)
  }

  // Helper function to remove token
  const removeToken = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('adminToken')
  }

  const checkAdminAuthStatus = async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking admin authentication status...')
      
      const token = getStoredToken()
      if (!token) {
        console.log('❌ No admin token found')
        setAdmin(null)
        setIsAuthenticated(false)
        return false
      }

      const response = await fetch(apiUrl('/auth/admin/auth/verify'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // same-origin
      })

      console.log('Auth check response status:', response.status)

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
      
      // Token is invalid, remove it
      removeToken()
      setAdmin(null)
      setIsAuthenticated(false)
      return false
    } catch (err) {
      console.error('❌ Error checking admin auth status:', err)
      removeToken()
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
        // same-origin
        body: JSON.stringify({ email, password }),
      })

      const data: AdminLoginResponse = await response.json()

      if (response.ok && data.success && data.data) {
        console.log('✅ Admin login successful:', {
          adminId: data.data.admin.id,
          email: data.data.admin.email,
          role: data.data.admin.role
        })
        
        // Store the token
        storeToken(data.data.token)
        
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

      const token = getStoredToken()
      if (token) {
        const response = await fetch(apiUrl('/auth/admin/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          // same-origin
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            console.log('✅ Admin logout successful')
          }
        }
      }
      
      // Always clear local state and token regardless of server response
      removeToken()
      setAdmin(null)
      setIsAuthenticated(false)
      return { success: true }
    } catch (err: any) {
      console.error('❌ Admin logout error:', err)
      // Still clear local state even if server call fails
      removeToken()
      setAdmin(null)
      setIsAuthenticated(false)
      return { success: true }
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