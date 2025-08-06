import { useState } from 'react';
import { useApiService } from './useApiService';

/**
 * Legacy hook for backward compatibility
 * Now uses the centralized API service
 * @deprecated Use useApiService directly for new components
 */
export const useAdminApi = () => {
    const { loading, error, dashboard, auth, clearError } = useApiService();

    // Legacy functions for backward compatibility
    const fetchDashboardData = async () => {
        try {
            return await dashboard.getData();
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            throw error;
        }
    };

    const handleExport = async () => {
        try {
            return await dashboard.exportData();
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    };

    const handleLogout = async () => {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            try {
                await auth.logout();
            } catch (error) {
                console.error('Logout failed:', error);
                // Force logout on error
                localStorage.clear();
                window.location.href = '/admin/login';
            }
        }
    };

    // Legacy apiRequest function for backward compatibility
    const apiRequest = async (endpoint, options = {}) => {
        // This is a simplified version for backward compatibility
        // New components should use useApiService directly
        console.warn('apiRequest is deprecated. Use useApiService for new components.');
        
        const { apiCall } = useApiService();
        const url = endpoint.startsWith('http') ? endpoint : `${import.meta.VITE_APP_API_URL || 'http://localhost:8000/api'}${endpoint}`;
        
        return await apiCall(async () => {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        });
    };

    return {
        loading,
        error,
        apiRequest,
        fetchDashboardData,
        handleExport,
        handleLogout,
        clearError,
    };
}; 