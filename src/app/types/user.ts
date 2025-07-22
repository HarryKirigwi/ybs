// types/user.ts
export interface UserData {
  id: string;
  active_direct_referrals: number;
  available_balance: number;
  created_at: string;
  full_name: string;
  is_active: boolean;
  membership_level: string;
  pending_balance: number;
  phone_number: string;
  phone_verified: boolean;
  referral_code: string;
  total_earnings: number;
  username: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
