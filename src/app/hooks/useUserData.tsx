// hooks/useUserData.ts
import { useUser } from '../contexts/UserContext';
import { useMemo } from 'react';

export const useUserData = () => {
  const { userData, loading, error, refreshUserData, updateUserData, isAuthenticated } = useUser();

  const computedData = useMemo(() => {
    if (!userData) return null;

    return {
      // Basic info
      firstName: userData.full_name.split(' ')[0],
      displayBalance: userData.available_balance || userData.total_earnings,
      email: userData.email,
      
      // Membership level display
      membershipLevel: {
        name: userData.membership_level.charAt(0).toUpperCase() + userData.membership_level.slice(1),
        color: getMembershipColor(userData.membership_level),
        isActive: userData.is_active
      },

      // Financial summary
      financials: {
        available: userData.available_balance,
        pending: userData.pending_balance,
        total: userData.total_earnings,
        totalValue: userData.available_balance + userData.pending_balance,
        canWithdraw: userData.is_active && userData.available_balance >= 1000
      },

      // Referral info
      referrals: {
        active: userData.active_direct_referrals,
        code: userData.referral_code,
        earnings: userData.active_direct_referrals * 300 // Assuming KSH 300 per referral
      },

      // Account status
      status: {
        isActive: userData.is_active,
        isPhoneVerified: userData.phone_verified,
        needsActivation: !userData.is_active,
      }
    };
  }, [userData]);

  return {
    userData,
    computedData,
    loading,
    error,
    refreshUserData,
    updateUserData,
    isAuthenticated
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