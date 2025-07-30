'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'
import AppContent from './components/AppContent'
import AutoLogoutWrapper from './components/AutoLogoutWrapper'

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

function ProtectedContent() {
  const { isAuthenticated, isLoading, user, userData, checkAuthStatus } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        setAuthError(null)
        
        // Wait for the initial auth check to complete
        if (isLoading) {
          console.log('🔄 Auth context is still loading...')
          return
        }

        // If we already have user data and are authenticated, proceed with validation
        if (isAuthenticated && user && userData) {
          console.log('✅ User authenticated:', {
            userId: user.id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            accountStatus: userData.accountStatus,
            phoneVerified: userData.phoneVerified,
            phoneVerificationStatus: userData.phoneVerificationStatus,
            isActive: userData.isActive,
            currentPath: pathname
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
            console.log('📱 Phone verification required, showing reminder...')
            if (mounted) {
              setAuthError('PHONE_VERIFICATION_REQUIRED')
            }
            return
          }

          // Account activation check removed - allow all users regardless of status

          // User is authenticated and phone verified - allow access regardless of account status
          console.log('🎉 User is authenticated and phone verified, allowing access')
          if (mounted) {
            setIsInitializing(false)
          }
          return
        }

        // If not authenticated or missing user data, try to check auth status
        // But only do this once to prevent loops
        if ((!isAuthenticated || !user || !userData) && !hasCheckedAuth) {
          console.log('🔍 Checking authentication status...')
          setHasCheckedAuth(true)
          const isValid = await checkAuthStatus()
          
          if (!mounted) return

          if (!isValid) {
            console.log('❌ Authentication check failed, redirecting to login...')
            router.replace('/auth/login')
            return
          }

          // After successful auth check, the user and userData should be set
          // The effect will run again due to state changes
          return
        }

        // If we've already checked auth and still don't have user data, redirect to login
        if (hasCheckedAuth && (!isAuthenticated || !user || !userData)) {
          console.log('❌ Auth check completed but no valid session, redirecting to login...')
          router.replace('/auth/login')
          return
        }

      } catch (error) {
        console.error('❌ Auth initialization error:', error)
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
  }, [isAuthenticated, isLoading, user, userData, router, checkAuthStatus, hasCheckedAuth, pathname])

  // Handle auth error retry
  const handleRetry = async () => {
    setAuthError(null)
    setIsInitializing(true)
    setHasCheckedAuth(false) // Reset the auth check flag
    
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

  // Show loading while initializing or while auth context is loading
  if (isLoading || isInitializing) {
    return <LoadingSpinner />
  }

  // Handle specific error states
  if (authError === 'PHONE_VERIFICATION_REQUIRED') {
    return <PhoneVerificationReminder onRetry={handlePhoneVerification} />
  }

  // Show general auth error if present
  if (authError) {
    return <AuthError error={authError} onRetry={handleRetry} />
  }

  // Final validation: ensure user is authenticated and has valid data
  if (!isAuthenticated || !user || !userData) {
    console.log('❌ Final check failed, redirecting to login...')
    router.replace('/auth/login')
    return <LoadingSpinner />
  }

  // Final safety check: ensure phone is verified
  if (!userData.phoneVerified) {
    console.log('📱 Phone verification check failed, showing reminder...')
    return <PhoneVerificationReminder onRetry={handlePhoneVerification} />
  }

  // Only check for suspended accounts - allow all other statuses
  if (userData.accountStatus === 'SUSPENDED') {
    return <AuthError error="Your account has been suspended. Please contact support." onRetry={handleRetry} />
  }

  // User is authenticated and phone verified - show the main app content
  // (all account statuses allowed: UNVERIFIED, ACTIVE, etc.)
  console.log('🎉 All checks passed, showing main app content for user with status:', userData.accountStatus)
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
          <AutoLogoutWrapper>
            <ProtectedContent />
          </AutoLogoutWrapper>
        </AuthProvider>
      </UserProvider>
    </AppErrorBoundary>
  )
}