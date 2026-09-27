"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  
} from "@/components/ui/drawer";
import { TrendingUp, Wallet, X } from "lucide-react";
import { useEffect, useState } from "react";
import { isMultiOutcomeMarket } from "@/types/market";
import { TOUR_OPEN_TRIGGER_EVENT } from "@/components/dashboard/AppTour";

export const OUTCOME_COLORS_MOBILE = [
  { bg: "bg-blue-600/20", border: "border-blue-500", text: "text-blue-400" },
  {
    bg: "bg-purple-600/20",
    border: "border-purple-500",
    text: "text-purple-400",
  },
  { bg: "bg-amber-600/20", border: "border-amber-500", text: "text-amber-400" },
  {
    bg: "bg-emerald-600/20",
    border: "border-emerald-500",
    text: "text-emerald-400",
  },
  { bg: "bg-rose-600/20", border: "border-rose-500", text: "text-rose-400" },
];

export function PlacePositionDrawer({
  market,
  userBalance,
  loading,
  handleTrade,
  units,
  setUnits,
  setSelectedOutcome,
  selectedOutcomeId,
  setSelectedOutcomeId,
}: {
  market: any;
  userBalance: any;
  units: any;
  setUnits: (units: any) => void;
  loading: boolean;
  handleTrade: () => void;
  setSelectedOutcome: (outcome: "buy" | "sell") => void;
  selectedOutcomeId?: string | null;
  setSelectedOutcomeId?: (id: string) => void;
}) {
  const isMulti = isMultiOutcomeMarket(market);
  const [selectedOption, setSelectedOption] = useState<"buy" | "sell">("buy");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMarketClosed = market.resolved || !market.active;

  // Let the app tour open this drawer reliably (a synthetic click/tap can
  // miss Vaul's own drag-vs-tap gesture detection) instead of simulating a
  // user interaction with the trigger.
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (id === "trading-outcome") setDrawerOpen(true);
    };
    document.addEventListener(TOUR_OPEN_TRIGGER_EVENT, handler);
    return () => document.removeEventListener(TOUR_OPEN_TRIGGER_EVENT, handler);
  }, []);

  if (isMarketClosed) {
    return (
      <div className="text-center py-4 px-4 rounded-xl border border-red-500/20 bg-red-500/5">
        <div className="text-[10px] font-black text-red-400 uppercase tracking-widest">
          {market.resolved ? "Market Resolved" : "Market Closed"}
        </div>
        <div className="text-[9px] text-red-300/70 mt-1">
          Trading is no longer available
        </div>
      </div>
    );
  }

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        {isMulti ? (
          <div className="flex flex-col gap-2 w-full" data-tour="trading-outcome">
            {market.outcomes.slice(0, 2).map((outcome: any, idx: number) => {
              const color =
                OUTCOME_COLORS_MOBILE[idx % OUTCOME_COLORS_MOBILE.length];
              return (
                <button
                  key={outcome.id}
                  className={`${color.bg} border ${color.border} w-full rounded-xl`}
                  type="button"
                  onClick={() => {
                    setSelectedOutcomeId?.(outcome.id);
                    setSelectedOutcome("buy");
                  }}
                >
                  <div className="relative z-10 flex items-center justify-between px-4 py-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.15em] ${color.text}`}
                    >
                      {outcome.name}
                    </span>
                    <span className="text-lg font-mono font-black text-white tracking-tighter">
                      {outcome.quota.toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
            {market.outcomes.length > 2 && (
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                +{market.outcomes.length - 2} more outcomes
              </div>
            )}
          </div>
        ) : (
          <div
            className="flex items-center justify-center gap-2 w-full"
            data-tour="trading-outcome"
          >
            <button
              className="bg-blue-600/20 border border-blue-500 w-full rounded-xl"
              type="button"
              onClick={() => {
                setSelectedOption("buy");
                setSelectedOutcome("buy");
              }}
            >
              <div className="relative z-10 text-center py-2">
                <div
                  className={`text-[10px] font-black uppercase tracking-[0.2em]  transition-colors duration-500`}
                >
                  Buy: Yes
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tighter">
                  {market.buy_quota.toFixed(2)}
                </div>
              </div>
            </button>
            <button
              className="bg-red-600/20 border-red-500 border  w-full rounded-xl"
              onClick={() => {
                setSelectedOption("sell");
                setSelectedOutcome("sell");
              }}
            >
              <div className="relative z-10 text-center py-2">
                <div
                  className={`text-[10px] font-black uppercase tracking-[0.2em]  transition-colors duration-500 `}
                >
                  Buy: NO
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tighter">
                  {market.sell_quota.toFixed(2)}
                </div>
              </div>
            </button>
          </div>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div
                className={`${isMulti ? "text-blue-400" : selectedOption === "buy" ? "text-blue-400" : "text-red-400"} uppercase font-medium text-sm`}
              >
                {isMulti ? (
                  <>
                    BUY on{" "}
                    <span className="font-bold">
                      {market.outcomes.find(
                        (o: any) => o.id === selectedOutcomeId,
                      )?.name || market.asset}
                    </span>
                  </>
                ) : (
                  <>
                    {selectedOption === "buy" ? "Buying YES" : "Buying NO"} on{" "}
                    <span className="font-bold">{market.asset}</span>
                  </>
                )}
              </div>
              <div>
                <DrawerClose asChild>
                  <X />
                </DrawerClose>
              </div>
            </div>
            <DrawerTitle />
            <DrawerDescription />
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="mt-3 h-[220px]">
              {/* Multi-outcome selector inside drawer */}
              {isMulti && (
                <div className="mb-3 flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                  {market.outcomes.map((outcome: any, idx: number) => {
                    const color =
                      OUTCOME_COLORS_MOBILE[idx % OUTCOME_COLORS_MOBILE.length];
                    const isActive = selectedOutcomeId === outcome.id;
                    return (
                      <button
                        key={outcome.id}
                        onClick={() => setSelectedOutcomeId?.(outcome.id)}
                        className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                          isActive
                            ? `${color.bg} ${color.border} ${color.text}`
                            : "bg-white/5 border-white/10 text-slate-500"
                        }`}
                      >
                        {outcome.name} · {outcome.quota.toFixed(2)}
                      </button>
                    );
                  })}
                </div>
              )}
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
                      { label: "Max", value: userBalance?.balance },
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
                          units === String(typeof preset === "object" ? preset.value : preset)
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

                        // allow numbers + one decimal point
                        if (/^\d*\.?\d*$/.test(value)) {
                          setUnits(value);
                        }
                      }}
                      placeholder="Enter Amount"
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
                  ${userBalance?.balance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter>
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
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
