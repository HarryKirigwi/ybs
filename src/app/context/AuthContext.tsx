'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface AuthContextType {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  userData: any | null // Store custom user profile data
  
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
    profile?: any
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
  const [userData, setUserData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  
  // Check if user is authenticated (either Supabase session or localStorage data)
  const isAuthenticated = !!user && !!session || !!userData

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        // Check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }

        // Check localStorage for custom auth data
        const storedUserId = localStorage.getItem('user_id')
        const storedUserData = localStorage.getItem('user_data')
        
        if (storedUserId && storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData)
            setUserData(parsedUserData)
          } catch (error) {
            console.error('Error parsing stored user data:', error)
            localStorage.removeItem('user_id')
            localStorage.removeItem('user_data')
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    getInitialSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      // Clear custom auth data
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_data')
      setUserData(null)
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
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
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      return { error }
    } catch (error) {
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
    
    try {
      // Pre-process phone number: remove '+' if it starts with '+254'
      let phoneNumberToSend = phoneNumber
      if (phoneNumberToSend.startsWith('+254')) {
        phoneNumberToSend = phoneNumberToSend.substring(1)
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumberToSend,
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Fetch user profile after successful login
        const profileResponse = await fetch(`/api/profile?user_id=${data.user_id}`)
        const profileData = await profileResponse.json()

        if (profileData.profile) {
          // Store auth data in localStorage and state
          localStorage.setItem('user_id', data.user_id)
          localStorage.setItem('user_data', JSON.stringify(profileData.profile))
          setUserData(profileData.profile)
          
          return {
            success: true,
            user_id: data.user_id,
            profile: profileData.profile,
            requiresActivation: !profileData.profile.is_active
          }
        } else {
          return {
            success: false,
            error: 'Failed to fetch user profile after login.'
          }
        }
      } else {
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

    try {
      const response = await fetch('/api/validate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referral_code: code })
      })

      const data = await response.json()

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
      return {
        valid: false,
        message: 'Unable to validate referral code'
      }
    }
  }

  const forgotPassword = async (email: string) => {
    setIsLoading(true)
    
    try {
      // You can implement password reset logic here
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true
      }
    } catch (error) {
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