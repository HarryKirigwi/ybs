'use client'
import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  MoreVertical,
  Plus,
  CheckCircle,
  XCircle,
  Trash2,
  UserPlus,
  Edit,
  X,
  Shield
} from 'lucide-react'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../components/admin/contexts/AdminAuthContext'
import { UsersSkeleton, ModalSkeleton } from '../../components/admin/SkeletonLoader'

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

// Utility functions for validation and formatting
const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Handle different formats
  if (digits.startsWith('254')) {
    return digits // Already in correct format
  } else if (digits.startsWith('07') && digits.length === 10) {
    return '254' + digits.substring(1) // Convert 07 to 254
  } else if (digits.startsWith('7') && digits.length === 9) {
    return '254' + digits // Add 254 prefix
  } else if (digits.length === 9) {
    return '254' + digits // Add 254 prefix
  }
  
  return digits // Return as is if no pattern matches
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

const validatePhoneNumber = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 12
}

const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50
}

const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

// Create Admin Modal Component
interface CreateAdminModalProps {
  onClose: () => void
  onSubmit: (adminData: {
    username: string
    email: string
    firstName: string
    lastName: string
    password: string
    role: string
  }) => void
}

function CreateAdminModal({ onClose, onSubmit }: CreateAdminModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'admin'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error creating admin:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Create New Admin</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password (min 6 characters)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
                             <button
                   type="button"
                   onClick={onClose}
                   className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={loading}
                   className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
                 >
              <Shield className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Types for users data
interface User {
  id: string
  phoneNumber: string
  firstName: string
  lastName: string
  email?: string
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

interface Admin {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
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
  const [limitFilter, setLimitFilter] = useState<number>(5)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [adminsLoading, setAdminsLoading] = useState(false)
  const [showAdmins, setShowAdmins] = useState(false)
  const [showViewAdminModal, setShowViewAdminModal] = useState(false)
  const [showEditAdminModal, setShowEditAdminModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const { isAuthenticated, admin } = useAdminAuth()

  // Debug: Log admin role for troubleshooting
  console.log('🔍 Current admin role:', admin?.role)
  console.log('🔍 Is super admin?', admin?.role === 'super_admin')
  
  // Helper function to check if admin is super admin
  const isSuperAdmin = admin?.role === 'super_admin'
  console.log('🔍 Is super admin (helper)?', isSuperAdmin)

  const fetchUsers = async (page = 1) => {
    if (!isAuthenticated) return

    try {
      setError(null)
      console.log('👥 Fetching users data...')

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limitFilter.toString()
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(apiUrl(`/admin/users?${params}`), {
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

  const fetchAdmins = async () => {
    if (!isAuthenticated) return

    try {
      setAdminsLoading(true)
      console.log('👨‍💼 Fetching admins data...')

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl('/admin/admins'), {
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

      const data = await response.json()
      
      if (data.success) {
        // Filter out the current admin from the list
        const currentAdminId = admin?.id
        const filteredAdmins = currentAdminId 
          ? data.data.admins.filter((admin: Admin) => admin.id !== currentAdminId)
          : data.data.admins
        setAdmins(filteredAdmins)
      } else {
        throw new Error(data.message || 'Failed to fetch admins')
      }
    } catch (err: any) {
      console.error('Failed to fetch admins:', err)
    } finally {
      setAdminsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [isAuthenticated, limitFilter])

  // Fetch admins when component mounts (for super admin)
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdmins()
    }
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

  const handleCreateAdmin = async (adminData: {
    username: string
    email: string
    firstName: string
    lastName: string
    password: string
    role: string
  }) => {
    if (!isAuthenticated || !isSuperAdmin) return

    try {
      setError(null)
      setModalLoading(true)
      console.log('👨‍💼 Creating new admin...')

      // Validate inputs
      if (!validateName(adminData.firstName)) {
        throw new Error('First name must be between 2 and 50 characters')
      }
      if (!validateName(adminData.lastName)) {
        throw new Error('Last name must be between 2 and 50 characters')
      }
      if (!validateEmail(adminData.email)) {
        throw new Error('Invalid email format')
      }
      if (!validatePassword(adminData.password)) {
        throw new Error('Password must be at least 6 characters long')
      }
      if (adminData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long')
      }

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl('/admin/admins'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(adminData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create admin')
      }

      const data = await response.json()
      
      if (data.success) {
        setShowCreateAdminModal(false)
        alert('Admin created successfully!')
      } else {
        throw new Error(data.message || 'Failed to create admin')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create admin')
    } finally {
      setModalLoading(false)
    }
  }

  const handleCreateUser = async (userData: {
    phoneNumber: string
    firstName: string
    lastName: string
    email: string
    password: string
    accountStatus: string
  }) => {
    if (!isAuthenticated) return

    try {
      setError(null)
      setModalLoading(true)
      console.log('👤 Creating new user...')

      // Validate inputs
      if (!validateName(userData.firstName)) {
        throw new Error('First name must be between 2 and 50 characters')
      }
      if (!validateName(userData.lastName)) {
        throw new Error('Last name must be between 2 and 50 characters')
      }
      if (!validatePhoneNumber(userData.phoneNumber)) {
        throw new Error('Invalid phone number format')
      }
      if (userData.email && !validateEmail(userData.email)) {
        throw new Error('Invalid email format')
      }
      if (!validatePassword(userData.password)) {
        throw new Error('Password must be at least 6 characters long')
      }

      // Format phone number to 2547 format
      const formattedPhoneNumber = formatPhoneNumber(userData.phoneNumber)

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl('/admin/users'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          ...userData,
          phoneNumber: formattedPhoneNumber
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create user')
      }

      const data = await response.json()
      
      if (data.success) {
        setShowCreateModal(false)
        fetchUsers() // Refresh the list
        alert('User created successfully!')
      } else {
        throw new Error(data.message || 'Failed to create user')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setModalLoading(false)
    }
  }

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    if (!isAuthenticated) return

    setProcessingUser(userId)

    try {
      setError(null)
      console.log(`🔄 Updating user status to ${status}...`)

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl(`/admin/users/${userId}/status`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update user status')
      }

      const data = await response.json()
      
      if (data.success) {
        fetchUsers() // Refresh the list
        alert(`User status updated to ${status} successfully!`)
      } else {
        throw new Error(data.message || 'Failed to update user status')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user status')
    } finally {
      setProcessingUser(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!isAuthenticated) return

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setProcessingUser(userId)

    try {
      setError(null)
      console.log('🗑️ Deleting user...')

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl(`/admin/users/${userId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete user')
      }

      const data = await response.json()
      
      if (data.success) {
        fetchUsers() // Refresh the list
        alert('User deleted successfully!')
      } else {
        throw new Error(data.message || 'Failed to delete user')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
    } finally {
      setProcessingUser(null)
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    if (!isAuthenticated || !isSuperAdmin) return

    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      return
    }

    setProcessingUser(adminId)

    try {
      setError(null)
      console.log(`🗑️ Deleting admin ${adminId}...`)

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl(`/admin/admins/${adminId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete admin')
      }

      const data = await response.json()
      
      if (data.success) {
        fetchAdmins() // Refresh the list
        alert('Admin deleted successfully!')
      } else {
        throw new Error(data.message || 'Failed to delete admin')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete admin')
    } finally {
      setProcessingUser(null)
    }
  }

  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin)
    setShowViewAdminModal(true)
  }

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin)
    setShowEditAdminModal(true)
  }

  const handleUpdateAdminInfo = async (adminId: string, updateData: {
    firstName: string
    lastName: string
    email: string
    role: string
  }) => {
    if (!isAuthenticated || !isSuperAdmin) return

    setProcessingUser(adminId)

    try {
      setError(null)
      console.log(`✏️ Updating admin ${adminId}...`)

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl(`/admin/admins/${adminId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        mode: 'cors',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update admin')
      }

      const data = await response.json()
      
      if (data.success) {
        fetchAdmins() // Refresh the list
        setShowEditAdminModal(false)
        setSelectedAdmin(null)
        alert('Admin updated successfully!')
      } else {
        throw new Error(data.message || 'Failed to update admin')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update admin')
    } finally {
      setProcessingUser(null)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleUpdateUserInfo = async (userData: {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
    userLevel: string
    accountStatus: string
  }) => {
    if (!isAuthenticated || !selectedUser) return

    setProcessingUser(selectedUser.id)

    try {
      setError(null)
      setModalLoading(true)
      console.log('✏️ Updating user information...')

      // Validate inputs
      if (!validateName(userData.firstName)) {
        throw new Error('First name must be between 2 and 50 characters')
      }
      if (!validateName(userData.lastName)) {
        throw new Error('Last name must be between 2 and 50 characters')
      }
      if (!validatePhoneNumber(userData.phoneNumber)) {
        throw new Error('Invalid phone number format')
      }
      if (userData.email && !validateEmail(userData.email)) {
        throw new Error('Invalid email format')
      }

      // Format phone number to 2547 format
      const formattedPhoneNumber = formatPhoneNumber(userData.phoneNumber)

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl(`/admin/users/${selectedUser.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          ...userData,
          phoneNumber: formattedPhoneNumber
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update user')
      }

      const data = await response.json()
      
      if (data.success) {
        setShowEditModal(false)
        setSelectedUser(null)
        fetchUsers() // Refresh the list
        alert('User updated successfully!')
      } else {
        throw new Error(data.message || 'Failed to update user')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
    } finally {
      setProcessingUser(null)
      setModalLoading(false)
    }
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
          <UsersSkeleton />
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
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create User</span>
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setShowCreateAdminModal(true)}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Create Admin</span>
                </button>
              )}
              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setShowAdmins(!showAdmins)
                    if (!showAdmins && admins.length === 0) {
                      fetchAdmins()
                    }
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    showAdmins 
                      ? 'bg-orange-600 text-white hover:bg-orange-700' 
                      : 'bg-white border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{showAdmins ? 'Hide Admins' : 'Show Admins'}</span>
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
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
                    className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="UNVERIFIED">Unverified</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                {/* Limit Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Show:</span>
                  <select
                    value={limitFilter}
                    onChange={(e) => setLimitFilter(Number(e.target.value))}
                    className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
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
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="View User Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Status Action Buttons */}
                        {user.accountStatus === 'UNVERIFIED' && (
                          <button
                            onClick={() => handleUpdateUserStatus(user.id, 'ACTIVE')}
                            disabled={processingUser === user.id}
                            className="p-2 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Verify User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {user.accountStatus === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateUserStatus(user.id, 'SUSPENDED')}
                            disabled={processingUser === user.id}
                            className="p-2 text-yellow-600 hover:text-yellow-700 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Suspend User"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {user.accountStatus === 'SUSPENDED' && (
                          <button
                            onClick={() => handleUpdateUserStatus(user.id, 'ACTIVE')}
                            disabled={processingUser === user.id}
                            className="p-2 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Activate User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={processingUser === user.id}
                          className="p-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
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
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admins List */}
        {showAdmins && isSuperAdmin && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Admin Users ({admins.length})</h3>
                <p className="text-sm text-slate-500">
                  Super admin can manage all admin accounts
                </p>
              </div>
            </div>

            <div className="p-6">
              {adminsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-32"></div>
                          <div className="h-3 bg-slate-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                        <div className="h-3 bg-slate-200 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : admins.length > 0 ? (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-lg">
                            {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-slate-800">
                              {admin.firstName} {admin.lastName}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              admin.isActive 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-red-600 bg-red-100'
                            }`}>
                              {admin.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                              {admin.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{admin.email}</p>
                          <p className="text-xs text-purple-600 font-mono">@{admin.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewAdmin(admin)}
                          className="p-2 text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="View Admin Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditAdmin(admin)}
                          className="p-2 text-green-400 hover:text-green-600 transition-colors cursor-pointer"
                          title="Edit Admin"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          disabled={processingUser === admin.id}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
                          title="Delete Admin"
                        >
                          {processingUser === admin.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No admin users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          modalLoading ? (
            <ModalSkeleton />
          ) : (
            <CreateUserModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateUser}
            />
          )
        )}

        {/* Create Admin Modal */}
        {showCreateAdminModal && isSuperAdmin && (
          modalLoading ? (
            <ModalSkeleton />
          ) : (
            <CreateAdminModal
              onClose={() => setShowCreateAdminModal(false)}
              onSubmit={handleCreateAdmin}
            />
          )
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          modalLoading ? (
            <ModalSkeleton />
          ) : (
            <ViewUserModal
              user={selectedUser}
              onClose={() => {
                setShowViewModal(false)
                setSelectedUser(null)
              }}
              onEdit={() => {
                setShowViewModal(false)
                setShowEditModal(true)
              }}
            />
          )
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          modalLoading ? (
            <ModalSkeleton />
          ) : (
            <EditUserModal
              user={selectedUser}
              onClose={() => {
                setShowEditModal(false)
                setSelectedUser(null)
              }}
              onSubmit={handleUpdateUserInfo}
              loading={processingUser === selectedUser.id}
            />
          )
        )}

        {/* View Admin Modal */}
        {showViewAdminModal && selectedAdmin && isSuperAdmin && (
          <ViewAdminModal
            admin={selectedAdmin}
            onClose={() => {
              setShowViewAdminModal(false)
              setSelectedAdmin(null)
            }}
            onEdit={() => {
              setShowViewAdminModal(false)
              setShowEditAdminModal(true)
            }}
          />
        )}

        {/* Edit Admin Modal */}
        {showEditAdminModal && selectedAdmin && isSuperAdmin && (
          <EditAdminModal
            admin={selectedAdmin}
            onClose={() => {
              setShowEditAdminModal(false)
              setSelectedAdmin(null)
            }}
            onSubmit={handleUpdateAdminInfo}
            loading={processingUser === selectedAdmin.id}
          />
        )}
      </AdminLayout>
    </AdminProtectedRoute>
  )
}

// View Admin Modal Component
interface ViewAdminModalProps {
  admin: Admin
  onClose: () => void
  onEdit: () => void
}

function ViewAdminModal({ admin, onClose, onEdit }: ViewAdminModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Admin Details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-xl">
                {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-800">
                {admin.firstName} {admin.lastName}
              </h4>
              <p className="text-slate-500">{admin.email}</p>
              <p className="text-purple-600 font-mono text-sm">@{admin.username}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Role:</span>
              <span className="font-medium text-slate-800">
                {admin.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                admin.isActive 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-red-600 bg-red-100'
              }`}>
                {admin.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Created:</span>
              <span className="text-slate-800">{formatDate(admin.createdAt)}</span>
            </div>
            {admin.lastLogin && (
              <div className="flex justify-between">
                <span className="text-slate-600">Last Login:</span>
                <span className="text-slate-800">{formatDate(admin.lastLogin)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Edit Admin Modal Component
interface EditAdminModalProps {
  admin: Admin
  onClose: () => void
  onSubmit: (adminId: string, updateData: {
    firstName: string
    lastName: string
    email: string
    role: string
  }) => void
  loading: boolean
}

function EditAdminModal({ admin, onClose, onSubmit, loading }: EditAdminModalProps) {
  const [formData, setFormData] = useState({
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    role: admin.role
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!validateName(formData.firstName)) {
      alert('First name must be between 2 and 50 characters')
      return
    }
    if (!validateName(formData.lastName)) {
      alert('Last name must be between 2 and 50 characters')
      return
    }
    if (!validateEmail(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    await onSubmit(admin.id, formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Edit Admin</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>{loading ? 'Updating...' : 'Update Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// View User Modal Component
interface ViewUserModalProps {
  user: User
  onClose: () => void
  onEdit: () => void
}

function ViewUserModal({ user, onClose, onEdit }: ViewUserModalProps) {
  const formatCurrency = (amount: string) => {
    return `KSH ${parseFloat(amount).toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800">User Details</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Avatar and Basic Info */}
          <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-2xl">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-slate-800">
                {user.firstName} {user.lastName}
              </h4>
              <p className="text-slate-600">{user.phoneNumber}</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.accountStatus)}`}>
                {user.accountStatus}
              </span>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h5 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Personal Information</h5>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-600">First Name</label>
                  <p className="font-medium text-slate-800">{user.firstName}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Last Name</label>
                  <p className="font-medium text-slate-800">{user.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Phone Number</label>
                  <p className="font-medium text-slate-800">{user.phoneNumber}</p>
                </div>
                {user.email && (
                  <div>
                    <label className="text-sm text-slate-600">Email</label>
                    <p className="font-medium text-slate-800">{user.email}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-slate-600">Referral Code</label>
                  <p className="font-mono text-blue-600 font-medium">{user.referralCode}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h5 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Account Information</h5>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-600">Account Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.accountStatus)}`}>
                    {user.accountStatus}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-slate-600">User Level</label>
                  <p className="font-medium text-slate-800">{user.userLevel}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Total Referrals</label>
                  <p className="font-medium text-slate-800">{user.totalReferrals}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Member Since</label>
                  <p className="font-medium text-slate-800">{formatDate(user.createdAt)}</p>
                </div>
                {user.lastLogin && (
                  <div>
                    <label className="text-sm text-slate-600">Last Login</label>
                    <p className="font-medium text-slate-800">{formatDate(user.lastLogin)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h5 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">Financial Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <label className="text-sm text-slate-600">Available Balance</label>
                <p className="text-xl font-bold text-green-600">{formatCurrency(user.availableBalance)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <label className="text-sm text-slate-600">Total Earned</label>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(user.totalEarned)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <label className="text-sm text-slate-600">Total Withdrawn</label>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(user.totalWithdrawn)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  )
}

// Edit User Modal Component
interface EditUserModalProps {
  user: User
  onClose: () => void
  onSubmit: (userData: {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
    userLevel: string
    accountStatus: string
  }) => void
  loading: boolean
}

function EditUserModal({ user, onClose, onSubmit, loading }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    email: user.email || '',
    userLevel: user.userLevel,
    accountStatus: user.accountStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Edit User</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="e.g., 0712345678 or +254712345678"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User Level
            </label>
            <select
              value={formData.userLevel}
              onChange={(e) => handleInputChange('userLevel', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="PLATINUM">Platinum</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Account Status
            </label>
            <select
              value={formData.accountStatus}
              onChange={(e) => handleInputChange('accountStatus', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="UNVERIFIED">Unverified</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Create User Modal Component
interface CreateUserModalProps {
  onClose: () => void
  onSubmit: (userData: {
    phoneNumber: string
    firstName: string
    lastName: string
    email: string
    password: string
    accountStatus: string
  }) => void
}

function CreateUserModal({ onClose, onSubmit }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    accountStatus: 'UNVERIFIED'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Create New User</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="e.g., 0712345678 or +254712345678"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Account Status
            </label>
            <select
              value={formData.accountStatus}
              onChange={(e) => handleInputChange('accountStatus', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="UNVERIFIED">Unverified</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

 