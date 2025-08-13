'use client'
import { useState, useEffect } from 'react'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Database,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  LogOut,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../components/admin/contexts/AdminAuthContext'
import { Skeleton } from '../../components/admin/SkeletonLoader'

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

// Types for settings data
interface AdminProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  lastLogin: string
  createdAt: string
}

interface SystemSettings {
  maintenanceMode: boolean
  registrationEnabled: boolean
  withdrawalEnabled: boolean
  maxWithdrawalAmount: number
  minWithdrawalAmount: number
  referralBonusEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
}

interface SettingsData {
  profile: AdminProfile
  system: SystemSettings
}

interface SettingsResponse {
  success: boolean
  message: string
  data: SettingsData
}

export default function AdminSettingsPage() {
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const { isAuthenticated, logoutAdmin } = useAdminAuth()

  const fetchSettings = async () => {
    if (!isAuthenticated) return

    try {
      setError(null)
      console.log('⚙️ Fetching settings data...')

      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl('/admin/settings'), {
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

      const data: SettingsResponse = await response.json()
      
      if (data.success) {
        setSettingsData(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch settings')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [isAuthenticated])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchSettings()
  }

  const handleLogout = () => {
    logoutAdmin()
  }

  const handlePasswordChange = async () => {
    if (!isAuthenticated) return

    // Reset messages
    setPasswordError('')
    setPasswordSuccess('')

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setIsSaving(true)

    try {
      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl('/admin/settings/password'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to change password')
      }

      const data = await response.json()
      
      if (data.success) {
        setPasswordSuccess('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        throw new Error(data.message || 'Failed to change password')
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSystemSettingUpdate = async (setting: string, value: any) => {
    if (!isAuthenticated) return

    try {
      const token = getStoredToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(apiUrl('/admin/settings/system'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          [setting]: value,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update setting')
      }

      const data = await response.json()
      
      if (data.success) {
        // Update local state
        setSettingsData(prev => prev ? {
          ...prev,
          system: {
            ...prev.system,
            [setting]: value,
          }
        } : null)
      } else {
        throw new Error(data.message || 'Failed to update setting')
      }
    } catch (err: any) {
      console.error('Failed to update setting:', err)
      // Revert the change in UI
      fetchSettings()
    }
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

  const formatCurrency = (amount: number) => {
    return `KSH ${amount.toLocaleString()}`
  }

  if (loading) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="settings">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="w-24 h-10 rounded-lg" />
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    )
  }

  if (error) {
    return (
      <AdminProtectedRoute>
        <AdminLayout activePage="settings">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Error Loading Settings</h3>
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
      <AdminLayout activePage="settings">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
              <p className="text-slate-600">Manage your account and system preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">Profile Information</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <p className="text-slate-800 font-medium">
                    {settingsData?.profile.firstName} {settingsData?.profile.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <p className="text-slate-800">{settingsData?.profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <p className="text-slate-800 capitalize">{settingsData?.profile.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Login</label>
                  <p className="text-slate-800">{formatDate(settingsData?.profile.lastLogin || '')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Member Since</label>
                  <p className="text-slate-800">{formatDate(settingsData?.profile.createdAt || '')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-slate-800">Change Password</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
                {passwordError && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{passwordError}</span>
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center space-x-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                <button
                  onClick={handlePasswordChange}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Changing Password...' : 'Change Password'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-800">System Configuration</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Maintenance Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-800">Maintenance Mode</h4>
                    <p className="text-sm text-slate-600">Temporarily disable user access</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData?.system.maintenanceMode || false}
                      onChange={(e) => handleSystemSettingUpdate('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Registration */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-800">User Registration</h4>
                    <p className="text-sm text-slate-600">Allow new users to register</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData?.system.registrationEnabled || false}
                      onChange={(e) => handleSystemSettingUpdate('registrationEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Withdrawals */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-800">Withdrawal Requests</h4>
                    <p className="text-sm text-slate-600">Allow users to request withdrawals</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData?.system.withdrawalEnabled || false}
                      onChange={(e) => handleSystemSettingUpdate('withdrawalEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Referral Bonus */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-800">Referral Bonus System</h4>
                    <p className="text-sm text-slate-600">Enable referral bonuses for users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsData?.system.referralBonusEnabled || false}
                      onChange={(e) => handleSystemSettingUpdate('referralBonusEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Notifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-800">Email Notifications</h4>
                      <p className="text-sm text-slate-600">Send email notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData?.system.emailNotifications || false}
                        onChange={(e) => handleSystemSettingUpdate('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-800">SMS Notifications</h4>
                      <p className="text-sm text-slate-600">Send SMS notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsData?.system.smsNotifications || false}
                        onChange={(e) => handleSystemSettingUpdate('smsNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Withdrawal Limits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Withdrawal Amount</label>
                    <p className="text-slate-800">{formatCurrency(settingsData?.system.minWithdrawalAmount || 0)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Maximum Withdrawal Amount</label>
                    <p className="text-slate-800">{formatCurrency(settingsData?.system.maxWithdrawalAmount || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
}

