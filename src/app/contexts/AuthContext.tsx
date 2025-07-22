// Utility function to clear all auth data'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Type definitions to match your API responses
interface UserData {
  id: string
  active_direct_referrals: number
  available_balance: number
  created_at: string
  email: string
  full_name: string
  is_active: boolean
  membership_level: string
  pending_balance: number
  phone_number: string
  phone_verified: boolean
  referral_code: string
  total_earnings: number
  username: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface LoginApiResponse {
  user_id: string
  error?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  userData: UserData | null // Now properly typed
  
  // Supabase auth methods
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: 'google' | 'github' | 'discord') => Promise<{ error: AuthError | null }>
  
  // Custom authentication methods
  registerUser: (userData: {
    fullName: string
    username: string
    email: string
    phoneNumber: string
    password: string
    confirmPassword: string
    referralCode?: string
    agreeToTerms: boolean
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
    code?: string // For development only
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
  
  // Utility methods
  testLocalStorage: () => boolean
  clearAuthData: () => void
  refreshUserData: () => Promise<{ success: boolean; error?: string }>
  
  // Legacy methods for backward compatibility
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: {
    fullName: string
    email: string
    phone: string
    password: string
    referralCode?: string
    agreeToTerms: boolean
  }) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  
  // Check if user is authenticated (either Supabase session or localStorage data)
  const isAuthenticated = (!!user && !!session) || !!userData

  // Utility function to test localStorage
  const testLocalStorage = (): boolean => {
    try {
      const testKey = 'auth_context_test'
      localStorage.setItem(testKey, 'test_value')
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)
      const isWorking = retrieved === 'test_value'
      console.log('LocalStorage test:', isWorking ? 'WORKING' : 'FAILED')
      return isWorking
    } catch (error) {
      console.error('LocalStorage test failed:', error)
      return false
    }
  }

  // Utility function to refresh user data from API
  const refreshUserData = async (): Promise<{ success: boolean; error?: string }> => {
    const storedUserId = localStorage.getItem('user_id')
    
    if (!storedUserId) {
      return {
        success: false,
        error: 'No user ID found in storage'
      }
    }

    try {
      console.log('Refreshing user data for:', storedUserId)
      
      const response = await fetch(`/api/user/profile?userId=${storedUserId}`)
      
      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch updated profile'
        }
      }

      const profileData: ApiResponse<UserData> = await response.json()
      
      if (profileData.success && profileData.data) {
        // Update localStorage
        localStorage.setItem('user_data', JSON.stringify(profileData.data))
        
        // Update state
        setUserData(profileData.data)
        
        console.log('User data refreshed successfully')
        return { success: true }
      } else {
        return {
          success: false,
          error: profileData.error || 'Invalid profile data'
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      return {
        success: false,
        error: 'Failed to refresh user data'
      }
    }
  }
  const clearAuthData = () => {
    try {
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_data')
      setUserData(null)
      setUser(null)
      setSession(null)
      console.log('Auth data cleared')
    } catch (error) {
      console.error('Error clearing auth data:', error)
    }
  }

  // Debug logging for state changes
  useEffect(() => {
    console.log('Auth Context State Update:', {
      user: user?.id,
      session: !!session,
      userData: userData?.id || userData?.id,
      isAuthenticated,
      isLoading
    })
  }, [user, session, userData, isAuthenticated, isLoading])

  // Debug localStorage
  useEffect(() => {
    const checkLocalStorage = () => {
      const userId = localStorage.getItem('user_id')
      const userDataStr = localStorage.getItem('user_data')
      console.log('LocalStorage Check:', {
        hasUserId: !!userId,
        hasUserData: !!userDataStr,
        userId: userId,
        userDataPreview: userDataStr ? userDataStr.substring(0, 100) + '...' : null
      })
    }
    
    checkLocalStorage()
    
    // Check again after a brief delay to catch async updates
    const timer = setTimeout(checkLocalStorage, 1000)
    return () => clearTimeout(timer)
  }, [userData])

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        // Test localStorage first
        if (!testLocalStorage()) {
          console.error('LocalStorage is not available')
        }

