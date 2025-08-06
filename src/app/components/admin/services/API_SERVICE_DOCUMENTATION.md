# Centralized API Service Documentation

## Overview

The admin dashboard now uses a centralized API service architecture that provides:

- **Unified API Layer**: All API operations are centralized in one service
- **Consistent Error Handling**: Standardized error handling across all API calls
- **Authentication Management**: Centralized token management and authentication
- **Request/Response Interceptors**: Automatic request/response processing
- **Development/Production Mode**: Automatic switching between mock data and real API calls
- **Type Safety**: Structured API responses with proper error types

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Components                               │
├─────────────────────────────────────────────────────────────┤
│  AdminDashboard  │  UsersManagement  │  Other Components   │
└─────────────────┼───────────────────┼─────────────────────┘
                  │                   │
                  ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks                             │
├─────────────────────────────────────────────────────────────┤
│  useApiService  │  useAdminApi  │  useNotifications  │ ... │
└─────────────────┼───────────────┼────────────────────┼─────┘
                  │               │                    │
                  ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                Centralized API Service                      │
├─────────────────────────────────────────────────────────────┤
│  apiService.js  - Main API service with all operations     │
└─────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                              │
├─────────────────────────────────────────────────────────────┤
│  Laravel/PHP API endpoints                                  │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
admin/
├── services/
│   ├── apiService.js                    # Main API service
│   └── API_SERVICE_DOCUMENTATION.md     # This documentation
├── hooks/
│   ├── useApiService.js                 # Main API hook
│   ├── useAdminApi.js                   # Legacy compatibility
│   ├── useNotifications.js              # Notifications hook
│   ├── useDashboardData.js              # Dashboard data hook
│   ├── useUsersManagement.js            # Users management hook
│   └── index.js                         # Hook exports
└── components/
    └── ...                              # React components
```

## Core Components

### 1. API Service (`apiService.js`)

The main API service that handles all HTTP requests with:

- **Request Interceptors**: Automatic authentication headers
- **Response Interceptors**: Error handling and data parsing
- **File Downloads**: Automatic blob handling for exports
- **Authentication**: Token management and refresh logic

#### Key Features:

```javascript
// Automatic authentication
const config = createRequestConfig(options);
// Adds: Authorization: Bearer <token>

// Response handling
const handleResponse = async (response) => {
  // Handles JSON, blob, and text responses
  // Automatic error throwing for non-200 responses
};

// File download handling
const exportDashboardData = async (format = 'xlsx') => {
  const response = await apiRequest(`/admin/export?format=${format}`, {
    headers: { 'Accept': 'application/octet-stream' }
  });
  // Automatic file download
};
```

### 2. API Hook (`useApiService.js`)

A React hook that provides a clean interface to the API service with:

- **Loading States**: Automatic loading state management
- **Error Handling**: Centralized error state
- **Cached Functions**: Memoized API calls for performance
- **Modular Organization**: Organized by feature (dashboard, users, etc.)

#### Usage Example:

```javascript
const { 
  dashboard, 
  users, 
  notifications, 
  loading, 
  error 
} = useApiService();

// Dashboard operations
const data = await dashboard.getData();
await dashboard.exportData('xlsx');

