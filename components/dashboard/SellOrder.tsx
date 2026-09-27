"use client";

import { useGetMarketActivities, useGetMarketOrders } from "@/hooks/markets";
import { useOrderStore } from "@/stores/useOrderStore";
import { OrderTypes } from "@/types/market";
import { Check } from "lucide-react";
import { SellConfirmation } from "./SellConfirm";
import { useState } from "react";
import { useGetLiveRate, useGetUserInfo } from "@/hooks/user";
import { useAuth } from "@/context/auth-provider";

const SellOrder = ({ market }: { market: any }) => {
  const { isAccess } = useAuth();
  const { data: profile } = useGetUserInfo();
  const { refetch: refetchActivities } = useGetMarketActivities(market.id);
  const { data: myOrders, refetch } = useGetMarketOrders(
    market.id,
    isAccess ? profile?.id : undefined,
  );
  const { data: rate } = useGetLiveRate();

  const { selectedOrders, setSelectedOrders, toggleOrder, clearOrders } =
    useOrderStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const NGN_USD_RATE = rate?.rate;

  const totalSelected = myOrders
    ?.filter((o: any) => selectedOrders.includes(o.id))
    ?.reduce((sum: number, o: any) => sum + o.amount, 0);

  const handleSell = async () => {
    setConfirmOpen(false);
    setSelectedOrders([]);
    refetchActivities();
    refetch();
  };

  return (
    <>
      {isAccess && profile?.id && myOrders?.length > 0 && (
        <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="mb-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  My Orders
                </span>
                <button
                  onClick={() =>
                    selectedOrders?.length === myOrders?.length
                      ? setSelectedOrders([])
                      : setSelectedOrders(myOrders.map((o: any) => o.id))
                  }
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                >
                  {selectedOrders?.length === myOrders?.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {myOrders?.map((item: OrderTypes) => {
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
                            item.side === "buy" ? "bg-blue-400" : "bg-red-400"
                          }`}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <div>
                          <div
                            className={`text-[7px] font-black uppercase tracking-[0.2em] mb-2 ${
                              item.side === "buy"
                                ? "text-blue-400"
                                : "text-red-400"
                            }`}
                          >
                            {market?.market_type === "multi-outcome"
                              ? `BUY ${item.outcome_name || "POSITION"}`
                              : `${item.side === "buy" ? "BUY" : "SELL"} Position`}
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <div className="text-xl font-mono font-black text-white">
                              ${item.amount.toFixed(2).toLocaleString()}
                            </div>
                            <span
                              className={`${
                                item.side === "buy"
                                  ? "text-blue-400/60"
                                  : "text-red-400/60"
                              } text-[10px] font-black uppercase`}
                            >
                              ≈ ₦
                              {(item.amount * NGN_USD_RATE).toLocaleString(
                                "en-NG",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                },
                              )}
                            </span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">
                            {Math.floor((item.quota / 100) * 100) / 100} QUOTA @
                            ¢1
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
                        ${totalSelected.toFixed(2).toLocaleString()}
                      </div>
                      <div className="text-[10px] mt-3 text-slate-500 font-bold uppercase">
                        ≈ ₦{(totalSelected / NGN_USD_RATE).toFixed(2)}
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
                      disabled={!myOrders || selectedOrders.length === 0}
                      onClick={() => setConfirmOpen(true)}
                      className="px-5 py-2 rounded-xl w-full text-[11px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-400 text-white transition-all"
                    >
                      Sell Selected
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <SellConfirmation
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleSell}
            selectedOrders={myOrders?.filter((o: any) =>
              selectedOrders.includes(o.id),
            )}
            NGN_USD_RATE={NGN_USD_RATE}
            market={market}
          />
        </div>
      )}
    </>
  );
};

export default SellOrder;
