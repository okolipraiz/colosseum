"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, TrendingUp, DollarSign, Info } from "lucide-react";
import axios from "axios";

interface YieldSummary {
  is_yield_bearing: boolean;
  yield_pool_id?: string;
  pool_name?: string;
  vault_address?: string;
  apy: number;
  tvl: number;
  yield_strategy: string;
  splits?: {
    treasury_pct: number;
    insurance_pct: number;
    depositor_yield_pct: number;
  };
}

interface YieldShieldCardProps {
  marketId: string;
  userStake?: number;
}

export function YieldShieldCard({ marketId, userStake = 100 }: YieldShieldCardProps) {
  const [yieldData, setYieldData] = useState<YieldSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchYieldData() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";
        const res = await axios.get(`${baseUrl}/markets/${marketId}/yield`);
        setYieldData(res.data);
      } catch (e) {
        console.warn("Could not fetch yield metrics for market:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchYieldData();
  }, [marketId]);

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-900/60 border border-slate-800 rounded-xl p-4 my-4">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-slate-800/60 rounded w-2/3"></div>
      </div>
    );
  }

  if (!yieldData || !yieldData.is_yield_bearing) {
    return null;
  }

  // Projected 6-month estimated yield share calculation
  const apy = yieldData.apy || 8.5;
  const estimatedAnnualYield = userStake * (apy / 100);
  const depositorCut = (yieldData.splits?.depositor_yield_pct || 70) / 100;
  const projectedUserYield = (estimatedAnnualYield * 0.5 * depositorCut).toFixed(2);

  return (
    <div className="relative overflow-hidden bg-[#0d0d0f]/60 border border-white/10 backdrop-blur-md rounded-[2rem] p-6 shadow-xl my-5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-base">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span>Yield-Protected Market</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mt-0.5">
              Yield Integration
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-extrabold text-blue-300">{apy.toFixed(1)}% APY</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        Stakes placed in this market earn continuous yield in yield vaults. Accrued yield provides a
        <strong className="text-blue-300"> loss cushion for losers</strong> and a
        <strong className="text-blue-300"> yield bonus for winners</strong>!
      </p>

      {/* Yield Calculator Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 border border-white/5 rounded-xl p-4 text-xs">
        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Yield Strategy</span>
          <span className="font-semibold text-slate-200 capitalize">
            {yieldData.yield_strategy.replace(/_/g, " ")}
          </span>
        </div>

        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Forecast Treasury Cut</span>
          <span className="font-semibold text-blue-400 font-mono">
            {yieldData.splits?.treasury_pct || 20}% Fee
          </span>
        </div>

        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Est. User Yield (+${userStake})</span>
          <span className="font-mono text-blue-400 font-extrabold flex items-center gap-1">
            +${projectedUserYield} USD
          </span>
        </div>
      </div>
    </div>
  );
}
