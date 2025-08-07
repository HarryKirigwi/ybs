'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiGet, apiPost, ApiResponse } from '@/lib/api'

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
      
      const data = await apiGet<{ admin: AdminUser }>('/admin/auth/verify')

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
      
      console.log('❌ Admin authentication failed:', {
        success: data.success,
        error: data.error,
        message: data.message
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

      const data = await apiPost<{ admin: AdminUser; accessToken: string }>('/auth/admin/login', {
        email,
        password,
      })

      if (data.success && data.data) {
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

      const data = await apiPost('/auth/admin/logout')

      if (data.success) {
        console.log('✅ Admin logout successful')
        setAdmin(null)
        setIsAuthenticated(false)
        return { success: true }
      } else {
        console.log('❌ Admin logout failed:', data.error)
        return { success: false, error: data.error || 'Logout failed' }
      }
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