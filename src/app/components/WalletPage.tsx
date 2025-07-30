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
  EyeOff,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useUserData } from '../hooks/useUserData'
import { useActivation } from '../hooks/useActivation'
import { useAuth } from '../contexts/AuthContext'

interface Transaction {
  id: string
  type: string
  amount: string
  status: string
  description: string
  mpesaTransactionCode: string | null
  createdAt: string
  confirmedAt: string
  metadata: any
}

interface TransactionsResponse {
  success: boolean
  message: string
  data: {
    transactions: Transaction[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

interface WithdrawalRequest {
  amount: number
  mpesaNumber: string
}

interface WithdrawalResponse {
  success: boolean
  message: string
  data?: {
    withdrawalId: string
    status: string
  }
}

export default function WalletPage() {
  const { isAuthenticated } = useAuth()
  const { userData, computedData, loading, error, refreshUserData } = useUserData()
  const { handleActivateNow } = useActivation()
  const [showBalance, setShowBalance] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)
  const [showTransferPopup, setShowTransferPopup] = useState(false)
  const [withdrawalLoading, setWithdrawalLoading] = useState(false)
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null)
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false)

  // API utility function
  const apiUrl = (path: string) => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    if (path.startsWith('http')) return path
    return `${BACKEND_URL}${path}`
  }

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!isAuthenticated) return

    try {
      setTransactionsLoading(true)
      setTransactionsError(null)

      const response = await fetch(apiUrl('/transactions'), {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: TransactionsResponse = await response.json()

      if (result.success && result.data) {
        setTransactions(result.data.transactions)
      } else {
        setTransactionsError(result.message || 'Failed to fetch transactions')
      }
    } catch (err: any) {
      setTransactionsError(err.message || 'Network error occurred')
      console.error('Error fetching transactions:', err)
    } finally {
      setTransactionsLoading(false)
    }
  }

  // Handle withdrawal request
  const handleWithdrawal = async () => {
    if (!isAuthenticated || !userData) return

    try {
      setWithdrawalLoading(true)
      setWithdrawalError(null)
      setWithdrawalSuccess(false)

      const withdrawalData: WithdrawalRequest = {
        amount: walletData.balance,
        mpesaNumber: userData.phoneNumber || ''
      }

      const response = await fetch(apiUrl('/withdrawals/request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(withdrawalData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result: WithdrawalResponse = await response.json()

      if (result.success) {
        setWithdrawalSuccess(true)
        // Refresh user data to update balance
        await refreshUserData()
        // Refresh transactions to show new withdrawal
        await fetchTransactions()
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setWithdrawalSuccess(false)
        }, 3000)
      } else {
        setWithdrawalError(result.message || 'Failed to process withdrawal')
      }
    } catch (err: any) {
      setWithdrawalError(err.message || 'Network error occurred')
      console.error('Error processing withdrawal:', err)
    } finally {
      setWithdrawalLoading(false)
    }
  }

  // Handle transfer button click
  const handleTransferClick = () => {
    setShowTransferPopup(true)
    
    // Hide popup after 5 seconds
    setTimeout(() => {
      setShowTransferPopup(false)
    }, 5000)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([refreshUserData(), fetchTransactions()])
    setIsRefreshing(false)
  }

  // Load transactions on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions()
    }
  }, [isAuthenticated])

  // Get transaction type and icon
  const getTransactionInfo = (transaction: Transaction) => {
    const amount = parseFloat(transaction.amount)
    const isWithdrawal = transaction.type.includes('WITHDRAW') || amount < 0
    const isActivation = transaction.type.includes('ACTIVATION')
    
    let icon = ArrowUpRight
    let type = 'earning'
    let isNegative = isWithdrawal || isActivation
    
    if (isWithdrawal) {
      icon = ArrowDownLeft
      type = 'withdraw'
    } else if (transaction.type.includes('REFERRAL')) {
      icon = TrendingUp
      type = 'referral'
    } else if (isActivation) {
      icon = CreditCard
      type = 'activation'
    }

    return { icon, type, isWithdrawal: isNegative }
  }

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
          color === 'text-orange-600' ? 'bg-orange-100' :
          'bg-blue-100'
        }`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    const { icon: Icon, type, isWithdrawal } = getTransactionInfo(transaction)
    const amount = parseFloat(transaction.amount)
    
    return (
      <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
        <div className={`p-2 rounded-full ${
          isWithdrawal ? 'bg-red-100' : 'bg-green-100'
        }`}>
          <Icon className={`w-4 h-4 ${
            isWithdrawal ? 'text-red-600' : 'text-green-600'
          }`} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-800">{transaction.description}</p>
          <p className="text-sm text-slate-500">
            {new Date(transaction.createdAt).toLocaleDateString()} at {new Date(transaction.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${
            isWithdrawal ? 'text-red-600' : 'text-green-600'
          }`}>
            {isWithdrawal ? '-' : '+'}KSH {Math.abs(amount).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {transaction.status.toLowerCase()}
          </p>
        </div>
      </div>
    )
  }

  // Transfer Popup Component
  const TransferPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Feature Coming Soon</h3>
              <p className="text-sm text-slate-600">Transfer functionality</p>
            </div>
          </div>
          <button 
            onClick={() => setShowTransferPopup(false)}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-800">Transfer Between Users</p>
                <p className="text-sm text-blue-600">Send money to other YBS members</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Instant Transfers</p>
                <p className="text-sm text-green-600">Real-time money transfers</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600 text-center">
            This feature is currently under development and will be available soon!
          </p>
        </div>
      </div>
    </div>
  )

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
                <p className="text-blue-100 text-sm">Loading wallet data...</p>
              </div>
            </div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled
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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-2 w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-2 w-1/2"></div>
                <div className="h-8 bg-slate-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !userData || !computedData) {
    return (
      <div className="p-4 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Wallet className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-800">Unable to Load Wallet</p>
              <p className="text-sm text-red-700">
                {error || 'Failed to load wallet data. Please try again.'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Retrying...' : 'Retry'}</span>
          </button>
        </div>
      </div>
    )
  }

  // Use real data from useUserData hook
  const walletData = {
    balance: computedData.financials.available,
    pendingEarnings: computedData.financials.pending,
    totalEarnings: computedData.financials.total,
    totalValue: computedData.financials.total,
    canWithdraw: computedData.financials.canWithdraw,
    minimumWithdraw: 1000 // This remains hardcoded for now
  }

  const canWithdraw = userData.is_active && computedData.financials.canWithdraw && walletData.balance >= walletData.minimumWithdraw

  return (
    <div className="p-4 space-y-6">
      {/* Header with Refresh */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold">My Wallet</h1>
              <p className="text-blue-100 text-sm">
                {userData.is_active ? `Manage your earnings • ${computedData.membershipLevel.name}` : 'Account activation required'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh wallet data"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawal Success Message */}
      {withdrawalSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800">Withdrawal Request Submitted!</p>
              <p className="text-sm text-green-700">
                Your withdrawal request has been submitted successfully. You'll receive the funds in 1-3 business days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Error Message */}
      {withdrawalError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-800">Withdrawal Failed</p>
              <p className="text-sm text-red-700">{withdrawalError}</p>
            </div>
            <button 
              onClick={() => setWithdrawalError(null)}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Account Status Alert */}
      {computedData.status.needsActivation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <CreditCard className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800">Account Not Activated</h4>
              <p className="text-sm text-yellow-700">Activate your account to enable withdrawals and unlock all wallet features.</p>
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

      {/* Balance Cards - Using Real Data */}
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
          onClick={handleWithdrawal}
          disabled={!canWithdraw || withdrawalLoading}
          className={`p-4 rounded-xl flex items-center justify-center space-x-2 font-medium transition-colors ${
            canWithdraw && !withdrawalLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={
            !userData.is_active 
              ? 'Account activation required' 
              : walletData.balance < walletData.minimumWithdraw 
                ? `Minimum withdrawal is KSH ${walletData.minimumWithdraw.toLocaleString()}`
                : !computedData.financials.canWithdraw
                  ? 'Insufficient balance for withdrawal'
                  : withdrawalLoading
                    ? 'Processing withdrawal...'
                    : 'Withdraw funds'
          }
        >
          {withdrawalLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span>{withdrawalLoading ? 'Processing...' : 'Withdraw'}</span>
        </button>
        <button 
          onClick={handleTransferClick}
          disabled={!userData.is_active}
          className={`p-4 rounded-xl flex items-center justify-center space-x-2 font-medium transition-colors ${
            userData.is_active
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
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
            <p className="font-medium text-amber-800">Withdrawal Information</p>
            <div className="text-sm text-amber-700 space-y-1">
              <p>• Minimum withdrawal: KSH {walletData.minimumWithdraw.toLocaleString()}</p>
              <p>• Processing time: 1-3 business days</p>
              <p>• Available for withdrawal: KSH {walletData.balance.toLocaleString()}</p>
              {!userData.is_active && (
                <p className="font-medium">⚠️ Account activation required for withdrawals</p>
              )}
              {userData.is_active && !computedData.financials.canWithdraw && (
                <p className="font-medium">⚠️ Insufficient balance for withdrawal</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Balance Summary - Using Real Data */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Account Summary</h3>
          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              userData.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {userData.is_active ? 'Active' : 'Inactive'}
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${computedData.membershipLevel.color.replace('text-', 'bg-').replace('-600', '-100')} ${computedData.membershipLevel.color}`}>
              {computedData.membershipLevel.name}
            </div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Total Earnings:</span>
            <span className="font-medium">{showBalance ? `KSH ${walletData.totalEarnings.toLocaleString()}` : '****'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Available Balance:</span>
            <span className="font-medium text-blue-600">{showBalance ? `KSH ${walletData.balance.toLocaleString()}` : '****'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Pending Balance:</span>
            <span className="font-medium text-orange-600">{showBalance ? `KSH ${walletData.pendingEarnings.toLocaleString()}` : '****'}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span className="text-slate-800">Total Value:</span>
            <span className="text-green-600">
              {showBalance ? `KSH ${walletData.totalValue.toLocaleString()}` : '****'}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Active Referrals:</span>
            <span className="text-slate-700">{computedData.referrals.active} members</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Member Since:</span>
            <span className="text-slate-700">{new Date(userData.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions - Using Real API Data */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
              <p className="text-sm text-slate-500">
                {transactionsLoading ? 'Loading transactions...' : 
                 transactionsError ? 'Failed to load transactions' :
                 `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
            {transactionsLoading && (
              <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                Loading...
              </div>
            )}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {transactionsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-slate-500">Loading transactions...</p>
            </div>
          ) : transactionsError ? (
            <div className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-red-300 mx-auto mb-3" />
              <p className="text-red-600 mb-2">Failed to load transactions</p>
              <p className="text-sm text-slate-400">{transactionsError}</p>
              <button 
                onClick={fetchTransactions}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No transactions yet</p>
              <p className="text-sm text-slate-400">Transactions will appear here</p>
            </div>
          )}
        </div>
        <div className="p-4 text-center">
          <button className="text-blue-600 text-sm font-medium hover:underline disabled:text-slate-400 disabled:no-underline" disabled>
            View All Transactions (Coming Soon)
          </button>
        </div>
      </div>

      {/* Transfer Popup */}
      {showTransferPopup && <TransferPopup />}
    </div>
  )
}