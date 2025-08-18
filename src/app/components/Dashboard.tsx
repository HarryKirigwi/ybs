// components/Dashboard.tsx (Updated) yes
'use client'
import { 
  Copy, 
  Users, 
  Zap, 
  Brain, 
  Play, 
  ShoppingBag, 
  TrendingUp,
  Eye,
  Share2,
  Gift,
  CheckCircle2,
  Star,
  RefreshCw
} from 'lucide-react'
import { useState } from 'react'
import { useUserData } from '../hooks/useUserData'
import { useActivation } from '../hooks/useActivation'
import DashboardSkeleton from './DashboardSkeleton'
import { CompactNetworkStatus } from './NetworkStatusIndicator'

export default function Dashboard() {
  const { userData, computedData, loading, error, refreshUserData } = useUserData()
  const { handleActivateNow } = useActivation()
  const [copySuccess, setCopySuccess] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshUserData()
    setIsRefreshing(false)
  }

  const copyReferralCode = async () => {
    if (!computedData?.referrals.code) return
    
    try {
      await navigator.clipboard.writeText(computedData.referrals.code)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      alert('Failed to copy referral code')
    }
  }

  const shareReferralCode = async () => {
    if (!computedData?.referrals.code) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join YBS - Young Billionaires Solutions',
          text: `Use my referral code ${computedData.referrals.code} to join YBS and start earning!`,
          url: `https://ybslimited.co.ke/ref/${computedData.referrals.code}`
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      copyReferralCode()
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error || !userData || !computedData) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load user data'}</p>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-0 space-y-6">
      {/* Desktop Grid Layout */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-6 md:space-y-0">
        {/* Left Column - Main Content */}
        <div className="md:col-span-8 space-y-6">
          {/* Welcome Header with Refresh */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Welcome back, {computedData.firstName}!</h2>
                <p className="text-blue-100 text-sm">Ready to earn more today?</p>
                {computedData.status.needsActivation && (
                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-2 mt-3">
                    <p className="text-yellow-100 text-xs">⚠️ Account not activated. Activate to start earning!</p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 mb-2">
                  <CompactNetworkStatus />
                </div>
                <p className="text-xs text-blue-200 uppercase tracking-wide">Available Balance</p>
                <p className="text-2xl font-bold">KSH {computedData.financials.available.toLocaleString()}</p>
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="mt-2 text-blue-200 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-slate-600 font-medium">Total Earned</span>
              </div>
              <p className="text-lg font-bold text-slate-800">KSH {computedData.financials.total.toLocaleString()}</p>
              {computedData.financials.pending > 0 && (
                <p className="text-xs text-orange-600">+KSH {computedData.financials.pending.toLocaleString()} pending</p>
              )}
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-slate-600 font-medium">Active Refs</span>
              </div>
              <p className="text-lg font-bold text-slate-800">{computedData.referrals.total}</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Star className={`w-4 h-4 ${computedData.membershipLevel.color}`} />
                <span className="text-xs text-slate-600 font-medium">Level</span>
              </div>
              <p className={`text-lg font-bold ${computedData.membershipLevel.color}`}>
                {computedData.membershipLevel.name}
              </p>
            </div>
          </div>

          {/* Earning Opportunities */}
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Earning Opportunities</h3>
              <p className="text-sm text-slate-600">Complete activities to boost your earnings</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Spin the Wheel</h3>
                <p className="text-sm opacity-90 mb-4">Win instant rewards up to KSH 500!</p>
                <button 
                  onClick={userData.is_active ? undefined : handleActivateNow}
                  className="w-full bg-white text-purple-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
                >
                  {userData.is_active ? 'Spin Now' : 'Activate Required'}
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Answer Trivia</h3>
                <p className="text-sm opacity-90 mb-4">Test knowledge, earn KSH 20-100!</p>
                <button 
                  onClick={userData.is_active ? undefined : handleActivateNow}
                  className="w-full bg-white text-blue-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
                >
                  {userData.is_active ? 'Start Quiz' : 'Activate Required'}
                </button>
              </div>

              <div className="bg-gradient-to-br from-green-600 via-green-700 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Watch Ads</h3>
                <p className="text-sm opacity-90 mb-4">Earn KSH 5-15 per video watched!</p>
                <button 
                  onClick={userData.is_active ? undefined : handleActivateNow}
                  className="w-full bg-white text-green-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
                >
                  {userData.is_active ? 'Watch Now' : 'Activate Required'}
                </button>
              </div>

              <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Promote Products</h3>
                <p className="text-sm opacity-90 mb-1">Earn 7% commission on:</p>
                <ul className="text-xs opacity-90 mb-4 space-y-1">
                  <li>• Blog sites & courses</li>
                  <li>• Deriv trading classes</li>
                  <li>• AI trading bots</li>
                </ul>
                <button 
                  onClick={userData.is_active ? undefined : handleActivateNow}
                  className="w-full bg-white text-amber-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
                >
                  {userData.is_active ? 'Start Promoting' : 'Activate Required'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Invite Friends</span>
              </button>
              <button className="bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="md:col-span-4 space-y-6">
          {/* Account Status Card */}
          {computedData.status.needsActivation && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-800">Activate Your Account</h4>
                  <p className="text-sm text-yellow-700">Unlock all earning features!</p>
                </div>
              </div>
              <button 
                onClick={handleActivateNow}
                className="w-full mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors"
              >
                Activate Now
              </button>
            </div>
          )}

          {/* Referral Code Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Your Referral Code</h3>
                <p className="text-sm text-slate-600">Share and earn KSH 300!</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-blue-800 tracking-wider">
                  {computedData.referrals.code}
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={copyReferralCode}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      copySuccess 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={copySuccess}
                  >
                    {copySuccess ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={shareReferralCode}
                    className="bg-slate-600 text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {copySuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-800 text-sm font-medium">✅ Referral code copied!</p>
              </div>
            )}
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Invite Friends Now
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Account Balance</h3>
            <div className="space-y-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-slate-600 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  KSH {computedData.financials.available.toLocaleString()}
                </p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <p className="text-sm text-slate-600 mb-1">Pending Balance</p>
                <p className="text-2xl font-bold text-orange-600">
                  KSH {computedData.financials.pending.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Value:</span>
                <span className="text-xl font-bold text-blue-600">
                  KSH {computedData.financials.total.toLocaleString()}
                </span>
              </div>
            </div>
            {computedData.financials.canWithdraw && (
              <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors mt-4">
                Withdraw Funds
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout (unchanged) */}
      <div className="md:hidden space-y-6">
        {/* Welcome Header with Refresh */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome back, {computedData.firstName}!</h2>
              <p className="text-blue-100 text-sm">Ready to earn more today?</p>
              {computedData.status.needsActivation && (
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-2 mt-3">
                  <p className="text-yellow-100 text-xs">⚠️ Account not activated. Activate to start earning!</p>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200 uppercase tracking-wide">Available Balance</p>
              <p className="text-2xl font-bold">KSH {computedData.financials.available.toLocaleString()}</p>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="mt-2 text-blue-200 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-600 font-medium">Total Earned</span>
            </div>
            <p className="text-lg font-bold text-slate-800">KSH {computedData.financials.total.toLocaleString()}</p>
            {computedData.financials.pending > 0 && (
              <p className="text-xs text-orange-600">+KSH {computedData.financials.pending.toLocaleString()} pending</p>
            )}
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-600 font-medium">Active Refs</span>
            </div>
            <p className="text-lg font-bold text-slate-800">{computedData.referrals.total}</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Star className={`w-4 h-4 ${computedData.membershipLevel.color}`} />
              <span className="text-xs text-slate-600 font-medium">Level</span>
            </div>
            <p className={`text-lg font-bold ${computedData.membershipLevel.color}`}>
              {computedData.membershipLevel.name}
            </p>
          </div>
        </div>

        {/* Account Status Alert */}
        {computedData.status.needsActivation && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800">Activate Your Account</h4>
                <p className="text-sm text-yellow-700">Unlock all earning features and start making money!</p>
              </div>
              <button 
                onClick={handleActivateNow}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors"
              >
                Activate Now
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Referral Code Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Your Referral Code</h3>
              <p className="text-sm text-slate-600">Share and earn KSH 300 per referral!</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-blue-800 tracking-wider">
                {computedData.referrals.code}
              </span>
              <div className="flex space-x-2">
                <button 
                  onClick={copyReferralCode}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    copySuccess 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={copySuccess}
                >
                  {copySuccess ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
                <button 
                  onClick={shareReferralCode}
                  className="bg-slate-600 text-white p-3 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {copySuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-800 text-sm font-medium">✅ Referral code copied to clipboard!</p>
            </div>
          )}
          
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Invite Friends Now
          </button>
        </div>

        {/* Real-time Balance Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Account Balance</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-slate-600 mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">
                KSH {computedData.financials.available.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <p className="text-sm text-slate-600 mb-1">Pending Balance</p>
              <p className="text-2xl font-bold text-orange-600">
                KSH {computedData.financials.pending.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Value:</span>
              <span className="text-xl font-bold text-blue-600">
                KSH {computedData.financials.total.toLocaleString()}
              </span>
            </div>
          </div>
          {computedData.financials.canWithdraw && (
            <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors mt-4">
              Withdraw Funds
            </button>
          )}
        </div>

        {/* Earning Opportunities */}
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Earning Opportunities</h3>
            <p className="text-sm text-slate-600">Complete activities to boost your earnings</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Spin the Wheel</h3>
              <p className="text-sm opacity-90 mb-4">Win instant rewards up to KSH 500!</p>
              <button 
                onClick={userData.is_active ? undefined : handleActivateNow}
                className="w-full bg-white text-purple-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
              >
                {userData.is_active ? 'Spin Now' : 'Activate Required'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Answer Trivia</h3>
              <p className="text-sm opacity-90 mb-4">Test knowledge, earn KSH 20-100!</p>
              <button 
                onClick={userData.is_active ? undefined : handleActivateNow}
                className="w-full bg-white text-blue-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
              >
                {userData.is_active ? 'Start Quiz' : 'Activate Required'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-600 via-green-700 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Watch Ads</h3>
              <p className="text-sm opacity-90 mb-4">Earn KSH 5-15 per video watched!</p>
              <button 
                onClick={userData.is_active ? undefined : handleActivateNow}
                className="w-full bg-white text-green-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
              >
                {userData.is_active ? 'Watch Now' : 'Activate Required'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">Promote Products</h3>
              <p className="text-sm opacity-90 mb-1">Earn 7% commission on:</p>
              <ul className="text-xs opacity-90 mb-4 space-y-1">
                <li>• Blog sites & courses</li>
                <li>• Deriv trading classes</li>
                <li>• AI trading bots</li>
              </ul>
              <button 
                onClick={userData.is_active ? undefined : handleActivateNow}
                className="w-full bg-white text-amber-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md"
              >
                {userData.is_active ? 'Start Promoting' : 'Activate Required'}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Invite Friends</span>
            </button>
            <button className="bg-white border border-slate-200 text-slate-700 py-3 px-4 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}