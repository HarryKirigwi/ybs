'use client'
import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

function apiUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

// Type definitions to match API responses
interface UserData {
  id: string
  active_direct_referrals: number
  totalReferrals: number
  availableBalance: number
  createdAt: string
  email: string
  fullName: string
  is_active: boolean
  userLevel: string
  pendingEarnings: number
  phoneNumber: string
  phone_verified: boolean
  referralCode: string
  totalEarned: number
  totalWithdrawn: number
  username: string
  accountStatus: string
  last_login?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface LoginApiResponse {
  message: string
  user: {
    id: string
    email: string
    phone: string
    last_sign_in_at: string
  }
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
  error?: string
  retry_after?: number
}

interface AuthContextType {
  user: UserData | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  userData: UserData | null

  registerUser: (userData: {
    fullName: string
    email: string
    phoneNumber: string
    password: string
    referralCode?: string
  }) => Promise<{
    success: boolean
    user_id?: string
    error?: string
    requiresPhoneVerification?: boolean
  }>

  loginWithPhone: (
    phoneNumber: string,
    password: string
  ) => Promise<{
    success: boolean
    user_id?: string
    profile?: UserData
    error?: string
    requiresActivation?: boolean
    retry_after?: number
  }>

  verifyPhone: (
    phoneNumber: string,
    code: string
  ) => Promise<{
    success: boolean
    error?: string
  }>

  sendVerificationCode: (phoneNumber: string) => Promise<{
    success: boolean
    error?: string
    code?: string
  }>

  validateReferralCode: (code: string) => Promise<{
    valid: boolean
    referrerName?: string
    message: string
  }>

  forgotPassword: (email: string) => Promise<{
    success: boolean
    error?: string
  }>

  refreshUserData: () => Promise<{ success: boolean; error?: string; data?: UserData }>
  checkAuthStatus: () => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // --- SECURITY NOTE ---
  // This app now uses HTTP-only cookies for authentication. Tokens are NOT accessible from JS.
  // Ensure your backend sets the tokens as Secure, HttpOnly, SameSite=Strict cookies.
  // For XSS protection, use a strict Content Security Policy (CSP) and sanitize all user input.
  // For role/permission checks, fetch user roles from /user/me or a similar endpoint.

  const [user, setUser] = useState<UserData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status by calling /auth/me
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch(apiUrl('/user/profile'), {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      })
      
      if (response.ok) {
        const data: ApiResponse<UserData> = await response.json()
        if (data.success && data.data) {
          setUser(data.data)
          setUserData(data.data)
          return true
        }
      }
      
