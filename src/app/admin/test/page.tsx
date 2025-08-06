'use client'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../components/admin/contexts/AdminAuthContext'

export default function AdminTestPage() {
  const { admin, isAuthenticated } = useAdminAuth()

  return (
    <AdminProtectedRoute>
      <AdminLayout activePage="dashboard">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Admin System Test</h1>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Authentication Status</h3>
                <p className="text-slate-600">
                  <span className="font-medium">Authenticated:</span> {isAuthenticated ? 'Yes' : 'No'}
                </p>
                {admin && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Admin:</span> {admin.firstName} {admin.lastName}
                    </p>
                    <p className="text-sm text-blue-600">{admin.email}</p>
                    <p className="text-sm text-blue-600 capitalize">{admin.role}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Available Routes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a 
                    href="/admin/dashboard"
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <h4 className="font-medium text-blue-800">Dashboard</h4>
                    <p className="text-sm text-blue-600">System overview and stats</p>
                  </a>
                  <a 
                    href="/admin/analytics"
                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <h4 className="font-medium text-green-800">Analytics</h4>
                    <p className="text-sm text-green-600">Performance metrics and charts</p>
                  </a>
                  <a 
                    href="/auth/admin/login"
                    className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <h4 className="font-medium text-orange-800">Login</h4>
                    <p className="text-sm text-orange-600">Admin authentication</p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
} 