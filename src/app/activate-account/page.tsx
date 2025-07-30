'use client'
import {
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Gift,
  Star,
  Zap,
  ArrowRight,
  Users,
  TrendingUp,
  DollarSign,
  CreditCard,
  Brain,
  Play,
  ShoppingBag,
  RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { useUserData } from '../hooks/useUserData'
import { UserProvider } from '../contexts/UserContext'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
const ACTIVATION_AMOUNT = process.env.NEXT_PUBLIC_MPESA_ACTIVATION_AMOUNT || '600'

function apiUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

interface ActivationResponse {
  success: boolean
  message: string
  data?: {
    transactionId?: string
    mpesaRequestId?: string
    checkoutRequestId?: string
    status?: string
  }
  error?: string
}

function ActivateAccountContent() {
  const router = useRouter()
  const { userData, refreshUserData, isAuthenticated } = useAuth()
  const { computedData } = useUserData()
  const [isActivating, setIsActivating] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)


  // Redirect if already activated
  useEffect(() => {
    if (userData?.accountStatus === 'ACTIVE') {
      router.replace('/')
    }
  }, [userData?.accountStatus, router])

  const handleActivateAccount = async () => {
    if (!userData) {
      setError('User data not available. Please refresh and try again.')
      return
    }

    setIsActivating(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await fetch(apiUrl('/user/activate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          mpesaNumber: userData.phoneNumber,
          amount: parseInt(ACTIVATION_AMOUNT)
        })
      })

      const data: ActivationResponse = await response.json()

      if (response.ok && data.success) {
        setSuccessMessage(data.message || 'Activation request sent successfully!')
        
        // Refresh user data to check if activation was completed
        setTimeout(async () => {
          await refreshUserData()
        }, 2000)

        console.log('✅ Activation request successful:', {
          transactionId: data.data?.transactionId,
          mpesaRequestId: data.data?.mpesaRequestId,
          status: data.data?.status
        })

        // Show success message and redirect after delay
        setTimeout(() => {
          router.push('/')
        }, 3000)

      } else {
        setError(data.error || data.message || 'Activation failed. Please try again.')
        console.error('❌ Activation failed:', data.error || data.message)
      }
    } catch (error: any) {
      console.error('Activation request error:', error)
      setError(error?.message || 'Network error. Please check your connection and try again.')
    } finally {
      setIsActivating(false)
    }
  }

  const handleSkipActivation = () => {
    console.log('ℹ️ User skipped activation')
    router.push('/')
  }

  const handleConfirmActivation = () => {
    setShowConfirmation(false)
    handleActivateAccount()
  }

  // Show loading if no user data
  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading account information...</p>
        </div>
      </div>
    )
  }

  // Success screen
  if (successMessage && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-slate-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Activation Initiated!</h2>
            <p className="text-slate-600 mb-6">{successMessage}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong>
                <br />
                1. Complete the M-PESA payment on your phone
                <br />
                2. Your account will be activated automatically
                <br />
                3. Start earning immediately after activation!
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300"
              >
                Continue to Dashboard
              </button>
              <button
                onClick={() => {
                  setSuccessMessage('')
                  refreshUserData()
                }}
                className="w-full text-slate-600 hover:text-slate-700 text-sm py-2 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Activation Status</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Confirmation modal
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="text-center mb-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirm Activation</h2>
              <p className="text-slate-600">
                You're about to activate your YBS account
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600">Phone Number:</span>
                <span className="font-semibold text-slate-800">{userData.phoneNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Activation Fee:</span>
                <span className="font-bold text-green-600 text-lg">KSH {ACTIVATION_AMOUNT}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> You will receive an M-PESA prompt on your phone. 
                Complete the payment to activate your account and start earning!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="py-3 px-4 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmActivation}
                disabled={isActivating}
                className="py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50"
              >
                {isActivating ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main activation page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Activate Your Account</h1>
          <p className="text-slate-600">Unlock the full YBS earning potential</p>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Welcome, {computedData?.firstName || userData.fullName}! 🎉</h3>
              <p className="text-blue-100 text-sm">You're almost ready to start earning</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <Gift className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Activation Fee Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-6">
          <div className="text-center mb-6">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">One-Time Activation Fee</h2>
            <div className="text-4xl font-bold text-green-600 mb-2">KSH {ACTIVATION_AMOUNT}</div>
            <p className="text-slate-600 text-sm">
              Paid via M-PESA to: {userData.phoneNumber}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Activation Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isActivating}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isActivating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Activate with M-PESA</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={handleSkipActivation}
              disabled={isActivating}
              className="w-full border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Skip for Now
            </button>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">What You'll Unlock</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">KSH 300</p>
              <p className="text-xs text-slate-600">Level 1 Referral</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">KSH 100</p>
              <p className="text-xs text-slate-600">Level 2 Referral</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Spin Wheel</p>
              <p className="text-xs text-slate-600">Win up to KSH 500</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Trivia</p>
              <p className="text-xs text-slate-600">Earn KSH 20-100</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-slate-800 mb-2">Additional Earning Methods:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Watch ads: KSH 5-15 per video</li>
              <li>• Product promotion: 7% commission</li>
              <li>• Academic writing bonuses</li>
              <li>• Weekly challenge rewards</li>
            </ul>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Current Account Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Phone Verified</span>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-semibold">Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Account Status</span>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-orange-600 font-semibold">Pending Activation</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Referral Code</span>
              <span className="font-mono text-blue-600 font-semibold">{userData.referralCode}</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Secure M-PESA Payment</p>
              <p>
                Your payment is processed securely through Safaricom M-PESA. 
                You'll receive a payment prompt on your registered phone number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ActivateAccount() {
  return (
    <AuthProvider>
      <UserProvider>
        <ActivateAccountContent />
      </UserProvider>
    </AuthProvider>
  )
}