      // If we get here, authentication failed
      setUser(null)
      setUserData(null)
      return false
    } catch (error) {
      console.error('Auth status check failed:', error)
      setUser(null)
      setUserData(null)
      return false
    }
  }

  // On mount, check if user is authenticated by calling /auth/me
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        await checkAuthStatus()
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  // Register user (backend sets cookie)
  const registerUser = async (userData: {
    fullName: string
    email: string
    phoneNumber: string
    password: string
    referralCode?: string
  }) => {
    setIsLoading(true)
    try {
      const response = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          password: userData.password,
          referralCode: userData.referralCode || undefined
        })
      })
      const data = await response.json()
      if (response.ok && data.success && data.data && data.data.user) {
        setUser(data.data.user)
        setUserData(data.data.user)
        return {
          success: true,
          user_id: data.data.user.id,
          requiresPhoneVerification: true
        }
      } else if (data.error && data.error.message) {
        if (data.error.message.includes('Phone number already registered')) {
          return {
            success: false,
            error: 'Phone number already registered'
          }
        } else if (data.error.message.includes('Email address already registered')) {
          return {
            success: false,
            error: 'Email address already registered'
          }
        } else {
          return {
            success: false,
            error: data.error.message || 'Registration failed. Please try again.'
          }
        }
      } else {
        return {
          success: false,
          error: data.error?.message || data.message || 'Registration failed. Please try again.'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'An unexpected error occurred. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Login (backend sets cookie)
  const loginWithPhone = async (
    phoneNumber: string,
    password: string
  ) => {
    setIsLoading(true)
    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          password: password,
        }),
      })
      const data = await response.json()
      if (response.status === 429) {
        return {
          success: false,
          error: data.error || data.message || 'Too many attempts. Please try again later.',
          retry_after: data.retry_after
        }
      }
      if (response.status === 423) {
        return {
          success: false,
          error: data.error || data.message || 'Account temporarily locked.',
          retry_after: data.retry_after
        }
      }
      if (response.ok && data.success && data.data && data.data.user) {
        setUser(data.data.user)
        setUserData(data.data.user)
        return {
          success: true,
          user_id: data.data.user.id,
          profile: data.data.user,
          requiresActivation: false
        }
      } else {
        return {
          success: false,
          error: data.error || data.message || 'Login failed. Please try again.'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'An unexpected error occurred during login.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout (backend clears cookie)
  const signOut = async () => {
    setIsLoading(true)
    try {
      await fetch(apiUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      })
    } catch {}
    setUser(null)
    setUserData(null)
    setIsLoading(false)
  }

  const verifyPhone = async (phoneNumber: string, code: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(apiUrl('/auth/verify-phone'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          action: 'verify',
          phoneNumber: phoneNumber,
          verificationCode: code
        })
      })
      const data = await response.json()
      if (response.ok) {
        // After successful phone verification, refresh user data
        await checkAuthStatus()
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || data.message || 'Invalid verification code'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Verification failed. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const sendVerificationCode = async (phoneNumber: string) => {
    try {
      const response = await fetch(apiUrl('/verify-phone'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          action: 'send',
          phone_number: phoneNumber
        })
      })
      const data = await response.json()
      if (response.ok) {
        return {
          success: true,
          code: data.code
        }
      } else {
        return {
          success: false,
          error: data.error || data.message || 'Failed to send verification code'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to send verification code'
      }
    }
  }

  const validateReferralCode = async (code: string) => {
    if (!code || code.length < 6) {
      return {
        valid: false,
        message: 'Referral code must be at least 6 characters'
      }
    }
    try {
      const response = await fetch(apiUrl(`/referral/verify/${code}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
      })
      const data = await response.json()
      if (response.ok && data.success && data.data && data.data.valid) {
        const referrer = data.data.referrer
        return {
          valid: true,
          referrerName: referrer ? `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() : undefined,
          message: data.message || `Valid referral code${referrer ? ` from ${referrer.firstName}` : ''}`
        }
      } else {
        return {
          valid: false,
          message: data.message || 'Invalid referral code'
        }
      }
    } catch (error) {
      return {
        valid: false,
        message: 'Unable to validate referral code'
      }
    }
  }

  const forgotPassword = async (email: string) => {
    // Not implemented in backend, placeholder
    return {
      success: false,
      error: 'Forgot password not implemented.'
    }
  }

  const refreshUserData = async (): Promise<{ success: boolean; error?: string; data?: UserData }> => {
    if (!user) {
      return {
        success: false,
        error: 'No active session'
      }
    }
    try {
      const response = await fetch(apiUrl('/auth/me'), { method: 'GET', credentials: 'include', mode: 'cors' })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || 'Failed to fetch updated profile'
        }
      }
      const profileData: ApiResponse<UserData> = await response.json()
      if (profileData.success && profileData.data) {
        setUserData(profileData.data)
        setUser(profileData.data)
        return { success: true, data: profileData.data }
      } else {
        return {
          success: false,
          error: profileData.error || 'Invalid profile data'
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to refresh user data'
      }
    }
  }

  const isAuthenticated = !!user

  const value: AuthContextType = useMemo(() => ({
    user,
    accessToken: null,
    refreshToken: null,
    isAuthenticated,
    isLoading,
    userData,
    registerUser,
    loginWithPhone,
    verifyPhone,
    sendVerificationCode,
    validateReferralCode,
    forgotPassword,
    refreshUserData,
    checkAuthStatus,
    signOut
  }), [user, isAuthenticated, isLoading, userData])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}