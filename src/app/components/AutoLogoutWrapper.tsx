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
    timeRemaining,
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
      {/* Session Status Indicator (optional - for debugging) */}
      {process.env.NODE_ENV === 'development' && timeRemaining && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs z-50">
          Session: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      )}
      
      {/* Main content */}
      {children}
    </>
  )
} 