// User operations
const allUsers = await users.getAll({ page: 1, limit: 10 });
await users.create(userData);
await users.update(userId, updatedData);
```

## API Modules

### Dashboard API

```javascript
dashboard: {
  getData: () => Promise<DashboardData>,
  exportData: (format) => Promise<void>,
  getAnalytics: (period) => Promise<AnalyticsData>,
  getRecentActivities: (limit) => Promise<Activity[]>
}
```

### Users API

```javascript
users: {
  getAll: (params) => Promise<User[]>,
  getById: (userId) => Promise<User>,
  create: (userData) => Promise<User>,
  update: (userId, userData) => Promise<User>,
  delete: (userId) => Promise<void>,
  bulkDelete: (userIds) => Promise<void>,
  export: (filters) => Promise<void>,
  import: (file) => Promise<User[]>,
  getStats: () => Promise<UserStats>
}
```

### Notifications API

```javascript
notifications: {
  getAll: (params) => Promise<Notification[]>,
  markAsRead: (notificationId) => Promise<void>,
  markAllAsRead: () => Promise<void>,
  delete: (notificationId) => Promise<void>,
  getSettings: () => Promise<NotificationSettings>,
  updateSettings: (settings) => Promise<void>
}
```

### Course Moderation API

```javascript
courseModeration: {
  getPendingCourses: (params) => Promise<Course[]>,
  approveCourse: (courseId, feedback) => Promise<void>,
  rejectCourse: (courseId, reason) => Promise<void>,
  getCourseDetails: (courseId) => Promise<Course>,
  getCourseStats: () => Promise<CourseStats>
}
```

### Financial API

```javascript
financial: {
  getReports: (params) => Promise<FinancialReport[]>,
  getRevenueAnalytics: (period) => Promise<RevenueData>,
  getPaymentStats: () => Promise<PaymentStats>,
  exportData: (params) => Promise<void>
}
```

### Analytics API

```javascript
analytics: {
  getPlatformAnalytics: (period) => Promise<PlatformAnalytics>,
  getUserEngagement: (params) => Promise<EngagementData>,
  getCoursePerformance: (params) => Promise<PerformanceData>,
  getSystemHealth: () => Promise<SystemHealth>
}
```

### Settings API

```javascript
settings: {
  get: () => Promise<AdminSettings>,
  update: (settingsData) => Promise<void>,
  getSystemConfig: () => Promise<SystemConfig>,
  updateSystemConfig: (config) => Promise<void>
}
```

### Authentication API

```javascript
auth: {
  login: (credentials) => Promise<AuthResponse>,
  logout: () => Promise<void>,
  getProfile: () => Promise<UserProfile>,
  updateProfile: (profileData) => Promise<void>,
  changePassword: (passwordData) => Promise<void>,
  refreshToken: () => Promise<AuthResponse>
}
```

## Error Handling

### Custom API Error Class

```javascript
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
```

### Error Types

- **Network Errors**: Connection issues, timeouts
- **HTTP Errors**: 4xx, 5xx status codes
- **Authentication Errors**: 401 responses trigger automatic logout
- **Validation Errors**: 422 responses with field-specific errors

### Error Handling in Components

```javascript
const { users, loading, error } = useApiService();

useEffect(() => {
  if (error) {
    // Handle error (show notification, etc.)
    console.error('API Error:', error.message);
  }
}, [error]);
```

## Development vs Production

### Environment Detection

```javascript
const useMockData = import.meta.env.DEV || !import.meta.VITE_APP_API_URL;
```

### Mock Data Usage

- **Development**: Uses mock data for faster development
- **Production**: Uses real API endpoints
- **Configurable**: Can be overridden with environment variables

### Mock Data Structure

Each hook maintains its own mock data that matches the expected API response structure:

```javascript
// Example: useNotifications.js
const mockNotifications = [
  {
    id: 1,
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight at 2 AM',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
    priority: 'high'
  },
  // ... more mock data
];
```

## Authentication Flow

### Token Management

```javascript
// Automatic token handling
const getAuthToken = () => localStorage.getItem('admin_token');
const setAuthToken = (token) => localStorage.setItem('admin_token', token);
const removeAuthToken = () => localStorage.removeItem('admin_token');
```

### Request Flow

1. **Request Creation**: `createRequestConfig()` adds auth headers
2. **API Call**: `apiRequest()` makes the HTTP request
3. **Response Handling**: `handleResponse()` processes the response
4. **Error Handling**: Automatic logout on 401 responses

### Login Flow

```javascript
const { auth } = useApiService();

const handleLogin = async (credentials) => {
  try {
    const response = await auth.login(credentials);
    // Token is automatically stored
    // User is redirected to dashboard
  } catch (error) {
    // Handle login error
  }
};
```

## Usage Examples

### Basic Component Usage

```javascript
import React, { useEffect, useState } from 'react';
import { useApiService } from '../hooks';

const DashboardComponent = () => {
  const { dashboard, loading, error } = useApiService();
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dashboardData = await dashboard.getData();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Render dashboard data */}
    </div>
  );
};
```

### Advanced Usage with Multiple APIs

```javascript
import React, { useEffect, useState } from 'react';
import { useApiService } from '../hooks';

