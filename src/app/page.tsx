'use client'
import { useEffect } from 'react'
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

function ProtectedContent() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're done loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...')
      router.push('/auth/login')
    } else if (!isLoading && isAuthenticated && user) {
      console.log('User authenticated:', user.email)
    }
  }, [isAuthenticated, isLoading, router, user])

  // Show loading while checking authentication status
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Show loading while redirecting unauthenticated users
  if (!isAuthenticated) {
    return <LoadingSpinner />
  }

  // User is authenticated, show the main app content
  return <AppContent />
}

export default function HomePage() {
  return (
    <UserProvider>
      <AuthProvider>
        <ProtectedContent />
      </AuthProvider>
    </UserProvider>
  )
}