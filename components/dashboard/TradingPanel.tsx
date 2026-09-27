"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TrendingUp, Wallet, Users } from "lucide-react";
import { toast } from "sonner";
import { useGetMarketActivities, useGetMarketOrders } from "@/hooks/markets";
import { useGetLiveRate, useGetWalletBalance } from "@/hooks/user";
import { useAuth } from "@/context/auth-provider";
import { PlacePositionDrawer } from "./PlacePositionDrawer";
import { OrderTypes } from "@/types/market";
import { isMultiOutcomeMarket } from "@/types/market";
import { Check } from "lucide-react";
import { SellConfirmation } from "./SellConfirm";
import Link from "next/link";
import { useGetUserInfo } from "@/hooks/user";

const OUTCOME_BUTTON_COLORS = [
  {
    selected:
      "bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.2)]",
    unselected: "bg-white/[0.02] border-white/5 hover:border-white/10",
    text: "text-blue-400",
    bar: "bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.8)]",
  },
  {
    selected:
      "bg-purple-600/20 border-purple-500 shadow-[0_0_30px_rgba(147,51,234,0.2)]",
    unselected: "bg-white/[0.02] border-white/5 hover:border-white/10",
    text: "text-purple-400",
    bar: "bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.8)]",
  },
  {
    selected:
      "bg-amber-600/20 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]",
    unselected: "bg-white/[0.02] border-white/5 hover:border-white/10",
    text: "text-amber-400",
    bar: "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]",
  },
  {
    selected:
      "bg-emerald-600/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    unselected: "bg-white/[0.02] border-white/5 hover:border-white/10",
    text: "text-emerald-400",
    bar: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]",
  },
  {
    selected:
      "bg-rose-600/20 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.2)]",
    unselected: "bg-white/[0.02] border-white/5 hover:border-white/10",
    text: "text-rose-400",
    bar: "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]",
  },
];

interface TradingPanelProps {
  market: any;
  userBalance?: number;
  userId?: string;
}

export const calculatePayout = (
  side: "buy" | "sell",
  amount: number,
  totalBuy: number,
  totalSell: number,
) => {
  const totalWinningSide = side === "buy" ? totalBuy : totalSell;
  const totalLosingSide = side === "buy" ? totalSell : totalBuy;

  // Guard: no winning side
  if (totalWinningSide === 0)
    return { payout: amount, profit: 0, returnPercent: 0 };

  const sharePercent = amount / totalWinningSide;

  // Payout = your stake back + your share of the losing side
  const payout = amount + sharePercent * totalLosingSide;
  const profit = payout - amount; // = sharePercent * totalLosingSide
  const returnPercent = (profit / amount) * 100;

  return { payout, profit, returnPercent };
};

