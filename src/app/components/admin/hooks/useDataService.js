import { useMemo, useState, useEffect, useCallback } from 'react';
import dataService, { 
  dashboardData, 
  usersData, 
  notificationsData, 
  coursesData, 
  financialData, 
  analyticsData, 
  settingsData, 
  sidebarData, 
  constants, 
  dataUtils 
} from '../services/dataService';

// Environment detection
const isDevelopment = import.meta.env.DEV || !import.meta.VITE_APP_API_URL;

/**
 * Custom hook that provides access to the centralized data service
 * with support for both development and production environments
 */
export const useDataService = () => {
  const [data, setData] = useState({
    dashboard: dashboardData,
    users: usersData,
    notifications: notificationsData,
    courses: coursesData,
    financial: financialData,
    analytics: analyticsData,
    settings: settingsData,
    sidebar: sidebarData
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all data from API in production
  const loadAllData = useCallback(async () => {
    if (isDevelopment) return; // Skip in development

    setLoading(true);
    setError(null);

    try {
      const freshData = await dataService.refreshAllData();
      setData(freshData);
    } catch (err) {
      console.error('Failed to load data, falling back to mock data:', err);
      setError(err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount in production
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  // Clear cache function (production only)
  const clearCache = useCallback((key = null) => {
    if (!isDevelopment && dataService.clearCache) {
      dataService.clearCache(key);
    }
  }, []);

  return {
    // Data
    ...data,
    
    // Constants and utilities (always available)
    constants,
    utils: dataUtils,
    
    // Service methods
    service: dataService,
    
    // State
    loading,
    error,
    
    // Actions
    refreshData,
    clearCache,
    loadAllData
  };
};

/**
 * Hook for accessing specific data modules with automatic loading
 */
export const useDashboardData = () => {
  const [data, setData] = useState(dashboardData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (isDevelopment) return;

    setLoading(true);
    setError(null);

    try {
      const freshData = await dataService.getDashboardData();
      setData(freshData);
    } catch (err) {
      console.error('Failed to load dashboard data, falling back to mock data:', err);
      setError(err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

export const useUsersData = () => {
  const [data, setData] = useState(usersData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (isDevelopment) return;

    setLoading(true);
    setError(null);

    try {
      const freshData = await dataService.getUsersData();
      setData(freshData);
    } catch (err) {
      console.error('Failed to load users data, falling back to mock data:', err);
      setError(err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

export const useNotificationsData = () => {
  const [data, setData] = useState(notificationsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (isDevelopment) return;

    setLoading(true);
    setError(null);

    try {
      const freshData = await dataService.getNotificationsData();
      setData(freshData);
    } catch (err) {
      console.error('Failed to load notifications data, falling back to mock data:', err);
      setError(err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

export const useCoursesData = () => {
  const [data, setData] = useState(coursesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (isDevelopment) return;

    setLoading(true);
    setError(null);

    try {
      const freshData = await dataService.getCoursesData();
      setData(freshData);
    } catch (err) {
      console.error('Failed to load courses data, falling back to mock data:', err);
      setError(err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

export const useFinancialData = () => {
  const [data, setData] = useState(financialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (isDevelopment) return;

    setLoading(true);
    setError(null);

    try {
      const freshData = await dataService.getFinancialData();
      setData(freshData);
    } catch (err) {
      console.error('Failed to load financial data, falling back to mock data:', err);
      setError(err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

export const useAnalyticsData = () => {
  const [data, setData] = useState(analyticsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (isDevelopment) return;

    setLoading(true);
    setError(null);

    try {
      const freshData = await dataService.getAnalyticsData();
      setData(freshData);
    } catch (err) {
      console.error('Failed to load analytics data, falling back to mock data:', err);
      setError(err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

export const useSettingsData = () => {
  const [data, setData] = useState(settingsData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (isDevelopment) return;

    setLoading(true);
    setError(null);

    try {
      const freshData = await dataService.getSettingsData();
      setData(freshData);
    } catch (err) {
      console.error('Failed to load settings data, falling back to mock data:', err);
      setError(err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

export const useSidebarData = () => {
  const [data, setData] = useState(sidebarData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (isDevelopment) return;

    setLoading(true);
    setError(null);

    try {
      const freshData = await dataService.getSidebarData();
      setData(freshData);
    } catch (err) {
      console.error('Failed to load sidebar data, falling back to mock data:', err);
      setError(err);
      // Keep existing mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

/**
 * Hook for accessing constants (always static)
 */
export const useConstants = () => {
  return useMemo(() => constants, []);
};

/**
 * Hook for accessing utility functions (always static)
 */
export const useDataUtils = () => {
  return useMemo(() => dataUtils, []);
}; 