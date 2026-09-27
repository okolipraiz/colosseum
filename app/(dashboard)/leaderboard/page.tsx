"use client";
import { useState } from "react";
import Navbar from "@/components/dashboard/Navbar";
import { useGetLeaderBoard } from "@/hooks/leaderboard";
import { useGetMarkets } from "@/hooks/markets";
import { LoaderCircle, Trophy, TrendingDown } from "lucide-react";

const PERIOD_TABS = ["Weekly", "Monthly", "All"] as const;
type PeriodTab = (typeof PERIOD_TABS)[number];

const VIEW_TABS = ["Winners", "Losers", "Reset"] as const;
type ViewTab = (typeof VIEW_TABS)[number];

type SortCol = "profit" | "volume" | "winrate";

export default function LeaderboardPage() {
  const [periodTab, setPeriodTab] = useState<PeriodTab>("All");
  const [viewTab, setViewTab] = useState<ViewTab>("Reset");
  const [sortCol, setSortCol] = useState<SortCol>("profit");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const avatarStyle = (idx: number): React.CSSProperties => {
    const gradients = [
      "conic-gradient(from 0deg, #a855f7, #6366f1, #3b82f6, #a855f7)",
      "conic-gradient(from 90deg, #6366f1, #8b5cf6, #a855f7, #6366f1)",
      "conic-gradient(from 180deg, #6366f1, #4f46e5, #818cf8, #6366f1)",
      "linear-gradient(135deg, #22c55e, #a855f7, #ec4899)",
      "conic-gradient(from 45deg, #3b82f6, #a855f7, #ec4899, #3b82f6)",
      "linear-gradient(135deg, #f59e0b, #ef4444)",
    ];
    return { background: gradients[idx % gradients.length] };
  };

  const { data: markets, isLoading: isLoadingCategory } = useGetMarkets();

  const categories: any = Array.from(
    new Set((markets || []).map((m: any) => m.category).filter(Boolean)),
  );

  const { data: users, isLoading } = useGetLeaderBoard({
    category,
    period: periodTab.toLowerCase(),
  });

  // Filter by search
  let filtered =
    users?.filter((l: any) =>
      l.first_name.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  // Filter by view tab
  if (viewTab === "Winners") {
    filtered = filtered.filter((u: any) => u.profit_n_loss > 0);
  } else if (viewTab === "Losers") {
    filtered = filtered.filter((u: any) => u.profit_n_loss < 0);
  }

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortCol === "profit") return b.profit_n_loss - a.profit_n_loss;
    if (sortCol === "volume") return b.order_volume - a.order_volume;
    if (sortCol === "winrate") return b.win_rate - a.win_rate;
    return 0;
  });

  const getRankBadge = (idx: number) => {
    if (idx === 0) return "🥇";
    if (idx === 1) return "🥈";
    if (idx === 2) return "🥉";
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Leaderboard
          </h1>
        </div>

        {/* Period Tabs + Category */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex flex-wrap gap-1.5">
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setPeriodTab(tab)}
                  className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium border transition-all ${
                    periodTab === tab
                      ? "bg-[#1a1a1a] text-white border-[#3a3a3a]"
                      : "bg-transparent text-[#888] border-[#2a2a2a] hover:text-white hover:border-[#333]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Winners / Losers / All toggle */}
            <div className="flex flex-wrap gap-1.5">
              {VIEW_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setViewTab(tab)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    viewTab === tab
                      ? tab === "Winners"
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : tab === "Losers"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : "bg-[#1a1a1a] text-white border-[#3a3a3a]"
                      : "bg-transparent text-[#888] border-[#2a2a2a] hover:text-white hover:border-[#333]"
                  }`}
                >
                  {tab === "Winners" && <Trophy className="w-3.5 h-3.5" />}
                  {tab === "Losers" && <TrendingDown className="w-3.5 h-3.5" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isLoadingCategory}
            className="w-full md:w-auto px-4 py-2 rounded-lg border border-[#2a2a2a] bg-[#111] text-white text-sm font-semibold"
          >
            <option value="" className="bg-[#111] text-white">All Categories</option>
            {categories?.map((cat: any) => (
              <option key={cat} value={cat} className="bg-[#111] text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Table Container */}
        <div className="rounded-xl border border-[#1a1a1a] bg-[#0c0c0c] overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-3 px-3 py-3 border-b border-[#1a1a1a]">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="#555"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="bg-transparent outline-none text-sm flex-1 text-white placeholder:text-[#555]"
            />
          </div>

          {/* Scrollable table content wrapper */}
          <div className="overflow-x-auto">
            <div className="min-w-[620px]">
              {/* Header */}
              <div className="grid grid-cols-[40px_1fr_80px_80px_80px_100px] items-center px-3 py-3 border-b border-[#1a1a1a] text-[#777] text-xs font-semibold uppercase tracking-wide">
                <div />
                <div>Name</div>

                <button onClick={() => setSortCol("profit")} className="text-right">
                  <span className={sortCol === "profit" ? "text-white" : ""}>
                    P&L
                  </span>
                </button>

                <button
                  onClick={() => setSortCol("winrate")}
                  className="text-right"
                >
                  <span className={sortCol === "winrate" ? "text-white" : ""}>
                    Win %
                  </span>
                </button>

                <div className="text-right">W / L</div>

                <button onClick={() => setSortCol("volume")} className="text-right">
                  <span className={sortCol === "volume" ? "text-white" : ""}>
                    Volume
                  </span>
                </button>
              </div>

              {isLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <LoaderCircle
                    className="h-10 w-10 animate-spin text-blue-500"
                  />
                </div>
              ) : (
                <>
                  {/* Rows */}
                  {sorted.map((user, idx) => {
                    const profit = user.profit_n_loss;
                    const isPositive = profit >= 0;
                    const showBadge =
                      viewTab !== "Losers" && user.profit_n_loss > 0;

                    const badge = showBadge ? getRankBadge(idx) : null;

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-[40px_1fr_80px_80px_80px_100px] items-center px-3 py-4 border-b border-[#141414] hover:bg-[#111] transition-colors"
                      >
                        {/* Avatar + rank */}
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                              style={avatarStyle(idx)}
                            >
                              {user.first_name?.charAt(0)}
                            </div>

                            {badge && (
                              <div className="absolute -left-1 -bottom-1 text-sm leading-none">
                                {badge}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Name */}
                        <div className="flex items-center">
                          <span className="text-white text-sm font-medium truncate">
                            {user.first_name.trim()} .
                            {user.last_name.trim().slice(0, 1)}
                          </span>
                        </div>

                        {/* Profit */}
                        <div
                          className={`text-sm font-semibold text-right ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? "+" : "-"}${Math.abs(profit).toFixed(2)}
                        </div>

                        {/* Win Rate */}
                        <div className="text-sm text-right">
                          <span
                            className={
                              user.win_rate >= 50
                                ? "text-green-400"
                                : user.win_rate > 0
                                  ? "text-yellow-400"
                                  : "text-[#666]"
                            }
                          >
                            {user.win_rate.toFixed(0)}%
                          </span>
                        </div>

                        {/* Wins / Losses */}
                        <div className="text-xs text-right flex items-center justify-end gap-1">
                          <span className="text-green-400">{user.wins}</span>
                          <span className="text-[#444]">/</span>
                          <span className="text-red-400">{user.losses}</span>
                        </div>

                        {/* Volume */}
                        <div className="text-[#aaa] text-sm text-right">
                          ${user.order_volume.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state */}
                  {!sorted.length && (
                    <div className="text-center text-[#555] py-12 text-sm">
                      No users found
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="my-30" />
      </main>
    </div>
  );
}
