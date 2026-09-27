"use client";

import MarketCard from "@/components/dashboard/MarketCard";
import { useGetMarkets } from "@/hooks/markets";
import { useState } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";

export default function MarketsPage() {
  return (
    <AdminGuard requireFullAdmin={false}>
      <MarketsPageContent />
    </AdminGuard>
  );
}

function MarketsPageContent() {
  const { data: markets, isLoading, isError } = useGetMarkets();
  const [category, setCategory] = useState("All");

  const filteredMarkets =
    category === "All"
      ? markets
      : markets?.filter((market: any) => market.category === category);

  return (
    <div className="min-h-screen bg-black">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Admin market
          </h1>
          <p className="text-slate-400  md:text-lg">
            Explore and predict outcomes across real-world events, business,
            politics, and financial markets
          </p>
        </div>

        {/* Category Filter */}
        {!isLoading && (
          <CategoryFilter
            markets={markets}
            currentCategory={category}
            onSelectCategory={setCategory}
          />
        )}

        {isLoading ? (
          <div className="text-center py-16">
            <div className="loader mb-4"></div>
            <p className="text-slate-600 text-sm">Loading markets...</p>
          </div>
        ) : filteredMarkets && filteredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets
              ?.filter((market: any) => !market.resolved)
              .map((market: any) => (
                <MarketCard key={market.id} market={market} isAdmin={true} />
              ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-slate-500 text-lg mb-4">No markets found</div>
            <p className="text-slate-600 text-sm">
              Check back later for new prediction markets
            </p>
          </div>
        )}

        <div className="my-20"></div>
      </main>
    </div>
  );
}

function CategoryFilter({
  markets,
  currentCategory,
  onSelectCategory,
}: {
  markets: any;
  currentCategory?: string;
  onSelectCategory: (category: string) => void;
}) {
  const categories: any = [
    "All",
    ...Array.from(
      new Set(
        markets?.filter((m: any) => !m.resolved)?.map((m: any) => m.category),
      ),
    ),
  ];

  return (
    <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
      {categories?.map((category: any) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-5 py-2.5 cursor-pointer rounded-full font-medium whitespace-nowrap transition-all ${
            currentCategory === category
              ? "bg-[rgba(20,23,25,0.4)] backdrop-blur-lg text-white shadow-sm shadow-blue-500/50 border border-blue-500"
              : "bg-[rgba(20,23,25,0.4)] backdrop-blur-lg text-slate-300 hover:bg-slate-700 border border-slate-700"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
