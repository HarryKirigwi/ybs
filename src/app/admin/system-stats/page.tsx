'use client'
import { useState, useEffect } from 'react'
import { 
  Activity, 
  Users, 
  DollarSign, 
  TrendingUp,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Target,
  Percent,
  CheckCircle
} from 'lucide-react'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../components/admin/contexts/AdminAuthContext'
import { SystemStatsSkeleton } from '../../components/admin/SkeletonLoader'

// API utility function - same pattern as other components
const apiUrl = (path: string) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

// Helper function to get stored token
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('adminToken')
}

// Types for system stats data
interface UserStats {
  total: number
  active: number
  suspended: number
  activeLast30Days: number
  activationRate: number
}

interface FinancialStats {
  totalRevenue: number
  totalPayouts: number
  totalProfit: number
  totalWithdrawals: {
    amount: number
    count: number
  }
}

interface ReferralStats {
  total: number
  activated: number
  conversionRate: number
}

interface UserLevelStats {
  silver: number
  gold?: number
  platinum?: number
}

interface SystemStatsData {
  users: UserStats
  financials: FinancialStats
  referrals: ReferralStats
  userLevels: UserLevelStats
}

interface SystemStatsResponse {
  success: boolean
  message: string
  data: SystemStatsData
}

export default function AdminSystemStatsPage() {
  const [systemStats, setSystemStats] = useState<SystemStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { isAuthenticated } = useAdminAuth()

  const fetchSystemStats = async () => {
    if (!isAuthenticated) return

    try {
      setError(null)
      console.log('📊 Fetching system stats...')

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl('/admin/system-stats'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SystemStatsResponse = await response.json()
      
      if (data.success) {
        setSystemStats(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch system stats')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load system stats')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSystemStats()
  }, [isAuthenticated])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchSystemStats()
  }

  const formatCurrency = (amount: number) => {
    return `KSH ${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    return `${value}%`
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="system-stats">
          <SystemStatsSkeleton />
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  if (error) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="system-stats">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading System Stats</h3>
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
      <AdminLayout activePage="system-stats">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">System Statistics</h1>
              <p className="text-slate-600">Comprehensive system performance overview</p>
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

          {/* User Statistics */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">User Statistics</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {(systemStats?.users?.total || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600">Total Users</p>
                </div>

                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {(systemStats?.users?.active || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600">Active Users</p>
                </div>

                <div className="text-center">
                  <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {(systemStats?.users?.activeLast30Days || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600">Active (30 days)</p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Percent className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatPercentage(systemStats?.users.activationRate || 0)}
                  </p>
                  <p className="text-sm text-slate-600">Activation Rate</p>
                </div>
              </div>

              {/* Additional user stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Suspended Users</span>
                    <span className="text-lg font-semibold text-red-600">
                      {(systemStats?.users?.suspended || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Inactive Users</span>
                    <span className="text-lg font-semibold text-slate-600">
                      {(systemStats?.users.total || 0) - (systemStats?.users.active || 0) - (systemStats?.users.suspended || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Statistics */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-slate-800">Financial Overview</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(systemStats?.financials.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                </div>

                <div className="text-center">
                  <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(systemStats?.financials.totalPayouts || 0)}
                  </p>
                  <p className="text-sm text-slate-600">Total Payouts</p>
                </div>

                <div className="text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(systemStats?.financials.totalProfit || 0)}
                  </p>
                  <p className="text-sm text-slate-600">Total Profit</p>
                </div>

                <div className="text-center">
                  <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(systemStats?.financials?.totalWithdrawals?.amount || 0)}
                  </p>
                  <p className="text-sm text-slate-600">Pending Withdrawals</p>
                </div>
              </div>

              {/* Financial details */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Pending Withdrawal Count</span>
                    <span className="text-lg font-semibold text-orange-600">
                      {(systemStats?.financials?.totalWithdrawals?.count || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Average Revenue per User</span>
                    <span className="text-lg font-semibold text-slate-600">
                      {systemStats?.users?.total ? formatCurrency((systemStats?.financials?.totalRevenue || 0) / systemStats.users.total) : 'KSH 0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Statistics */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-800">Referral Performance</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {(systemStats?.referrals?.total || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600">Total Referrals</p>
                </div>

                <div className="text-center">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {(systemStats?.referrals?.activated || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600">Activated Referrals</p>
                </div>

                <div className="text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Percent className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatPercentage(systemStats?.referrals.conversionRate || 0)}
                  </p>
                  <p className="text-sm text-slate-600">Conversion Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Levels */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-slate-800">User Level Distribution</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-600 font-semibold">S</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {(systemStats?.userLevels?.silver || 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600">Silver Users</p>
                </div>

                {systemStats?.userLevels.gold && (
                  <div className="text-center">
                    <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-yellow-600 font-semibold">G</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                      {(systemStats?.userLevels?.gold || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600">Gold Users</p>
                  </div>
                )}

                {systemStats?.userLevels.platinum && (
                  <div className="text-center">
                    <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-600 font-semibold">P</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">
                      {(systemStats?.userLevels?.platinum || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-600">Platinum Users</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
} 