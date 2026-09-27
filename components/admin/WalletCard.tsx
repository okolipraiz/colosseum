"use client";

import {
  useGetAdminLiveRate,
  useGetAdminWalletBalance,
  useGetAdminWalletBalanceFlowTotal,
  useGetAdminWalletProfit,
} from "@/hooks/admin/wallet";
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, Coins } from "lucide-react";

export default function WalletCard() {
  const { data: totalBalance, isLoading: isTotalBalanceLoading } =
    useGetAdminWalletBalance();
  const { data: balanceFlow, isLoading: isBalanceFlowLoading } =
    useGetAdminWalletBalanceFlowTotal();
  
  const { data: balanceProfit, isLoading: isBalanceProfitLoading } =
    useGetAdminWalletProfit();

  const { data: live_rate } = useGetAdminLiveRate("sell");

  const availableBalanceInDollar = totalBalance?.balances?.reduce(
    (acc: number, item: any) => {
      if (item.currency === "NGN") {
        return acc + Number(item.available.amount) / Number(live_rate?.rate);
      }

      // Add USDT directly
      if (item.currency === "USDT") {
        return acc + Number(item.available.amount);
      }

      return acc;
    },
    0,
  );

  return (
    <>
      {/* Available Balance */}
      <div className="w-[280px] sm:w-[320px] md:w-full shrink-0 snap-start bg-[#0d0d0f]/70 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-blue-500/40 hover:shadow-blue-500/10 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#8b8b8b] font-medium">
              Available Balance
            </p>

            <h2 className="mt-3 text-xl md:text-3xl font-bold text-white tracking-tight">
              $
              {parseFloat(
                availableBalanceInDollar?.toString() || "0",
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <p className="mt-2 text-xs text-green-400">
              {" "}
              {(
                Number(live_rate?.rate) * Number(availableBalanceInDollar)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              NGN equivalent
            </p>
          </div>

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Money In */}
      <div className="w-[280px] sm:w-[320px] md:w-full shrink-0 snap-start bg-[#0d0d0f]/70 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-green-500/40 hover:shadow-green-500/10 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#8b8b8b] font-medium">Money In</p>

            <h2 className="mt-3 text-xl md:text-3xl font-bold text-white tracking-tight">
              $
              {parseFloat(balanceFlow?.inflow?.total_usd ?? "0").toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </h2>

            <p className="mt-2 text-xs text-green-400">
              {(
                Number(live_rate?.rate) * Number(balanceFlow?.inflow?.total_usd)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              NGN equivalent
            </p>
          </div>

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Money Out */}
      <div className="w-[280px] sm:w-[320px] md:w-full shrink-0 snap-start bg-[#0d0d0f]/70 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-red-500/40 hover:shadow-red-500/10 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#8b8b8b] font-medium">Money Out</p>

            <h2 className="mt-3 text-xl md:text-3xl font-bold text-white tracking-tight">
              $
              {parseFloat(
                balanceFlow?.outflow?.total_usd ?? "0",
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <p className="mt-2 text-xs text-red-400">
              {" "}
              {(
                Number(live_rate?.rate) *
                Number(balanceFlow?.outflow?.total_usd)
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              NGN equivalent
            </p>
          </div>

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Total Profit */}
      <div className="w-[280px] sm:w-[320px] md:w-full shrink-0 snap-start bg-[#0d0d0f]/70 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-purple-500/40 hover:shadow-purple-500/10 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#8b8b8b] font-medium">Total Profit</p>

            <h2 className="mt-3 text-xl md:text-3xl font-bold text-white tracking-tight">
              $
              {parseFloat(balanceProfit?.profit ?? "0").toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </h2>

            <p className="mt-2 text-xs text-purple-400">
              {balanceProfit?.profit
                ? (Number(balanceProfit.profit) / 100).toFixed(2)
                : "0.00"}
              % overall growth
            </p>
          </div>

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Total Users Busha Balance */}
      <div className="w-[280px] sm:w-[320px] md:w-full shrink-0 snap-start bg-[#0d0d0f]/70 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-purple-500/40 hover:shadow-purple-500/10 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#8b8b8b] font-medium">
              Total Users Busha Balance
            </p>

            <h2 className="mt-3 text-xl md:text-3xl font-bold text-white tracking-tight">
              $
              {parseFloat(
                balanceProfit?.total_user_balances ?? "0",
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>

            <p className="mt-2 text-xs text-purple-400">
              {(
                Number(live_rate?.rate) *
                Number(balanceProfit?.total_user_balances?.toFixed(2) || "0")
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              NGN equivalent
            </p>
          </div>

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Total Users Busha Balance */}
      <div className="w-[280px] sm:w-[320px] md:w-full shrink-0 snap-start bg-[#0d0d0f]/70 backdrop-blur-3xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-purple-500/40 hover:shadow-purple-500/10 group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#8b8b8b] font-medium">
              Total NowPayment Balance
            </p>

            <h2 className="mt-3 text-xl md:text-3xl font-bold text-white tracking-tight">
              $
              {parseFloat(balanceProfit?.breakdown?.nowpayments_usd ?? "0").toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </h2>

            <p className="mt-2 text-xs text-purple-400">
              {(
                Number(live_rate?.rate) *
                Number(
                  balanceProfit?.breakdown?.nowpayments_usd.toFixed(2) || "0",
                )
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              NGN equivalent
            </p>
          </div>

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
      </div>
    </>
  );
}
