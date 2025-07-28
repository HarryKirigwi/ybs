// hooks/useUserData.ts
import { useUser } from '../contexts/UserContext';
import { useMemo } from 'react';

export const useUserData = () => {
  const { 
    userData, 
    loading, 
    error, 
    rateLimited, 
    retryAfter, 
    refreshUserData, 
    updateUserData, 
    isAuthenticated 
  } = useUser();

  const computedData = useMemo(() => {
    if (!userData) return null;

    return {
      // Basic info - Updated to match your UserData interface
      firstName: userData.fullName?.split(' ')[0] || `${userData.firstName}`, // Extract first name from fullName
      displayBalance: userData.availableBalance || userData.totalEarned,
      email: userData.email,
      
      // Membership level display - Updated field name
      membershipLevel: {
        name: userData.userLevel.charAt(0).toUpperCase() + userData.userLevel.slice(1),
        color: getMembershipColor(userData.userLevel),
        isActive: userData.accountStatus === 'ACTIVE', // Updated field name and value
      },

      // Financial summary - Updated field names
      financials: {
        available: userData.availableBalance,
        pending: userData.pendingEarnings, // Updated field name
        total: userData.totalEarned,
        withdrawn: userData.totalWithdrawn, // Added withdrawn amount
        // totalValue: (userData.availableBalance + userData.pendingEarnings),
        canWithdraw: userData.is_active && userData.availableBalance >= 1000
      },

      // Referral info - Updated field names
      referrals: {
        active: userData.active_direct_referrals, // Updated field name
        total: userData.totalReferrals, // Added total referrals
        code: userData.referralCode,
        earnings: userData.totalEarned // Assuming this includes referral earnings
      },

      // Account status - Updated field names
      status: {
        isActive: userData.is_active,
        isPhoneVerified: userData.phone_verified,
        needsActivation: !userData.is_active,
        accountStatus: userData.accountStatus, // Added account status
        needsPhoneVerification: !userData.phone_verified
      }
    };
  }, [userData]);

  // Enhanced return object with rate limiting states
  return {
    userData,
    computedData,
    loading,
    error,
    rateLimited, // New: indicates if requests are being rate limited
    retryAfter, // New: seconds until next retry is allowed
    refreshUserData,
    updateUserData,
    isAuthenticated,
    
    // Convenience computed states
    isLoading: loading || rateLimited, // Combined loading state
    canRefresh: !loading && !rateLimited, // Can user manually refresh?
    hasError: !!error && !rateLimited, // Has non-rate-limit error
    
    // Quick access to common user properties
    userDisplayName: userData?.fullName || 'User',
    userBalance: userData?.availableBalance || 0,
    userLevel: userData?.userLevel || 'inactive',
    isVerified: userData?.phone_verified || false,
  };
};

const getMembershipColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'inactive': return 'text-gray-500';
    case 'bronze': return 'text-amber-600';
    case 'silver': return 'text-gray-400';
    case 'gold': return 'text-yellow-500';
    case 'platinum': return 'text-purple-500';
    default: return 'text-gray-500';
  }
};

// Additional utility functions for common operations
export const useUserActions = () => {
  const { updateUserData, refreshUserData, canRefresh } = useUserData();

  const updateProfile = async (profileData: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  }) => {
    if (!canRefresh) return { success: false, error: 'Cannot update profile right now' };
    
    try {
      await updateUserData(profileData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const forceRefresh = async () => {
    if (!canRefresh) return { success: false, error: 'Cannot refresh right now' };
    
    try {
      await refreshUserData();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    updateProfile,
    forceRefresh,
    canRefresh
  };
};

// Hook for financial operations
export const useUserFinancials = () => {
  const { computedData, userData } = useUserData();

  return useMemo(() => {
    if (!computedData || !userData) {
      return {
        available: 0,
        pending: 0,
        total: 0,
        withdrawn: 0,
        canWithdraw: false,
        withdrawalLimit: 1000,
        formattedAvailable: '$0.00',
        formattedPending: '$0.00',
        formattedTotal: '$0.00'
      };
    }

    const { financials } = computedData;

    return {
      ...financials,
      withdrawalLimit: 1000,
      formattedAvailable: `$${financials.available.toLocaleString()}`,
      formattedPending: `$${financials.pending.toLocaleString()}`,
      formattedTotal: `$${financials.total.toLocaleString()}`,
      formattedWithdrawn: `$${financials.withdrawn.toLocaleString()}`
    };
  }, [computedData, userData]);
};

// Hook for referral operations
export const useUserReferrals = () => {
  const { computedData, userData } = useUserData();

  return useMemo(() => {
    if (!computedData || !userData) {
      return {
        active: 0,
        total: 0,
        code: '',
        earnings: 0,
        shareUrl: '',
        formattedEarnings: '$0.00'
      };
    }

    const { referrals } = computedData;
    const shareUrl = `${window.location.origin}/register?ref=${referrals.code}`;

    return {
      ...referrals,
      shareUrl,
      formattedEarnings: `$${referrals.earnings.toLocaleString()}`
    };
  }, [computedData, userData]);
};