export type OrderUserTypes = {
  id: string;
  email: string;
  last_name: string;
  first_name: string;
  created_at: string;
  updated_at: string;
};

export type OrderTypes = {
  id: string;
  side: "buy" | "sell";
  quota: number;
  amount: number;
  active: boolean;
  user: OrderUserTypes;
  created_at: string;
  updated_at: string;
  outcome_name: string;
};

type ActivityType = "buy_yes" | "buy_no" | "sell_yes" | "sell_no";
export interface Activity {
  id: string;
  type: ActivityType;
  order: OrderTypes;
  created_at: string;
  updated_at: string;
}

// Multi-outcome market types
export interface MarketOutcome {
  id: string;
  name: string;
  volume: number;
  percentage: number;
  quota: number;
}

export interface MultiOutcomeMarket {
  id: string;
  active: boolean;
  question: string;
  description: string;
  market_type: "multi-outcome";
  asset: string;
  category: string;
  data_source: string;
  closing_time: string;
  resolution_time: string;
  created_at: string;
  updated_at: string;
  resolved: boolean;
  outcome: string | null;
  orders_count: number;
  orders_volume: number;
  participants_count: number;
  outcomes: MarketOutcome[];
}

// Helper to check if a market is multi-outcome
export function isMultiOutcomeMarket(market: any): market is MultiOutcomeMarket {
  return market?.market_type === "multi-outcome" || Array.isArray(market?.outcomes);
}