// app/components/Dashboard.tsx
'use client'
import { 
  Copy, 
  Users, 
  Zap, 
  Brain, 
  Play, 
  ShoppingBag, 
  ChevronRight, 
  TrendingUp,
  Eye,
  Share2,
  Gift,
  CheckCircle2,
  Star
} from 'lucide-react'
import { useState } from 'react'


export default function Dashboard() {
  const [referralCode, setReferralCode] = useState('YBS2024JD789')
  const [copySuccess, setCopySuccess] = useState(false)
  
  const referralData = {
    level1: { count: 15, earnings: 4500 },
    level2: { count: 8, earnings: 800 },
    level3: { count: 12, earnings: 600 }
  }

  const todaysEarnings = 450
  const totalEarnings = referralData.level1.earnings + referralData.level2.earnings + referralData.level3.earnings

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      alert('Failed to copy referral code')
    }
  }

  const shareReferralCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join YBS - Young Billionaires Solutions',
          text: `Use my referral code ${referralCode} to join YBS and start earning!`,
          url: `https://ybs.com/ref/${referralCode}`
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      copyReferralCode()
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back!</h2>
            <p className="text-blue-100 text-sm">Ready to earn more today?</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200 uppercase tracking-wide">Today's Earnings</p>
            <p className="text-2xl font-bold">KSH {todaysEarnings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-slate-600 font-medium">Total Earned</span>
          </div>
          <p className="text-lg font-bold text-slate-800">KSH {totalEarnings.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-slate-600 font-medium">Total Refs</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{referralData.level1.count + referralData.level2.count + referralData.level3.count}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-slate-600 font-medium">Level</span>
          </div>
          <p className="text-lg font-bold text-slate-800">Gold</p>
        </div>
      </div>

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
            <span className="font-mono text-2xl font-bold text-blue-800 tracking-wider">{referralCode}</span>
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

      {/* Enhanced Referral Stats */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Referral Performance</h3>
            <p className="text-sm text-slate-600">Track your referral network growth</p>
          </div>
          <button className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
            <Eye className="w-4 h-4 mr-2" />
            View Tree
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-slate-800">Level 1 Referrals</span>
                </div>
                <p className="text-sm text-slate-600">KSH 300 per referral</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-800">{referralData.level1.count}</p>
                <p className="text-sm font-semibold text-green-600">+KSH {referralData.level1.earnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-slate-800">Level 2 Referrals</span>
                </div>
                <p className="text-sm text-slate-600">KSH 100 per referral</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-800">{referralData.level2.count}</p>
                <p className="text-sm font-semibold text-blue-600">+KSH {referralData.level2.earnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-semibold text-slate-800">Level 3 Referrals</span>
                </div>
                <p className="text-sm text-slate-600">KSH 50 per referral</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-800">{referralData.level3.count}</p>
                <p className="text-sm font-semibold text-purple-600">+KSH {referralData.level3.earnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
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
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Spin the Wheel</h3>
            <p className="text-sm opacity-90 mb-4">Win instant rewards up to KSH 500!</p>
            <button className="w-full bg-white text-purple-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md">
              Spin Now
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Answer Trivia</h3>
            <p className="text-sm opacity-90 mb-4">Test knowledge, earn KSH 20-100!</p>
            <button className="w-full bg-white text-blue-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md">
              Start Quiz
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-600 via-green-700 to-teal-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Play className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Watch Ads</h3>
            <p className="text-sm opacity-90 mb-4">Earn KSH 5-15 per video watched!</p>
            <button className="w-full bg-white text-green-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md">
              Watch Now
            </button>
          </div>

          <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Promote Products</h3>
            <p className="text-sm opacity-90 mb-1">Earn 7% commission on:</p>
            <ul className="text-xs opacity-90 mb-4 space-y-1">
              <li>• Blog sites & courses</li>
              <li>• Deriv trading classes</li>
              <li>• AI trading bots</li>
            </ul>
            <button className="w-full bg-white text-amber-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-md">
              Start Promoting
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
  )
}