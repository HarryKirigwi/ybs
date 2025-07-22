// app/components/WalletPage.tsx
'use client'
import { 
  Wallet, 
  CreditCard, 
  Send, 
  Download, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface UserData {
  activation_paid_at: string | null;
  active_direct_referrals: number;
  available_balance: number;
  created_at: string;
  full_name: string;
  id: string;
  is_active: boolean;
  membership_level: string;
  pending_balance: number;
  phone_number: string;
  phone_verified: boolean;
  referral_code: string;
  referred_by: string | null;
  total_earnings: number;
  updated_at: string;
  username: string;
}

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Get user data from localStorage
    const getUserData = () => {
      try {
        const storedUserData = localStorage.getItem('user_data') // Adjust key name as needed
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData)
          setUserData(parsedData)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      } finally {
        setLoading(false)
      }
    }

    getUserData()
  }, [])

  // Use real data from localStorage, with fallback values
  const walletData = {
    balance: userData?.available_balance || 0,
    pendingEarnings: userData?.pending_balance || 0,
    totalEarnings: userData?.total_earnings || 0,
    minimumWithdraw: 1000 // This remains hardcoded for now
  }

  // Mock transactions data - will be replaced with real API data later
  const transactions = [
    { id: 1, type: 'earning', amount: 300, description: 'Level 1 Referral Bonus', date: '2024-01-15T10:30:00', icon: ArrowUpRight },
    { id: 2, type: 'withdraw', amount: -5000, description: 'Withdraw to M-Pesa', date: '2024-01-14T15:45:00', icon: ArrowDownLeft },
    { id: 3, type: 'earning', amount: 100, description: 'Level 2 Referral Bonus', date: '2024-01-14T09:20:00', icon: ArrowUpRight },
    { id: 4, type: 'earning', amount: 50, description: 'Daily Task Completion', date: '2024-01-13T14:15:00', icon: ArrowUpRight },
    { id: 5, type: 'earning', amount: 200, description: 'Weekly Challenge Bonus', date: '2024-01-12T11:00:00', icon: ArrowUpRight },
    { id: 6, type: 'earning', amount: 30, description: 'Video Watch Reward', date: '2024-01-12T08:45:00', icon: ArrowUpRight },
  ]

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {showBalance ? `KSH ${value.toLocaleString()}` : '****'}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${
          color === 'text-green-600' ? 'bg-green-100' : 
          color === 'text-blue-600' ? 'bg-blue-100' : 
          'bg-blue-100'
        }`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  const TransactionItem = ({ transaction }: { transaction: any }) => {
    const Icon = transaction.icon
    const isEarning = transaction.type === 'earning'
    
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-full ${
          isEarning ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Icon className={`w-4 h-4 ${
            isEarning ? 'text-green-600' : 'text-red-600'
          }`} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-800">{transaction.description}</p>
          <p className="text-sm text-slate-500">
            {new Date(transaction.date).toLocaleDateString()} at {new Date(transaction.date).toLocaleTimeString()}
          </p>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${
            isEarning ? 'text-green-600' : 'text-red-600'
          }`}>
            {isEarning ? '+' : ''}KSH {Math.abs(transaction.amount).toLocaleString()}
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 space-y-6">
        {/* Loading Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">My Wallet</h1>
                <p className="text-blue-100 text-sm">Loading...</p>
              </div>
            </div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Loading Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded mb-2 w-1/3"></div>
              <div className="h-8 bg-slate-200 rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (!userData) {
    return (
      <div className="p-4 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Wallet className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">Unable to Load Wallet</p>
              <p className="text-sm text-red-700">Please try logging in again</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const canWithdraw = userData.is_active && walletData.balance >= walletData.minimumWithdraw

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold">My Wallet</h1>
              <p className="text-blue-100 text-sm">
                {userData.is_active ? 'Manage your earnings' : 'Account activation required'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Account Status Alert */}
      {!userData.is_active && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <CreditCard className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800">Account Not Activated</h4>
              <p className="text-sm text-yellow-700">Activate your account to enable withdrawals and unlock all features.</p>
            </div>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors">
              Activate Now
            </button>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 gap-4">
        <StatCard 
          title="Available Balance"
          value={walletData.balance}
          subtitle={userData.is_active ? "Ready to withdraw" : "Activation required"}
          icon={Wallet}
          color="text-blue-600"
        />
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Pending"
            value={walletData.pendingEarnings}
            subtitle="Processing"
            icon={TrendingUp}
            color="text-orange-600"
          />
          <StatCard 
            title="Total Earned"
            value={walletData.totalEarnings}
            subtitle="All time"
            icon={TrendingUp}
            color="text-green-600"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          className={`p-4 rounded-xl flex items-center justify-center space-x-2 font-medium transition-colors ${
            canWithdraw
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!canWithdraw}
          title={
            !userData.is_active 
              ? 'Account activation required' 
              : walletData.balance < walletData.minimumWithdraw 
                ? `Minimum withdrawal is KSH ${walletData.minimumWithdraw.toLocaleString()}`
                : 'Withdraw funds'
          }
        >
          <Download className="w-5 h-5" />
          <span>Withdraw</span>
        </button>
        <button 
          className={`p-4 rounded-xl flex items-center justify-center space-x-2 font-medium transition-colors ${
            userData.is_active
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!userData.is_active}
          title={!userData.is_active ? 'Account activation required' : 'Transfer funds'}
        >
          <Send className="w-5 h-5" />
          <span>Transfer</span>
        </button>
      </div>

      {/* Withdrawal Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-amber-800">Withdrawal Info</p>
            <p className="text-sm text-amber-700">
              Minimum withdrawal: KSH {walletData.minimumWithdraw.toLocaleString()}
            </p>
            <p className="text-sm text-amber-700">
              Processing time: 1-3 business days
            </p>
            {!userData.is_active && (
              <p className="text-sm text-amber-700 font-medium">
                ⚠️ Account activation required for withdrawals
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      {(walletData.balance > 0 || walletData.pendingEarnings > 0 || walletData.totalEarnings > 0) && (
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-3">Account Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Earnings:</span>
              <span className="font-medium">KSH {walletData.totalEarnings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Available Balance:</span>
              <span className="font-medium text-blue-600">KSH {walletData.balance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pending Balance:</span>
              <span className="font-medium text-orange-600">KSH {walletData.pendingEarnings.toLocaleString()}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span className="text-slate-800">Total Value:</span>
              <span className="text-green-600">
                KSH {(walletData.balance + walletData.pendingEarnings).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
          <p className="text-sm text-slate-500">Mock data - will be replaced with real transactions</p>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No transactions yet</p>
              <p className="text-sm text-slate-400">Your transaction history will appear here</p>
            </div>
          )}
        </div>
        <div className="p-4 text-center">
          <button className="text-blue-600 text-sm font-medium hover:underline">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  )
}