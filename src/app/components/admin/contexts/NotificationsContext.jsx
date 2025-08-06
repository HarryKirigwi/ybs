import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useApiService } from '../hooks/useApiService';
import { notificationsData } from '../services/dataService';

// Create the context
const NotificationsContext = createContext();

// Provider component
export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { notifications: apiNotifications } = useApiService();
  const intervalRef = useRef(null);

  // Check if we should use mock data (for development)
  const useMockData = import.meta.env.DEV || !import.meta.VITE_APP_API_URL;

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Use mock data for development
        await new Promise(resolve => setTimeout(resolve, 500));
        setNotifications(notificationsData.notifications);
      } else {
        // Use real API
        const data = await apiNotifications.getAll();
        setNotifications(data);
      }
    } catch (error) {
      // console.error('Failed to fetch notifications:', error);
      setError(error);
      // Fallback to mock data to ensure the app continues to work
      setNotifications(notificationsData.notifications);
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markNotificationAsRead = async (notificationId) => {
    // Update frontend immediately
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );

    if (useMockData) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      // Use real API
      try {
        await apiNotifications.markAsRead(notificationId);
      } catch (error) {
        // console.error('Failed to mark notification as read:', error);
        // Keep the frontend change even if API fails - this ensures good UX
      }
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    // Update frontend immediately
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ 
        ...notification, 
        read: true 
      }))
    );

    if (useMockData) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      // Use real API
      try {
        await apiNotifications.markAllAsRead();
      } catch (error) {
        // console.error('Failed to mark all notifications as read:', error);
        // Keep the frontend change even if API fails - this ensures good UX
      }
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    // Update frontend immediately
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );

    if (useMockData) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      // Use real API
      try {
        await apiNotifications.delete(notificationId);
      } catch (error) {
        // console.error('Failed to delete notification:', error);
        // Keep the frontend change even if API fails - this ensures good UX
      }
    }
  };

  // Start autoupdate interval
  const startAutoUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Update every 30 seconds
    const interval = 30000;
    
    intervalRef.current = setInterval(() => {
      // Only fetch if we're not in the middle of an operation
      if (!loading) {
        fetchNotifications();
      }
    }, interval);
  };

  // Stop autoupdate interval
  const stopAutoUpdate = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
    startAutoUpdate();

    // Cleanup on unmount
    return () => {
      stopAutoUpdate();
    };
  }, []);

  // Manual refresh
  const refreshNotifications = () => {
    fetchNotifications();
  };

  const value = {
    notifications,
    loading,
    error,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    fetchNotifications,
    refreshNotifications,
    startAutoUpdate,
    stopAutoUpdate,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Custom hook to use the notifications context
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}; 