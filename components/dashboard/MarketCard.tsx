"use client";

import Link from "next/link";
import ShareButton from "@/components/dashboard/ShareButton";
import { formatCompact } from "@/utils/truncate";
import { isMultiOutcomeMarket } from "@/types/market";
import { Download } from "lucide-react";
import { useState } from "react";
import PostMarketModal from "../admin/PostMarketModal";
import { formatDistanceToNow } from "date-fns";

export default function MarketCard({
  market,
  isAdmin = false,
  tourTarget,
}: any) {
  const isMulti = isMultiOutcomeMarket(market);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "School":
        return "from-blue-500 to-cyan-500";
      case "Politics":
        return "from-red-500 to-orange-500";
      case "Business":
        return "from-green-500 to-emerald-500";
      default:
        return "from-purple-500 to-pink-500";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "School":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Politics":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Business":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getStatus = () => {
    const now = new Date();
    // if (now < new Date(market.resolution_time)) return "Opening";
    if (now < new Date(market.closing_time)) return "Closing";
    return "Resolution due";
  };

  const getTime = () => {
    const now = new Date();
    const target =
      now < new Date(market.resolution_time)
        ? new Date(market.resolution_time)
        : now < new Date(market.closing_time)
          ? new Date(market.closing_time)
          : new Date(market.resolution_time);

    return formatDistanceToNow(target, { addSuffix: true });
  };

  // Color palette for multi-outcome options
  const outcomeColors = [
    { bg: "bg-blue-600/20", border: "border-blue-500", text: "text-blue-400" },
    {
      bg: "bg-purple-600/20",
      border: "border-purple-500",
      text: "text-purple-400",
    },
    {
      bg: "bg-amber-600/20",
      border: "border-amber-500",
      text: "text-amber-400",
    },
    {
      bg: "bg-emerald-600/20",
      border: "border-emerald-500",
      text: "text-emerald-400",
    },
    { bg: "bg-rose-600/20", border: "border-rose-500", text: "text-rose-400" },
  ];

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedMarketId, setIsSelectedMarketId] = useState("");

  const handleOpenDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPostModalOpen(true);
    setIsSelectedMarketId(market.id);
  };

  return (
    <>
      <Link
        href={isAdmin ? `/admin/markets/${market.id}` : `/markets/${market.id}`}
        className="block group"
      >
        <div className="block group">
          <div className="relative h-full bg-[#0d0d0f] rounded-[2rem] p-7 border border-white/[0.05] group-hover:border-white/10 transition-all duration-500 cursor-pointer overflow-hidden">
            {/* Glow Background (on hover) */}
            <div
              className={`absolute -inset-10 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-[80px] -z-10 bg-gradient-to-br ${getCategoryColor(market.category)}`}
            />

            {/* Header */}
            <div className="flex gap-2 justify-between items-center mb-6">
              <div className="flex gap-2 items-center">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryBadgeColor(
                    market.category,
                  )}`}
                >
                  {market.category}
                </span>

                {/* {isMulti && (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Multi
                </span>
              )} */}

                {isAdmin ? (
                  <>
                    <button
                      onClick={handleOpenDownload}
                      className="cursor-pointer p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group/share"
                    >
                      <Download className="w-3.5 h-3.5 group-hover/share:scale-110 transition-transform" />
                    </button>
                  </>
                ) : (
                  <ShareButton
                    marketId={market.id}
                    asset={market.asset}
                    question={market.question}
                    variant="icon"
                  />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold  tracking-wider">
                <div
                  className={`w-1.5 h-1.5 rounded-full animate-pulse 
                  bg-blue-500
                `}
                />

                {isAdmin ? (
                  <>
                    <div>
                      {getStatus()} {getTime()}
                    </div>
                  </>
                ) : (
                  <> Ends by Outcome</>
                )}
              </div>
            </div>

            {/* Asset */}
            <h3 className="text-white font-black line-clamp-2 text-xl mb-4 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-500">
              {market.question}
            </h3>

            {/* Description */}
            {market.description && (
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
                {market.description}
              </p>
            )}

            {/* Buttons: Binary vs Multi-Outcome */}
            {isMulti ? (
              <>
                <div className="flex flex-row gap-3" data-tour={tourTarget}>
                  {market.outcomes
                    .slice(0, 2)
                    .map((outcome: any, idx: number) => {
                      const color = outcomeColors[idx % outcomeColors.length];
                      return (
                        <div
                          key={outcome.id}
                          className={`${color.bg} border ${color.border} w-full rounded-lg`}
                        >
                          <div className="relative z-10 flex items-center justify-between px-4 py-5">
                            <span
                              className={`text-[10px] font-black uppercase tracking-[0.15em] ${color.text}`}
                            >
                              {outcome.name}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                              {outcome.quota.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {market.outcomes.length > 3 && (
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-right mt-2">
                    +{market.outcomes.length - 3} more
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 mt-4" data-tour={tourTarget}>
                <button
                  className="bg-blue-600/20 border border-blue-500 w-full rounded-lg"
                  type="button"
                >
                  <div className="relative z-10 text-center py-5">
                    <div
                      className={`text-[10px] font-black uppercase tracking-[0.2em]  transition-colors duration-500`}
                    >
                      Buy Yes - {(market.buy_quota ?? 0).toFixed(2)}
                    </div>
                  </div>
                </button>
                <button className="bg-red-600/20 border-red-500 border  w-full rounded-lg">
                  <div className="relative z-10 text-center py-5">
                    <div
                      className={`text-[10px] font-black uppercase tracking-[0.2em]  transition-colors duration-500 `}
                    >
                      Buy NO - {(market.sell_quota ?? 0).toFixed(2)}
                    </div>
                  </div>
                </button>
              </div>
            )}

            <div className="flex justify-between gap-4 mt-4">
              <div className="">
                <div className="text-[9px] font-mono font-black text-white text-left">
                  $ {formatCompact(market.orders_volume.toFixed(2))}{" "}
                  <span className="text-blue-400/60 mb-1 font-black uppercase tracking-widest ">
                    {" "}
                    Vol.
                  </span>
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono font-black text-white ">
                  {market.orders_count}{" "}
                  <span className="ml-1 text-blue-400/60 mb-1 font-black uppercase tracking-widest">
                    Orders
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar Styling */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/0 to-transparent group-hover:via-blue-500/20 transition-all duration-700" />
          </div>
        </div>
      </Link>

      <PostMarketModal
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setIsSelectedMarketId("");
        }}
        selectedMarketId={selectedMarketId}
      />
    </>
  );
}
