'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'
import AppContent from './components/AppContent'

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  )
}

// Error component for authentication failures
function AuthError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-4">
          <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Authentication Error</h2>
        <p className="text-slate-600 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

// Phone verification reminder component
function PhoneVerificationReminder({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-4">
          <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Phone Verification Required</h2>
        <p className="text-slate-600 mb-4">
          Please verify your phone number to continue using YBS services.
        </p>
        <button
          onClick={onRetry}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors mr-2"
        >
          Verify Now
        </button>
      </div>
    </div>
  )
}

// Account activation reminder component
function AccountActivationReminder({ userData, onRetry }: { userData: any; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-4">
          <svg className="w-16 h-16 text-orange-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Account Activation Required</h2>
        <p className="text-slate-600 mb-4">
          Welcome to YBS! Please activate your account with KSH 600 to start earning.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Your Benefits:</strong>
            <br />• Earn KSH 300 per Level 1 referral
            <br />• Multi-level referral system
            <br />• Spin the wheel, watch ads, and more!
          </p>
        </div>
        <button
          onClick={onRetry}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Activate Account
        </button>
      </div>
    </div>
  )
}

function ProtectedContent() {
  const { isAuthenticated, isLoading, user, userData, checkAuthStatus } = useAuth()
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        setAuthError(null)
        
        // Wait for the initial auth check to complete
        if (isLoading) {
          return
        }

        // If we already have user data and are authenticated, proceed with validation
        if (isAuthenticated && user && userData) {
          console.log('User authenticated:', {
            userId: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            accountStatus: userData.accountStatus,
            phoneVerified: userData.phoneVerified,
            phoneVerificationStatus: userData.phoneVerificationStatus,
            isActive: userData.isActive
          })

          // Check for suspended account
          if (userData.accountStatus === 'SUSPENDED') {
            if (mounted) {
              setAuthError('Your account has been suspended. Please contact support.')
            }
            return
          }

          // Check if phone verification is required
          if (!userData.phoneVerified) {
            console.log('Phone verification required, redirecting...')
            if (mounted) {
              // Instead of redirecting, show verification reminder
              setAuthError('PHONE_VERIFICATION_REQUIRED')
            }
            return
          }

          // Check if account activation is required
          if (userData.accountStatus === 'UNVERIFIED') {
            console.log('Account activation required')
            if (mounted) {
              setAuthError('ACCOUNT_ACTIVATION_REQUIRED')
            }
            return
          }

          // User is fully authenticated, verified, and active
          if (mounted) {
            setIsInitializing(false)
          }
          return
        }

        // If not authenticated or missing user data, try to check auth status
        if (!isAuthenticated || !user || !userData) {
          console.log('Checking authentication status...')
          const isValid = await checkAuthStatus()
          
          if (!mounted) return

          if (!isValid) {
            console.log('Authentication check failed, redirecting to login...')
            router.replace('/auth/login')
            return
          }

          // After successful auth check, the user and userData should be set
          // The effect will run again due to state changes
          return
        }

      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setAuthError('Failed to verify authentication. Please try again.')
          setIsInitializing(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [isAuthenticated, isLoading, user, userData, router, checkAuthStatus])

  // Handle auth error retry
  const handleRetry = async () => {
    setAuthError(null)
    setIsInitializing(true)
    
    try {
      const isValid = await checkAuthStatus()
      if (!isValid) {
        router.replace('/auth/login')
      } else {
        setIsInitializing(false)
      }
    } catch (error) {
      console.error('Retry auth check failed:', error)
      setAuthError('Authentication check failed. Please try again.')
      setIsInitializing(false)
    }
  }

  // Handle phone verification
  const handlePhoneVerification = () => {
    router.replace('/auth/verify-phone')
  }

  // Handle account activation
  const handleAccountActivation = () => {
    router.replace('/activate-account')
  }

  // Show loading while initializing or while auth context is loading
  if (isLoading || isInitializing) {
    return <LoadingSpinner />
  }

  // Handle specific error states
  if (authError === 'PHONE_VERIFICATION_REQUIRED') {
    return <PhoneVerificationReminder onRetry={handlePhoneVerification} />
  }

  if (authError === 'ACCOUNT_ACTIVATION_REQUIRED') {
    return <AccountActivationReminder userData={userData} onRetry={handleAccountActivation} />
  }

  // Show general auth error if present
  if (authError) {
    return <AuthError error={authError} onRetry={handleRetry} />
  }

  // Final validation: ensure user is authenticated and has valid data
  if (!isAuthenticated || !user || !userData) {
    console.log('Final check failed, redirecting to login...')
    router.replace('/auth/login')
    return <LoadingSpinner />
  }

  // Final safety check: ensure phone is verified
  if (!userData.phoneVerified || userData.phoneVerificationStatus !== 'VERIFIED') {
    console.log('Phone verification check failed, showing reminder...')
    return <PhoneVerificationReminder onRetry={handlePhoneVerification} />
  }

  // Check account status one more time
  if (userData.accountStatus === 'UNVERIFIED') {
    console.log('Account activation check, showing reminder...')
    return <AccountActivationReminder userData={userData} onRetry={handleAccountActivation} />
  }

  if (userData.accountStatus === 'SUSPENDED') {
    return <AuthError error="Your account has been suspended. Please contact support." onRetry={handleRetry} />
  }

  // User is authenticated, phone verified, and active - show the main app content
  console.log('✅ All checks passed, showing main app content')
  return <AppContent />
}

// Error boundary component for the entire app
function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      setError(event.error?.message || 'An unexpected error occurred')
      setHasError(true)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      setError(event.reason?.message || 'An unexpected error occurred')
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error || 'An unexpected error occurred'}</p>
          <button
            onClick={() => {
              setHasError(false)
              setError(null)
              window.location.reload()
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function HomePage() {
  return (
    <AppErrorBoundary>
      <UserProvider>
        <AuthProvider>
          <ProtectedContent />
        </AuthProvider>
      </UserProvider>
    </AppErrorBoundary>
  )
}