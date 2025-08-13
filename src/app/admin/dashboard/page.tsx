'use client'
import { useState, useEffect } from 'react'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../components/admin/contexts/AdminAuthContext'
import { DashboardSkeleton } from '../../components/admin/SkeletonLoader'

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

// Types for dashboard data
interface DashboardStats {
  users: {
    total: number
    active: number
    newToday: number
    activationRate: number
  }
  financials: {
    totalRevenue: number
    totalPayouts: number
    profit: number
    pendingWithdrawals: {
      amount: number
      count: number
    }
  }
}

interface RecentUser {
  id: string
  phoneNumber: string
  firstName: string
  lastName: string
  email?: string
  accountStatus: 'ACTIVE' | 'UNVERIFIED' | 'SUSPENDED'
  createdAt: string
}

interface RecentWithdrawal {
  id: string
  userId: string
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'
  createdAt: string
}

interface DashboardData {
  stats: DashboardStats
  recentActivity: {
    users: RecentUser[]
    withdrawals: RecentWithdrawal[]
  }
}

interface DashboardResponse {
  success: boolean
  message: string
  data: DashboardData
}

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { isAuthenticated } = useAdminAuth()

  const fetchDashboardData = async () => {
    if (!isAuthenticated) return

    try {
      setError(null)
      console.log('📊 Fetching dashboard data...')

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl('/admin/dashboard'), {
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

      const data: DashboardResponse = await response.json()
      
      if (data.success && data.data) {
        console.log('✅ Dashboard data loaded successfully')
        setDashboardData(data.data)
      } else {
        const errorMessage = data.message || 'Failed to fetch dashboard data'
        console.log('❌ Dashboard data fetch failed:', errorMessage)
        throw new Error(errorMessage)
      }
    } catch (err: any) {
      console.error('❌ Dashboard data fetch error:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [isAuthenticated])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchDashboardData()
  }

  const formatCurrency = (amount: number) => {
    return `KSH ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100'
      case 'UNVERIFIED':
        return 'text-yellow-600 bg-yellow-100'
      case 'SUSPENDED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-slate-600 bg-slate-100'
    }
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="dashboard">
          <DashboardSkeleton />
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  if (error) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="dashboard">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Dashboard</h3>
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
      <AdminLayout activePage="dashboard">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
              <p className="text-slate-600">System statistics and recent activity</p>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {dashboardData?.stats.users.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {dashboardData?.stats.users.newToday} new today
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {dashboardData?.stats.users.active.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {dashboardData?.stats.users.activationRate}% activation rate
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(dashboardData?.stats.financials.totalRevenue || 0)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    +{formatCurrency(dashboardData?.stats.financials.profit || 0)} profit
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Payouts */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Payouts</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(dashboardData?.stats.financials.totalPayouts || 0)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {dashboardData?.stats.financials.pendingWithdrawals.count} pending
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Recent Users</h3>
                </div>
              </div>
              <div className="p-6">
                {dashboardData?.recentActivity.users.length ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivity.users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-slate-500">{user.phoneNumber}</p>
                            {user.email && (
                              <p className="text-xs text-slate-400">{user.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.accountStatus)}`}>
                            {user.accountStatus}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No recent users</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Withdrawals */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Recent Withdrawals</h3>
                </div>
              </div>
              <div className="p-6">
                {dashboardData?.recentActivity.withdrawals.length ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivity.withdrawals.slice(0, 5).map((withdrawal) => (
                      <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {formatCurrency(withdrawal.amount)}
                            </p>
                            <p className="text-sm text-slate-500">ID: {withdrawal.userId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            withdrawal.status === 'COMPLETED' ? 'text-green-600 bg-green-100' :
                            withdrawal.status === 'PENDING' ? 'text-yellow-600 bg-yellow-100' :
                            'text-red-600 bg-red-100'
                          }`}>
                            {withdrawal.status}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(withdrawal.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No recent withdrawals</p>
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