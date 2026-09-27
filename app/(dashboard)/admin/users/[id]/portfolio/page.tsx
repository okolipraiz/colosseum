"use client";

import {
  TrendingUp,
  Award,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import ShareWinModal from "@/components/dashboard/ShareWinModal";
import { useSearchParams } from "next/navigation";
import {
  useAdminGetUserPortfolio,
  useAdminGetUserAffiliateConfig,
  useAdminUpdateUserAffiliateConfig,
} from "@/hooks/admin/user";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminViewPortfolio() {
  return (
    <AdminGuard requireFullAdmin={true}>
      <AdminViewPortfolioContent />
    </AdminGuard>
  );
}

function AdminViewPortfolioContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const firstName = searchParams.get("firstName");
  const lastName = searchParams.get("lastName");

  const { data: stats, isLoading, error } = useAdminGetUserPortfolio(id);
  const { data: configData, isLoading: isConfigLoading, error: configError } = useAdminGetUserAffiliateConfig(id);
  const { mutate: updateConfig, isPending: isUpdating } = useAdminUpdateUserAffiliateConfig();
  const [activeTab, setActiveTab] = useState<"holdings" | "history">("history");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPayoutTransactionId, setSelectedPayoutTransactionId] =
    useState("");

  const {
    total_p_and_l = 0,
    total_payout = 0,
    total_profit = 0,
    total_investment = 0,
    overall_roi = 0,
    holdings = [],
    history = [],
  } = stats || {};

  return (
    <div className="min-h-screen bg-[#060608] text-white">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ">
        <Link
          href="/admin/users"
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 text-sm font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Exit Portfolio</span>
        </Link>

        {/* Header Title */}
        <div className=" mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white capitalize">
            {firstName} {lastName} Portfolio
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Monitor your predictive assets, returns, and overall ROI
            performance.
          </p>
        </div>

        {isLoading && !stats && (
          <div className=" text-white flex flex-col items-center justify-center gap-4 mt-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="text-sm font-black uppercase tracking-widest text-slate-500">
              Loading your portfolio...
            </span>
          </div>
        )}

        {error && !stats && (
          <div className=" text-white flex flex-col items-center justify-center gap-4 mt-20">
            <p className="text-red-400 font-bold uppercase tracking-wider">
              Failed to load portfolio statistics.
            </p>
            <p className="text-slate-500 text-sm">
              Please refresh the page or try again later.
            </p>
          </div>
        )}

        {!isLoading && stats && (
          <>
            {/* Dynamic Metric Cards */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 scrollbar-none">
              {/* Card 1: Total P&L */}
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-blue-500/30 group min-w-[72vw] md:min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Total P&L
                    </p>
                    <h3
                      className={`text-2xl md:text-3xl font-black mt-3 tracking-tight ${total_p_and_l >= 0 ? "text-emerald-400" : "text-rose-500"}`}
                    >
                      {total_p_and_l >= 1 ? "+" : ""}$
                      {total_p_and_l?.toFixed(2)}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 mt-2 ${overall_roi >= 0 ? "text-emerald-500/80" : "text-rose-500/80"}`}
                    >
                      {overall_roi >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {overall_roi?.toFixed(1)}% ROI
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
              </div>

              {/* Card 2: Profits Made */}
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-emerald-500/30 group min-w-[72vw] md:min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Profits Made
                    </p>
                    <h3 className="text-2xl md:text-3xl font-black mt-3 tracking-tight text-emerald-400">
                      {total_profit ? `+$${total_profit.toFixed(2)}` : "$0.00"}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-2 block">
                      Net earnings from wins
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
              </div>

              {/* Card 3: Total Payout */}
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-purple-500/30 group min-w-[72vw] md:min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Total Payouts
                    </p>
                    <h3 className="text-2xl md:text-3xl font-black mt-3 tracking-tight text-purple-400">
                      {total_payout ? `$${total_payout.toFixed(2)}` : "$0.00"}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-2 block">
                      Gross payouts returned
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
              </div>

              {/* Card 4: Total Traded */}
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-slate-500/30 group min-w-[72vw] md:min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Total Traded
                    </p>
                    <h3 className="text-2xl md:text-3xl font-black mt-3 tracking-tight text-slate-200">
                      {total_investment
                        ? `$${total_investment.toFixed(2)}`
                        : "$0.00"}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-2 block">
                      Total prediction volume
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-300">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-slate-500/10 blur-2xl group-hover:bg-slate-500/20 transition-all duration-500" />
              </div>
            </div>

            {/* Affiliate Configuration Card */}
            <div className="rounded-3xl border border-white/5 bg-[#0d0d0f]/50 backdrop-blur-md p-8 shadow-2xl mb-8">
              <h3 className="text-lg font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span>Affiliate & Referral Control Panel</span>
              </h3>

              {isConfigLoading ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 uppercase tracking-wider animate-pulse">Loading settings...</span>
                </div>
              ) : configError ? (
                <div className="text-xs text-rose-400 font-bold uppercase tracking-wider">
                  Failed to load affiliate configuration settings.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Toggles */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                      <div className="space-y-1">
                        <span className="text-xs font-black text-white uppercase tracking-wider block">
                          Static Referrals
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Enable/disable user sign-up bonuses via this referrer
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          updateConfig({
                            userId: id,
                            data: { static_referral_enabled: !configData?.static_referral_enabled },
                          });
                        }}
                        disabled={isUpdating}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                          configData?.static_referral_enabled
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                        }`}
                      >
                        {configData?.static_referral_enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                      <div className="space-y-1">
                        <span className="text-xs font-black text-white uppercase tracking-wider block">
                          Dynamic Fee Sharing
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Earn commission sharing on referred users' trading fees
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          updateConfig({
                            userId: id,
                            data: { dynamic_referral_enabled: !configData?.dynamic_referral_enabled },
                          });
                        }}
                        disabled={isUpdating}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${
                          configData?.dynamic_referral_enabled
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                        }`}
                      >
                        {configData?.dynamic_referral_enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Custom Rates Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const bonusVal = formData.get("signup_bonus") as string;

                      updateConfig({
                        userId: id,
                        data: {
                          custom_referral_signup_bonus: bonusVal === "" ? null : parseFloat(bonusVal),
                        },
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                        Custom Signup Bonus ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="signup_bonus"
                        placeholder={`Default ($${configData?.effective_signup_bonus})`}
                        defaultValue={configData?.custom_referral_signup_bonus ?? ""}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full py-2.5 cursor-pointer rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                    >
                      {isUpdating ? "Saving..." : "Save Custom Rates"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Tabs Control */}
            <div className="flex border-b border-white/10  mb-6">
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "history" ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
              >
                History ({history.length})
                {activeTab === "history" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("holdings")}
                className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === "holdings" ? "text-blue-400" : "text-slate-500 hover:text-slate-300"}`}
              >
                Active Holdings ({holdings.length})
                {activeTab === "holdings" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                )}
              </button>
            </div>
            {/* Tab Content */}
            {activeTab === "holdings" ? (
              holdings.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm space-y-4">
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
                    No active holdings found
                  </p>
                  <p className="text-slate-600 text-xs max-w-md mx-auto">
                    Explore prediction markets to place your first trade.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {holdings.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
                    >
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                            {item.asset}
                          </span>
                        </div>
                        <h4 className="text-md md:text-lg font-black text-slate-100 group-hover:text-white transition-colors">
                          {item.question}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 mt-4 md:mt-0">
                        <div className="md:text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                            Predicted
                          </span>
                          <span className="text-sm font-extrabold uppercase text-slate-200">
                            {item.side}
                          </span>
                        </div>

                        <div className="md:text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                            Bought Quotes at
                          </span>
                          <span className="text-sm font-extrabold text-slate-200">
                            {item.quota.toFixed(2)} Q
                          </span>
                        </div>

                        <div className="md:text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                            Invested
                          </span>
                          <span className="text-sm font-extrabold text-blue-400">
                            ${item.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : history.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm space-y-4">
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
                  No trade history found
                </p>
                <p className="text-slate-600 text-xs max-w-md mx-auto">
                  Resolved or closed predictions will be archived here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {history.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                          {item.asset}
                        </span>
                        {item.is_neutral ? (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            NEUTRAL
                          </span>
                        ) : item.is_win ? (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            WINNER
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            LOST
                          </span>
                        )}
                      </div>
                      <h4 className="text-md md:text-lg font-black text-slate-100 group-hover:text-white transition-colors">
                        {item.question}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-4 md:mt-0">
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                          Position
                        </span>
                        <span className="text-sm font-extrabold uppercase text-slate-300">
                          {item.side}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                          Invested
                        </span>
                        <span className="text-sm font-extrabold text-slate-300">
                          ${item.amount.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                          Payout
                        </span>
                        <span className="text-sm font-extrabold text-slate-300">
                          ${item.payout.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                          Net Profit
                        </span>
                        <span
                          className={`text-sm font-black ${item.is_neutral ? "text-slate-400" : item.profit >= 0 ? "text-emerald-400" : "text-rose-500"}`}
                        >
                          {item.is_neutral ? "" : item.profit >= 0 ? "+" : ""}$
                          {item.profit.toFixed(2)}
                        </span>
                      </div>

                      {item.is_win && item.transaction_id && (
                        <button
                          onClick={() => {
                            setSelectedPayoutTransactionId(item.transaction_id);
                            setIsShareModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm shadow-blue-500/5 active:scale-95"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          Share Win
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="my-20"></div>
      </main>

      <ShareWinModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedPayoutTransactionId("");
        }}
        transactionId={selectedPayoutTransactionId}
      />
    </div>
  );
}
