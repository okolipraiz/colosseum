export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  origin_app: "forecast";
  created_at: string; // ISO string
  wallet_balance: number;
}

export interface GetUsersResponse {
  total_forecast_users: number;
  users: User[];
}
export type MarketType = "financial" | "non-financial" | "multi-outcome";

export interface MarketOutcome {
  name: string;
  initial_price: number;
}

export interface MarketOutcome {
  name: string;
  initial_price: number;
}

export interface CreateMarketPayload {
  question: string;
  is_trending: boolean;
  description: string;
  asset: string;
  category: string;
  data_source: string;
  closing_time: string;
  resolution_time: string;
  market_type: MarketType;
  active?: boolean;
  current_price?: number;
  strike_price?: number;
  outcomes?: MarketOutcome[];
  yield_pool_id?: string | null;
  yield_strategy?: string;
}

export interface ReferrerInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  affiliate_code?: string;
}

export interface ReferredUserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  wallet_balance: number;
  static_balance: number;
  referrer: ReferrerInfo;
}

export interface ReferralsResponse {
  total_referred_users: number;
  total_with_static_balance: number;
  referrals: ReferredUserInfo[];
}

export interface AuditLogInfo {
  id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  action: string;
  details: string;
  created_at: string;
}

export interface AuditLogsResponse {
  total_logs: number;
  logs: AuditLogInfo[];
}

export interface UserMin {
  email: string;
  first_name: string;
  last_name: string;
}

export interface AffiliateWithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  user?: UserMin;
}