/**
 * Centralized API Service for Admin Dashboard
 * Handles all API operations with proper error handling and authentication
 */

const API_BASE_URL = import.meta.VITE_APP_API_URL || 'http://localhost:8000/api';

// API Response Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Custom API Error class
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Authentication utilities
const getAuthToken = () => localStorage.getItem('admin_token');
const setAuthToken = (token) => localStorage.setItem('admin_token', token);
const removeAuthToken = () => localStorage.removeItem('admin_token');

// Request interceptor
const createRequestConfig = (options = {}) => {
  const token = getAuthToken();
  
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
};

// Response interceptor
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  // Handle different response types
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }
    
    return data;
  } else if (contentType && contentType.includes('application/octet-stream')) {
    // Handle file downloads
    if (!response.ok) {
      throw new ApiError(
        `Download failed! status: ${response.status}`,
        response.status
      );
    }
    
    return response.blob();
  } else {
    // Handle text responses
    const text = await response.text();
    
    if (!response.ok) {
      throw new ApiError(
        text || `HTTP error! status: ${response.status}`,
        response.status
      );
    }
    
    return text;
  }
};

// Main API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    const config = createRequestConfig(options);
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, config);
    
    // Handle authentication errors
    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      removeAuthToken();
      window.location.href = '/admin/login';
      throw new ApiError('Authentication required', response.status);
    }
    
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    console.error('API Request failed:', error);
    throw new ApiError(
      error.message || 'Network error occurred',
      null,
      error
    );
  }
};

// Dashboard API operations
export const dashboardApi = {
  // Fetch dashboard overview data
  getDashboardData: async () => {
    return await apiRequest('/admin/dashboard');
  },

  // Export dashboard data
  exportDashboardData: async (format = 'xlsx') => {
    const response = await apiRequest(`/admin/export?format=${format}`, {
      headers: {
        'Accept': 'application/octet-stream',
      },
    });
    
    // Handle file download
    const url = window.URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  },

  // Get dashboard analytics
  getAnalytics: async (period = 'month') => {
    return await apiRequest(`/admin/analytics?period=${period}`);
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    return await apiRequest(`/admin/activities?limit=${limit}`);
  },
};

