import { useState, useCallback } from 'react';
import apiService, { apiUtils } from '../services/apiService';

/**
 * Custom hook that provides a clean interface to the centralized API service
 * with loading states, error handling, and success notifications
 */
export const useApiService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic API call wrapper with loading and error handling
  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Dashboard API calls
  const dashboard = {
    getData: useCallback(async () => {
      return await apiCall(apiService.dashboard.getDashboardData);
    }, [apiCall]),

    exportData: useCallback(async (format = 'xlsx') => {
      return await apiCall(apiService.dashboard.exportDashboardData, format);
    }, [apiCall]),

    getAnalytics: useCallback(async (period = 'month') => {
      return await apiCall(apiService.dashboard.getAnalytics, period);
    }, [apiCall]),

    getRecentActivities: useCallback(async (limit = 10) => {
      return await apiCall(apiService.dashboard.getRecentActivities, limit);
    }, [apiCall]),
  };

  // Users API calls
  const users = {
    getAll: useCallback(async (params = {}) => {
      return await apiCall(apiService.users.getUsers, params);
    }, [apiCall]),

    getById: useCallback(async (userId) => {
      return await apiCall(apiService.users.getUser, userId);
    }, [apiCall]),

    create: useCallback(async (userData) => {
      return await apiCall(apiService.users.createUser, userData);
    }, [apiCall]),

    update: useCallback(async (userId, userData) => {
      return await apiCall(apiService.users.updateUser, userId, userData);
    }, [apiCall]),

    delete: useCallback(async (userId) => {
      return await apiCall(apiService.users.deleteUser, userId);
    }, [apiCall]),

    bulkDelete: useCallback(async (userIds) => {
      return await apiCall(apiService.users.bulkDeleteUsers, userIds);
    }, [apiCall]),

    export: useCallback(async (filters = {}) => {
      return await apiCall(apiService.users.exportUsers, filters);
    }, [apiCall]),

    import: useCallback(async (file) => {
      return await apiCall(apiService.users.importUsers, file);
    }, [apiCall]),

    getStats: useCallback(async () => {
      return await apiCall(apiService.users.getUserStats);
    }, [apiCall]),
  };

  // Notifications API calls
  const notifications = {
    getAll: useCallback(async (params = {}) => {
      return await apiCall(apiService.notifications.getNotifications, params);
    }, [apiCall]),

    markAsRead: useCallback(async (notificationId) => {
      return await apiCall(apiService.notifications.markAsRead, notificationId);
    }, [apiCall]),

    markAllAsRead: useCallback(async () => {
      return await apiCall(apiService.notifications.markAllAsRead);
    }, [apiCall]),

    delete: useCallback(async (notificationId) => {
      return await apiCall(apiService.notifications.deleteNotification, notificationId);
    }, [apiCall]),

    getSettings: useCallback(async () => {
      return await apiCall(apiService.notifications.getNotificationSettings);
    }, [apiCall]),

    updateSettings: useCallback(async (settings) => {
      return await apiCall(apiService.notifications.updateNotificationSettings, settings);
    }, [apiCall]),
  };

  // Course Moderation API calls
  const courseModeration = {
    getPendingCourses: useCallback(async (params = {}) => {
      return await apiCall(apiService.courseModeration.getPendingCourses, params);
    }, [apiCall]),

    approveCourse: useCallback(async (courseId, feedback = '') => {
      return await apiCall(apiService.courseModeration.approveCourse, courseId, feedback);
    }, [apiCall]),

    rejectCourse: useCallback(async (courseId, reason = '') => {
      return await apiCall(apiService.courseModeration.rejectCourse, courseId, reason);
    }, [apiCall]),

    getCourseDetails: useCallback(async (courseId) => {
      return await apiCall(apiService.courseModeration.getCourseDetails, courseId);
    }, [apiCall]),

    getCourseStats: useCallback(async () => {
      return await apiCall(apiService.courseModeration.getCourseStats);
    }, [apiCall]),
  };

  // Financial API calls
  const financial = {
    getReports: useCallback(async (params = {}) => {
      return await apiCall(apiService.financial.getFinancialReports, params);
    }, [apiCall]),

    getRevenueAnalytics: useCallback(async (period = 'month') => {
      return await apiCall(apiService.financial.getRevenueAnalytics, period);
    }, [apiCall]),

    getPaymentStats: useCallback(async () => {
      return await apiCall(apiService.financial.getPaymentStats);
    }, [apiCall]),

    exportData: useCallback(async (params = {}) => {
      return await apiCall(apiService.financial.exportFinancialData, params);
    }, [apiCall]),
  };

  // Analytics API calls
  const analytics = {
    getPlatformAnalytics: useCallback(async (period = 'month') => {
      return await apiCall(apiService.analytics.getPlatformAnalytics, period);
    }, [apiCall]),

    getUserEngagement: useCallback(async (params = {}) => {
      return await apiCall(apiService.analytics.getUserEngagement, params);
    }, [apiCall]),

    getCoursePerformance: useCallback(async (params = {}) => {
      return await apiCall(apiService.analytics.getCoursePerformance, params);
    }, [apiCall]),

    getSystemHealth: useCallback(async () => {
      return await apiCall(apiService.analytics.getSystemHealth);
    }, [apiCall]),
  };

  // Settings API calls
  const settings = {
    get: useCallback(async () => {
      return await apiCall(apiService.settings.getSettings);
    }, [apiCall]),

    update: useCallback(async (settingsData) => {
      return await apiCall(apiService.settings.updateSettings, settingsData);
    }, [apiCall]),

    getSystemConfig: useCallback(async () => {
      return await apiCall(apiService.settings.getSystemConfig);
    }, [apiCall]),

    updateSystemConfig: useCallback(async (config) => {
      return await apiCall(apiService.settings.updateSystemConfig, config);
    }, [apiCall]),
  };

  // Authentication API calls
  const auth = {
    login: useCallback(async (credentials) => {
      return await apiCall(apiService.auth.login, credentials);
    }, [apiCall]),

    logout: useCallback(async () => {
      return await apiCall(apiService.auth.logout);
    }, [apiCall]),

    getProfile: useCallback(async () => {
      return await apiCall(apiService.auth.getProfile);
    }, [apiCall]),

    updateProfile: useCallback(async (profileData) => {
      return await apiCall(apiService.auth.updateProfile, profileData);
    }, [apiCall]),

    changePassword: useCallback(async (passwordData) => {
      return await apiCall(apiService.auth.changePassword, passwordData);
    }, [apiCall]),

    refreshToken: useCallback(async () => {
      return await apiCall(apiService.auth.refreshToken);
    }, [apiCall]),
  };

  // Utility functions
  const utils = {
    isAuthenticated: apiUtils.isAuthenticated,
    getAuthToken: apiUtils.getAuthToken,
    setAuthToken: apiUtils.setAuthToken,
    removeAuthToken: apiUtils.removeAuthToken,
    HTTP_STATUS: apiUtils.HTTP_STATUS,
  };

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    
    // API modules
    dashboard,
    users,
    notifications,
    courseModeration,
    financial,
    analytics,
    settings,
    auth,
    utils,
    
    // Utility functions
    clearError,
    apiCall, // Generic API call wrapper
  };
}; 