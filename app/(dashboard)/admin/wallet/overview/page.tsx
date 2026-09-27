"use client";

import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";
import WalletCard from "@/components/admin/WalletCard";
import { useGetAdminSystemTransactions } from "@/hooks/admin/wallet";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export default function WalletPage() {
  return (
    <AdminGuard requireFullAdmin={true}>
      <WalletPageContent />
    </AdminGuard>
  );
}

function WalletPageContent() {
  const { data: systemTxs, isLoading } = useGetAdminSystemTransactions();
  const transactions = systemTxs?.transactions || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
          Wallet
        </h1>

        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex md:grid md:grid-cols-4 gap-4 w-max md:w-full snap-x snap-mandatory">
           <WalletCard />
          </div>
        </div>

        <div className="mt-10">
          <h1 className="text-lg md:text-2xl font-extrabold text-white mb-6">
            Transactions
          </h1>

          {/* Table */}
          <div className="rounded-xl overflow-hidden bg-[#0d0d0f]/50 border border-white/5">
            {/* Header */}
            <div className="grid grid-cols-[60px_60px_1fr_120px] items-center px-3 py-3 border-b border-[#1a1a1a] text-[#777] text-sm font-semibold">
              <div>S/N</div>
              <div />
              <div>Name</div>
              <div className="text-right">Wallet</div>
            </div>

            {isLoading ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Loading transactions...
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((txn: any, index: number) => {
                const isDeposit = txn.type === "deposit" || txn.type === "funding";
                return (
                  <div
                    key={txn.id}
                    className="grid grid-cols-[60px_60px_1fr_120px] items-center px-3 py-4 border-b border-white/5 hover:bg-white/[0.02] text-sm transition-colors"
                  >
                    <div className="text-slate-500 font-mono text-center md:text-left">{index + 1}</div>
                    <div className="flex justify-center">
                      {isDeposit ? (
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                          <ArrowDownLeft className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{txn.user_name}</div>
                      <div className="text-xs text-slate-500">{txn.user_email}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-mono font-bold ${
                          isDeposit ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {isDeposit ? "+" : "-"}${Number(txn.amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        {txn.status}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm">
                No deposit or withdrawal transactions found
              </div>
            )}
          </div>
        </div>

        <div className="my-30" />
      </main>
    </div>
  );
}
