'use client'
import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  RefreshCw,
  AlertCircle,
  Trophy,
  Calendar
} from 'lucide-react'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../components/admin/contexts/AdminAuthContext'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

function apiUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

// Types for analytics data
interface UserGrowthData {
  month: number
  monthName: string
  newUsers: number
  activatedUsers: number
  activationRate: number
}

interface EarningsData {
  month: number
  monthName: string
  revenue: number
  payouts: number
  profit: number
}

interface ReferralData {
  month: number
  monthName: string
  referrals: number
}

interface TopPerformer {
  id: string
  phoneNumber: string
  firstName: string
  lastName: string
  totalReferrals: number
  totalEarned: string
  userLevel: string
}

interface RecentStat {
  _sum: {
    amount: string
  }
  _count: {
    id: number
  }
  type: string
}

interface AnalyticsData {
  year: number
  userGrowth: UserGrowthData[]
  earningsData: EarningsData[]
  referralData: ReferralData[]
  topPerformers: TopPerformer[]
  recentStats: RecentStat[]
}

interface AnalyticsResponse {
  success: boolean
  message: string
  data: AnalyticsData
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { isAuthenticated } = useAdminAuth()

  const fetchAnalyticsData = async () => {
    if (!isAuthenticated) return

    try {
      setError(null)
      const response = await fetch(apiUrl('/api/admin/analytics'), {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AnalyticsResponse = await response.json()
      
      if (data.success) {
        setAnalyticsData(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch analytics data')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [isAuthenticated])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAnalyticsData()
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return `KSH ${numAmount.toLocaleString()}`
  }

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    return months[month - 1] || ''
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'ACCOUNT_ACTIVATION':
        return 'Account Activations'
      case 'LEVEL_1_REFERRAL_BONUS':
        return 'Referral Bonuses'
      case 'WITHDRAWAL':
        return 'Withdrawals'
      default:
        return type.replace(/_/g, ' ')
    }
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="analytics">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading analytics...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  if (error) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="analytics">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Analytics</h3>
              <p className="text-slate-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout activePage="analytics">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Analytics Overview</h1>
              <p className="text-slate-600">Year {analyticsData?.year} performance metrics</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total New Users */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total New Users</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {analyticsData?.userGrowth.reduce((sum, month) => sum + month.newUsers, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">This year</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(analyticsData?.earningsData.reduce((sum, month) => sum + month.revenue, 0) || 0)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">This year</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Referrals */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {analyticsData?.referralData.reduce((sum, month) => sum + month.referrals, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">This year</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Average Activation Rate */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Avg Activation Rate</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {analyticsData?.userGrowth.length ? 
                      Math.round(analyticsData.userGrowth.reduce((sum, month) => sum + month.activationRate, 0) / analyticsData.userGrowth.length) : 0
                    }%
                  </p>
                  <p className="text-xs text-orange-600 mt-1">This year</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">User Growth</h3>
                <p className="text-sm text-slate-600">Monthly new user registrations</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analyticsData?.userGrowth.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-xs">{getMonthName(month.month)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{month.newUsers} new users</p>
                          <p className="text-sm text-slate-500">{month.activatedUsers} activated</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-slate-800">{month.activationRate}%</span>
                        <p className="text-xs text-slate-500">activation rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Earnings Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Financial Performance</h3>
                <p className="text-sm text-slate-600">Monthly revenue and payouts</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {analyticsData?.earningsData.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-xs">{getMonthName(month.month)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{formatCurrency(month.revenue)}</p>
                          <p className="text-sm text-slate-500">{formatCurrency(month.payouts)} payouts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {month.profit >= 0 ? '+' : ''}{formatCurrency(month.profit)}
                        </span>
                        <p className="text-xs text-slate-500">profit</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-slate-800">Top Performers</h3>
              </div>
              <p className="text-sm text-slate-600">Users with highest referral counts</p>
            </div>
            <div className="p-6">
              {analyticsData?.topPerformers.length ? (
                <div className="space-y-4">
                  {analyticsData.topPerformers.slice(0, 5).map((performer, index) => (
                    <div key={performer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100' : 
                          index === 1 ? 'bg-gray-100' : 
                          index === 2 ? 'bg-orange-100' : 'bg-blue-100'
                        }`}>
                          <span className={`font-semibold text-sm ${
                            index === 0 ? 'text-yellow-600' : 
                            index === 1 ? 'text-gray-600' : 
                            index === 2 ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {performer.firstName} {performer.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{performer.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-800">{performer.totalReferrals} referrals</p>
                        <p className="text-sm text-slate-500">{formatCurrency(performer.totalEarned)} earned</p>
                        <span className="text-xs text-blue-600 font-medium">{performer.userLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No top performers data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Recent Transaction Stats</h3>
              <p className="text-sm text-slate-600">Summary of recent transaction types</p>
            </div>
            <div className="p-6">
              {analyticsData?.recentStats.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.recentStats.map((stat, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">{getTransactionTypeLabel(stat.type)}</p>
                      <p className="text-xl font-bold text-slate-800">{formatCurrency(stat._sum.amount)}</p>
                      <p className="text-xs text-slate-500">{stat._count.id} transactions</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No recent transaction stats available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
} 