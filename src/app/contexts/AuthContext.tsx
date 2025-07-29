'use client'
import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

function apiUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

// Updated type definitions to match backend response structure
interface UserData {
  id: string
  phoneNumber: string
  email: string
  fullName: string
  firstName?: string
  lastName?: string
  username?: string
  referralCode: string
  
  // Phone verification fields
  phoneVerified: boolean
  phoneVerifiedAt?: string
  phoneVerificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED'
  
  // Account status
  accountStatus: 'UNVERIFIED' | 'ACTIVE' | 'SUSPENDED'
  userLevel: string
  isActive: boolean
  
  // Financial fields
  availableBalance: number
  pendingEarnings: number
  totalEarned: number
  totalWithdrawn: number
  totalReferrals: number
  active_direct_referrals: number
  
  // Timestamps
  createdAt: string
  lastLogin?: string
  lastActiveAt?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface RegisterResponse {
  success: boolean
  message: string
  data: {
    user: UserData
  }
  error?: {
    message: string
  }
}

interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: UserData
  }
  error?: string
  retry_after?: number
}

interface LogoutApiResponse {
  success: boolean
  message: string
  data: {
    loggedOut: boolean
  }
  error?: string
}

interface PhoneVerificationResponse {
  success: boolean
  message: string
  data?: {
    sent: boolean
    phoneNumber: string
    code: string // Available for testing
  }
  error?: string
}

interface VerifyPhoneResponse {
  success: boolean
  message: string
  data?: {
    verified: boolean
    phoneNumber: string
  }
  error?: string
}

interface ReferralValidationResponse {
  success: boolean
  message: string
  data?: {
    valid: boolean
    referrer?: {
      firstName?: string
      lastName?: string
      fullName?: string
      verified: boolean
    }
  }
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
    statusCode?: number
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
  signOut: () => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status by calling /user/profile
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

  // On mount, check if user is authenticated
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

  // Register user - Updated to match backend response structure
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
      
      const data: RegisterResponse = await response.json()
      
