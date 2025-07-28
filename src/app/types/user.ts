// types/user.ts
export interface UserData {
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


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
