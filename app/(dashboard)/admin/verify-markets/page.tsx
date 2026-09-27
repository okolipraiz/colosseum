"use client";

import { useState } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";
import { useGetAllMarketsAdmin, useVerifyMarket } from "@/hooks/admin/markets";
import { CheckCircle2, XCircle, Clock, ShieldCheck, HelpCircle, Layers, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function VerifyMarketsPage() {
  return (
    <AdminGuard requireFullAdmin={true}>
      <VerifyMarketsContent />
    </AdminGuard>
  );
}

function VerifyMarketsContent() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [rejectingMarketId, setRejectingMarketId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: markets, isLoading, refetch } = useGetAllMarketsAdmin(activeTab);
  const { mutate: verifyMarket, isPending: isVerifying } = useVerifyMarket();

  const handleApprove = (marketId: string) => {
    verifyMarket(
      { marketId, action: "approve" },
      {
        onSuccess: () => refetch(),
      }
    );
  };

  const handleRejectSubmit = (marketId: string) => {
    verifyMarket(
      { marketId, action: "reject", reason: rejectReason },
      {
        onSuccess: () => {
          setRejectingMarketId(null);
          setRejectReason("");
          refetch();
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
              Market Verification
            </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Review and verify markets created by subadmins before they go live on the platform.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          {[
            { key: "pending", label: "Pending Verification", icon: Clock },
            { key: "approved", label: "Approved Markets", icon: CheckCircle2 },
            { key: "rejected", label: "Rejected Markets", icon: XCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-blue-600/15 border border-blue-500/30 text-white shadow-lg shadow-blue-500/10"
                    : "bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Markets Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm font-medium">Loading markets...</p>
          </div>
        ) : !markets || markets.length === 0 ? (
          <div className="bg-[#121214]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">
              No {activeTab} markets found
            </h3>
            <p className="text-slate-400 text-xs">
              {activeTab === "pending"
                ? "All subadmin submitted markets have been verified."
                : `There are currently no ${activeTab} markets.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {markets.map((market: any) => {
              const status = market.verification_status || (market.is_verified ? "approved" : "pending");
              const isCreatedBySubadmin = Boolean(market.created_by_id);

              return (
                <div
                  key={market.id}
                  className="bg-[#121214]/80 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl p-6 shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <span className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full text-xs font-bold text-blue-400">
                        {market.category}
                      </span>
                      <StatusBadge status={status} />
                    </div>

                    {/* Question */}
                    <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                      {market.question}
                    </h3>
                    <p className="text-xs text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                      {market.description}
                    </p>

                    {/* Information Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6 bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Layers className="w-3.5 h-3.5 text-blue-400" />
                        <span>Type: <strong className="text-white uppercase">{market.market_type || "Financial"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>Closes: <strong className="text-white">{formatDate(market.closing_time)}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Reject Modal / Actions */}
                  {rejectingMarketId === market.id ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 space-y-3">
                      <p className="text-xs font-bold text-red-400">Reason for rejection:</p>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter rejection notes for subadmin..."
                        className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 resize-none h-20"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRejectSubmit(market.id)}
                          disabled={isVerifying}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs text-white transition disabled:opacity-50 cursor-pointer"
                        >
                          {isVerifying ? "Rejecting..." : "Confirm Reject"}
                        </button>
                        <button
                          onClick={() => {
                            setRejectingMarketId(null);
                            setRejectReason("");
                          }}
                          className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 pt-2">
                      {status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(market.id)}
                            disabled={isVerifying}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & Publish
                          </button>
                          <button
                            onClick={() => setRejectingMarketId(market.id)}
                            disabled={isVerifying}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 font-bold text-xs text-red-400 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {status === "approved" && (
                        <div className="w-full flex items-center justify-between text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-2xl px-4 py-3">
                          <span className="font-bold flex items-center gap-2 text-white">
                            <CheckCircle2 className="w-4 h-4 text-blue-400" /> Live on Platform
                          </span>
                          {/* Revoke approval is ONLY available if market was created by a subadmin */}
                          {isCreatedBySubadmin && (
                            <button
                              onClick={() => setRejectingMarketId(market.id)}
                              className="text-red-400 hover:underline text-[11px] font-bold cursor-pointer"
                            >
                              Revoke Approval
                            </button>
                          )}
                        </div>
                      )}
                      {status === "rejected" && (
                        <div className="w-full flex items-center justify-between text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                          <span className="font-bold flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Rejected Market
                          </span>
                          <button
                            onClick={() => handleApprove(market.id)}
                            className="text-blue-400 hover:underline text-[11px] font-bold cursor-pointer"
                          >
                            Re-approve Market
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-blue-400">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[11px] font-bold text-red-400">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300 animate-pulse">
      <Clock className="w-3 h-3 text-blue-400" /> Pending Review
    </span>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  try {
    return format(new Date(dateStr), "MMM dd, yyyy");
  } catch {
    return dateStr;
  }
}
