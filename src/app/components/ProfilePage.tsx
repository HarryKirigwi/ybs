// app/components/ProfilePage.tsx
'use client'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2, 
  Settings, 
  HelpCircle, 
  LogOut,
  Shield,
  Bell,
  ChevronRight,
  ChevronDown,
  Award,
  Users,
  TrendingUp,
  Save,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  CreditCard,
  MessageSquare,
  FileText,
  ExternalLink,
  Camera,
  RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useUserData } from '../hooks/useUserData'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { userData, computedData, loading, error, refreshUserData } = useUserData()
  const { signOut, refreshUserData: authRefreshUserData } = useAuth()
  
  const [isEditing, setIsEditing] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempUserData, setTempUserData] = useState({})
  const [showEditModal, setShowEditModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  })
  
  // Settings states
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: true,
    referrals: true,
    earnings: true
  })
  
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEarnings: false,
    showReferrals: true,
    twoFactor: false
  })
  
  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'KSH',
    darkMode: false,
    sound: true
  })

  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      setEditFormData({
        name: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phoneNumber || '',
        location: '' // Add location if available in UserData
      })
    }
  }, [userData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshUserData()
    // Also refresh auth context data
    await authRefreshUserData()
    setIsRefreshing(false)
  }

  const achievements = [
    { 
      id: 1, 
      title: 'First Referral', 
      description: 'Made your first referral', 
      icon: Users, 
      earned: (computedData?.referrals.active ?? 0) > 0
    },
    { 
      id: 2, 
      title: 'Top Performer', 
      description: 'Reached 25 referrals', 
      icon: Award, 
      earned: (computedData?.referrals.active ?? 0) >= 25
    },
    { 
      id: 3, 
      title: 'Consistent Earner', 
      description: 'Account activated and earning', 
      icon: TrendingUp, 
      earned: userData?.is_active && (computedData?.financials.available ?? 0) > 0
    },
    { 
      id: 4, 
      title: 'Super Referrer', 
      description: 'Reach 50 referrals', 
      icon: Users, 
      earned: (computedData?.referrals.active ?? 0) >= 50
    },
  ]

  const handleEditProfile = () => {
    if (userData && computedData) {
      setEditFormData({
        name: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phoneNumber || '',
        location: editFormData.location || ''
      })
    }
    setShowEditModal(true)
  }

  const handleSaveProfile = async () => {
    try {
      // Here you would typically save to backend
      // For now, we'll just show success and refresh data
      console.log('Saving profile data:', editFormData)
      
      // In a real implementation, you'd make an API call here
      // await updateUserProfile(editFormData)
      
      // Refresh the data after saving
      await handleRefresh()
      
      // Close the modal
      setShowEditModal(false)
      
      // Show success message
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setShowEditModal(false)
    // Reset form data to original values
    if (userData) {
      setEditFormData({
        name: userData.fullName || '',
        email: userData.email || '',
        phone: userData.phoneNumber || '',
        location: editFormData.location || ''
      })
    }
  }

  const handleEditField = (field: string) => {
    setEditingField(field)
    if (userData) {
      const value = field === 'email' ? userData.email :
                   field === 'phone' ? userData.phoneNumber :
                   field === 'name' ? userData.fullName : ''
      setTempUserData({ [field]: value })
    }
  }

  const handleSaveField = async (field: string) => {
    try {
      // Here you would typically save to backend
      console.log(`Saving ${field}:`, tempUserData)
      
      // In a real implementation, you'd make an API call here
      // await updateUserField(field, tempUserData[field])
      
      // Refresh data after saving
      await handleRefresh()
      
      setEditingField(null)
      setTempUserData({})
      
      alert(`${field} updated successfully!`)
    } catch (error) {
      console.error(`Error saving ${field}:`, error)
      alert(`Failed to update ${field}. Please try again.`)
    }
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setTempUserData({})
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await signOut()
      } catch (error: any) {
        alert('Error logging out: ' + (error?.message || 'Unknown error'))
      }
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !userData || !computedData) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load profile data'}</p>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    )
  }

  const StatsCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-full ${
          color === 'blue' ? 'bg-blue-100' : 
          color === 'green' ? 'bg-green-100' : 
          'bg-purple-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            color === 'blue' ? 'text-blue-600' : 
            color === 'green' ? 'text-green-600' : 
            'text-purple-600'
          }`} />
        </div>
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )

  const EditableField = ({ field, value, type = 'text', icon: Icon }: any) => {
    const isEditing = editingField === field
    
    return (
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-slate-500" />
        <div className="flex-1">
          <p className="text-sm text-slate-600 capitalize">{field}</p>
          {isEditing ? (
            <div className="flex items-center space-x-2 mt-1">
              <input
                type={type}
                value={(tempUserData as any)[field] || ''}
                onChange={(e) => setTempUserData(prev => ({ ...prev, [field]: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleSaveField(field)}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-800">{value || 'Not set'}</p>
              <button
                onClick={() => handleEditField(field)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const ToggleSwitch = ({ enabled, onChange, label }: { enabled: boolean, onChange: () => void, label: string }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  const SettingsSection = ({ title, icon: Icon, children, sectionKey }: any) => {
    const isExpanded = expandedSection === sectionKey
    
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-slate-600" />
            <span className="font-medium text-slate-800">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {isExpanded && (
          <div className="border-t border-slate-200 p-4 bg-slate-50">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{userData.fullName || 'User'}</h1>
              <p className="text-blue-100">{userData.userLevel}</p>
              <p className="text-sm text-blue-200">
                Member since {new Date(userData.createdAt).toLocaleDateString()}
              </p>
              {userData.phone_verified && (
                <div className="flex items-center space-x-1 mt-1">
                  <Phone className="w-3 h-3" />
                  <span className="text-xs text-blue-200">Phone Verified</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleEditProfile}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden transform transition-all duration-300 ease-out scale-100 flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 p-6 text-white relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <p className="text-blue-100 text-sm">Update your personal information</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-purple-400/20 rounded-full blur-lg"></div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 bg-gradient-to-b from-slate-50 to-white">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                      <User className="w-12 h-12 text-blue-600" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <button className="mt-3 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors flex items-center space-x-1 group">
                    <span>Change Profile Photo</span>
                    <Edit2 className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Edit Form */}
                <div className="space-y-5">
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Full Name</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-slate-800 placeholder-slate-400 group-hover:border-slate-300"
                        placeholder="Enter your full name"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Email Address</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-slate-800 placeholder-slate-400 group-hover:border-slate-300"
                        placeholder="Enter your email address"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>Phone Number</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-slate-800 placeholder-slate-400 group-hover:border-slate-300"
                        placeholder="Enter your phone number"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Location</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editFormData.location}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-slate-800 placeholder-slate-400 group-hover:border-slate-300"
                        placeholder="Enter your location"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="flex-shrink-0 p-6 bg-white border-t border-slate-100">
              <div className="flex space-x-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 font-semibold group"
                >
                  <span className="group-hover:scale-105 transition-transform inline-block">Cancel</span>
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Status Alert */}
      {computedData.status.needsActivation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800">Activate Your Account</h4>
              <p className="text-sm text-yellow-700">Unlock all features and start earning!</p>
            </div>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition-colors">
              Activate Now
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid - Using Real Data */}
      <div className="grid grid-cols-1 gap-4">
        <StatsCard 
          title="Total Referrals"
          value={computedData.referrals.total}
          subtitle="Active members"
          icon={Users}
          color="blue"
        />
        <div className="grid grid-cols-2 gap-4">
          <StatsCard 
            title="Total Earnings"
            value={`KSH ${computedData.financials.total.toLocaleString()}`}
            subtitle="All time"
            icon={TrendingUp}
            color="green"
          />
          <StatsCard 
            title="Member Level"
            value={computedData.membershipLevel.name.split(' ')[0]}
            subtitle={computedData.membershipLevel.name}
            icon={Award}
            color="purple"
          />
        </div>
      </div>

      {/* Personal Information - Enhanced with editing */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Personal Information</h3>
        </div>
        <div className="p-4 space-y-4">
          <EditableField field="email" value={userData.email} type="email" icon={Mail} />
          <EditableField field="phone" value={userData.phoneNumber} type="tel" icon={Phone} />
          <EditableField field="name" value={userData.fullName} icon={User} />
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-600">Join Date</p>
              <p className="font-medium text-slate-800">
                {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-600">Account Status</p>
              <p className={`font-medium ${userData.is_active ? 'text-green-600' : 'text-orange-600'}`}>
                {userData.is_active ? 'Active' : 'Pending Activation'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements - Using Real Data */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Achievements</h3>
        </div>
        <div className="p-4 space-y-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <div 
                key={achievement.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  achievement.earned ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  achievement.earned ? 'bg-green-100' : 'bg-slate-200'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    achievement.earned ? 'text-green-600' : 'text-slate-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    achievement.earned ? 'text-green-800' : 'text-slate-600'
                  }`}>
                    {achievement.title}
                  </p>
                  <p className={`text-sm ${
                    achievement.earned ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <div className="text-green-600">
                    <Award className="w-5 h-5" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Enhanced Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Settings</h3>
        
        {/* Account Settings */}
        <SettingsSection title="Account Settings" icon={Settings} sectionKey="account">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Profile Visibility</label>
              <ToggleSwitch
                enabled={privacy.profileVisible}
                onChange={() => setPrivacy(prev => ({ ...prev, profileVisible: !prev.profileVisible }))}
                label="Make profile public"
              />
              <ToggleSwitch
                enabled={privacy.showEarnings}
                onChange={() => setPrivacy(prev => ({ ...prev, showEarnings: !prev.showEarnings }))}
                label="Show earnings publicly"
              />
              <ToggleSwitch
                enabled={privacy.showReferrals}
                onChange={() => setPrivacy(prev => ({ ...prev, showReferrals: !prev.showReferrals }))}
                label="Show referral count"
              />
            </div>
            <div className="pt-4 border-t border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">Language & Currency</label>
              <div className="grid grid-cols-2 gap-3">
                <select 
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="English">English</option>
                  <option value="Swahili">Swahili</option>
                  <option value="French">French</option>
                </select>
                <select 
                  value={preferences.currency}
                  onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="KSH">KSH</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" icon={Bell} sectionKey="notifications">
          <div className="space-y-3">
            <ToggleSwitch
              enabled={notifications.email}
              onChange={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
              label="Email notifications"
            />
            <ToggleSwitch
              enabled={notifications.push}
              onChange={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
              label="Push notifications"
            />
            <ToggleSwitch
              enabled={notifications.sms}
              onChange={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
              label="SMS notifications"
            />
            <ToggleSwitch
              enabled={notifications.marketing}
              onChange={() => setNotifications(prev => ({ ...prev, marketing: !prev.marketing }))}
              label="Marketing emails"
            />
            <ToggleSwitch
              enabled={notifications.referrals}
              onChange={() => setNotifications(prev => ({ ...prev, referrals: !prev.referrals }))}
              label="New referral alerts"
            />
            <ToggleSwitch
              enabled={notifications.earnings}
              onChange={() => setNotifications(prev => ({ ...prev, earnings: !prev.earnings }))}
              label="Earning notifications"
            />
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" icon={Shield} sectionKey="security">
          <div className="space-y-4">
            <ToggleSwitch
              enabled={privacy.twoFactor}
              onChange={() => setPrivacy(prev => ({ ...prev, twoFactor: !prev.twoFactor }))}
              label="Two-factor authentication"
            />
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium">Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium">Manage Devices</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium">Login Activity</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Help & Support */}
        <SettingsSection title="Help & Support" icon={HelpCircle} sectionKey="help">
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium">Contact Support</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium">FAQ & Documentation</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium">Terms & Privacy Policy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </SettingsSection>

        {/* User Data Summary for Debug */}
        <SettingsSection title="Account Information" icon={User} sectionKey="account-info">
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-600">User ID:</p>
                <p className="font-mono text-xs text-slate-800">{userData.id}</p>
              </div>
              <div>
                <p className="text-slate-600">Username:</p>
                <p className="text-slate-800">{userData.username}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-600">Phone Verified:</p>
                <p className={userData.phone_verified ? 'text-green-600' : 'text-red-600'}>
                  {userData.phone_verified ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Referral Code:</p>
                <p className="font-mono text-slate-800">{userData.referralCode}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200">
              <p className="text-slate-600 mb-2">Financial Summary:</p>
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="font-semibold">KSH {userData.availableBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-semibold">KSH {userData.pendingEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Earned:</span>
                  <span className="font-semibold">KSH {userData.totalEarned.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  )
}