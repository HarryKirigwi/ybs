'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  DollarSign,
  Shield,
  Activity
} from 'lucide-react'
import { useAdminAuth } from './contexts/AdminAuthContext'

interface AdminLayoutProps {
  children: React.ReactNode
  activePage?: string
}

const navigationItems = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics'
  },
  {
    id: 'users',
    name: 'Users',
    icon: Users,
    href: '/admin/users'
  },
  {
    id: 'withdrawals',
    name: 'Withdrawals',
    icon: DollarSign,
    href: '/admin/withdrawals'
  },
  {
    id: 'system-stats',
    name: 'System Stats',
    icon: Activity,
    href: '/admin/system-stats'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    href: '/admin/settings'
  }
]

export default function AdminLayout({ children, activePage = 'dashboard' }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin, logoutAdmin } = useAdminAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logoutAdmin()
    router.push('/auth/admin/login')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">YBS Admin</h1>
                <p className="text-xs text-slate-500">Management Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="font-medium">{item.name}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200">
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-800">
                {admin?.firstName} {admin?.lastName}
              </p>
              <p className="text-xs text-slate-500">{admin?.email}</p>
              <p className="text-xs text-blue-600 font-medium capitalize">
                {admin?.role?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-500">
                <TrendingUp className="w-4 h-4" />
                <span>Admin Panel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 