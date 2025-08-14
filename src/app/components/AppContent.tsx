// app/components/AppContent.tsx
'use client'
import { useState } from 'react'
import TopNavigation from './TopNavigation'
import BottomNavigation from './BottomNavigation'
import Dashboard from './Dashboard'
import TasksPage from './TasksPage'
import WalletPage from './WalletPage'
import ProfilePage from './ProfilePage'
import { useUserData } from '../hooks/useUserData'

// Main App Content - only shows when authenticated
export default function AppContent() {
  const [activeTab, setActiveTab] = useState('home')
  const { userData, computedData } = useUserData()

  const getMembershipLevelDisplay = (level: string) => {
    switch (level.toLowerCase()) {
      case 'inactive':
        return 'Inactive Member'
      case 'bronze':
        return 'Bronze Member'
      case 'silver':
        return 'Silver Member'
      case 'gold':
        return 'Gold Member'
      case 'platinum':
        return 'Platinum Member'
      default:
        return `${level.charAt(0).toUpperCase() + level.slice(1)} Member`
    }
  }

  const getDisplayBalance = () => {
    if (!computedData) return 0
    return computedData.financials.available || computedData.financials.total
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard />
      case 'tasks':
        return <TasksPage setActiveTab={setActiveTab} />
      case 'wallet':
        return <WalletPage />
      case 'profile':
        return <ProfilePage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Layout (unchanged) */}
      <div className="md:hidden">
        <TopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="pb-20 pt-16">
          {renderContent()}
        </main>
        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Sidebar - Matching Mobile Design */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {/* Menu Header */}
          <div className={`p-4 text-white ${
            userData?.is_active 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
              : 'bg-gradient-to-r from-gray-600 to-gray-700'
          }`}>
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-base">👤</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{userData?.fullName || 'User Account'}</p>
                <p className={`text-xs ${userData?.is_active ? 'text-blue-100' : 'text-gray-100'}`}>
                  {computedData ? getMembershipLevelDisplay(computedData.membershipLevel.name) : 'Member'}
                </p>
                <p className="text-xs text-white/70">@{userData?.username || 'username'}</p>
                {computedData?.status.needsActivation && (
                  <p className="text-xs text-yellow-300 font-medium mt-1">⚠️ Account needs activation</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Status Alert */}
          {computedData?.status.needsActivation && (
            <div className="mx-3 mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <p className="text-yellow-800 text-xs font-medium">
                Activate your account to unlock all features!
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="p-3 border-b border-slate-200">
            <h3 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-slate-600 text-xs">👥</span>
                  <span className="text-xs text-slate-600">Active Refs</span>
                </div>
                <p className="font-bold text-slate-800 text-xs">{computedData?.referrals.active || 0}</p>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-slate-600 text-xs">🏆</span>
                  <span className="text-xs text-slate-600">Member Level</span>
                </div>
                <p className="font-bold text-slate-800 text-xs">{computedData?.membershipLevel.name || 'Inactive'}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-green-600 text-xs">💰</span>
                  <span className="text-xs text-slate-600">Available</span>
                </div>
                <p className="font-bold text-green-600 text-xs">KSH {getDisplayBalance().toLocaleString()}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="text-blue-600 text-xs">📈</div>
                  <span className="text-xs text-slate-600">Total Earned</span>
                </div>
                <p className="font-bold text-blue-600 text-xs">KSH {computedData?.financials.total.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-3 overflow-hidden">
            <h3 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Navigation</h3>
            <div className="space-y-1">
              {[
                { id: 'home', label: 'Dashboard', icon: '🏠', description: 'View your earnings and activities' },
                { id: 'tasks', label: 'Tasks', icon: '✅', description: 'Complete daily and weekly challenges' },
                { id: 'wallet', label: 'Wallet', icon: '💰', description: 'Manage your earnings and withdrawals' },
                { id: 'profile', label: 'Profile', icon: '👤', description: 'Update your account information' },
              ].map((item) => {
                const isActive = activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <div className="text-left">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Menu Footer */}
          <div className="p-3 border-t border-slate-200">
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-base">⚙️</span>
                <span className="font-medium text-sm">Settings</span>
              </button>
              <button 
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              >
                <span className="text-base">🚪</span>
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
            
            {/* App Version */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">YBS Dashboard v2.1.0</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 capitalize">
                  {activeTab === 'home' ? 'Dashboard' : 
                   activeTab === 'tasks' ? 'Tasks & Activities' :
                   activeTab === 'wallet' ? 'Wallet & Earnings' :
                   activeTab === 'profile' ? 'Profile & Settings' : 'Dashboard'}
                </h2>
                <p className="text-sm text-slate-600">
                  {activeTab === 'home' ? 'Overview of your earnings and activities' :
                   activeTab === 'tasks' ? 'Complete tasks to earn rewards' :
                   activeTab === 'wallet' ? 'Manage your earnings and withdrawals' :
                   activeTab === 'profile' ? 'Update your account information' : 'Welcome to YBS'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-slate-100 rounded-lg relative">
                  <span className="text-slate-600">🔔</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </button>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800">Available Balance</p>
                  <p className="text-lg font-bold text-blue-600">KSH {getDisplayBalance().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}