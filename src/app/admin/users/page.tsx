'use client'
import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  MoreVertical
} from 'lucide-react'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../components/admin/contexts/AdminAuthContext'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

function apiUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

// Types for users data
interface User {
  id: string
  phoneNumber: string
  firstName: string
  lastName: string
  referralCode: string
  accountStatus: 'ACTIVE' | 'UNVERIFIED' | 'SUSPENDED'
  userLevel: string
  totalReferrals: number
  availableBalance: string
  totalEarned: string
  totalWithdrawn: string
  createdAt: string
  lastLogin?: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface UsersResponse {
  success: boolean
  message: string
  data: {
    users: User[]
    pagination: Pagination
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { isAuthenticated } = useAdminAuth()

  const fetchUsers = async (page = 1) => {
    if (!isAuthenticated) return

    try {
      setError(null)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(apiUrl(`/admin/users?${params}`), {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: UsersResponse = await response.json()
      
      if (data.success) {
        setUsers(data.data.users)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch users')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [isAuthenticated])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchUsers()
  }

  const handleSearch = () => {
    fetchUsers(1)
  }

  const handlePageChange = (page: number) => {
    fetchUsers(page)
  }

  const formatCurrency = (amount: string) => {
    return `KSH ${parseFloat(amount).toLocaleString()}`
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
        <AdminLayout activePage="users">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading users...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  if (error) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="users">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Users</h3>
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
      <AdminLayout activePage="users">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Users Management</h1>
              <p className="text-slate-600">Manage all registered users</p>
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

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, or referral code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="UNVERIFIED">Unverified</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Users ({pagination?.total || 0})</h3>
                <p className="text-sm text-slate-500">
                  Showing {users.length} of {pagination?.total || 0} users
                </p>
              </div>
            </div>

            <div className="p-6">
              {users.length > 0 ? (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-slate-800">
                              {user.firstName} {user.lastName}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.accountStatus)}`}>
                              {user.accountStatus}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{user.phoneNumber}</p>
                          <p className="text-xs text-blue-600 font-mono">Ref: {user.referralCode}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-800">
                            {formatCurrency(user.availableBalance)} available
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.totalReferrals} referrals • {formatCurrency(user.totalEarned)} earned
                          </p>
                          <p className="text-xs text-slate-500">
                            Joined {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No users found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="p-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
} 