// Users API operations
export const usersApi = {
  // Get all users with pagination and filters
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/users?${queryString}`);
  },

  // Get single user by ID
  getUser: async (userId) => {
    return await apiRequest(`/admin/users/${userId}`);
  },

  // Create new user
  createUser: async (userData) => {
    return await apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user
  updateUser: async (userId, userData) => {
    return await apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Delete user
  deleteUser: async (userId) => {
    return await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Bulk delete users
  bulkDeleteUsers: async (userIds) => {
    return await apiRequest('/admin/users/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  },

  // Export users
  exportUsers: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const response = await apiRequest(`/admin/users/export?${queryString}`, {
      headers: {
        'Accept': 'application/octet-stream',
      },
    });
    
    const url = window.URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  },

  // Import users
  importUsers: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return await apiRequest('/admin/users/import', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  },

  // Get user statistics
  getUserStats: async () => {
    return await apiRequest('/admin/users/stats');
  },
};

// Notifications API operations
export const notificationsApi = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/notifications?${queryString}`);
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    return await apiRequest(`/admin/notifications/${notificationId}/mark-read`, {
      method: 'PUT',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return await apiRequest('/admin/notifications/mark-all-read', {
      method: 'PUT',
    });
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return await apiRequest(`/admin/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  // Get notification settings
  getNotificationSettings: async () => {
    return await apiRequest('/admin/notifications/settings');
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    return await apiRequest('/admin/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// Course Moderation API operations
export const courseModerationApi = {
  // Get pending courses
  getPendingCourses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/courses/pending?${queryString}`);
  },

  // Approve course
  approveCourse: async (courseId, feedback = '') => {
    return await apiRequest(`/admin/courses/${courseId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    });
  },

  // Reject course
  rejectCourse: async (courseId, reason = '') => {
    return await apiRequest(`/admin/courses/${courseId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Get course details
  getCourseDetails: async (courseId) => {
    return await apiRequest(`/admin/courses/${courseId}`);
  },

  // Get course statistics
  getCourseStats: async () => {
    return await apiRequest('/admin/courses/stats');
  },
};

// Instructor Applications API operations
export const instructorApplicationsApi = {
  // Get all instructor applications
  getApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/instructor-applications?${queryString}`);
  },

  // Get single application by ID
  getApplication: async (applicationId) => {
    return await apiRequest(`/admin/instructor-applications/${applicationId}`);
  },

  // Approve application
  approveApplication: async (applicationId, reviewNotes = '') => {
    return await apiRequest(`/admin/instructor-applications/${applicationId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes }),
    });
  },

  // Reject application
  rejectApplication: async (applicationId, reviewNotes = '') => {
    return await apiRequest(`/admin/instructor-applications/${applicationId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reviewNotes }),
    });
  },

  // Get application statistics
  getApplicationStats: async () => {
    return await apiRequest('/admin/instructor-applications/stats');
  },

  // Export applications
  exportApplications: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const response = await apiRequest(`/admin/instructor-applications/export?${queryString}`, {
      headers: {
        'Accept': 'application/octet-stream',
      },
    });
    
    const url = window.URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instructor-applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  },
};

// Financial API operations
export const financialApi = {
  // Get financial reports
  getFinancialReports: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/financial/reports?${queryString}`);
  },

  // Get revenue analytics
  getRevenueAnalytics: async (period = 'month') => {
    return await apiRequest(`/admin/financial/revenue?period=${period}`);
  },

  // Get payment statistics
  getPaymentStats: async () => {
    return await apiRequest('/admin/financial/payments/stats');
  },

  // Export financial data
  exportFinancialData: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/admin/financial/export?${queryString}`, {
      headers: {
        'Accept': 'application/octet-stream',
      },
    });
    
    const url = window.URL.createObjectURL(response);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  },
};

// Analytics API operations
export const analyticsApi = {
  // Get platform analytics
  getPlatformAnalytics: async (period = 'month') => {
    return await apiRequest(`/admin/analytics/platform?period=${period}`);
  },

  // Get user engagement metrics
  getUserEngagement: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/analytics/engagement?${queryString}`);
  },

  // Get course performance metrics
  getCoursePerformance: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/admin/analytics/courses?${queryString}`);
  },

  // Get system health metrics
  getSystemHealth: async () => {
    return await apiRequest('/admin/analytics/system-health');
  },
};

// Settings API operations
export const settingsApi = {
  // Get admin settings
  getSettings: async () => {
    return await apiRequest('/admin/settings');
  },

  // Update admin settings
  updateSettings: async (settings) => {
    return await apiRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Get system configuration
  getSystemConfig: async () => {
    return await apiRequest('/admin/settings/system');
  },

  // Update system configuration
  updateSystemConfig: async (config) => {
    return await apiRequest('/admin/settings/system', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },
};

// Authentication API operations
export const authApi = {
  // Login
  login: async (credentials) => {
    const response = await apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  // Logout
  logout: async () => {
    try {
      await apiRequest('/admin/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      removeAuthToken();
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
  },

  // Get current user profile
  getProfile: async () => {
    return await apiRequest('/admin/profile');
  },

  // Update profile
  updateProfile: async (profileData) => {
    return await apiRequest('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return await apiRequest('/admin/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // Refresh token
  refreshToken: async () => {
    const response = await apiRequest('/admin/refresh-token', {
      method: 'POST',
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Get auth token
  getAuthToken,

  // Set auth token
  setAuthToken,

  // Remove auth token
  removeAuthToken,

  // Create API request with custom config
  createRequest: apiRequest,

  // HTTP status codes
  HTTP_STATUS,
};

// Export all API modules
export default {
  dashboard: dashboardApi,
  users: usersApi,
  notifications: notificationsApi,
  courseModeration: courseModerationApi,
  instructorApplications: instructorApplicationsApi,
  financial: financialApi,
  analytics: analyticsApi,
  settings: settingsApi,
  auth: authApi,
  utils: apiUtils,
}; 