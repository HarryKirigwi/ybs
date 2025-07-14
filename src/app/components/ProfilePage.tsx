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
  ExternalLink
} from 'lucide-react'
import { useState } from 'react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempUserData, setTempUserData] = useState({})
  
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
  
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254 700 123 456',
    location: 'Nairobi, Kenya',
    joinDate: '2024-01-10',
    level: 'Gold Member',
    totalReferrals: 35,
    totalEarnings: 28900,
    profilePicture: null
  }

  const achievements = [
    { id: 1, title: 'First Referral', description: 'Made your first referral', icon: Users, earned: true },
    { id: 2, title: 'Top Performer', description: 'Reached 25 referrals', icon: Award, earned: true },
    { id: 3, title: 'Consistent Earner', description: 'Earned for 7 consecutive days', icon: TrendingUp, earned: true },
    { id: 4, title: 'Super Referrer', description: 'Reach 50 referrals', icon: Users, earned: false },
  ]

  const handleEditField = (field: string) => {
    setEditingField(field)
    setTempUserData({ [field]: (userData as any)[field] })
  }

  const handleSaveField = (field: string) => {
    // Here you would typically save to backend
    console.log(`Saving ${field}:`, tempUserData)
    setEditingField(null)
    setTempUserData({})
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setTempUserData({})
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
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
              <p className="font-medium text-slate-800">{value}</p>
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
              <h1 className="text-xl font-bold">{userData.name}</h1>
              <p className="text-blue-100">{userData.level}</p>
              <p className="text-sm text-blue-200">
                Member since {new Date(userData.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4">
        <StatsCard 
          title="Total Referrals"
          value={userData.totalReferrals}
          subtitle="Active members"
          icon={Users}
          color="blue"
        />
        <div className="grid grid-cols-2 gap-4">
          <StatsCard 
            title="Total Earnings"
            value={`KSH ${userData.totalEarnings.toLocaleString()}`}
            subtitle="All time"
            icon={TrendingUp}
            color="green"
          />
          <StatsCard 
            title="Member Level"
            value={userData.level.split(' ')[0]}
            subtitle={userData.level}
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
          <EditableField field="phone" value={userData.phone} type="tel" icon={Phone} />
          <EditableField field="location" value={userData.location} icon={MapPin} />
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-600">Join Date</p>
              <p className="font-medium text-slate-800">
                {new Date(userData.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
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
                <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>English</option>
                  <option>Swahili</option>
                  <option>French</option>
                </select>
                <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>KSH</option>
                  <option>USD</option>
                  <option>EUR</option>
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
      </div>

      {/* Logout Button */}
      <button className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  )
}