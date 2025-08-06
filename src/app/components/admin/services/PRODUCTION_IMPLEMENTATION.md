# Production Implementation Guide

## Overview

This guide explains how the centralized data service works in production environments, where data is fetched from the backend API instead of using static mock data.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                     │
├─────────────────────────────────────────────────────────────┤
│  AdminDashboard  │  UsersManagement  │  Other Components   │
└─────────────────┼───────────────────┼─────────────────────┘
                  │                   │
                  ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks                             │
├─────────────────────────────────────────────────────────────┤
│  useDataService  │  useUsersData  │  useConstants  │ ...  │
└─────────────────┼───────────────┼────────────────────┼─────┘
                  │               │                    │
                  ▼               ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                Production Data Service                      │
├─────────────────────────────────────────────────────────────┤
│  ProductionDataService  - API calls with caching          │
│  dataService.js         - Environment-aware service       │
└─────────────────────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                             │
├─────────────────────────────────────────────────────────────┤
│  Laravel/PHP API  │  Database  │  External Services       │
└────────────────────┼───────────┼─────────────────────────┘
```

## Environment Detection

The system automatically detects the environment and switches between development and production modes:

```javascript
// Environment detection
const isDevelopment = import.meta.env.DEV || !import.meta.VITE_APP_API_URL;
const API_BASE_URL = import.meta.VITE_APP_API_URL || 'http://localhost:8000/api';
```

### Environment Variables

Set these environment variables in your production environment:

```bash
# .env.production
VITE_APP_API_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
```

```bash
# .env.development
VITE_APP_API_URL=http://localhost:8000/api
VITE_APP_ENV=development
```

## Production Data Service

### Class Structure

```javascript
class ProductionDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management methods
  setCache(key, data) { /* ... */ }
  getCache(key) { /* ... */ }
  clearCache(key = null) { /* ... */ }

  // Data fetching methods
  async getDashboardData() { /* ... */ }
  async getUsersData() { /* ... */ }
  async getNotificationsData() { /* ... */ }
  async getCoursesData() { /* ... */ }
  async getFinancialData() { /* ... */ }
  async getAnalyticsData() { /* ... */ }
  async getSettingsData() { /* ... */ }
  async getSidebarData() { /* ... */ }
  async refreshAllData() { /* ... */ }
}
```

### Caching Strategy

The production service implements intelligent caching:

- **Cache Duration**: 5 minutes by default
- **Cache Keys**: Separate keys for each data module
- **Cache Invalidation**: Automatic timeout-based invalidation
- **Manual Cache Clear**: Ability to clear specific or all cache

```javascript
// Cache management
setCache(key, data) {
  this.cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

getCache(key) {
  const cached = this.cache.get(key);
  if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
    return cached.data;
  }
  return null;
}
```

### Error Handling and Fallbacks

Each data fetching method includes comprehensive error handling:

```javascript
async getDashboardData() {
  const cacheKey = 'dashboard';
  const cached = this.getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await apiService.dashboard.getData();
    this.setCache(cacheKey, response);
    return response;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return dashboardData; // Fallback to mock data
  }
}
```

## Backend API Requirements

### Required API Endpoints

Your backend should provide these endpoints:

#### Dashboard Data
```http
GET /api/admin/dashboard
Response: {
  "stats": {
    "totalUsers": 12000,
    "activeCourses": 500,
    "monthlyRevenue": 500000,
    "completionRate": 80,
    "pendingActions": {
      "courseApproval": 15,
      "instructorApproval": 10,
      "paymentIssues": 3
    }
  },
  "recentActivities": [...],
  "analytics": {...}
}
```

#### Users Data
```http
GET /api/admin/users
Response: {
  "users": [...],
  "categories": [...],
  "roles": [...],
  "statuses": [...],
  "enrollments": [...]
}
```

#### Notifications Data
```http
GET /api/admin/notifications
Response: {
  "notifications": [...],
  "types": [...],
  "priorities": [...]
}
```

#### Courses Data
```http
GET /api/admin/courses
Response: {
  "pendingCourses": [...],
  "categories": [...],
  "statuses": [...]
}
```

#### Financial Data
```http
GET /api/admin/financial
Response: {
  "revenue": {...},
  "payments": {...},
  "reports": [...]
}
```

#### Analytics Data
```http
GET /api/admin/analytics
Response: {
  "platform": {...},
  "engagement": {...},
  "coursePerformance": {...},
  "systemHealth": {...}
}
```

#### Settings Data
```http
GET /api/admin/settings
Response: {
  "admin": {...},
  "system": {...},
  "notifications": {...}
}
```

#### Sidebar Data
```http
GET /api/admin/sidebar
Response: {
  "navigation": [...],
  "userProfile": {...}
}
```

### Authentication

All API endpoints should require authentication:

```javascript
// In apiService.js
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Accept': 'application/json'
};
```

### Response Format

All API responses should follow this format:

```javascript
{
  "success": true,
  "data": {
    // Actual data here
  },
  "message": "Data retrieved successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Frontend Implementation

### Using the Production Data Service

```javascript
import React from 'react';
import { useDataService, useUsersData } from '../hooks';

const AdminDashboard = () => {
  const { 
    dashboard, 
    users, 
    notifications, 
    loading, 
    error, 
    refreshData 
  } = useDataService();

  const { data: usersData, loading: usersLoading, refresh: refreshUsers } = useUsersData();

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total Users: {dashboard.stats.totalUsers}</p>
      <button onClick={refreshData}>Refresh All Data</button>
      <button onClick={refreshUsers}>Refresh Users Only</button>
    </div>
  );
};
```

### Component with Loading States

```javascript
import React from 'react';
import { useUsersData, useDataUtils } from '../hooks';

const UsersList = () => {
  const { data, loading, error, refresh } = useUsersData();
  const utils = useDataUtils();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error.message}
        <button 
          onClick={refresh}
          className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {data.users.map(user => (
        <div key={user.id} className="border p-4 mb-2 rounded">
          <h3>{user.name}</h3>
          <span className={utils.getStatusColor(user.status)}>
            {user.status}
          </span>
        </div>
      ))}
    </div>
  );
};
```

## Performance Optimizations

### 1. Caching Strategy

```javascript
// Custom cache configuration
const cacheConfig = {
  dashboard: 2 * 60 * 1000,    // 2 minutes
  users: 5 * 60 * 1000,        // 5 minutes
  notifications: 1 * 60 * 1000, // 1 minute
  courses: 10 * 60 * 1000,     // 10 minutes
  financial: 15 * 60 * 1000,   // 15 minutes
  analytics: 5 * 60 * 1000,    // 5 minutes
  settings: 30 * 60 * 1000,    // 30 minutes
  sidebar: 60 * 60 * 1000      // 1 hour
};
```

### 2. Lazy Loading

```javascript
// Load data only when needed
const useLazyData = (dataType) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    if (loaded) return;
    
    setLoading(true);
    try {
      const result = await dataService[`get${dataType}Data`]();
      setData(result);
      setLoaded(true);
    } catch (error) {
      console.error(`Failed to load ${dataType} data:`, error);
    } finally {
      setLoading(false);
    }
  }, [dataType, loaded]);

  return { data, loading, loadData };
};
```

### 3. Optimistic Updates

```javascript
// Update UI immediately, sync with backend
const updateUserOptimistically = async (userId, updates) => {
  // Update UI immediately
  setUsers(prev => prev.map(user => 
    user.id === userId ? { ...user, ...updates } : user
  ));

  try {
    // Sync with backend
    await apiService.users.update(userId, updates);
  } catch (error) {
    // Revert on error
    console.error('Failed to update user:', error);
    // Optionally revert the UI change
  }
};
```

## Error Handling

### 1. Network Errors

```javascript
const handleNetworkError = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Network connection failed. Please check your internet connection.',
      action: 'retry'
    };
  }
  return {
    type: 'unknown',
    message: 'An unexpected error occurred.',
    action: 'refresh'
  };
};
```

### 2. Authentication Errors

```javascript
const handleAuthError = (error) => {
  if (error.status === 401) {
    // Redirect to login
    localStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
    return;
  }
  return error;
};
```

### 3. Rate Limiting

```javascript
const handleRateLimit = (error) => {
  if (error.status === 429) {
    return {
      type: 'rate_limit',
      message: 'Too many requests. Please wait a moment and try again.',
      action: 'wait'
    };
  }
  return error;
};
```

## Monitoring and Debugging

### 1. Performance Monitoring

```javascript
const monitorApiCall = async (apiCall, name) => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    
    console.log(`API Call ${name}: ${duration.toFixed(2)}ms`);
    
    // Send to monitoring service
    if (duration > 1000) {
      console.warn(`Slow API call: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`API Call ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};
```

### 2. Debug Mode

```javascript
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('Data Service Debug Mode Enabled');
  console.log('Environment:', import.meta.env.MODE);
  console.log('API URL:', import.meta.VITE_APP_API_URL);
  console.log('Cache Status:', productionDataService.cache);
}
```

## Deployment Checklist

### 1. Environment Variables

- [ ] Set `VITE_APP_API_URL` in production
- [ ] Configure `VITE_APP_ENV=production`
- [ ] Set up proper CORS headers on backend
- [ ] Configure authentication tokens

### 2. Backend API

- [ ] Implement all required endpoints
- [ ] Add proper authentication middleware
- [ ] Set up rate limiting
- [ ] Configure CORS for frontend domain
- [ ] Add error handling and logging

### 3. Frontend Configuration

- [ ] Build with production environment
- [ ] Test API connectivity
- [ ] Verify authentication flow
- [ ] Test error handling
- [ ] Monitor performance

### 4. Testing

- [ ] Test all data fetching hooks
- [ ] Verify caching behavior
- [ ] Test error scenarios
- [ ] Performance testing
- [ ] Load testing

## Migration from Development

### 1. Update Environment Variables

```bash
# Development
VITE_APP_API_URL=http://localhost:8000/api
VITE_APP_ENV=development

# Production
VITE_APP_API_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
```

### 2. Update API Service

Ensure your `apiService.js` is configured for production:

```javascript
const API_BASE_URL = import.meta.VITE_APP_API_URL || 'http://localhost:8000/api';

// Production headers
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
});
```

### 3. Test Data Flow

```javascript
// Test script to verify production setup
const testProductionSetup = async () => {
  try {
    const dataService = await import('./dataService');
    const result = await dataService.default.getDashboardData();
    console.log('Production setup working:', result);
  } catch (error) {
    console.error('Production setup failed:', error);
  }
};
```

## Conclusion

The production implementation provides:

- **Automatic Environment Detection**: Seamless switching between dev and prod
- **Intelligent Caching**: Reduces API calls and improves performance
- **Comprehensive Error Handling**: Graceful fallbacks and user feedback
- **Performance Monitoring**: Track API performance and user experience
- **Scalable Architecture**: Easy to extend with new data modules

This setup ensures your admin dashboard works efficiently in production while maintaining the flexibility to use mock data during development. 