const AdminOverview = () => {
  const { 
    dashboard, 
    users, 
    notifications, 
    analytics,
    loading, 
    error 
  } = useApiService();

  const [overview, setOverview] = useState({});

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [
          dashboardData,
          userStats,
          notificationCount,
          analyticsData
        ] = await Promise.all([
          dashboard.getData(),
          users.getStats(),
          notifications.getAll({ limit: 1 }),
          analytics.getPlatformAnalytics()
        ]);

        setOverview({
          dashboard: dashboardData,
          users: userStats,
          notifications: notificationCount.length,
          analytics: analyticsData
        });
      } catch (error) {
        console.error('Failed to load overview:', error);
      }
    };

    loadOverview();
  }, []);

  return (
    <div>
      {/* Render overview data */}
    </div>
  );
};
```

## Migration Guide

### From Legacy API Calls

**Before:**
```javascript
const fetchData = async () => {
  const response = await fetch('/api/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data;
};
```

**After:**
```javascript
const { dashboard } = useApiService();

const fetchData = async () => {
  return await dashboard.getData();
};
```

### From useAdminApi Hook

**Before:**
```javascript
const { fetchDashboardData, handleExport } = useAdminApi();
```

**After:**
```javascript
const { dashboard } = useApiService();

// Use dashboard.getData() instead of fetchDashboardData
// Use dashboard.exportData() instead of handleExport
```

## Best Practices

### 1. Error Handling

Always handle errors in your components:

```javascript
const { users, loading, error } = useApiService();

useEffect(() => {
  if (error) {
    // Show user-friendly error message
    showNotification(error.message, 'error');
  }
}, [error]);
```

### 2. Loading States

Use loading states for better UX:

```javascript
const { users, loading } = useApiService();

if (loading) {
  return <LoadingSpinner />;
}
```

### 3. Optimistic Updates

For better UX, update UI immediately and handle errors:

```javascript
const handleDeleteUser = async (userId) => {
  // Optimistic update
  setUsers(prev => prev.filter(user => user.id !== userId));
  
  try {
    await users.delete(userId);
  } catch (error) {
    // Revert on error
    setUsers(prev => [...prev, userToDelete]);
    showNotification('Failed to delete user', 'error');
  }
};
```

### 4. Batch Operations

Use Promise.all for multiple API calls:

```javascript
const loadAllData = async () => {
  const [dashboardData, userStats, notifications] = await Promise.all([
    dashboard.getData(),
    users.getStats(),
    notifications.getAll()
  ]);
  
  // Process all data together
};
```

## Configuration

### Environment Variables

```bash
# .env
VITE_APP_API_URL=http://localhost:8000/api

# .env.production
VITE_APP_API_URL=https://api.yourdomain.com/api
```

### API Base URL

The service automatically uses the environment variable or falls back to a default:

```javascript
const API_BASE_URL = import.meta.VITE_APP_API_URL || 'http://localhost:8000/api';
```

## Testing

### Mock Data Testing

For testing components, you can mock the API service:

```javascript
// Mock the API service
jest.mock('../hooks/useApiService', () => ({
  useApiService: () => ({
    dashboard: {
      getData: jest.fn().mockResolvedValue(mockDashboardData)
    },
    loading: false,
    error: null
  })
}));
```

### API Testing

Test the API service directly:

```javascript
import { dashboardApi } from '../services/apiService';

describe('Dashboard API', () => {
  it('should fetch dashboard data', async () => {
    const data = await dashboardApi.getDashboardData();
    expect(data).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows requests from frontend domain
2. **Authentication Errors**: Check token storage and refresh logic
3. **Network Errors**: Verify API URL and network connectivity
4. **Response Format**: Ensure API responses match expected structure

### Debug Mode

Enable debug logging:

```javascript
// In apiService.js
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('API Request:', { endpoint, options });
}
```

## Future Enhancements

### Planned Features

1. **Request Caching**: Implement response caching for better performance
2. **Retry Logic**: Automatic retry for failed requests
3. **Request Queuing**: Queue requests when offline
4. **Real-time Updates**: WebSocket integration for live data
5. **TypeScript**: Add TypeScript support for better type safety

### Extensibility

The service is designed to be easily extensible:

```javascript
// Add new API module
export const newFeatureApi = {
  getData: async () => {
    return await apiRequest('/admin/new-feature');
  },
  // ... more methods
};

// Add to main export
export default {
  // ... existing modules
  newFeature: newFeatureApi,
};
```

## Conclusion

The centralized API service provides a robust, maintainable, and scalable solution for managing all API operations in the admin dashboard. It ensures consistency, reduces code duplication, and provides a clean interface for components to interact with the backend.

For questions or issues, refer to the individual hook documentation or the main API service file. 