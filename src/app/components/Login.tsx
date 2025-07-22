'use client'
import {
  Eye,
  EyeOff,
  Lock,
  Phone,
  LogIn,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Mail,
  Shield,
  CreditCard
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

interface LoginProps {
  onSwitchToRegister: () => void
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const router = useRouter()
  const { loginWithPhone, forgotPassword, isLoading } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [loginStep, setLoginStep] = useState(1) // 1: Login, 2: Activation required
  const [userData, setUserData] = useState<any>(null)
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Kenyan phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setErrors({})

    const result = await loginWithPhone(formData.phoneNumber, formData.password)

    if (result.success) {
      if (result.profile) {
        setUserData(result.profile)

        // Check if account is activated
        if (result.requiresActivation) {
          setLoginStep(2) // Show activation required step
        } else {
          // Account is active, redirect to home page
          router.push('/')
        }
      }
    } else {
      // Handle different types of errors
      if (result.error?.includes('No account found')) {
        setErrors({ phoneNumber: 'No account found with this phone number' })
      } else if (result.error?.includes('verify your phone number')) {
        setErrors({ submit: 'Please verify your phone number before signing in' })
      } else if (result.error?.includes('Invalid phone number or password')) {
        setErrors({ submit: 'Invalid phone number or password' })
      } else {
        setErrors({ submit: result.error || 'Login failed. Please try again.' })
      }
    }
  }

  const handleActivateAccount = () => {
    // User data is already stored in AuthContext and localStorage
    router.push('/activate-account')
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!forgotPasswordEmail || !/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setErrors({ forgotPassword: 'Please enter a valid email address' })
      return
    }

    setErrors({})

    const result = await forgotPassword(forgotPasswordEmail)

    if (result.success) {
      alert('Password reset instructions sent to your email!')
      setShowForgotPassword(false)
      setForgotPasswordEmail('')
    } else {
      setErrors({ forgotPassword: result.error || 'Failed to send reset email. Please try again.' })
    }
  }

  // Activation Required Step
  if (loginStep === 2 && userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="text-center mb-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Account Activation Required</h2>
              <p className="text-slate-600 mb-4">
                Welcome back, {userData.full_name}! Your account needs to be activated to start earning.
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Account Status:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Phone Verified:</span>
                  <span className={userData.phone_verified ? 'text-green-600' : 'text-red-600'}>
                    {userData.phone_verified ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Account Active:</span>
                  <span className="text-red-600">✗ No</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Direct Referrals:</span>
                  <span className="text-blue-600">{userData.active_direct_referrals}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-800 mb-2">🎉 Unlock Your Earning Potential!</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Earn KSH 300 per direct referral</li>
                <li>• Get KSH 100 for level 2 referrals</li>
                <li>• Receive KSH 50 for level 3 referrals</li>
                <li>• Access to exclusive products</li>
                <li>• Real-time earnings dashboard</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleActivateAccount}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>Pay KSH 600 to Activate</span>
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full border border-slate-300 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
              >
                View Dashboard (Limited Access)
              </button>

              <button
                onClick={() => setLoginStep(1)}
                className="w-full text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h2>
              <p className="text-slate-600">
                Enter your email address to receive password reset instructions
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    id="resetEmail"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {errors.forgotPassword && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.forgotPassword}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>

              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-blue-600 hover:text-blue-700 text-sm py-2"
              >
                ← Back to Login
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back!</h1>
          <p className="text-slate-600">Sign in with your phone number to continue earning</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Field */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.phoneNumber
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="e.g., +254712345678"
                  disabled={isLoading}
                />
              </div>
              {errors.phoneNumber && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.phoneNumber}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.password}</span>
                </div>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Your Earning Opportunities</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">KSH 300</p>
              <p className="text-xs text-slate-600">Level 1 Referral</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">Secure</p>
              <p className="text-xs text-slate-600">Payments</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              Multi-level rewards: Level 1 (KSH 300) • Level 2 (KSH 100) • Level 3 (KSH 50)
            </p>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-8 pb-8">
          <p className="text-slate-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign Up Now
            </button>
          </p>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              Need help? Contact support at{' '}
              <span className="text-blue-600">support@ybs.co.ke</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}