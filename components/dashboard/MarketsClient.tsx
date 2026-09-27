"use client";
import Navbar from "@/components/dashboard/Navbar";
import MarketCard from "@/components/dashboard/MarketCard";
import { useGetMarkets } from "@/hooks/markets";
import { useState } from "react";
import MainBanner from "./MainBanner";
import { useAuth } from "@/context/auth-provider";
import { useGetUserInfo } from "@/hooks/user";
import AppTour, { type TourStep } from "@/components/dashboard/AppTour";
import { HelpCircle } from "lucide-react";

const TOUR_STEPS_BASE: TourStep[] = [
  {
    id: "category-filter",
    title: "Browse by category",
    description:
      "Filter markets by category, or check Trending for what's hot right now.",
  },
  {
    id: "market-outcome",
    title: "Pick your side",
    description:
      "Each market shows live odds. Tap an outcome to open a position at that price.",
  },
];

const TOUR_STEPS_AUTHED: TourStep[] = [
  {
    id: "wallet-balance",
    title: "Your balance",
    description: "This is your Forecast wallet. Fund it here to start trading.",
  },
  {
    id: "profile-menu",
    title: "Your account",
    description: "Notifications, account settings, and logout live here.",
  },
];

export default function MarketsClient() {
  const {isAccess} = useAuth();
  const { data: profile, isLoading: isLoadingProfile } = useGetUserInfo();
  const { data: markets, isLoading, isError } = useGetMarkets();
  const [category, setCategory] = useState("Trending");
  const [tourOpen, setTourOpen] = useState(false);
  const tourSteps = isAccess
    ? [...TOUR_STEPS_BASE, ...TOUR_STEPS_AUTHED]
    : TOUR_STEPS_BASE;

  const filteredMarkets =
    category === "Trending"
      ? [...(markets || [])].sort((a: any, b: any) => {
          // Trending markets first
          if (a.is_trending !== b.is_trending) {
            return b.is_trending ? 1 : -1;
          }

          // Then sort by volume
          return (b.orders_volume || 0) - (a.orders_volume || 0);
        })
      : category === "All"
        ? markets
        : markets?.filter((market: any) => market.category === category);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 md:mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              {!isLoadingProfile && isAccess ? `Welcome, ${profile?.first_name}!` : "Explore market"}
            </h1>

            <p className="text-slate-400 md:text-lg">
              Explore and predict outcomes across real-world events, business,
              politics, and financial markets
            </p>
          </div>

          <button
            onClick={() => setTourOpen(true)}
            className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/10 text-slate-400 hover:text-white hover:bg-white/6 hover:border-white/20 transition-all shrink-0 text-xs font-bold"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Take a tour</span>
          </button>
        </div>

        <MainBanner />
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
              .map((market: any, idx: number) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  isAdmin={false}
                  tourTarget={idx === 0 ? "market-outcome" : undefined}
                />
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

      <AppTour
        steps={tourSteps}
        storageKey="forecast_tour_markets_seen"
        ready={!isLoading && !!filteredMarkets && filteredMarkets.length > 0}
        open={tourOpen}
        onOpenChange={setTourOpen}
      />
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
    "Trending",
    ...Array.from(
      new Set(
        markets?.filter((m: any) => !m.resolved)?.map((m: any) => m.category),
      ),
    ),
  ];

  return (
    <div
      className="flex gap-3 mb-2 md:mb-8 overflow-x-auto pb-2"
      data-tour="category-filter"
    >
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
