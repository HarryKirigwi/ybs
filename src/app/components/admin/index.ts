// Legacy exports (keeping for backward compatibility)
export { default as AdminDashboardOverview } from './dashboard/AdminDashboardOverview'
export { default as UsersManagement } from './users/UsersManagement'
export { default as FinancialReport } from './financial/FinancialReport'
export { default as AdminAnalytics } from './analytics/AdminAnalytics'
export { default as AdminNotifications } from './notifications/AdminNotifications'
export { default as AdminSettings } from './settings/AdminSettings'
export { default as CourseModeration } from './courseModeration/CourseModeration'

// New admin system exports
export { default as AdminDashboard } from './AdminDashboard'
export { default as AdminLayout } from './AdminLayout'
export { default as AdminProtectedRoute } from './AdminProtectedRoute'
export { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext' 