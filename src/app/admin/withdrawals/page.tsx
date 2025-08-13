'use client'
import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Search, 
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../components/admin/contexts/AdminAuthContext'
import { WithdrawalsSkeleton } from '../../components/admin/SkeletonLoader'

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

// Types for withdrawals data
interface Withdrawal {
  id: string
  userId: string
  amount: number
  mpesaNumber: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED'
  mpesaTransactionCode?: string
  rejectionReason?: string
  requestedAt: string
  processedAt?: string
  resolvedAt?: string
  user: {
    phoneNumber: string
    firstName: string
    lastName: string
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface WithdrawalsResponse {
  success: boolean
  message: string
  data: {
    withdrawals: Withdrawal[]
    pagination: Pagination
  }
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [mpesaTransactionCode, setMpesaTransactionCode] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [rejectionLoading, setRejectionLoading] = useState(false)
  const { isAuthenticated } = useAdminAuth()

  const fetchWithdrawals = async (page = 1) => {
    if (!isAuthenticated) return

    try {
      setError(null)
      console.log('💰 Fetching withdrawals data...')

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

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

      const response = await fetch(apiUrl(`/admin/withdrawals?${params}`), {
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

      const data: WithdrawalsResponse = await response.json()
      
      if (data.success) {
        setWithdrawals(data.data.withdrawals)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch withdrawals')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load withdrawals')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [isAuthenticated])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchWithdrawals()
  }

  const handleSearch = () => {
    fetchWithdrawals(1)
  }

  const handlePageChange = (page: number) => {
    fetchWithdrawals(page)
  }

  const handleStatusUpdate = async (withdrawalId: string, status: 'COMPLETED' | 'REJECTED', reason?: string) => {
    if (!isAuthenticated) return

    setProcessingId(withdrawalId)

    try {
      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl(`/admin/withdrawals/${withdrawalId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ status, reason }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Refresh the withdrawals list
        fetchWithdrawals()
      } else {
        throw new Error(data.message || 'Failed to update withdrawal status')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update withdrawal status')
    } finally {
      setProcessingId(null)
    }
  }

  const handleApproveWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setMpesaTransactionCode('')
    setShowApprovalModal(true)
  }

  const handleApprovalSubmit = async () => {
    if (!selectedWithdrawal || !mpesaTransactionCode.trim()) {
      alert('Please enter the M-Pesa transaction code')
      return
    }

    setApprovalLoading(true)

    try {
      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl(`/admin/withdrawals/${selectedWithdrawal.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ 
          status: 'COMPLETED', 
          mpesaTransactionCode: mpesaTransactionCode.trim() 
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setShowApprovalModal(false)
        setSelectedWithdrawal(null)
        setMpesaTransactionCode('')
        fetchWithdrawals() // Refresh the list
        alert('Withdrawal approved successfully!')
      } else {
        throw new Error(data.message || 'Failed to approve withdrawal')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve withdrawal')
    } finally {
      setApprovalLoading(false)
    }
  }

  const handleRejectWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setRejectionReason('')
    setShowRejectionModal(true)
  }

  const handleRejectionSubmit = async () => {
    if (!selectedWithdrawal || !rejectionReason.trim()) {
      alert('Please enter a rejection reason')
      return
    }

    setRejectionLoading(true)

    try {
      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl(`/admin/withdrawals/${selectedWithdrawal.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ 
          status: 'REJECTED', 
          rejectionReason: rejectionReason.trim() 
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setShowRejectionModal(false)
        setSelectedWithdrawal(null)
        setRejectionReason('')
        fetchWithdrawals() // Refresh the list
        alert('Withdrawal rejected successfully!')
      } else {
        throw new Error(data.message || 'Failed to reject withdrawal')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject withdrawal')
    } finally {
      setRejectionLoading(false)
    }
  }

  const handlePreviewWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowPreviewModal(true)
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
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-100'
      case 'REJECTED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-slate-600 bg-slate-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'PROCESSING':
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="withdrawals">
          <WithdrawalsSkeleton />
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  if (error) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="withdrawals">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Withdrawals</h3>
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
      <AdminLayout activePage="withdrawals">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Withdrawals Management</h1>
              <p className="text-slate-600">Process and manage withdrawal requests</p>
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
                    placeholder="Search by user name or phone number..."
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
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="REJECTED">Rejected</option>
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

          {/* Withdrawals List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Withdrawals ({pagination?.total || 0})</h3>
                <p className="text-sm text-slate-500">
                  Showing {withdrawals.length} of {pagination?.total || 0} withdrawals
                </p>
              </div>
            </div>

            <div className="p-6">
              {withdrawals.length > 0 ? (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-slate-800">
                              {withdrawal.user.firstName} {withdrawal.user.lastName}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(withdrawal.status)}`}>
                              {getStatusIcon(withdrawal.status)}
                              <span>{withdrawal.status}</span>
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{withdrawal.user.phoneNumber}</p>
                          <p className="text-xs text-slate-500">
                            Requested {formatDate(withdrawal.requestedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-slate-800">
                            {formatCurrency(withdrawal.amount)}
                          </p>
                          {withdrawal.rejectionReason && (
                            <p className="text-xs text-red-600">{withdrawal.rejectionReason}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handlePreviewWithdrawal(withdrawal)}
                          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {withdrawal.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveWithdrawal(withdrawal)}
                              disabled={processingId === withdrawal.id}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              {processingId === withdrawal.id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(withdrawal)}
                              disabled={processingId === withdrawal.id}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {processingId === withdrawal.id ? 'Processing...' : 'Reject'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No withdrawals found</p>
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

        {/* Approval Modal */}
        {showApprovalModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Approve Withdrawal</h3>
                <button
                  onClick={() => {
                    setShowApprovalModal(false)
                    setSelectedWithdrawal(null)
                    setMpesaTransactionCode('')
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">User:</span>
                    <span className="font-medium text-slate-800">
                      {selectedWithdrawal.user.firstName} {selectedWithdrawal.user.lastName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Phone:</span>
                    <span className="font-medium text-slate-800">{selectedWithdrawal.user.phoneNumber}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Amount:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(selectedWithdrawal.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">M-Pesa Number:</span>
                    <span className="font-medium text-slate-800">{selectedWithdrawal.mpesaNumber}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    M-Pesa Transaction Code *
                  </label>
                  <input
                    type="text"
                    value={mpesaTransactionCode}
                    onChange={(e) => setMpesaTransactionCode(e.target.value)}
                    placeholder="e.g., QK123456789"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the M-Pesa transaction code from the payment confirmation
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowApprovalModal(false)
                      setSelectedWithdrawal(null)
                      setMpesaTransactionCode('')
                    }}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprovalSubmit}
                    disabled={approvalLoading || !mpesaTransactionCode.trim()}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{approvalLoading ? 'Approving...' : 'Approve Withdrawal'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Reject Withdrawal</h3>
                <button
                  onClick={() => {
                    setShowRejectionModal(false)
                    setSelectedWithdrawal(null)
                    setRejectionReason('')
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">User:</span>
                    <span className="font-medium text-slate-800">
                      {selectedWithdrawal.user.firstName} {selectedWithdrawal.user.lastName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Phone:</span>
                    <span className="font-medium text-slate-800">{selectedWithdrawal.user.phoneNumber}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Amount:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(selectedWithdrawal.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">M-Pesa Number:</span>
                    <span className="font-medium text-slate-800">{selectedWithdrawal.mpesaNumber}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter the reason for rejecting this withdrawal request..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This reason will be shown to the user
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowRejectionModal(false)
                      setSelectedWithdrawal(null)
                      setRejectionReason('')
                    }}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectionSubmit}
                    disabled={rejectionLoading || !rejectionReason.trim()}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{rejectionLoading ? 'Rejecting...' : 'Reject Withdrawal'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">Withdrawal Details</h3>
                <button
                  onClick={() => {
                    setShowPreviewModal(false)
                    setSelectedWithdrawal(null)
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Information */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-3">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Full Name</label>
                      <p className="font-medium text-slate-800">
                        {selectedWithdrawal.user.firstName} {selectedWithdrawal.user.lastName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Phone Number</label>
                      <p className="font-medium text-slate-800">{selectedWithdrawal.user.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Information */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-3">Withdrawal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Amount</label>
                      <p className="text-xl font-bold text-slate-800">{formatCurrency(selectedWithdrawal.amount)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Status</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedWithdrawal.status)}`}>
                        {selectedWithdrawal.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">M-Pesa Number</label>
                      <p className="font-medium text-slate-800">{selectedWithdrawal.mpesaNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Requested At</label>
                      <p className="font-medium text-slate-800">{formatDate(selectedWithdrawal.requestedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Processing Information */}
                {(selectedWithdrawal.processedAt || selectedWithdrawal.resolvedAt || selectedWithdrawal.mpesaTransactionCode || selectedWithdrawal.rejectionReason) && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-3">Processing Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedWithdrawal.processedAt && (
                        <div>
                          <label className="text-sm text-slate-600">Processed At</label>
                          <p className="font-medium text-slate-800">{formatDate(selectedWithdrawal.processedAt)}</p>
                        </div>
                      )}
                      {selectedWithdrawal.resolvedAt && (
                        <div>
                          <label className="text-sm text-slate-600">Resolved At</label>
                          <p className="font-medium text-slate-800">{formatDate(selectedWithdrawal.resolvedAt)}</p>
                        </div>
                      )}
                      {selectedWithdrawal.mpesaTransactionCode && (
                        <div>
                          <label className="text-sm text-slate-600">M-Pesa Transaction Code</label>
                          <p className="font-medium text-slate-800 font-mono">{selectedWithdrawal.mpesaTransactionCode}</p>
                        </div>
                      )}
                      {selectedWithdrawal.rejectionReason && (
                        <div className="md:col-span-2">
                          <label className="text-sm text-slate-600">Rejection Reason</label>
                          <p className="font-medium text-red-600 bg-red-50 p-2 rounded mt-1">{selectedWithdrawal.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons for Pending Withdrawals */}
                {selectedWithdrawal.status === 'PENDING' && (
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setShowPreviewModal(false)
                        handleApproveWithdrawal(selectedWithdrawal)
                      }}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowPreviewModal(false)
                        handleRejectWithdrawal(selectedWithdrawal)
                      }}
                      className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  )
} 