export interface Profile {
  id: string
  phone_number: string
  full_name: string
  username: string
  referral_code: string
  referred_by?: string
  is_active: boolean
  activation_paid_at?: string
  total_earnings: number
  available_balance: number
  pending_balance: number
  membership_level: 'inactive' | 'silver' | 'bronze' | 'gold'
  active_direct_referrals: number
  phone_verified: boolean
  created_at: string
  updated_at: string
}

export interface ActivationPayment {
  id: string
  user_id: string
  amount: number
  payment_method: string
  payment_reference: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  paid_at?: string
}