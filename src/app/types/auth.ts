export interface RegisterData {
  phoneNumber: string; // Primary identifier
  email: string; // Only for recovery
  password: string;
  fullName: string;
  username: string;
  referralCode?: string;
}

export interface LoginData {
  phoneNumber: string;
  password: string;
}