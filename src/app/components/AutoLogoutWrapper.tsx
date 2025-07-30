'use client'
import { useAutoLogout } from '../hooks/useAutoLogout'
import { useAuth } from '../contexts/AuthContext'

interface AutoLogoutWrapperProps {
  children: React.ReactNode
}

export default function AutoLogoutWrapper({ children }: AutoLogoutWrapperProps) {
  const { isAuthenticated } = useAuth()
  
  // Initialize auto-logout hook
  const {
    showWarning,
    isLoggingOut,
    manualLogout,
    extendSession
  } = useAutoLogout({
    timeoutMinutes: 15, // 15 minutes of inactivity
    warningMinutes: 2,  // Show warning 2 minutes before logout
    checkIntervalMs: 1000 // Check every second
  })

  // Only show session info if user is authenticated
  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <>
      {/* Main content */}
      {children}
    </>
  )
} 