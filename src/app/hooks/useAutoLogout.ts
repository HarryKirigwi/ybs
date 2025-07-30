import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLogout } from './useLogout'

interface AutoLogoutConfig {
  timeoutMinutes: number
  warningMinutes: number
  checkIntervalMs: number
}

const DEFAULT_CONFIG: AutoLogoutConfig = {
  timeoutMinutes: 15, // 15 minutes of inactivity
  warningMinutes: 2,  // Show warning 2 minutes before logout
  checkIntervalMs: 1000 // Check every second
}

export const useAutoLogout = (config: Partial<AutoLogoutConfig> = {}) => {
  const { timeoutMinutes, warningMinutes, checkIntervalMs } = { ...DEFAULT_CONFIG, ...config }
  
  const { isAuthenticated } = useAuth()
  const { logout } = useLogout()
  
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const lastActivityRef = useRef<number>(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Convert minutes to milliseconds
  const timeoutMs = timeoutMinutes * 60 * 1000
  const warningMs = warningMinutes * 60 * 1000

  // Reset activity timer
  const resetActivity = useCallback(() => {
    console.log('🔄 User activity detected, resetting auto-logout timer')
    lastActivityRef.current = Date.now()
    setShowWarning(false)
    setTimeRemaining(null)
    
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
      warningTimeoutRef.current = null
    }
  }, [])

  // Handle user activity events
  const handleUserActivity = useCallback(() => {
    if (!isAuthenticated) return
    resetActivity()
  }, [isAuthenticated, resetActivity])

  // Show warning to user
  const showWarningToUser = useCallback(() => {
    console.log('⚠️ Showing auto-logout warning to user')
    setShowWarning(true)
    
    // Create a custom warning notification
    const warningElement = document.createElement('div')
    warningElement.id = 'auto-logout-warning'
    warningElement.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 8px;
            height: 8px;
            background: #fbbf24;
            border-radius: 50%;
            animation: pulse 1s infinite;
          "></div>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Session Timeout Warning</div>
            <div style="font-size: 13px; opacity: 0.9;">
              You'll be logged out in <span id="countdown">${warningMinutes}</span> minutes due to inactivity.
            </div>
          </div>
        </div>
        <button id="extend-session" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          margin-top: 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          Stay Logged In
        </button>
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      </style>
    `
    
    document.body.appendChild(warningElement)
    
    // Add event listener to "Stay Logged In" button
    const extendButton = document.getElementById('extend-session')
    if (extendButton) {
      extendButton.addEventListener('click', () => {
        handleUserActivity()
        document.body.removeChild(warningElement)
      })
    }
    
    // Auto-remove warning after timeout
    setTimeout(() => {
      if (document.body.contains(warningElement)) {
        document.body.removeChild(warningElement)
      }
    }, warningMs)
  }, [warningMinutes])

  // Perform logout
  const performLogout = useCallback(async () => {
    if (isLoggingOut) return
    
    console.log('🚪 Auto-logout triggered due to inactivity')
    setIsLoggingOut(true)
    
    // Remove warning if still showing
    const warningElement = document.getElementById('auto-logout-warning')
    if (warningElement) {
      document.body.removeChild(warningElement)
    }
    
    // Show logout notification
    const logoutElement = document.createElement('div')
    logoutElement.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 8px;
            height: 8px;
            background: #fca5a5;
            border-radius: 50%;
          "></div>
          <div>
            <div style="font-weight: 600;">Session Expired</div>
            <div style="font-size: 13px; opacity: 0.9;">You've been logged out due to inactivity.</div>
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(logoutElement)
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      if (document.body.contains(logoutElement)) {
        document.body.removeChild(logoutElement)
      }
    }, 5000)
    
    try {
      await logout('/auth/login')
    } catch (error) {
      console.error('Auto-logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }, [logout, isLoggingOut])

  // Check for inactivity
  const checkInactivity = useCallback(() => {
    if (!isAuthenticated) return
    
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityRef.current
    const timeUntilWarning = timeoutMs - warningMs - timeSinceLastActivity
    const timeUntilLogout = timeoutMs - timeSinceLastActivity
    
    // Update time remaining for UI
    if (timeUntilLogout > 0) {
      setTimeRemaining(Math.ceil(timeUntilLogout / 1000))
    }
    
    // Show warning if approaching timeout
    if (timeUntilWarning <= 0 && !showWarning && timeUntilLogout > 0) {
      showWarningToUser()
    }
    
    // Logout if timeout exceeded
    if (timeUntilLogout <= 0) {
      performLogout()
    }
  }, [isAuthenticated, timeoutMs, warningMs, showWarning, showWarningToUser, performLogout])

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) {
      // Clean up if user is not authenticated
      setShowWarning(false)
      setTimeRemaining(null)
      return
    }

    console.log('🔒 Setting up auto-logout monitoring (15 minutes)')
    
    // Activity events to monitor
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus'
    ]
    
    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })
    
    // Set up periodic checking
    checkIntervalRef.current = setInterval(checkInactivity, checkIntervalMs)
    
    // Initial check
    checkInactivity()
    
    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleUserActivity)
      })
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      
      // Remove any existing warning elements
      const warningElement = document.getElementById('auto-logout-warning')
      if (warningElement) {
        document.body.removeChild(warningElement)
      }
    }
  }, [isAuthenticated, handleUserActivity, checkInactivity, checkIntervalMs])

  // Manual logout function (for testing or manual triggers)
  const manualLogout = useCallback(async () => {
    console.log('🚪 Manual logout triggered')
    await performLogout()
  }, [performLogout])

  // Extend session manually
  const extendSession = useCallback(() => {
    console.log('⏰ Session extended manually')
    resetActivity()
  }, [resetActivity])

  return {
    timeRemaining,
    showWarning,
    isLoggingOut,
    manualLogout,
    extendSession,
    resetActivity
  }
} 