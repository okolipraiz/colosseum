"use client";

import React, { useState } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";
import { useGetAuditLogs } from "@/hooks/admin/user";

const PAGE_SIZE = 15;

const AuditLogPage = () => {
  return (
    <AdminGuard requireFullAdmin={true}>
      <AuditLogPageContent />
    </AdminGuard>
  );
};

const AuditLogPageContent = () => {
  const [page, setPage] = useState(1);
  const skip = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isError } = useGetAuditLogs(skip, PAGE_SIZE);

  const totalLogs = data?.total_logs || 0;
  const totalPages = Math.ceil(totalLogs / PAGE_SIZE) || 1;

  const getActionBadgeClass = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("signup")) {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    }
    if (act.includes("login")) {
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    }
    if (act.includes("order")) {
      return "border-purple-500/20 bg-purple-500/10 text-purple-400";
    }
    if (act.includes("deposit")) {
      return "border-teal-500/20 bg-teal-500/10 text-teal-400";
    }
    if (act.includes("withdrawal")) {
      return "border-rose-500/20 bg-rose-500/10 text-rose-400";
    }
    return "border-slate-500/20 bg-slate-500/10 text-slate-400";
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              System Audit Logs
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Monitor and track all security and financial activities across the platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
              Total Records: {totalLogs}
            </span>
          </div>
        </div>

        {/* Logs Table Section */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.01] backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                    User / ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                    Action
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-white/10 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-white/10 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-24 bg-white/10 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-72 bg-white/10 rounded" /></td>
                    </tr>
                  ))
                ) : isError ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-rose-400 font-medium">
                      Failed to load audit logs. Please check your admin privileges.
                    </td>
                  </tr>
                ) : data?.logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No audit logs found on the platform yet.
                    </td>
                  </tr>
                ) : (
                  data?.logs.map((log: any) => (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">
                        {formatTimestamp(log.created_at)}
                      </td>

                      <td className="px-6 py-4">
                        {log.user_email ? (
                          <div className="flex flex-col">
                            {log.user_name ? (
                              <>
                                <span className="text-sm font-semibold text-slate-200">
                                  {log.user_name}
                                </span>
                                <span className="text-xs text-slate-400 mt-0.5">
                                  {log.user_email}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-slate-200">
                                {log.user_email}
                              </span>
                            )}
                            {log.user_id && (
                              <span className="text-[10px] text-slate-500 font-mono tracking-tight mt-0.5">
                                ID: {log.user_id}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">System Event</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300 max-w-md break-words">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!isLoading && !isError && totalLogs > 0 && (
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-white/[0.02]">
              <div className="text-xs text-slate-400">
                Showing <span className="font-semibold text-white">{skip + 1}</span> to{" "}
                <span className="font-semibold text-white">
                  {Math.min(skip + PAGE_SIZE, totalLogs)}
                </span>{" "}
                of <span className="font-semibold text-white">{totalLogs}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-400 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="my-20"></div>
      </main>
    </div>
  );
};

export default AuditLogPage;
