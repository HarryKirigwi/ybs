import { useState, useEffect } from 'react';
import { dashboardData } from '../services/dataService';

export const useDashboardData = () => {
  // Flatten the dashboard data structure to match component expectations
  const flattenDashboardData = (data) => {
    if (!data) return {};
    
    return {
      // Stats data
      totalUsers: data.stats?.totalUsers || 0,
      activeCourses: data.stats?.activeCourses || 0,
      monthlyRevenue: data.stats?.monthlyRevenue || 0,
      completionRate: data.stats?.completionRate || 0,
      pendingActions: data.stats?.pendingActions || {
        courseApproval: 0,
        instructorApproval: 0,
        paymentIssues: 0
      },
      // Recent activities
      recentActivities: data.recentActivities || [],
      // Analytics data
      analytics: data.analytics || {}
    };
  };

  const [dashboardDataState, setDashboardData] = useState(flattenDashboardData(dashboardData));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if we should use mock data (for development)
  const useMockData = import.meta.env.DEV || !import.meta.VITE_APP_API_URL;

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Use mock data for development with a small delay to simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
        setDashboardData(flattenDashboardData(dashboardData));
      } else {
        // In production, this would call the real API
        // For now, we'll use mock data as fallback
        setDashboardData(flattenDashboardData(dashboardData));
      }
    } catch (error) {
      console.error('Failed to load dashboard data, falling back to mock data:', error);
      setError(error);
      // Keep default data on error - this ensures the app continues to work
      setDashboardData(flattenDashboardData(dashboardData));
    } finally {
      setLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboardData = async () => {
    await loadDashboardData();
  };

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    dashboardData: dashboardDataState,
    setDashboardData,
    loading,
    error,
    refreshDashboardData,
  };
}; 