// Offline Context Provider for YBS
// Manages offline state and provides offline functionality

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { offlineApi } from '@/lib/offlineApi';
import { offlineStorage } from '@/lib/offlineStorage';

interface OfflineState {
  isOnline: boolean;
  isInitialized: boolean;
  hasOfflineData: boolean;
  pendingActions: number;
  lastSync: number | null;
}

interface OfflineContextType {
  // State
  offlineState: OfflineState;
  
  // Actions
  initializeOffline: (userId: string, sessionToken: string) => Promise<void>;
  clearOfflineData: () => Promise<void>;
  syncOfflineActions: () => Promise<void>;
  
  // Data access
  getUserDataOffline: (userId: string) => Promise<any | null>;
  storeUserDataOffline: (userId: string, userData: any) => Promise<void>;
  getAdminDataOffline: (adminId: string) => Promise<any | null>;
  storeAdminDataOffline: (adminId: string, adminData: any) => Promise<void>;
  
  // Network status
  isOnline: () => boolean;
  getNetworkStatus: () => { isOnline: boolean; lastCheck: number };
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isInitialized: false,
    hasOfflineData: false,
    pendingActions: 0,
    lastSync: null,
  });

  // Initialize offline storage
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await offlineStorage.init();
        setOfflineState(prev => ({ ...prev, isInitialized: true }));
        console.log('✅ Offline storage initialized');
      } catch (error) {
        console.error('❌ Failed to initialize offline storage:', error);
      }
    };

    initializeStorage();
  }, []);

  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      setOfflineState(prev => ({ ...prev, isOnline }));
      
      if (isOnline) {
        // Trigger sync when coming back online
        syncOfflineActions();
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Monitor pending actions
  useEffect(() => {
    const checkPendingActions = async () => {
      try {
        const actions = await offlineStorage.getOfflineActions();
        setOfflineState(prev => ({ ...prev, pendingActions: actions.length }));
      } catch (error) {
        console.error('Failed to check pending actions:', error);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkPendingActions, 30000);
    checkPendingActions(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // Initialize offline functionality for user
  const initializeOffline = async (userId: string, sessionToken: string): Promise<void> => {
    try {
      await offlineApi.initializeUserEncryption(userId, sessionToken);
      console.log('✅ Offline functionality initialized for user:', userId);
    } catch (error) {
      console.error('❌ Failed to initialize offline functionality:', error);
    }
  };

  // Clear all offline data
  const clearOfflineData = async (): Promise<void> => {
    try {
      await offlineApi.clearOfflineData();
      setOfflineState(prev => ({ 
        ...prev, 
        hasOfflineData: false, 
        pendingActions: 0,
        lastSync: null 
      }));
      console.log('✅ Offline data cleared');
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
    }
  };

  // Sync offline actions
  const syncOfflineActions = async (): Promise<void> => {
    if (!offlineState.isOnline) {
      console.log('🔄 Cannot sync - offline');
      return;
    }

    try {
      setOfflineState(prev => ({ ...prev, lastSync: Date.now() }));
      await offlineApi.syncOfflineActions();
      
      // Update pending actions count
      const actions = await offlineStorage.getOfflineActions();
      setOfflineState(prev => ({ ...prev, pendingActions: actions.length }));
      
      console.log('✅ Offline actions synced');
    } catch (error) {
      console.error('❌ Failed to sync offline actions:', error);
    }
  };

  // Get user data from offline storage
  const getUserDataOffline = async (userId: string): Promise<any | null> => {
    try {
      const data = await offlineApi.getUserDataOffline(userId);
      setOfflineState(prev => ({ ...prev, hasOfflineData: !!data }));
      return data;
    } catch (error) {
      console.error('❌ Failed to get user data offline:', error);
      return null;
    }
  };

  // Store user data offline
  const storeUserDataOffline = async (userId: string, userData: any): Promise<void> => {
    try {
      await offlineApi.storeUserDataOffline(userId, userData);
      setOfflineState(prev => ({ ...prev, hasOfflineData: true }));
      console.log('✅ User data stored offline');
    } catch (error) {
      console.error('❌ Failed to store user data offline:', error);
    }
  };

  // Get admin data from offline storage
  const getAdminDataOffline = async (adminId: string): Promise<any | null> => {
    try {
      const data = await offlineApi.getAdminDataOffline(adminId);
      setOfflineState(prev => ({ ...prev, hasOfflineData: !!data }));
      return data;
    } catch (error) {
      console.error('❌ Failed to get admin data offline:', error);
      return null;
    }
  };

  // Store admin data offline
  const storeAdminDataOffline = async (adminId: string, adminData: any): Promise<void> => {
    try {
      await offlineApi.storeAdminDataOffline(adminId, adminData);
      setOfflineState(prev => ({ ...prev, hasOfflineData: true }));
      console.log('✅ Admin data stored offline');
    } catch (error) {
      console.error('❌ Failed to store admin data offline:', error);
    }
  };

  // Check if online
  const isOnline = (): boolean => {
    return offlineApi.isOnline();
  };

  // Get network status
  const getNetworkStatus = () => {
    return offlineApi.getNetworkStatus();
  };

  const contextValue: OfflineContextType = {
    offlineState,
    initializeOffline,
    clearOfflineData,
    syncOfflineActions,
    getUserDataOffline,
    storeUserDataOffline,
    getAdminDataOffline,
    storeAdminDataOffline,
    isOnline,
    getNetworkStatus,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}

// Hook to use offline context
export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

// Hook to check if offline functionality is available
export function useOfflineAvailable(): boolean {
  const { offlineState } = useOffline();
  return offlineState.isInitialized && 'serviceWorker' in navigator && 'indexedDB' in window;
}

// Hook to get network status
export function useNetworkStatus(): { isOnline: boolean; lastCheck: number } {
  const { getNetworkStatus } = useOffline();
  return getNetworkStatus();
}
