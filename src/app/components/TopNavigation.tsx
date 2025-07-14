// app/components/TopNavigation.tsx
'use client'
import { Bell, Menu, X, Home, CheckSquare, Wallet, User, Settings, LogOut, Award, Users } from 'lucide-react'
import { useState } from 'react'

interface TopNavigationProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export default function TopNavigation({ activeTab, setActiveTab }: TopNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const userData = {
    name: 'John Doe',
    balance: 15750,
    level: 'Gold Member',
    referrals: 35
  }

  // Only include the 4 main pages that exist in the bottom navigation
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home, description: 'View your earnings and activities' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, description: 'Complete daily and weekly challenges' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, description: 'Manage your earnings and withdrawals' },
    { id: 'profile', label: 'Profile', icon: User, description: 'Update your account information' },
  ]

  const quickActions = [
    { id: 'referrals', label: 'My Referrals', icon: Users, value: userData.referrals },
    { id: 'level', label: 'Member Level', icon: Award, value: userData.level },
  ]

  const handleMenuItemClick = (tabId: string) => {
    if (setActiveTab) {
      setActiveTab(tabId)
    }
    setIsMenuOpen(false)
  }

  const handleSettingsClick = () => {
    // Navigate to profile page and close menu since settings are in the profile
    if (setActiveTab) {
      setActiveTab('profile')
    }
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleMenu}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-blue-700">YBS</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{userData.name}</p>
              <p className="text-xs text-blue-600 font-semibold">
                KSH {userData.balance.toLocaleString()}
              </p>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">{userData.name}</p>
                <p className="text-blue-100 text-sm">{userData.level}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <div key={action.id} className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className="text-xs text-slate-600">{action.label}</span>
                    </div>
                    <p className="font-bold text-slate-800">{action.value}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Navigation</h3>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Menu Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="space-y-2">
              <button 
                onClick={handleSettingsClick}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
            
            {/* App Version */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">YBS Dashboard v2.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}