'use client'
import { useState } from 'react'
import { useAutoLogout } from '../hooks/useAutoLogout'
import { useAuth } from '../contexts/AuthContext'
import { Clock, LogOut, RefreshCw } from 'lucide-react'

export default function SessionStatus() {
  const { isAuthenticated } = useAuth()
  const { timeRemaining, extendSession, manualLogout } = useAutoLogout()
  const [showDetails, setShowDetails] = useState(false)

  if (!isAuthenticated || !timeRemaining) {
    return null
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const isWarning = timeRemaining <= 120 // 2 minutes or less

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Session Timer */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${
            isWarning ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Clock className={`w-4 h-4 ${
              isWarning ? 'text-red-600' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-700">Session Timeout</div>
            <div className={`text-lg font-bold ${
              isWarning ? 'text-red-600' : 'text-slate-800'
            }`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Action Buttons */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
            <button
              onClick={extendSession}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Extend Session</span>
            </button>
            <button
              onClick={manualLogout}
              className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 