        // Check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            console.log('Restored Supabase session for user:', session.user.id)
          }
        }

        // Check localStorage for custom auth data
        const storedUserId = localStorage.getItem('user_id')
        const storedUserData = localStorage.getItem('user_data')
        
        if (storedUserId && storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData)
            // Validate the parsed data has expected structure
            if (parsedUserData && typeof parsedUserData === 'object') {
              setUserData(parsedUserData)
              console.log('Restored user data from localStorage:', {
                userId: storedUserId,
                hasProfile: !!parsedUserData
              })
            } else {
              throw new Error('Invalid user data structure')
            }
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError)
            // Clean up corrupted data
            localStorage.removeItem('user_id')
            localStorage.removeItem('user_data')
            setUserData(null)
          }
        } else if (storedUserId || storedUserData) {
          // Partial data - clean up
          console.warn('Partial localStorage data found, cleaning up')
          localStorage.removeItem('user_id')
          localStorage.removeItem('user_data')
          setUserData(null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        // Clean up potentially corrupted state
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }
    
    getInitialSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Supabase authentication methods
  const signUp = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      })
      console.log('SignUp result:', { success: !error, error: error?.message })
      return { error }
    } catch (error) {
      console.error('SignUp error:', error)
      return { error: error as AuthError }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      console.log('SignIn result:', { success: !error, error: error?.message })
      return { error }
    } catch (error) {
      console.error('SignIn error:', error)
      return { error: error as AuthError }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      console.log('Signing out...')
      // Clear custom auth data first
      clearAuthData()
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      console.log('SignOut result:', { success: !error, error: error?.message })
      return { error }
    } catch (error) {
      console.error('SignOut error:', error)
      return { error: error as AuthError }
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      console.log('Password reset result:', { success: !error, error: error?.message })
      return { error }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error as AuthError }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      console.log('OAuth signin result:', { provider, success: !error, error: error?.message })
      return { error }
    } catch (error) {
      console.error('OAuth signin error:', error)
      return { error: error as AuthError }
    }
  }

  // Custom authentication methods
  const registerUser = async (userData: {
    fullName: string
    username: string
    email: string
    phoneNumber: string
    password: string
    confirmPassword: string
    referralCode?: string
    agreeToTerms: boolean
  }) => {
    setIsLoading(true)
    console.log('Registering user:', { 
      email: userData.email, 
      phone: userData.phoneNumber,
      username: userData.username 
    })
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: userData.phoneNumber,
          email: userData.email,
          password: userData.password,
          full_name: userData.fullName,
          username: userData.username.toLowerCase(),
          referral_code: userData.referralCode || undefined
        })
      })

      const data = await response.json()
      console.log('Registration API response:', { 
        status: response.status, 
        success: response.ok,
        hasUserId: !!data.user_id 
      })

      if (response.ok) {
        return {
          success: true,
          user_id: data.user_id,
          requiresPhoneVerification: true
        }
      } else {
        return {
          success: false,
          error: data.error || 'Registration failed. Please try again.'
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithPhone = async (
    phoneNumber: string,
    password: string
  ) => {
    setIsLoading(true)
    console.log('Attempting phone login:', { phoneNumber })
    
    try {
      // Pre-process phone number: remove '+' if it starts with '+254'
      let phoneNumberToSend = phoneNumber.trim()
      if (phoneNumberToSend.startsWith('+254')) {
        phoneNumberToSend = phoneNumberToSend.substring(1)
      }
      console.log('Phone number for API:', phoneNumberToSend)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumberToSend,
          password: password,
        }),
      })

      const data: LoginApiResponse = await response.json()
      console.log('Login API response:', { 
        status: response.status, 
        success: response.ok,
        hasUserId: !!data.user_id 
      })

      if (response.ok && data.user_id) {
        console.log('Login successful, fetching profile...')
        
        // Fetch user profile after successful login
        const profileResponse = await fetch(`/api/user/profile?userId=${data.user_id}`)
        
        if (!profileResponse.ok) {
          console.error('Profile fetch failed:', profileResponse.status)
          return {
            success: false,
            error: 'Failed to fetch user profile after login.'
          }
        }

        const profileData: ApiResponse<UserData> = await profileResponse.json()
        console.log('Profile API response:', { 
          success: profileResponse.ok,
          apiSuccess: profileData.success,
          hasData: !!profileData.data 
        })

        // Check API response structure - your API returns data in 'data' field, not 'profile'
        if (profileData.success && profileData.data) {
          // Use a try-catch for localStorage operations
          try {
            const userIdToStore = data.user_id
            const profileToStore = JSON.stringify(profileData.data)
            
            console.log('Saving to localStorage:', {
              userId: userIdToStore,
              profileSize: profileToStore.length,
              profilePreview: {
                id: profileData.data.id,
                email: profileData.data.email,
                full_name: profileData.data.full_name,
                is_active: profileData.data.is_active
              }
            })

            localStorage.setItem('user_id', userIdToStore)
            localStorage.setItem('user_data', profileToStore)
            
            // Verify the data was saved
            const savedUserId = localStorage.getItem('user_id')
            const savedUserData = localStorage.getItem('user_data')
            
            if (savedUserId !== userIdToStore || !savedUserData) {
              throw new Error('LocalStorage verification failed')
            }
            
            console.log('LocalStorage save verified successfully')
          } catch (storageError) {
            console.error('Failed to save to localStorage:', storageError)
            return {
              success: false,
              error: 'Failed to save login data. Please try again.'
            }
          }

          // Set state after localStorage is confirmed
          console.log('Setting userData state...')
          setUserData(profileData.data)
          
          return {
            success: true,
            user_id: data.user_id,
            profile: profileData.data,
            requiresActivation: !profileData.data.is_active
          }
        } else {
          console.error('API response structure invalid:', {
            success: profileData.success,
            hasData: !!profileData.data,
            error: profileData.error
          })
          return {
            success: false,
            error: profileData.error || 'Invalid profile data received.'
          }
        }
      } else {
        console.error('Login failed:', data.error)
        return {
          success: false,
          error: data.error || 'Login failed. Please try again.'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during login.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPhone = async (phoneNumber: string, code: string) => {
    setIsLoading(true)
    console.log('Verifying phone:', { phoneNumber })
    
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          phone_number: phoneNumber,
          code: code
        })
      })

      const data = await response.json()
      console.log('Phone verification result:', { success: response.ok })

      if (response.ok) {
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || 'Invalid verification code'
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      return {
        success: false,
        error: 'Verification failed. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const sendVerificationCode = async (phoneNumber: string) => {
    console.log('Sending verification code to:', phoneNumber)
    
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          phone_number: phoneNumber
        })
      })

      const data = await response.json()
      console.log('Send verification code result:', { success: response.ok })
      
      if (response.ok) {
        return {
          success: true,
          code: data.code // For development only
        }
      } else {
        return {
          success: false,
          error: data.error || 'Failed to send verification code'
        }
      }
    } catch (error) {
      console.error('Error sending verification code:', error)
      return {
        success: false,
        error: 'Failed to send verification code'
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

    console.log('Validating referral code:', code)

    try {
      const response = await fetch('/api/validate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_code: code })
      })

      const data = await response.json()
      console.log('Referral validation result:', { valid: data.valid })

      if (response.ok && data.valid) {
        return {
          valid: true,
          referrerName: data.referrer_name,
          message: `Valid referral code from ${data.referrer_name}`
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

  const forgotPassword = async (email: string) => {
    setIsLoading(true)
    console.log('Processing forgot password for:', email)
    
    try {
      // You can implement actual password reset logic here
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      return {
        success: false,
        error: 'Failed to send reset email. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Legacy methods for backward compatibility
  const register = async (userData: {
    fullName: string
    email: string
    phone: string
    password: string
    referralCode?: string
    agreeToTerms: boolean
  }): Promise<boolean> => {
    const { error } = await signUp(userData.email, userData.password, {
      full_name: userData.fullName,
      phone: userData.phone,
      referral_code: userData.referralCode || null,
      agreed_to_terms: userData.agreeToTerms
    })
    return !error
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await signIn(email, password)
    return !error
  }

  const value = {
    user,
    session,
    isAuthenticated,
    isLoading,
    userData,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithOAuth,
    registerUser,
    loginWithPhone,
    verifyPhone,
    sendVerificationCode,
    validateReferralCode,
    forgotPassword,
    testLocalStorage,
    clearAuthData,
    refreshUserData,
    login, // Legacy method
    register // Legacy method
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}