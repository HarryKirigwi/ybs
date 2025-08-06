# Centralized Data Service Documentation

## Overview

The admin dashboard now uses a centralized data service that provides:

- **Unified Data Management**: All mock data, constants, and utilities in one place
- **Consistent Data Structure**: Standardized data formats across all modules
- **Reusable Utilities**: Common functions for data manipulation and formatting
- **Type Safety**: Structured data with proper validation and error handling

## Architecture

```
Components → Custom Hooks → Centralized Data Service → dataService.js
```

## Data Modules

### 1. Dashboard Data (`dashboardData`)
- Dashboard statistics (users, courses, revenue)
- Recent activities
- Analytics data (charts, metrics)

### 2. Users Data (`usersData`)
- Mock users list
- User categories, roles, statuses
- Enrollment statuses

### 3. Notifications Data (`notificationsData`)
- Mock notifications list
- Notification types and priorities

### 4. Courses Data (`coursesData`)
- Pending courses for moderation
- Course categories and statuses

### 5. Financial Data (`financialData`)
- Revenue analytics
- Payment statistics
- Financial reports

### 6. Analytics Data (`analyticsData`)
- Platform analytics
- User engagement metrics
- Course performance data
- System health metrics

### 7. Settings Data (`settingsData`)
- Admin settings
- System configuration
- Notification settings

### 8. Sidebar Data (`sidebarData`)
- Navigation items
- User profile data

## Constants

```javascript
export const constants = {
  HTTP_STATUS: { OK: 200, BAD_REQUEST: 400, /* ... */ },
  API_ENDPOINTS: { DASHBOARD: '/admin/dashboard', /* ... */ },
  FILE_TYPES: { IMAGES: ['jpg', 'png'], /* ... */ },
  VALIDATION: { EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, /* ... */ },
  PAGINATION: { DEFAULT_PAGE_SIZE: 10, /* ... */ },
  DATE_FORMATS: { DISPLAY: 'MMM DD, YYYY', /* ... */ }
};
```

## Utility Functions

```javascript
export const dataUtils = {
  getInitials: (name) => { /* ... */ },
  getUserData: (user, field, defaultValue) => { /* ... */ },
  isValidEmail: (email) => { /* ... */ },
  isValidPhone: (phone) => { /* ... */ },
  validatePassword: (password) => { /* ... */ },
  getAvatarColor: (name) => { /* ... */ },
  getStatusColor: (status) => { /* ... */ },
  getRoleColor: (role) => { /* ... */ },
  formatCurrency: (amount, currency) => { /* ... */ },
  formatDate: (date, format) => { /* ... */ },
  formatRelativeTime: (date) => { /* ... */ },
  generateCSV: (data, headers) => { /* ... */ },
  downloadFile: (content, filename, type) => { /* ... */ }
};
```

## Custom Hooks

### Main Data Service Hook
```javascript
export const useDataService = () => {
  return useMemo(() => ({
    dashboard: dashboardData,
    users: usersData,
    notifications: notificationsData,
    courses: coursesData,
    financial: financialData,
    analytics: analyticsData,
    settings: settingsData,
    sidebar: sidebarData,
    constants,
    utils: dataUtils,
    service: dataService
  }), []);
};
```

### Specific Data Hooks
```javascript
export const useDashboardData = () => useMemo(() => dashboardData, []);
export const useUsersData = () => useMemo(() => usersData, []);
export const useNotificationsData = () => useMemo(() => notificationsData, []);
export const useCoursesData = () => useMemo(() => coursesData, []);
export const useFinancialData = () => useMemo(() => financialData, []);
export const useAnalyticsData = () => useMemo(() => analyticsData, []);
export const useSettingsData = () => useMemo(() => settingsData, []);
export const useSidebarData = () => useMemo(() => sidebarData, []);
export const useConstants = () => useMemo(() => constants, []);
export const useDataUtils = () => useMemo(() => dataUtils, []);
```

## Usage Examples

### Basic Component Usage
```javascript
import React from 'react';
import { useUsersData, useDataUtils } from '../hooks';

const UserComponent = () => {
  const usersData = useUsersData();
  const utils = useDataUtils();

  return (
    <div>
      {usersData.users.map(user => (
        <div key={user.id}>
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

### Form Validation
```javascript
import React from 'react';
import { useDataUtils, useConstants } from '../hooks';

const UserForm = () => {
  const utils = useDataUtils();
  const constants = useConstants();

  const validateEmail = (email) => {
    return constants.VALIDATION.EMAIL_REGEX.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= constants.VALIDATION.PASSWORD_MIN_LENGTH;
  };

  return (
    <form>
      {/* Form fields with validation */}
    </form>
  );
};
```

## Migration Guide

### From Hardcoded Data
**Before:**
```javascript
const mockUsers = [{ id: 1, name: 'John Doe' }];
const getInitials = (name) => name.split(' ').map(n => n[0]).join('');
```

**After:**
```javascript
import { useUsersData, useDataUtils } from '../hooks';

const Component = () => {
  const usersData = useUsersData();
  const utils = useDataUtils();
  
  return usersData.users.map(user => (
    <span key={user.id}>{utils.getInitials(user.name)}</span>
  ));
};
```

## Best Practices

1. **Use Specific Hooks**: Use `useUsersData()` instead of `useDataService()` for better performance
2. **Memoize Expensive Operations**: Use `useMemo` for data processing
3. **Centralize Updates**: Update data through the service, not directly in components
4. **Type Safety**: Add TypeScript interfaces for better type checking

## Benefits

- **Consistency**: All data follows the same structure
- **Maintainability**: Single source of truth for all data
- **Reusability**: Utilities can be shared across components
- **Performance**: Memoized hooks prevent unnecessary re-renders
- **Testing**: Easy to mock and test data structures
- **Scalability**: Easy to add new data modules and utilities

## Conclusion

The centralized data service provides a robust foundation for managing all data in the admin dashboard. It ensures consistency, reduces duplication, and provides a clean interface for components to access data and utilities. 