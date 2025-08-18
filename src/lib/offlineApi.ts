// Offline API Manager for YBS
// Handles network requests with offline fallback and background sync

import { offlineStorage, type OfflineAction } from './offlineStorage';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface NetworkStatus {
  isOnline: boolean;
  lastCheck: number;
}

class OfflineApiManager {
  private networkStatus: NetworkStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastCheck: Date.now()
  };

  private syncInProgress = false;
  private readonly BACKEND_URL = ''; // use same-origin and Next.js rewrites

  constructor() {
    // Only attach browser listeners on the client
    if (typeof window !== 'undefined') {
      this.setupNetworkListeners();
      this.initializeServiceWorker();
    }
  }

  // Setup network status listeners
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      this.networkStatus.isOnline = true;
      this.networkStatus.lastCheck = Date.now();
      console.log('🟢 Network connection restored');
      this.syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      this.networkStatus.isOnline = false;
      this.networkStatus.lastCheck = Date.now();
      console.log('🔴 Network connection lost');
    });
  }

  // Initialize service worker
  private async initializeServiceWorker(): Promise<void> {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New service worker available');
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Make API request with offline support
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    enableOfflineQueue = true
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const requestOptions: RequestInit = {
      ...options,
      credentials: 'include',
      // same-origin proxy, CORS mode not needed
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Try network request first
    if (this.networkStatus.isOnline) {
      try {
        const response = await fetch(url, requestOptions);
        // Always try to parse JSON; allow non-2xx to propagate
        const data: ApiResponse<T> = await response
          .clone()
          .json()
          .catch(() => ({ success: response.ok } as ApiResponse<T>));

        if (response.ok && data && data.success) {
          await this.cacheResponse(endpoint, data);
        }
        return data;
      } catch (error) {
        console.log('Network request failed, trying offline fallback:', error);
      }
    }

    // Try offline cache
    const cachedData = await this.getCachedResponse<T>(endpoint);
    if (cachedData) {
      console.log('Serving from offline cache:', endpoint);
      return cachedData;
    }

    // Queue for offline sync if enabled
    if (enableOfflineQueue && this.shouldQueueRequest(options.method || 'GET')) {
      const actionId = await this.queueOfflineAction(url, requestOptions);
      console.log('Request queued for offline sync:', actionId);
      
      return {
        success: false,
        error: 'Request queued for offline sync. Will be processed when connection is restored.',
        data: { actionId } as any
      };
    }

    return {
      success: false,
      error: 'No internet connection and no cached data available'
    };
  }

  // Build full URL
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    if (endpoint.startsWith('/')) return `/api${endpoint}`; // ensure SW interception
    return `/api/${endpoint}`;
  }

  // Check if request should be queued for offline sync
  private shouldQueueRequest(method: string): boolean {
    // Queue POST, PUT, DELETE requests
    return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
  }

  // Queue offline action
  private async queueOfflineAction(url: string, options: RequestInit): Promise<string> {
    const action: Omit<OfflineAction, 'id' | 'timestamp'> = {
      url,
      method: options.method || 'GET',
      headers: options.headers as Record<string, string>,
      body: options.body as string,
      retryCount: 0,
    };

    return await offlineStorage.queueOfflineAction(action);
  }

  // Cache API response
  private async cacheResponse(endpoint: string, data: ApiResponse): Promise<void> {
    try {
      const cacheKey = `api_${endpoint}`;
      await offlineStorage.setCache(cacheKey, data, 24 * 60 * 60 * 1000);
    } catch (error) {
      console.error('Failed to cache response:', error);
    }
  }

  // Get cached response
  private async getCachedResponse<T>(endpoint: string): Promise<ApiResponse<T> | null> {
    try {
      const cacheKey = `api_${endpoint}`;
      const cached = await offlineStorage.getCache<ApiResponse<T>>(cacheKey);
      return cached || null;
    } catch (error) {
      console.error('Failed to get cached response:', error);
      return null;
    }
  }

  // Sync offline actions
  async syncOfflineActions(): Promise<void> {
    if (this.syncInProgress || !this.networkStatus.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Starting offline actions sync...');

    try {
      const actions = await offlineStorage.getOfflineActions();
      
      for (const action of actions) {
        try {
          const response = await fetch(action.url, {
            method: action.method,
            headers: action.headers,
            body: action.body,
            credentials: 'include',
          });

          if (response.ok) {
            await offlineStorage.removeOfflineAction(action.id);
            console.log('✅ Synced offline action:', action.id);
          } else {
            await offlineStorage.updateRetryCount(action.id);
            console.log('❌ Failed to sync action:', action.id);
          }
        } catch (error) {
          await offlineStorage.updateRetryCount(action.id);
          console.error('❌ Error syncing action:', action.id, error);
        }
      }
    } catch (error) {
      console.error('❌ Offline sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // User-specific API methods
  async getUserProfile(): Promise<ApiResponse> {
    return this.request('/user/profile');
  }

  async getTransactions(): Promise<ApiResponse> {
    return this.request('/transactions');
  }

  async getWithdrawals(): Promise<ApiResponse> {
    return this.request('/withdrawals');
  }

  async requestWithdrawal(data: any): Promise<ApiResponse> {
    return this.request('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Admin-specific API methods
  async getAdminUsers(): Promise<ApiResponse> {
    return this.request('/admin/users');
  }

  async getAdminWithdrawals(): Promise<ApiResponse> {
    return this.request('/admin/withdrawals');
  }

  async approveWithdrawal(withdrawalId: string, data: any): Promise<ApiResponse> {
    return this.request(`/admin/withdrawals/${withdrawalId}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async rejectWithdrawal(withdrawalId: string, data: any): Promise<ApiResponse> {
    return this.request(`/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Store user data offline
  async storeUserDataOffline(userId: string, userData: any): Promise<void> {
    try {
      await offlineStorage.storeUserData(userId, {
        profile: userData,
        balance: userData.balance || 0,
        transactions: userData.transactions || [],
        lastSync: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      });
      console.log('✅ User data stored offline');
    } catch (error) {
      console.error('❌ Failed to store user data offline:', error);
    }
  }

  // Get user data from offline storage
  async getUserDataOffline(userId: string): Promise<any | null> {
    try {
      return await offlineStorage.getUserData(userId);
    } catch (error) {
      console.error('❌ Failed to get user data from offline storage:', error);
      return null;
    }
  }

  // Store admin data offline
  async storeAdminDataOffline(adminId: string, adminData: any): Promise<void> {
    try {
      await offlineStorage.storeAdminData(adminId, {
        users: adminData.users || [],
        withdrawals: adminData.withdrawals || [],
        dashboard: adminData.dashboard || {},
        lastSync: Date.now(),
        expiresAt: Date.now() + (60 * 60 * 1000) // 1 hour for admin data
      });
      console.log('✅ Admin data stored offline');
    } catch (error) {
      console.error('❌ Failed to store admin data offline:', error);
    }
  }

  // Get admin data from offline storage
  async getAdminDataOffline(adminId: string): Promise<any | null> {
    try {
      return await offlineStorage.getAdminData(adminId);
    } catch (error) {
      console.error('❌ Failed to get admin data from offline storage:', error);
      return null;
    }
  }

  // Initialize encryption for user
  async initializeUserEncryption(userId: string, sessionToken: string): Promise<void> {
    try {
      await offlineStorage.generateEncryptionKey(userId, sessionToken);
      console.log('✅ User encryption initialized');
    } catch (error) {
      console.error('❌ Failed to initialize user encryption:', error);
    }
  }

  // Clear all offline data (for logout)
  async clearOfflineData(): Promise<void> {
    try {
      await offlineStorage.clearAllData();
      console.log('✅ Offline data cleared');
    } catch (error) {
      console.error('❌ Failed to clear offline data:', error);
    }
  }

  // Get network status
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  // Check if online
  isOnline(): boolean {
    return this.networkStatus.isOnline;
  }
}

// Export singleton instance
export const offlineApi = new OfflineApiManager();
