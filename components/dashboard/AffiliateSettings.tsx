"use client";

import { useGetAffiliateDashboard, useWithdrawAffiliate } from "@/hooks/user";
import { Users, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AffiliateSettings = () => {
  const { data: dashboard, isLoading, error } = useGetAffiliateDashboard();
  const { mutate: withdrawAffiliate, isPending: isWithdrawing } =
    useWithdrawAffiliate();
  const [activeTab, setActiveTab] = useState<"referrals" | "earn_as_refer">(
    "earn_as_refer",
  );

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopy = async (text: string, isLink: boolean) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success(isLink ? "Referral link copied!" : "Referral code copied!");
      if (isLink) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6">
        <p className="text-rose-400 font-bold uppercase tracking-wider">
          Failed to load affiliate details
        </p>
      </div>
    );
  }

  const affiliate_code = dashboard?.affiliate_code;
  const static_affiliate_balance =
    dashboard?.static_affiliate_balance ?? dashboard?.affiliate_balance ?? 0.0;
  const dynamic_affiliate_balance = dashboard?.dynamic_affiliate_balance ?? 0.0;
  const total_referrals = dashboard?.total_referrals || 0;
  const effective_signup_bonus = dashboard?.effective_signup_bonus || 5.0;
  const static_referral_enabled = dashboard?.static_referral_enabled ?? true;
  const dynamic_referral_enabled = dashboard?.dynamic_referral_enabled ?? true;
  const recent_referrals = dashboard?.recent_referrals || [];
  const withdrawal_history = dashboard?.withdrawal_history || [];

  const localReferralLink =
    affiliate_code && typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${affiliate_code}`
      : `https://useforecast.cc/signup?ref=${affiliate_code || "..."}`;

  const handleCheckIsStatic = () => {
    if (static_referral_enabled) {
      setActiveTab("referrals");
    } else {
      toast.info("This referral option needs to enabled by the Admin");
    }
  };

  return (
    <>
      {/* Tab Selector */}
      <div className="flex gap-6 mb-8 border-b border-white/10 pb-px">
        <button
          onClick={() => handleCheckIsStatic()}
          className={`pb-4 text-sm font-bold cursor-pointer transition-all relative ${
            activeTab === "referrals"
              ? "text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Referral Records
          {activeTab === "referrals" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("earn_as_refer")}
          className={`pb-4 text-sm font-bold cursor-pointer transition-all relative ${
            activeTab === "earn_as_refer"
              ? "text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Earn as you Refer
          {activeTab === "earn_as_refer" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      <div className="space-y-8">
        {/* Main Info Card */}
        {activeTab === "referrals" && (
          <div className="bg-blue-500/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-blue-500/20 overflow-hidden shadow-2xl p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    Referral
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your universal referral link for static signup bonuses
                  </p>
                </div>
              </div>

              {/* Show status pills for both affiliate plans */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                    static_referral_enabled
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                  }`}
                >
                  {static_referral_enabled
                    ? `Static Plan: Enabled ($${effective_signup_bonus.toFixed(2)} Bonus)`
                    : "Static Plan: Disabled"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Your Referral Code
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-black text-white tracking-tight select-all">
                    {affiliate_code || "..."}
                  </span>
                  <button
                    onClick={() => handleCopy(affiliate_code || "", false)}
                    disabled={!affiliate_code}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      !affiliate_code
                        ? "opacity-50 cursor-not-allowed bg-white/5 border-white/10 text-slate-500"
                        : copiedCode
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    }`}
                  >
                    {copiedCode ? "Copied! ✓" : "Copy Code"}
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Your Referral Link
                </span>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                    {localReferralLink}
                  </span>
                  <button
                    onClick={() => handleCopy(localReferralLink, true)}
                    disabled={!affiliate_code}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                      !affiliate_code
                        ? "opacity-50 cursor-not-allowed bg-blue-600/50 text-slate-400"
                        : copiedLink
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {copiedLink ? "Copied! ✓" : "Copy Link"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                Affiliate Balances
              </span>
              <div className={`grid grid-cols-1 gap-6`}>
                {static_referral_enabled && (
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Referral Balance
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                          Payout Requestable
                        </span>
                      </div>
                      <span className="text-3xl font-mono font-black text-white block">
                        ${static_affiliate_balance.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <input
                        type="number"
                        id="affiliate_withdraw_amount"
                        placeholder="Amount ($)"
                        defaultValue={
                          static_affiliate_balance >= 10.0
                            ? static_affiliate_balance
                            : 10
                        }
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-mono w-28 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={async () => {
                          const el = document.getElementById(
                            "affiliate_withdraw_amount",
                          ) as HTMLInputElement;
                          const val = parseFloat(el?.value || "0");
                          if (isNaN(val) || val <= 0) {
                            toast.error(
                              "Please enter a valid withdrawal amount",
                            );
                            return;
                          }
                          if (static_affiliate_balance < val) {
                            toast.error(
                              `Insufficient static affiliate balance. Available: $${static_affiliate_balance.toFixed(2)}`,
                            );
                            return;
                          }
                          if (val < 10.0) {
                            toast.error("Minimum withdrawal amount is $10.00");
                            return;
                          }
                          try {
                            await withdrawAffiliate({ amount: val });
                          } catch (err) {}
                        }}
                        disabled={isWithdrawing}
                        className="px-5 py-2 cursor-pointer rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-55 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                      >
                        {isWithdrawing ? "Requesting..." : "Request Payout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "earn_as_refer" && (
          <div className="bg-blue-500/[0.03] backdrop-blur-xl rounded-[2.5rem] border border-blue-500/20 overflow-hidden shadow-2xl p-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    Earn from referral trades
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your universal referral link for dynamic fee rewards
                  </p>
                </div>
              </div>

              {/* Show status pills for both affiliate plans */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                    dynamic_referral_enabled
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                  }`}
                >
                  {dynamic_referral_enabled
                    ? "Dynamic Plan: Enabled"
                    : "Dynamic Plan: Disabled"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Your Referral Code
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-black text-white tracking-tight select-all">
                    {affiliate_code || "..."}
                  </span>
                  <button
                    onClick={() => handleCopy(affiliate_code || "", false)}
                    disabled={!affiliate_code}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      !affiliate_code
                        ? "opacity-50 cursor-not-allowed bg-white/5 border-white/10 text-slate-500"
                        : copiedCode
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    }`}
                  >
                    {copiedCode ? "Copied! ✓" : "Copy Code"}
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Your Referral Link
                </span>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">
                    {localReferralLink}
                  </span>
                  <button
                    onClick={() => handleCopy(localReferralLink, true)}
                    disabled={!affiliate_code}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                      !affiliate_code
                        ? "opacity-50 cursor-not-allowed bg-blue-600/50 text-slate-400"
                        : copiedLink
                          ? "bg-green-500/20 border-green-500/40 text-green-400"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
                  >
                    {copiedLink ? "Copied! ✓" : "Copy Link"}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                Earnings from Users Trades
              </span>
              <div
                className={`grid grid-cols-1 dynamic_referral_enabled gap-6`}
              >
                {dynamic_referral_enabled && (
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Balance Earned
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                          Directly Credited
                        </span>
                      </div>
                      <span className="text-3xl font-mono font-black text-white block">
                        ${dynamic_affiliate_balance.toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center gap-1 text-[11px] text-slate-400">
                      <span className="font-bold">Payout Mode:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        Credited directly to main balance ✓
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Referred Users and History tables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-[#0d0d0f]/50 border border-white/[0.05] rounded-[2.5rem] p-8 shadow-xl">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Referred Users ({total_referrals})</span>
            </h4>

            {recent_referrals.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-wider">
                No users referred yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-left">
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Name
                      </th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Email
                      </th>
                      <th className="pb-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recent_referrals.map((ref) => (
                      <tr key={ref.id} className="hover:bg-white/[0.01]">
                        <td className="py-3 text-xs font-bold text-white truncate max-w-[120px]">
                          {ref.first_name} {ref.last_name}
                        </td>
                        <td className="py-3 text-xs font-mono text-slate-400 truncate max-w-[150px]">
                          {ref.email}
                        </td>
                        <td className="py-3 text-xs text-slate-500 text-right">
                          {formatDate(ref.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-[#0d0d0f]/50 border border-white/[0.05] rounded-[2.5rem] p-8 shadow-xl">
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Payout History</span>
            </h4>

            {withdrawal_history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-wider">
                No payouts requested yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {withdrawal_history.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white block">
                        ${req.amount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {formatDate(req.created_at)}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        req.status === "approved"
                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          : req.status === "rejected"
                            ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AffiliateSettings;
