"use client";

import { useGetMarketActivities, useGetMarketOrders } from "@/hooks/markets";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useGetLiveRate, useGetUserInfo } from "@/hooks/user";
import { Activity } from "@/types/market";

export default function ActivitiesCard({ marketId }: { marketId: string }) {

  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");

    const {data: rate} = useGetLiveRate()
  const { data: profile } = useGetUserInfo();
  const { data: allActivities } = useGetMarketActivities(marketId);
  const { data: myOrders } = useGetMarketOrders(
    marketId,
    activeTab === "mine" ? profile?.id : undefined,
  );

  const NGN_USD_RATE = rate?.rate || 1500;
  
  const renderAllActivities = () => {
    if (!allActivities?.length) {
      return <EmptyState />;
    }

    return allActivities
      .sort(
        (a: Activity, b: Activity) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .map((item: Activity) => (
        <ActivityCard
          key={item?.id}
          type={item?.type}
          side={item?.order.side}
          name={item?.order?.user?.first_name}
          amount={item?.order.amount}
          quota={item?.order.quota}
          outcome_name={item?.order?.outcome_name}
          NGN_USD_RATE={NGN_USD_RATE}
        />
      ));
  };

  const renderMyOrders = () => {
    if (!myOrders?.length) {
      return <EmptyState />;
    }

    return myOrders.map((item: any) => (
      <OrdersCard
        key={item?.id}
        side={item?.side}
        amount={item?.amount}
        quota={item?.quota}
        NGN_USD_RATE={NGN_USD_RATE}
      />
    ));
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 md:p-10 border border-white/5 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-white uppercase tracking-widest">
          Activities
        </h2>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          {(["all", "mine"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {tab === "all" ? "All" : "Yours"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === "all" ? renderAllActivities() : renderMyOrders()}
      </div>
    </div>
  );
}

function ActivityCard({
  side,
  amount,
  type,
  quota,
  name,
  NGN_USD_RATE,
  outcome_name,
}: any) {
  const isBuy = side === "buy";

  return (
    <>
      {type === "buy_multi" ? (
        <>
          {" "}
          <div
            className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 ${
              isBuy
                ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
            }`}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div
                  className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${
                    isBuy ? "text-blue-400" : "text-red-400"
                  }`}
                >
                  {name} {(type === "buy_yes" || type === "buy_no") && "Opens"}{" "}
                  {(type === "sell_yes" || type === "sell_no") && "Closes"}{" "}
                  {isBuy ? "BUY" : "SELL"} {outcome_name} Position
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-2xl font-mono font-black text-white">
                    ${amount.toFixed(2).toLocaleString()}
                  </div>
                  <span
                    className={`${
                      isBuy ? "text-blue-400/60" : "text-red-400/60"
                    } text-[10px] font-black uppercase`}
                  >
                    ≈ ₦
                    {(amount * NGN_USD_RATE).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="text-[10px] flex items-center gap-1 font-bold text-slate-600 mt-1 uppercase tracking-widest">
                  {Math.floor((quota / 100) * 100) / 100} QUOTA @ ¢1
                </div>
              </div>

              <div
                className={`p-3 rounded-2xl bg-white/5 ${
                  isBuy ? "text-blue-400" : "text-red-400"
                }`}
              >
                {isBuy ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
              </div>
            </div>

            <div
              className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${
                isBuy
                  ? "from-blue-500/0 via-blue-500 to-blue-500/0"
                  : "from-red-500/0 via-red-500 to-red-500/0"
              }`}
            />
          </div>
        </>
      ) : (
        <div
          className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 ${
            isBuy
              ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
              : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
          }`}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div
                className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${
                  isBuy ? "text-blue-400" : "text-red-400"
                }`}
              >
                {name} {(type === "buy_yes" || type === "buy_no") && "Opens"}{" "}
                {(type === "sell_yes" || type === "sell_no") && "Closes"}{" "}
                {isBuy ? "BUY" : "SELL"} Position
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <div className="text-2xl font-mono font-black text-white">
                  ${amount.toFixed(2).toLocaleString()}
                </div>
                <span
                  className={`${
                    isBuy ? "text-blue-400/60" : "text-red-400/60"
                  } text-[10px] font-black uppercase`}
                >
                  ≈ ₦
                  {(amount * NGN_USD_RATE).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="text-[10px] flex items-center gap-1 font-bold text-slate-600 mt-1 uppercase tracking-widest">
                {Math.floor((quota / 100) * 100) / 100} QUOTA @ ¢1
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl bg-white/5 ${
                isBuy ? "text-blue-400" : "text-red-400"
              }`}
            >
              {isBuy ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
          </div>

          <div
            className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${
              isBuy
                ? "from-blue-500/0 via-blue-500 to-blue-500/0"
                : "from-red-500/0 via-red-500 to-red-500/0"
            }`}
          />
        </div>
      )}
    </>
  );
}

function OrdersCard({ side, amount, quota, NGN_USD_RATE }: any) {
  const isBuy = side === "buy";

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 ${
        isBuy
          ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
          : "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
      }`}
    >
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div
            className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${
              isBuy ? "text-blue-400" : "text-red-400"
            }`}
          >
            Opens {isBuy ? "BUY" : "SELL"} Position
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <div className="text-2xl font-mono font-black text-white">
              ${amount.toFixed(2).toLocaleString()}
            </div>
            <span
              className={`${
                isBuy ? "text-blue-400/60" : "text-red-400/60"
              } text-[10px] font-black uppercase`}
            >
              ≈ ₦
              {(amount * NGN_USD_RATE).toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">
            {Math.floor((quota / 100) * 100) / 100} QUOTA @ ¢1
          </div>
        </div>

        <div
          className={`p-3 rounded-2xl bg-white/5 ${
            isBuy ? "text-blue-400" : "text-red-400"
          }`}
        >
          {isBuy ? (
            <TrendingUp className="w-6 h-6" />
          ) : (
            <TrendingDown className="w-6 h-6" />
          )}
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${
          isBuy
            ? "from-blue-500/0 via-blue-500 to-blue-500/0"
            : "from-red-500/0 via-red-500 to-red-500/0"
        }`}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-2 text-center py-12 text-slate-600 text-sm font-black uppercase tracking-widest">
      No activities yet
    </div>
  );
}
