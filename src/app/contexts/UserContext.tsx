'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

function apiUrl(path: string) {
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

// Data processing utility to ensure data consistency
const processUserData = (rawData: UserData): UserData => {
  return {
    ...rawData,
    // Ensure is_active is true when accountStatus is ACTIVE
    is_active: rawData.accountStatus === 'ACTIVE' || rawData.is_active,
    // Ensure phone_verified is consistent with account status
    phone_verified: (rawData.accountStatus === 'ACTIVE' && rawData.phone_verified) || rawData.phone_verified,
    // Ensure other computed fields are consistent
    availableBalance: rawData.availableBalance || 0,
    totalEarned: rawData.totalEarned || 0,
    totalWithdrawn: rawData.totalWithdrawn || 0,
    pendingEarnings: rawData.pendingEarnings || 0,
    active_direct_referrals: rawData.active_direct_referrals || 0,
    totalReferrals: rawData.totalReferrals || 0,
  };
};

// Debounce utility
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  // FIX: Initialize useRef with null
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }) as T, [callback, delay]);
}

// Rate limiting utility
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove requests older than the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getRetryAfter(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

// Type definitions
interface UserData {
  id: string
  active_direct_referrals: number
  totalReferrals: number
  availableBalance: number
  createdAt: string
  email: string
  fullName: string
  firstName: string
  lastName: string
  is_active: boolean
  userLevel: string
  pendingEarnings: number
  phoneNumber: string
  phone_verified: boolean
  referralCode: string
  totalEarned: number
  totalWithdrawn: number
  username: string
  accountStatus: string
  last_login?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  rateLimited: boolean;
  retryAfter: number;
  refreshUserData: () => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  // Rate limiter instance
  const rateLimiterRef = useRef(new RateLimiter(3, 60000)); // 3 requests per minute
  const lastRequestRef = useRef<number>(0);
  const pendingRequestRef = useRef<Promise<void> | null>(null);

  // Fetch user data with rate limiting and retry logic
  const fetchUserData = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (pendingRequestRef.current) {
      return pendingRequestRef.current;
    }

    // Check rate limiting
    if (!rateLimiterRef.current.canMakeRequest()) {
      const retryAfterMs = rateLimiterRef.current.getRetryAfter();
      setRateLimited(true);
      setRetryAfter(Math.ceil(retryAfterMs / 1000));
      setError('Too many requests. Please wait before trying again.');
      setLoading(false);

      // Auto-retry after rate limit expires
      setTimeout(() => {
        setRateLimited(false);
        setRetryAfter(0);
        fetchUserData();
      }, retryAfterMs);

      return;
    }

    // Minimum time between requests (500ms)
    const timeSinceLastRequest = Date.now() - lastRequestRef.current;
    if (timeSinceLastRequest < 500) {
      await new Promise(resolve => setTimeout(resolve, 500 - timeSinceLastRequest));
    }

    const request = (async () => {
      try {
        setError(null);
        setRateLimited(false);
        lastRequestRef.current = Date.now();

        const response = await fetch(apiUrl('/user/profile'), {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 429) {
            const retryAfterHeader = response.headers.get('Retry-After');
            const retrySeconds = retryAfterHeader ? parseInt(retryAfterHeader) : 60;

            setRateLimited(true);
            setRetryAfter(retrySeconds);
            setError(`Too many requests. Please wait ${retrySeconds} seconds.`);

            // Auto-retry after the specified time
            setTimeout(() => {
              setRateLimited(false);
              setRetryAfter(0);
              fetchUserData();
            }, retrySeconds * 1000);

            return;
          }

          if (response.status === 401) {
            setUserData(null);
            setError(null);
            return;
          }

          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<UserData> = await response.json();

        if (result.success && result.data) {
          const processedData = processUserData(result.data);
          setUserData(processedData);
        } else {
          setError(result.error || 'Failed to fetch user data');
          setUserData(null);
        }
      } catch (err: any) {
        setError(err.message || 'Network error occurred');
        setUserData(null);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
        pendingRequestRef.current = null;
      }
    })();

    pendingRequestRef.current = request;
    return request;
  }, []);

  // Debounced version of fetchUserData
  const debouncedFetchUserData = useDebounce(fetchUserData, 300);

  // Public refresh method
  const refreshUserData = useCallback(async () => {
    if (rateLimited) {
      console.log('Rate limited, skipping refresh');
      return;
    }

    setLoading(true);
    await fetchUserData();
  }, [fetchUserData, rateLimited]);

  // Update user data with retry logic
  const updateUserData = useCallback(async (updates: Partial<UserData>) => {
    if (!userData || rateLimited) {
      setError(rateLimited ? 'Rate limited. Please wait.' : 'User not authenticated');
      return;
    }

    try {
      setError(null);

      const response = await fetch(apiUrl('/user/update'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfterHeader = response.headers.get('Retry-After');
          const retrySeconds = retryAfterHeader ? parseInt(retryAfterHeader) : 60;
          setRateLimited(true);
          setRetryAfter(retrySeconds);
          setError(`Too many requests. Please wait ${retrySeconds} seconds.`);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<UserData> = await response.json();

      if (result.success && result.data) {
        const processedData = processUserData(result.data);
        setUserData(processedData);
      } else {
        setError(result.error || 'Failed to update user data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
      console.error('Error updating user data:', err);
    }
  }, [userData, rateLimited]);

  // Initial fetch with delay to prevent immediate rate limiting
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedFetchUserData();
    }, 100); // Small delay to prevent immediate requests on mount

    return () => clearTimeout(timer);
  }, [debouncedFetchUserData]);

  // Reduced polling frequency and smarter polling
  useEffect(() => {
    if (!userData || rateLimited) return;

    // Longer polling interval to reduce server load
    const interval = setInterval(() => {
      if (!document.hidden && !rateLimited) {
        debouncedFetchUserData();
      }
    }, 60000); // Poll every 60 seconds instead of 30

    return () => clearInterval(interval);
  }, [userData, rateLimited, debouncedFetchUserData]);

  // Page visibility with debouncing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userData && !rateLimited) {
        debouncedFetchUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userData, rateLimited, debouncedFetchUserData]);

  // Countdown for retry timer
  useEffect(() => {
    if (retryAfter > 0) {
      const interval = setInterval(() => {
        setRetryAfter(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [retryAfter]);

  const contextValue: UserContextType = {
    userData,
    loading,
    error,
    rateLimited,
    retryAfter,
    refreshUserData,
    updateUserData,
    isAuthenticated: !!userData,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};