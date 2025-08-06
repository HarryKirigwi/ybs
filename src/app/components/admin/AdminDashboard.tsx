'use client'
import React, { useState, useMemo } from 'react'

// Import shared components
import { DashboardLayout } from '../shared/layout'

// Import custom hooks
import { useAdminApi, useDashboardData, useSidebarData } from './hooks'

// Import constants
import { sidebarItems } from './constants/sidebarItems'

// Import utilities
import { renderMainContent } from './utils/renderMainContent.jsx'

import { NotificationsProvider } from './contexts/NotificationsContext'

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [searchTerm, setSearchTerm] = useState('')

    // Custom hooks
    const { loading, fetchDashboardData, handleExport, handleLogout } = useAdminApi()
    const { dashboardData, loading: dashboardLoading, error: dashboardError } = useDashboardData()
    const { data: sidebarData, loading: sidebarLoading, error: sidebarError } = useSidebarData()

    // Use centralized user data with fallback
    const user = sidebarData?.userProfile || {
        name: 'Admin User',
        role: 'Administrator',
        email: 'admin@xist.com'
    }

    // Event handlers
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId)
    }

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
    }

    const handleNotificationClick = () => {
        setActiveTab('notifications')
    }

    const handleProfileClick = () => {
        setActiveTab('settings')
    }

    // Header props - memoized to ensure proper re-rendering
    const headerProps = useMemo(() => ({
        title: 'YBS ADMIN PANEL',
        subtitle: 'Admin Dashboard',
        searchTerm,
        onSearchChange: handleSearchChange,
        onExport: handleExport,
        onNotificationClick: handleNotificationClick,
        user,
        onProfileClick: handleProfileClick,
        showExport: true,
        showFilter: true
    }), [searchTerm, user, handleSearchChange, handleExport, handleNotificationClick, handleProfileClick])

    // Sidebar props
    const sidebarProps = {
        onLogout: handleLogout,
        user
    }

    // Show loading state if sidebar data is loading
    if (sidebarLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg">Loading user data...</span>
            </div>
        )
    }

    // Show error state if sidebar data failed to load
    if (sidebarError) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
                    <div className="flex items-center">
                        <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs">!</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-red-800">Error loading user data</h3>
                            <p className="text-sm text-red-600 mt-1">{sidebarError.message}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-3 inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <NotificationsProvider>
        <DashboardLayout
            activeTab={activeTab}
            sidebarItems={sidebarItems}
            onTabChange={handleTabChange}
            headerProps={headerProps}
            sidebarProps={sidebarProps}
            loading={loading || dashboardLoading}
        >
            {renderMainContent(activeTab, dashboardData)}
        </DashboardLayout>
        </NotificationsProvider>
    )
}

export default AdminDashboard 