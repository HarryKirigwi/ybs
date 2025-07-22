'use client'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Gift,
  Star,
  Zap
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface RegisterProps {
  onSwitchToLogin: () => void
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    registerUser, 
    verifyPhone, 
    sendVerificationCode, 
    validateReferralCode, 
    isLoading 
  } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1) // 1: Register, 2: Phone Verification
  const [userId, setUserId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [referralValidation, setReferralValidation] = useState<{
    isValidating: boolean
    isValid: boolean | null
    message: string
    referrerName: string
  }>({
    isValidating: false,
    isValid: null,
    message: '',
    referrerName: ''
  })

  // Auto-fill referral code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode }))
      handleValidateReferralCode(refCode)
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Validate referral code on change
    if (name === 'referralCode') {
      if (value.trim() === '') {
        setReferralValidation({
          isValidating: false,
          isValid: null,
          message: '',
          referrerName: ''
        })
      } else if (value.length >= 6) {
        handleValidateReferralCode(value.trim())
      }
    }
  }

  const handleValidateReferralCode = async (code: string) => {
    if (!code || code.length < 6) return

    setReferralValidation(prev => ({ ...prev, isValidating: true }))

    const result = await validateReferralCode(code)
    
    setReferralValidation({
      isValidating: false,
      isValid: result.valid,
      message: result.message,
      referrerName: result.referrerName || ''
    })
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid Kenyan phone number'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setErrors({})
    
    const result = await registerUser(formData)

    if (result.success) {
      setUserId(result.user_id || '')
      // Send phone verification code
      await handleSendVerificationCode(formData.phoneNumber)
      setStep(2) // Move to phone verification
      setSuccessMessage('Registration successful! Please verify your phone number.')
    } else {
      if (result.error?.includes('Phone number already registered')) {
        setErrors({ phoneNumber: 'This phone number is already registered' })
      } else if (result.error?.includes('Username already taken')) {
        setErrors({ username: 'This username is already taken' })
      } else if (result.error?.includes('already registered')) {
        setErrors({ email: 'This email is already registered' })
      } else {
        setErrors({ submit: result.error || 'Registration failed. Please try again.' })
      }
    }
  }

  const handleSendVerificationCode = async (phoneNumber: string) => {
    const result = await sendVerificationCode(phoneNumber)
    
    // For development - show the code (remove in production)
    if (result.success && result.code) {
      console.log('Verification code:', result.code)
    }
  }

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = await verifyPhone(formData.phoneNumber, verificationCode)

    if (result.success) {
      setSuccessMessage('Phone verified successfully! You can now sign in. Remember to activate your account with KSH 600 to start earning.')
      
      // Auto-redirect to login after delay
      setTimeout(() => {
        onSwitchToLogin()
      }, 3000)
    } else {
      setErrors({ verification: result.error || 'Invalid verification code' })
    }
  }

  const resendVerificationCode = async () => {
    const result = await sendVerificationCode(formData.phoneNumber)
    
    if (result.success) {
      setSuccessMessage('Verification code sent again!')
      // Clear any existing errors
      setErrors({})
      // For development - show the code (remove in production)
      if (result.code) {
        console.log('Verification code:', result.code)
      }
    } else {
      setErrors({ verification: result.error || 'Failed to resend code. Please try again.' })
    }
  }

  // Phone Verification Step
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify Phone Number</h2>
              <p className="text-slate-600 mb-4">
                We sent a 6-digit code to {formData.phoneNumber}
              </p>
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">{successMessage}</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handlePhoneVerification} className="space-y-4">
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-semibold text-slate-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              {errors.verification && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.verification}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify Phone Number'
                )}
              </button>

              <button
                type="button"
                onClick={resendVerificationCode}
                className="w-full text-blue-600 hover:text-blue-700 text-sm py-2"
              >
                Resend Code
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Show success message if moving to login
  if (successMessage && step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to YBS!</h2>
            <p className="text-slate-600 mb-6">{successMessage}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Next Step:</strong> Pay KSH 600 activation fee after login to start earning!
              </p>
            </div>
            <button
              onClick={onSwitchToLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
            >
              Go to Sign In
            </button>
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Join YBS Today!</h1>
          <p className="text-slate-600">Start earning money with our referral system</p>
        </div>

        {/* Welcome Bonus Banner */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Gift className="w-6 h-6" />
                <span className="font-bold text-lg">Referral Rewards</span>
              </div>
              <p className="text-sm text-green-100">Earn KSH 300 per referral!</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 p-3 rounded-full">
                <Star className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Show referral info if code is detected */}
        {formData.referralCode && referralValidation.isValid && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center space-x-2 text-green-700">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">
                🎉 You're being referred by {referralValidation.referrerName}!
              </span>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.fullName
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.fullName}</span>
                </div>
              )}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.username
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.username}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.email}</span>
                </div>
              )}
            </div>

            {/* Phone Number */}
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
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.phoneNumber
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="e.g., +254712345678"
                />
              </div>
              {errors.phoneNumber && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.phoneNumber}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">This will be your login username</p>
            </div>

            {/* Password */}
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
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-semibold text-slate-700 mb-2">
                Referral Code <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Gift className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    referralValidation.isValid === true
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                      : referralValidation.isValid === false
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter referral code (if any)"
                />
                {referralValidation.isValidating && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {referralValidation.message && (
                <div className={`mt-2 flex items-center space-x-2 ${
                  referralValidation.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {referralValidation.isValid ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">{referralValidation.message}</span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded disabled:opacity-50"
                />
                <span className="text-sm text-slate-700">
                  I agree to the{' '}
                  <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                    Terms and Conditions
                  </span>
                  {' '}and{' '}
                  <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                    Privacy Policy
                  </span>
                </span>
              </label>
              {errors.agreeToTerms && (
                <div className="mt-2 flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.agreeToTerms}</span>
                </div>
              )}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Start Earning After Activation</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">KSH 300</p>
              <p className="text-xs text-slate-600">Level 1 Referral</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-slate-700">KSH 600</p>
              <p className="text-xs text-slate-600">Activation Fee</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              Multi-level rewards: KSH 300 (Level 1) + KSH 100 (Level 2) + KSH 50 (Level 3)
            </p>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-8 pb-8">
          <p className="text-slate-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}