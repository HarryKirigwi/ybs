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
import { useState } from 'react'

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true)
  
  const walletData = {
    balance: 15750,
    pendingEarnings: 2340,
    totalEarnings: 28900,
    minimumWithdraw: 1000
  }

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

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold">My Wallet</h1>
              <p className="text-blue-100 text-sm">Manage your earnings</p>
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

      {/* Balance Cards */}
      <div className="grid grid-cols-1 gap-4">
        <StatCard 
          title="Available Balance"
          value={walletData.balance}
          subtitle="Ready to withdraw"
          icon={Wallet}
          color="text-blue-600"
        />
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Pending"
            value={walletData.pendingEarnings}
            subtitle="Processing"
            icon={TrendingUp}
            color="text-blue-600"
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
        <button className="bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors">
          <Download className="w-5 h-5" />
          <span className="font-medium">Withdraw</span>
        </button>
        <button className="bg-white border border-slate-200 text-slate-700 p-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors">
          <Send className="w-5 h-5" />
          <span className="font-medium">Transfer</span>
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
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
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