// Secure Offline Storage Manager for YBS
// Uses IndexedDB with encryption for secure data storage

interface OfflineAction {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
}

interface CachedUserData {
  profile: any;
  balance: number;
  transactions: any[];
  lastSync: number;
  expiresAt: number;
}

interface CachedAdminData {
  users: any[];
  withdrawals: any[];
  dashboard: any;
  lastSync: number;
  expiresAt: number;
}

class SecureOfflineStorage {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'YBSOfflineDB';
  private readonly DB_VERSION = 1;
  private encryptionKey: CryptoKey | null = null;

  // Initialize the database
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionsStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('userData')) {
          const userStore = db.createObjectStore('userData', { keyPath: 'userId' });
          userStore.createIndex('lastSync', 'lastSync', { unique: false });
        }

        if (!db.objectStoreNames.contains('adminData')) {
          const adminStore = db.createObjectStore('adminData', { keyPath: 'adminId' });
          adminStore.createIndex('lastSync', 'lastSync', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
    });
  }

  // Generate encryption key from user session
  async generateEncryptionKey(userId: string, sessionToken: string): Promise<void> {
    try {
      // Derive key from user ID and session token
      const encoder = new TextEncoder();
      const data = encoder.encode(userId + sessionToken + 'YBS_SECRET_SALT');
      
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        data,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode('YBS_SALT'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      throw error;
    }
  }

  // Encrypt data
  private async encryptData(data: any): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(data);
    const dataBuffer = encoder.encode(jsonString);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      dataBuffer
    );

    const encryptedArray = new Uint8Array(encryptedData);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt data
  private async decryptData(encryptedString: string): Promise<any> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const combined = new Uint8Array(
        atob(encryptedString).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encryptedData = combined.slice(12);

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw new Error('Data corruption detected');
    }
  }

  // Store user data securely
  async storeUserData(userId: string, data: CachedUserData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const encryptedData = await this.encryptData(data);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userData'], 'readwrite');
      const store = transaction.objectStore('userData');
      
      const request = store.put({
        userId,
        encryptedData,
        lastSync: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Retrieve user data securely
  async getUserData(userId: string): Promise<CachedUserData | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userData'], 'readonly');
      const store = transaction.objectStore('userData');
      
      const request = store.get(userId);

      request.onsuccess = async () => {
        if (request.result) {
          try {
            const decryptedData = await this.decryptData(request.result.encryptedData);
            
            // Check if data is expired (24 hours)
            if (Date.now() - decryptedData.lastSync > 24 * 60 * 60 * 1000) {
              resolve(null);
              return;
            }
            
            resolve(decryptedData);
          } catch (error) {
            console.error('Failed to decrypt user data:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Store admin data securely
  async storeAdminData(adminId: string, data: CachedAdminData): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const encryptedData = await this.encryptData(data);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['adminData'], 'readwrite');
      const store = transaction.objectStore('adminData');
      
      const request = store.put({
        adminId,
        encryptedData,
        lastSync: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Retrieve admin data securely
  async getAdminData(adminId: string): Promise<CachedAdminData | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['adminData'], 'readonly');
      const store = transaction.objectStore('adminData');
      
      const request = store.get(adminId);

      request.onsuccess = async () => {
        if (request.result) {
          try {
            const decryptedData = await this.decryptData(request.result.encryptedData);
            
            // Check if data is expired (1 hour for admin data)
            if (Date.now() - decryptedData.lastSync > 60 * 60 * 1000) {
              resolve(null);
              return;
            }
            
            resolve(decryptedData);
          } catch (error) {
            console.error('Failed to decrypt admin data:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Queue offline action
  async queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const offlineAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      
      const request = store.add(offlineAction);

      request.onsuccess = () => resolve(offlineAction.id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending offline actions
  async getOfflineActions(): Promise<OfflineAction[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const index = store.index('timestamp');
      
      const request = index.getAll();

      request.onsuccess = () => {
        const actions = request.result || [];
        // Filter out actions that have been retried too many times
        resolve(actions.filter(action => action.retryCount < 3));
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Remove offline action after successful sync
  async removeOfflineAction(actionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      
      const request = store.delete(actionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Update retry count for failed actions
  async updateRetryCount(actionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      
      const getRequest = store.get(actionId);

      getRequest.onsuccess = () => {
        if (getRequest.result) {
          const action = getRequest.result;
          action.retryCount += 1;
          
          const putRequest = store.put(action);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Clear expired data
  async clearExpiredData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const userExpiry = 24 * 60 * 60 * 1000; // 24 hours
    const adminExpiry = 60 * 60 * 1000; // 1 hour

    // Clear expired user data
    const userTransaction = this.db.transaction(['userData'], 'readwrite');
    const userStore = userTransaction.objectStore('userData');
    const userIndex = userStore.index('lastSync');
    const userRequest = userIndex.openCursor();

    userRequest.onsuccess = () => {
      const cursor = userRequest.result;
      if (cursor) {
        if (now - cursor.value.lastSync > userExpiry) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    // Clear expired admin data
    const adminTransaction = this.db.transaction(['adminData'], 'readwrite');
    const adminStore = adminTransaction.objectStore('adminData');
    const adminIndex = adminStore.index('lastSync');
    const adminRequest = adminIndex.openCursor();

    adminRequest.onsuccess = () => {
      const cursor = adminRequest.result;
      if (cursor) {
        if (now - cursor.value.lastSync > adminExpiry) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }

  // Clear all data (for logout)
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stores = ['userData', 'adminData', 'offlineActions', 'cache'];
    
    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Export singleton instance
export const offlineStorage = new SecureOfflineStorage();
export type { OfflineAction, CachedUserData, CachedAdminData };
