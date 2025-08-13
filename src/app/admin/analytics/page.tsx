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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../components/admin/contexts/AdminAuthContext'
import { AnalyticsSkeleton } from '../../components/admin/SkeletonLoader'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

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
  email?: string
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
      console.log('📊 Fetching analytics data...')

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl('/admin/analytics'), {
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

  // Chart configuration options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  // User Growth Chart Component
  const UserGrowthChart = ({ data }: { data: UserGrowthData[] }) => {
    const chartData = {
      labels: data.map(item => item.monthName),
      datasets: [
        {
          label: 'New Users',
          data: data.map(item => item.newUsers),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Activated Users',
          data: data.map(item => item.activatedUsers),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    }

    return (
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
    )
  }

  // Financial Performance Chart Component
  const FinancialPerformanceChart = ({ data }: { data: EarningsData[] }) => {
    const chartData = {
      labels: data.map(item => item.monthName),
      datasets: [
        {
          label: 'Revenue',
          data: data.map(item => item.revenue),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
        },
        {
          label: 'Payouts',
          data: data.map(item => item.payouts),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
        },
        {
          label: 'Profit',
          data: data.map(item => item.profit),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
        },
      ],
    }

    const financialChartOptions = {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        tooltip: {
          ...chartOptions.plugins.tooltip,
          callbacks: {
            label: function(context: any) {
              const label = context.dataset.label || ''
              const value = context.parsed.y
              return `${label}: ${formatCurrency(value)}`
            }
          }
        }
      }
    }

    return (
      <div className="h-80">
        <Bar data={chartData} options={financialChartOptions} />
      </div>
    )
  }

  // Referral Growth Chart Component
  const ReferralGrowthChart = ({ data }: { data: ReferralData[] }) => {
    const chartData = {
      labels: data.map(item => item.monthName),
      datasets: [
        {
          label: 'Referrals',
          data: data.map(item => item.referrals),
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    }

    return (
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
    )
  }

  // Activation Rate Doughnut Chart Component
  const ActivationRateChart = ({ data }: { data: UserGrowthData[] }) => {
    const totalNewUsers = data.reduce((sum, month) => sum + month.newUsers, 0)
    const totalActivatedUsers = data.reduce((sum, month) => sum + month.activatedUsers, 0)
    const activationRate = totalNewUsers > 0 ? (totalActivatedUsers / totalNewUsers) * 100 : 0

    const chartData = {
      labels: ['Activated', 'Not Activated'],
      datasets: [
        {
          data: [totalActivatedUsers, totalNewUsers - totalActivatedUsers],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(156, 163, 175, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(156, 163, 175)',
          ],
          borderWidth: 2,
        },
      ],
    }

    const doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || ''
              const value = context.parsed
              const percentage = ((value / totalNewUsers) * 100).toFixed(1)
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }

    return (
      <div className="h-80">
        <Doughnut data={chartData} options={doughnutOptions} />
      </div>
    )
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="analytics">
          <AnalyticsSkeleton />
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

            {/* Total Profit */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Profit</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatCurrency(analyticsData?.earningsData.reduce((sum, month) => sum + month.profit, 0) || 0)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">This year</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
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

          {/* Key Insights */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Key Insights</h3>
              <p className="text-sm text-slate-600">Quick overview of performance trends</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Best Performing Month */}
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">Best Month</h4>
                  {analyticsData?.earningsData && analyticsData.earningsData.length > 0 ? (
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {analyticsData.earningsData.reduce((max, month) => 
                          month.revenue > max.revenue ? month : max
                        ).monthName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(analyticsData.earningsData.reduce((max, month) => 
                          month.revenue > max.revenue ? month : max
                        ).revenue)} revenue
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500">No data available</p>
                  )}
                </div>

                {/* Growth Trend */}
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">User Growth Trend</h4>
                  {analyticsData?.userGrowth && analyticsData.userGrowth.length > 1 ? (
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {analyticsData.userGrowth[analyticsData.userGrowth.length - 1].newUsers > 
                         analyticsData.userGrowth[analyticsData.userGrowth.length - 2].newUsers ? '↗️ Growing' : '↘️ Declining'}
                      </p>
                      <p className="text-sm text-slate-500">
                        vs previous month
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500">No data available</p>
                  )}
                </div>

                {/* Total Referrals */}
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">Total Referrals</h4>
                  <p className="text-lg font-bold text-purple-600">
                    {analyticsData?.referralData.reduce((sum, month) => sum + month.referrals, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500">This year</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">User Growth Trends</h3>
                <p className="text-sm text-slate-600">Monthly new user registrations and activations</p>
              </div>
              <div className="p-6">
                {analyticsData?.userGrowth && analyticsData.userGrowth.length > 0 ? (
                  <UserGrowthChart data={analyticsData.userGrowth} />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No user growth data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Performance Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Financial Performance</h3>
                <p className="text-sm text-slate-600">Monthly revenue, payouts, and profit</p>
              </div>
              <div className="p-6">
                {analyticsData?.earningsData && analyticsData.earningsData.length > 0 ? (
                  <FinancialPerformanceChart data={analyticsData.earningsData} />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No financial data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referral Growth Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Referral Growth</h3>
                <p className="text-sm text-slate-600">Monthly referral activity</p>
              </div>
              <div className="p-6">
                {analyticsData?.referralData && analyticsData.referralData.length > 0 ? (
                  <ReferralGrowthChart data={analyticsData.referralData} />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No referral data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activation Rate Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">User Activation Overview</h3>
                <p className="text-sm text-slate-600">Overall activation rate distribution</p>
              </div>
              <div className="p-6">
                {analyticsData?.userGrowth && analyticsData.userGrowth.length > 0 ? (
                  <ActivationRateChart data={analyticsData.userGrowth} />
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No activation data available</p>
                    </div>
                  </div>
                )}
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
                          {performer.email && (
                            <p className="text-xs text-slate-400">{performer.email}</p>
                          )}
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