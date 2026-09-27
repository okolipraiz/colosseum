export type SignInInputsTypes = {
  email: string;
  password: string;
};

export interface SignUpInputsTypes extends SignInInputsTypes {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  country: string;
  confirmPassword: string;
  referral_code?: string;
}

export type VerifyInputType = {
  email: string;
  code: string;
};

export type ForgotPasswordTypes = {
  email: string;
};

export interface ReferredUserItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface AffiliateWithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface UserAffiliateDashboard {
  affiliate_code: string | null;
  referral_link: string;
  affiliate_balance: number;
  static_affiliate_balance: number;
  dynamic_affiliate_balance: number;
  total_referrals: number;
  custom_referral_signup_bonus: number | null;
  custom_affiliate_fee_share_percentage: number | null;
  effective_signup_bonus: number;
  effective_fee_share_percentage: number;
  static_referral_enabled: boolean;
  dynamic_referral_enabled: boolean;
  recent_referrals: ReferredUserItem[];
  withdrawal_history: AffiliateWithdrawalRequest[];
}