export default function TradingPanel({ market }: TradingPanelProps) {
  const isMulti = isMultiOutcomeMarket(market);
  const { data: rate } = useGetLiveRate();
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [selectedOutcome, setSelectedOutcome] = useState<"buy" | "sell">("buy");
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string | null>(
    isMulti && market.outcomes?.length > 0 ? market.outcomes[0].id : null,
  );
  const [units, setUnits] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: profile } = useGetUserInfo();
  const { data: userBalance, refetch: refetchBalance } = useGetWalletBalance();
  const { refetch, data: myOrders } = useGetMarketOrders(
    market.id,
    profile?.id,
  );
  const { refetch: refetchActivities } = useGetMarketActivities(market.id);

  const NGN_USD_RATE = rate?.rate || 1500;

  const { isAccess } = useAuth();

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const numericUnits = Number(units);

  const handleSell = async () => {
    setConfirmOpen(false);
    setSelectedOrders([]);
    refetch();
    refetchActivities();
    refetchBalance();
  };

  const toggleOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id],
    );
  };

  const totalSelected = myOrders
    ?.filter((o: any) => selectedOrders.includes(o.id))
    ?.reduce((sum: number, o: any) => sum + o.amount, 0);

  const handleTrade = async () => {
    const totalStakeUsd = Math.round(numericUnits * 100) / 100;
    const balance = Math.round((userBalance?.balance || 0) * 100) / 100;

    // if (
    //   market.outcome ||
    //   market.resolved ||
    //   new Date(market.closing_time + "Z") < new Date()
    // ) {
    //   toast.error("Market is closed for trading.");
    //   return;
    // }

      if (totalStakeUsd > balance) {
        toast.error(`Insufficient balance. Need $${totalStakeUsd.toFixed(2)}`);
        return;
      }

    if (!isAccess) {
      toast.error("Kindly login to place a trade.");
      return;
    }

    if (numericUnits <= 0) {
      toast.error("Please enter a valid amount to trade.");
      return;
    }

    if (numericUnits < 0.1) {
      toast.error("Minimum stake amount is $0.10.");
      return;
    }

    if (numericUnits > 1000) {
      toast.error("Maximum stake amount is $1,000.00.");
      return;
    }

    try {
      setLoading(true);

      const body: any = {
        market_id: market.id,
        side: isMulti ? "buy" : selectedOutcome,
        amount: units,
      };

      if (isMulti && selectedOutcomeId) {
        body.outcome_id = selectedOutcomeId;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail);

      router.refresh();
      refetch();
      refetchActivities();
      refetchBalance();
      setUnits("");

      if (isMulti) {
        const outcomeName =
          market.outcomes.find((o: any) => o.id === selectedOutcomeId)?.name ||
          "";
        toast.success(`Order placed on "${outcomeName}" successfully!`);
      } else {
        toast.success(
          ` ${selectedOutcome.toUpperCase()} Order placed successfully!`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Render multi-outcome buy panel
  const renderMultiOutcomeBuyPanel = () => (
    <div>
      {/* Outcome Selection */}
      <div className="mb-4">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
          Select Outcome
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2" data-tour="trading-outcome">
          {market.outcomes.map((outcome: any, idx: number) => {
            const isSelected = selectedOutcomeId === outcome.id;
            const color =
              OUTCOME_BUTTON_COLORS[idx % OUTCOME_BUTTON_COLORS.length];

            return (
              <button
                key={outcome.id}
                onClick={() => setSelectedOutcomeId(outcome.id)}
                className={`group relative min-w-[230px] p-5 rounded-[1rem] border-2 transition-all duration-500 overflow-hidden flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed ${
                  isSelected ? color.selected : color.unselected
                }`}
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="text-left">
                    <div
                      className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors duration-500 ${
                        isSelected ? color.text : "text-slate-500"
                      }`}
                    >
                      {outcome.name}
                    </div>
                    <div className="text-[8px] font-bold text-slate-600 uppercase">
                      {outcome.percentage}% chance
                    </div>
                  </div>
                  <div className="text-2xl font-mono font-black text-white tracking-tighter">
                    {outcome.quota.toFixed(2)}
                  </div>
                </div>

                {isSelected && (
                  <div
                    className={`absolute inset-x-0 bottom-0 h-1 ${color.bar}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unit Selector */}
      <div className="mb-4 space-y-4">
        <div className="space-y-3">
          {/* Preset chips */}
          <div className="flex items-center gap-2">
            {[
              0.5,
              1,
              5,
              10,
              { label: "Max", value: userBalance?.balance || "0" },
            ].map((preset) => (
              <button
                key={typeof preset === "object" ? "max" : preset}
                onClick={() =>
                  setUnits(
                    typeof preset === "object"
                      ? String(preset.value)
                      : String(preset),
                  )
                }
                className={`flex-1 h-10 rounded-xl border font-mono font-black text-xs transition-colors ${
                  units === (typeof preset === "object" ? preset.value : preset)
                    ? "bg-white text-black border-white"
                    : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                }`}
              >
                {typeof preset === "object" ? preset.label : preset}
              </button>
            ))}
          </div>
          {/* Custom input */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/5 h-12">
            <input
              type="text"
              value={units}
              onChange={(e) => {
                const value = e.target.value;

                // Allow only numbers + one decimal point
                if (/^\d*\.?\d*$/.test(value)) {
                  setUnits(value);
                }
              }}
              placeholder="Enter amount"
              className="w-full h-full bg-transparent font-mono font-black text-base text-white text-center outline-none"
            />
          </div>
        </div>
      </div>

      {/* User Balance */}
      <div className="mb-4 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <Wallet className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Available Balance
          </span>
        </div>
        <div className="text-sm font-mono font-bold text-white">
          ${userBalance?.balance.toFixed(2) || "0.00"}
        </div>
      </div>

      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={loading || !selectedOutcomeId}
        data-tour="trading-execute"
        className="group relative w-full py-5 rounded-2xl font-black text-white uppercase tracking-[0.2em] transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0  bg-blue-600 animate-gradient-slow" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Execute Order
            </>
          )}
        </span>
      </button>
    </div>
  );

  // Render binary buy panel (existing)
  const renderBinaryBuyPanel = () => (
    <div>
      {/* Outcome Selection */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"
        data-tour="trading-outcome"
      >
        <button
          onClick={() => setSelectedOutcome("buy")}
          className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden ${
            selectedOutcome === "buy"
              ? "bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              : "bg-white/[0.02] border-white/5 hover:border-white/10"
          }`}
        >
          <div className="relative z-10 text-center">
            <div
              className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors duration-500 ${selectedOutcome === "buy" ? "text-blue-400" : "text-slate-500"}`}
            >
              Buy: Yes
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tighter">
              {market.buy_quota.toFixed(2)}
            </div>
            <div className="text-[8px] font-bold text-slate-600 uppercase mt-1">
              Order
            </div>
          </div>
          {selectedOutcome === "buy" && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
          )}
        </button>

        <button
          onClick={() => setSelectedOutcome("sell")}
          className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden ${
            selectedOutcome === "sell"
              ? "bg-red-600/20 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
              : "bg-white/[0.02] border-white/5 hover:border-white/10"
          }`}
        >
          <div className="relative z-10 text-center">
            <div
              className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors duration-500 ${selectedOutcome === "sell" ? "text-red-400" : "text-slate-500"}`}
            >
              Buy: No
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tighter">
              {market.sell_quota.toFixed(2)}
            </div>
            <div className="text-[8px] font-bold text-slate-600 uppercase mt-1">
              Order
            </div>
          </div>
          {selectedOutcome === "sell" && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          )}
        </button>
      </div>

      {/* Unit Selector */}
      <div className="mb-4 space-y-4">
        <div className="space-y-3">
          {/* Preset chips */}
          <div className="flex items-center gap-2">
            {[0.5, 1, 5, 10, { label: "Max", value: userBalance?.balance }].map(
              (preset) => (
                <button
                  key={typeof preset === "object" ? "max" : preset}
                  onClick={() =>
                    setUnits(
                      typeof preset === "object"
                        ? String(preset.value)
                        : String(preset),
                    )
                  }
                  className={`flex-1 h-10 rounded-xl border font-mono font-black text-xs transition-colors ${
                    units ===
                    (typeof preset === "object" ? preset.value : preset)
                      ? "bg-white text-black border-white"
                      : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {typeof preset === "object" ? preset.label : preset}
                </button>
              ),
            )}
          </div>
          {/* Custom input */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/5 h-12">
            <input
              type="text"
              value={units}
              onChange={(e) => {
                const value = e.target.value;

                // allow numbers + one decimal point
                if (/^\d*\.?\d*$/.test(value)) {
                  setUnits(value);
                }
              }}
              placeholder="Enter amount"
              className="w-full h-full bg-transparent font-mono font-black text-base text-white text-center outline-none"
            />
          </div>
        </div>
      </div>

      {/* User Balance */}
      <div className="mb-4 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500">
          <Wallet className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Available Balance
          </span>
        </div>
        <div className="text-sm font-mono font-bold text-white">
          ${userBalance?.balance.toFixed(2) || "0.00"}
        </div>
      </div>

      {numericUnits > 0 && (
        <div className="mb-4 px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 animate-slide-up">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
            Potential Payout
          </div>

          {(() => {
            const totalBuy =
              market.total_buy + (selectedOutcome === "buy" ? numericUnits : 0);
            const totalSell =
              market.total_sell +
              (selectedOutcome === "sell" ? numericUnits : 0);
            const { payout, profit, returnPercent } = calculatePayout(
              selectedOutcome,
              numericUnits,
              totalBuy,
              totalSell,
            );

            return (
              <>
                <div className="flex items-center justify-between transition-all duration-300">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    If {selectedOutcome === "buy" ? "Yes" : "No"} wins
                  </span>
                  <span className="text-sm font-mono font-black text-white tabular-nums transition-all duration-300">
                    ${payout.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between transition-all duration-300">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Profit
                  </span>
                  <span
                    className={`text-sm font-mono font-black tabular-nums transition-all duration-300 ${profit >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between transition-all duration-300">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Return
                  </span>
                  <span
                    className={`text-sm font-mono font-black tabular-nums transition-all duration-300 ${returnPercent >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {returnPercent >= 0 ? "+" : ""}
                    {Math.floor(returnPercent)}%
                  </span>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Trade Button */}
      <button
        onClick={handleTrade}
        disabled={loading}
        data-tour="trading-execute"
        className="group relative w-full py-5 rounded-2xl font-black text-white uppercase tracking-[0.2em] transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0  bg-blue-600 animate-gradient-slow" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Execute Order
            </>
          )}
        </span>
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block">
        <div className="bg-[#0a0a0b]/60 backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden w-full">
          {/* Tab switcher — show for all markets */}
          <div
            className="flex items-center gap-1 bg-white/[0.03] p-1 mb-4 rounded-2xl border border-white/5"
            data-tour="trading-tabs"
          >
            {(["buy", "sell"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "bg-white text-black w-full"
                    : "text-slate-500 hover:text-white w-full"
                }`}
              >
                {tab === "buy" ? "Buy" : "Sell"}
              </button>
            ))}
          </div>

          {/* Render Panels */}
          {activeTab === "buy" ? (
            isMulti ? (
              renderMultiOutcomeBuyPanel()
            ) : (
              renderBinaryBuyPanel()
            )
          ) : (
            <div>
              {isAccess ? (
                <div className="mb-4 space-y-4">
                  {myOrders?.length > 0 ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                            My Orders
                          </span>
                          <button
                            onClick={() =>
                              selectedOrders?.length === myOrders.length
                                ? setSelectedOrders([])
                                : setSelectedOrders(
                                    myOrders.map((o: any) => o.id),
                                  )
                            }
                            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                          >
                            {selectedOrders?.length === myOrders.length
                              ? "Deselect All"
                              : "Select All"}
                          </button>
                        </div>

                        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                          {myOrders.map((item: OrderTypes) => {
                            const isSelected = selectedOrders.includes(item.id);
                            return (
                              <div
                                key={item.id}
                                onClick={() => toggleOrder(item.id)}
                                className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 min-w-[280px] cursor-pointer ${
                                  isSelected
                                    ? item.side === "buy"
                                      ? "bg-blue-500/30 border-blue-400"
                                      : "bg-red-500/30 border-red-400"
                                    : item.side === "buy"
                                      ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                                      : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                                }`}
                              >
                                {/* Selected checkmark */}
                                {isSelected && (
                                  <div
                                    className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${
                                      item.side === "buy"
                                        ? "bg-blue-400"
                                        : "bg-red-400"
                                    }`}
                                  >
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}

                                <div className="relative z-10 flex items-center justify-between">
                                  <div>
                                    <div
                                      className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${
                                        item.side === "buy"
                                          ? "text-blue-400"
                                          : "text-red-400"
                                      }`}
                                    >
                                      {isMulti
                                        ? `BUY ${item.outcome_name || "POSITION"}`
                                        : `${item.side === "buy" ? "BUY" : "SELL"} Position`}
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1">
                                      <div className="text-2xl font-mono font-black text-white">
                                        $
                                        {item.amount
                                          .toFixed(2)
                                          .toLocaleString()}
                                      </div>
                                      <span
                                        className={`${
                                          item.side === "buy"
                                            ? "text-blue-400/60"
                                            : "text-red-400/60"
                                        } text-[10px] font-black uppercase`}
                                      >
                                        ≈ ₦
                                        {(
                                          item.amount * NGN_USD_RATE
                                        ).toLocaleString("en-NG", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">
                                      {Math.floor((item.quota / 100) * 100) /
                                        100}{" "}
                                      QUOTA @ $1
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Bottom action bar */}
                        {selectedOrders?.length > 0 && (
                          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 gap-4">
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                {selectedOrders?.length} order
                                {selectedOrders?.length > 1 ? "s" : ""} selected
                              </div>
                              <div className="flex gap-1">
                                <div className="text-xl font-mono font-black text-white mt-0.5">
                                  ${totalSelected.toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => setSelectedOrders([])}
                                className="px-4 py-2 rounded-xl w-full text-[11px] font-black uppercase tracking-widest border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => setConfirmOpen(true)}
                                className="px-5 py-2 rounded-xl w-full text-[11px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-400 text-white transition-all"
                              >
                                Sell Selected
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 text-center py-12 text-slate-600 text-sm font-black uppercase tracking-widest">
                      No activities yet
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-3">
                      Sell Quotes
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                      Your orders are waiting — sign in to trade
                    </p>
                    <Link
                      href={`/login?next=${encodeURIComponent(pathname)}`}
                      className="block w-full py-4 rounded-xl bg-gradient-to-r bg-blue-600 text-white font-black uppercase shadow-lg hover:shadow-blue-500/40 transition-all hover:-translate-y-1"
                    >
                      Sign in
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 lg:hidden w-full left-0 right-0">
        <div className="bg-[#0d0d0f]/80 w-full backdrop-blur-2xl border-y border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] py-3 px-4">
          <PlacePositionDrawer
            market={market}
            userBalance={userBalance}
            units={units}
            setUnits={setUnits}
            loading={loading}
            handleTrade={handleTrade}
            setSelectedOutcome={setSelectedOutcome}
            selectedOutcomeId={selectedOutcomeId}
            setSelectedOutcomeId={setSelectedOutcomeId}
          />
        </div>
      </div>

      <SellConfirmation
        open={confirmOpen}
        market={market}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSell}
        selectedOrders={
          myOrders?.filter((o: any) => selectedOrders.includes(o.id)) ?? []
        }
        NGN_USD_RATE={NGN_USD_RATE}
      />
    </>
  );
}
