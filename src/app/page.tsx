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

function ProtectedContent() {
  const { isAuthenticated, isLoading, user, userData, checkAuthStatus } = useAuth()
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        await setAuthError(null)
        
        // Wait for the initial auth check to complete
        if (isLoading) {
          return
        }

        // If we already have user data and are authenticated, proceed with validation
        if (isAuthenticated && user ) {
          console.log('User authenticated:', {
            userId: user.id,
            email: user.email,
            // accountStatus: userData.accountStatus,
            // phoneVerified: userData.
          })

          // Check account status
          // if (userData.accountStatus === 'suspended') {
          //   if (mounted) {
          //     setAuthError('Your account has been suspended. Please contact support.')
          //   }
          //   return
          // }

          // if (userData.accountStatus === 'locked') {
          //   if (mounted) {
          //     setAuthError('Your account is temporarily locked. Please try again later or contact support.')
          //   }
          //   return
          // }

          // if (!userData.phone_verified) {
          //   console.log('Phone not verified, redirecting to verification...')
          //   router.replace('/auth/verify-phone')
          //   return
          // }

          // User is fully authenticated and verified
          if (mounted) {
            await setIsInitializing(false)
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
          // The effect will run again due to state changes, so we don't set isInitializing to false here
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

  // Show loading while initializing or while auth context is loading
  if (isLoading || isInitializing) {
    return <LoadingSpinner />
  }

  // Show auth error if present
  if (authError) {
    return <AuthError error={authError} onRetry={handleRetry} />
  }

  // Final validation: ensure user is authenticated and has valid data
  if (!isAuthenticated || !user || !userData) {
    console.log('Final check failed, redirecting to login...')
    router.replace('/auth/login')
    return <LoadingSpinner />
  }

  // Additional safety check for account status
  if (userData.accountStatus !== 'ACTIVE') {
    console.log(`Account status is ${userData.accountStatus}, showing loading...`)
    return <LoadingSpinner />
  }

  // User is authenticated and active, show the main app content
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