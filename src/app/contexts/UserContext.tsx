// contexts/UserContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { UserData, ApiResponse } from '../types/user';

interface UserContextType {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
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
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('user_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setUserId(parsed.id);
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        setError('Invalid stored user data');
        setLoading(false);
      }
    } else {
      setError('No user data found');
      setLoading(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const response = await fetch(`/api/user/profile?userId=${userId}`);
      const result: ApiResponse<UserData> = await response.json();

      if (result.success && result.data) {
        setUserData(result.data);
        // Update localStorage with fresh data
        localStorage.setItem('userData', JSON.stringify(result.data));
      } else {
        setError(result.error || 'Failed to fetch user data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateUserData = useCallback(async (updates: Partial<UserData>) => {
    if (!userId) return;

    try {
      setError(null);
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, updates }),
      });

      const result: ApiResponse<UserData> = await response.json();

      if (result.success && result.data) {
        setUserData(result.data);
        localStorage.setItem('userData', JSON.stringify(result.data));
      } else {
        setError(result.error || 'Failed to update user data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error updating user data:', err);
    }
  }, [userId]);

  // Set up real-time polling
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchUserData();

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchUserData();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [userId, fetchUserData]);

  // Set up page visibility API for efficient polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        fetchUserData(); // Fetch fresh data when user returns to tab
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId, fetchUserData]);

  const contextValue: UserContextType = {
    userData,
    loading,
    error,
    refreshUserData: fetchUserData,
    updateUserData,
    isAuthenticated: !!userData && !!userId,
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