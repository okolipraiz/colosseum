"use client";

import React, { useState } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";
import {
  useGetReferrals,
  useGetAffiliateWithdrawals,
  useApproveAffiliateWithdrawal,
  useRejectAffiliateWithdrawal,
} from "@/hooks/admin/user";
import { useGetAdminStaticBalance } from "@/hooks/admin/wallet";

const ReferralsPage = () => {
  return (
    <AdminGuard requireFullAdmin={true}>
      <ReferralsPageContent />
    </AdminGuard>
  );
};

const ReferralsPageContent = () => {
  const [activeTab, setActiveTab] = useState<"referrals" | "withdrawals">("referrals");
  const { data, isLoading, isError } = useGetReferrals();
  const { data: withdrawals, isLoading: isWithdrawalsLoading, isError: isWithdrawalsError } = useGetAffiliateWithdrawals();
  const { mutate: approveWithdrawal, isPending: isApproving } = useApproveAffiliateWithdrawal();
  const { mutate: rejectWithdrawal, isPending: isRejecting } = useRejectAffiliateWithdrawal();
  const {
    data: staticBalanceData,
  } = useGetAdminStaticBalance();

  const totalReferred = data?.total_referred_users || 0;
  const totalWithStatic = data?.total_with_static_balance || 0;
  const pendingCount = withdrawals?.filter((w) => w.status === "pending").length || 0;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleApprove = (requestId: string) => {
    approveWithdrawal(requestId);
  };

  const handleReject = (requestId: string) => {
    rejectWithdrawal(requestId);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Affiliate & Referral Tracking
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Monitor users who registered via affiliate referral links and track
            registration bonuses
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-6 mb-8 border-b border-white/10 pb-px">
          <button
            onClick={() => setActiveTab("referrals")}
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
            onClick={() => setActiveTab("withdrawals")}
            className={`pb-4 text-sm font-bold cursor-pointer transition-all relative flex items-center gap-2 ${
              activeTab === "withdrawals"
                ? "text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Withdrawal Vetting
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
                {pendingCount}
              </span>
            )}
            {activeTab === "withdrawals" && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {activeTab === "referrals" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 1 */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm shadow-xl hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      Total Referred Users
                    </p>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
                      {isLoading ? (
                        <div className="h-9 w-16 bg-white/10 rounded animate-pulse" />
                      ) : (
                        totalReferred
                      )}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm shadow-xl hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      Static Trading Balance
                    </p>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-emerald-400 mt-2">
                      {isLoading ? (
                        <div className="h-9 w-16 bg-white/10 rounded animate-pulse" />
                      ) : (
                        `$${staticBalanceData?.total_static_balance?.toFixed(2) || 0}`
                      )}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm shadow-xl hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                      Static Trading Payout
                    </p>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-gray-400 mt-2">
                      {isLoading ? (
                        <div className="h-9 w-16 bg-white/10 rounded animate-pulse" />
                      ) : (
                        `$${staticBalanceData?.total_static_profit?.toFixed(2) || 0}`
                      )}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/20 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="lucide lucide-banknote-arrow-down-icon lucide-banknote-arrow-down"
                    >
                      <path d="M12 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
                      <path d="m16 19 3 3 3-3" />
                      <path d="M18 12h.01" />
                      <path d="M19 16v6" />
                      <path d="M6 12h.01" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals Table */}
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.01] backdrop-blur-md shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                        Referred User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                        Registration Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                        Account Balances
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                        Affiliate / Referrer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                        Affiliate Code
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="px-6 py-4">
                            <div className="h-4 w-40 bg-white/10 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-24 bg-white/10 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-8 w-36 bg-white/10 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-44 bg-white/10 rounded" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 w-20 bg-white/10 rounded-full" />
                          </td>
                        </tr>
                      ))
                    ) : isError ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-rose-400 font-medium"
                        >
                          Failed to load affiliate referral records.
                        </td>
                      </tr>
                    ) : data?.referrals.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-slate-500 font-medium"
                        >
                          No referred user accounts found on the platform.
                        </td>
                      </tr>
                    ) : (
                      data?.referrals.map((ref: any) => (
                        <tr
                          key={ref.id}
                          className="hover:bg-white/[0.02] transition-colors duration-150"
                        >
                          {/* Referred User */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-200">
                                {ref.first_name} {ref.last_name}
                              </span>
                              <span className="text-xs text-slate-400 mt-0.5">
                                {ref.email}
                              </span>
                            </div>
                          </td>

                          {/* Registration Date */}
                          <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                            {formatDate(ref.created_at)}
                          </td>

                          {/* Account Balances */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-400">
                                  Total Balance
                                </span>
                                <span className="text-sm font-bold text-slate-200">
                                  ${ref.wallet_balance.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex flex-col border-l border-white/10 pl-3">
                                <span className="text-xs text-slate-400">
                                  Static Balance
                                </span>
                                <span className="text-sm font-bold text-emerald-400">
                                  ${ref.static_balance.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Affiliate Referrer */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-200">
                                {ref.referrer.first_name}{" "}
                                {ref.referrer.last_name}
                              </span>
                              <span className="text-xs text-slate-400 mt-0.5">
                                {ref.referrer.email}
                              </span>
                            </div>
                          </td>

                          {/* Affiliate Code */}
                          <td className="px-6 py-4">
                            {ref.referrer.affiliate_code ? (
                              <span className="inline-flex items-center rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-mono font-bold text-blue-400 uppercase">
                                {ref.referrer.affiliate_code}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 italic">
                                N/A
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Withdrawal Vetting Table */
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.01] backdrop-blur-md shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                      User Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                      Requested Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                      Date Requested
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {isWithdrawalsLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="h-4 w-40 bg-white/10 rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-white/10 rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-white/10 rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-20 bg-white/10 rounded-full" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="h-8 w-36 ml-auto bg-white/10 rounded" />
                        </td>
                      </tr>
                    ))
                  ) : isWithdrawalsError ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-rose-400 font-medium"
                      >
                        Failed to load affiliate withdrawal requests.
                      </td>
                    </tr>
                  ) : withdrawals?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-500 font-medium"
                      >
                        No affiliate withdrawal requests found.
                      </td>
                    </tr>
                  ) : (
                    withdrawals?.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-white/[0.02] transition-colors duration-150"
                      >
                        {/* User Details */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-200">
                              {req.user
                                ? `${req.user.first_name} ${req.user.last_name}`
                                : "Unknown User"}
                            </span>
                            <span className="text-xs text-slate-400 mt-0.5">
                              {req.user?.email || `ID: ${req.user_id}`}
                            </span>
                          </div>
                        </td>

                        {/* Requested Amount */}
                        <td className="px-6 py-4 text-sm font-bold text-slate-200">
                          ${req.amount.toFixed(2)}
                        </td>

                        {/* Date Requested */}
                        <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                          {formatDate(req.created_at)}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {req.status === "pending" && (
                            <span className="inline-flex items-center rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-mono font-bold text-amber-400 uppercase">
                              Pending
                            </span>
                          )}
                          {req.status === "approved" && (
                            <span className="inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 uppercase">
                              Approved
                            </span>
                          )}
                          {req.status === "rejected" && (
                            <span className="inline-flex items-center rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-mono font-bold text-rose-400 uppercase">
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {req.status === "pending" ? (
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleApprove(req.id)}
                                disabled={isApproving}
                                className="px-3 py-1.5 cursor-pointer rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isApproving ? "Approving..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(req.id)}
                                disabled={isRejecting}
                                className="px-3 py-1.5 cursor-pointer rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isRejecting ? "Rejecting..." : "Reject"}
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">
                              Processed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="my-20"></div>
      </main>
    </div>
  );
};

export default ReferralsPage;