      if (response.ok && data.success && data.data && data.data.user) {
        // Set user data from registration response
        setUser(data.data.user)
        setUserData(data.data.user)
        
        console.log('✅ Registration successful:', {
          userId: data.data.user.id,
          phoneNumber: data.data.user.phoneNumber,
          phoneVerificationStatus: data.data.user.phoneVerificationStatus
        })
        
        return {
          success: true,
          user_id: data.data.user.id,
          requiresPhoneVerification: !data.data.user.phoneVerified
        }
      } else {
        // Handle specific error cases
        const errorMessage = data.error?.message || data.message || 'Registration failed'
        
        if (errorMessage.includes('Phone number already registered')) {
          return {
            success: false,
            error: 'Phone number already registered'
          }
        } else if (errorMessage.includes('Email address already registered')) {
          return {
            success: false,
            error: 'Email address already registered'
          }
        } else {
          return {
            success: false,
            error: errorMessage
          }
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: error?.message || 'An unexpected error occurred. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Login - Updated to match backend response structure
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
      
      const data: LoginResponse = await response.json()
      
      // Handle rate limiting
      if (response.status === 429) {
        return {
          success: false,
          statusCode: 429,
          error: data.error || 'Too many attempts. Please try again later.',
          retry_after: data.retry_after
        }
      }

      // Handle account locked
      if (response.status === 423) {
        return {
          success: false,
          statusCode: 423,
          error: data.error || 'Account temporarily locked.',
          retry_after: data.retry_after
        }
      }

      // Handle invalid credentials
      if (response.status === 401) {
        return {
          success: false,
          statusCode: 401,
          error: data.error || 'Invalid phone number or password.'
        }
      }

      if (response.ok && data.success && data.data && data.data.user) {
        setUser(data.data.user)
        setUserData(data.data.user)
        
        console.log('✅ Login successful:', {
          userId: data.data.user.id,
          phoneNumber: data.data.user.phoneNumber,
          accountStatus: data.data.user.accountStatus,
          phoneVerified: data.data.user.phoneVerified
        })
        
        return {
          success: true,
          user_id: data.data.user.id,
          profile: data.data.user,
          requiresActivation: data.data.user.accountStatus !== 'ACTIVE'
        }
      } else {
        return {
          success: false,
          error: data.error || data.message || 'Login failed. Please try again.'
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error?.message || 'An unexpected error occurred during login.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Phone verification - Send code
  const sendVerificationCode = async (phoneNumber: string) => {
    try {
      const response = await fetch(apiUrl('/auth/verify-phone'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          action: 'send',
          phoneNumber: phoneNumber
        })
      })
      
      const data: PhoneVerificationResponse = await response.json()
      
      if (response.ok && data.success && data.data?.sent) {
        console.log('📱 Verification code sent to:', data.data.phoneNumber)
        
        // In development, log the code for testing
        if (data.data.code && process.env.NODE_ENV === 'development') {
          console.log('🔢 Verification code:', data.data.code)
        }
        
        return {
          success: true,
          code: data.data.code // Available for testing
        }
      } else {
        return {
          success: false,
          error: data.error || data.message || 'Failed to send verification code'
        }
      }
    } catch (error: any) {
      console.error('Send verification code error:', error)
      return {
        success: false,
        error: error?.message || 'Failed to send verification code'
      }
    }
  }

  // Phone verification - Verify code
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
      
      const data: VerifyPhoneResponse = await response.json()
      
      if (response.ok && data.success && data.data?.verified) {
        console.log('✅ Phone verification successful for:', data.data.phoneNumber)
        
        // Refresh user data to get updated verification status
        await checkAuthStatus()
        
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || data.message || 'Invalid verification code'
        }
      }
    } catch (error: any) {
      console.error('Phone verification error:', error)
      return {
        success: false,
        error: error?.message || 'Verification failed. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Validate referral code
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
      
      const data: ReferralValidationResponse = await response.json()
      
      if (response.ok && data.success && data.data && data.data.valid) {
        const referrer = data.data.referrer
        const referrerName = referrer ? 
          (referrer.firstName ? `${referrer.firstName} ${referrer.lastName || ''}`.trim() : referrer.fullName) : 
          'Unknown User'
        
        return {
          valid: true,
          referrerName,
          message: data.message || `Valid referral code${referrer ? ` from ${referrerName}` : ''}`
        }
      } else {
        return {
          valid: false,
          message: data.message || 'Invalid referral code'
        }
      }
    } catch (error) {
      console.error('Referral validation error:', error)
      return {
        valid: false,
        message: 'Unable to validate referral code'
      }
    }
  }

  // Logout function
  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const response = await fetch(apiUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      })

      const data: LogoutApiResponse = await response.json()
      
      if (response.ok && data.success && data.data?.loggedOut === true) {
        setUser(null)
        setUserData(null)
        console.log('✅ Logout successful')
        return { success: true }
      } else {
        console.error('Logout API failed:', data.error || data.message)
        setUser(null)
        setUserData(null)
        return {
          success: false,
          error: data.error || data.message || 'Logout failed on server, but cleared local session'
        }
      }
    } catch (error: any) {
      console.error('Logout request failed:', error)
      setUser(null)
      setUserData(null)
      return {
        success: false,
        error: error?.message || 'Network error during logout, but cleared local session'
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Forgot password placeholder
  const forgotPassword = async (email: string) => {
    return {
      success: false,
      error: 'Forgot password not implemented.'
    }
  }

  // Refresh user data
  const refreshUserData = async (): Promise<{ success: boolean; error?: string; data?: UserData }> => {
    if (!user) {
      return {
        success: false,
        error: 'No active session'
      }
    }
    
    try {
      const response = await fetch(apiUrl('/user/profile'), { 
        method: 'GET', 
        credentials: 'include', 
        mode: 'cors' 
      })
      
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
      console.error('Refresh user data error:', error)
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