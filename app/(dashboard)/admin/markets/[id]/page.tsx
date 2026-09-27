import ShareButton from "@/components/dashboard/ShareButton";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  ChartNoAxesColumnDecreasing,
} from "lucide-react";
import Link from "next/link";
import { formatDistance, format } from "date-fns";
import { Metadata } from "next";
import { getMarket } from "@/hooks/markets";
import ActivitiesCard from "@/components/dashboard/ActivitiesCard";
import PredictionBar from "@/components/dashboard/PredictionBar";
import { formatCompact } from "@/utils/truncate";
import SellOrder from "@/components/dashboard/SellOrder";
import Description from "@/components/dashboard/Description";
import AdminNavbar from "@/components/admin/AdminNavbar";
import ResolvePanel from "@/components/admin/ResolvePanel";
import DeleteMarket from "@/components/admin/DeleteMarket";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = "https://useforecast.cc";
  const { id } = await params;

  const market = await getMarket(id);

  if (!market) return { title: "Forecast | Market Not Found" };

  return {
    title: market.asset
      ? ` Predict the outcome of ${market.asset} on Forecast`
      : "Predict the outcome on Forecast",
    description:
      market.description ||
      `Predict the outcome of ${market.asset} on Forecast.`,
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: market.asset
        ? ` Predict the outcome of ${market.asset} on Forecast`
        : "Predict the outcome on Forecast",
      description: market.description || `Trade on this prediction market.`,
      type: "article",
      siteName: "Forecast by anomaly",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Forecast by anomaly preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: market.asset
        ? ` Predict the outcome of ${market.asset} on Forecast`
        : "Predict the outcome on Forecast",
      description: market.description || `Trade on this prediction market.`,
      images: [`${baseUrl}/og-image.png`],
    },
  };
}

export default async function MarketDetailPage({ params }: Props) {
  const { id } = await params;

  const market = await getMarket(id);

  if (!market) redirect("/markets");

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "School":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Politics":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Business":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Background Glows */}
      {/* <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full -z-10" /> */}

      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <Link
          href="/admin"
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 text-sm font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Exit TRADE</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PredictionBar market={market} />
            {/* Market Header */}
            <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between gap-6 mb-8">
                <div className="flex gap-3">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryBadgeColor(
                      market.category,
                    )} shadow-sm`}
                  >
                    {market.category}
                  </span>
                  {market.outcome && (
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        market.outcome === "yes"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : market.outcome === "no"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                      } shadow-sm`}
                    >
                      Outcome: {market.outcome}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <ShareButton
                    marketId={id}
                    asset={market.asset}
                    question={market.question}
                  />
                  {/* {market.resolution_time && (
                    <div
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        market.resolution_time === "yes"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : market.resolution_time === "no"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-slate-500/10 text-slate-400 border border-white/10"
                      }`}
                    >
                      FINALIZED: {market.resolution_time.toUpperCase()}
                    </div>
                  )}
                  {new Date(market.resolution_time) < new Date() && (
                    <div className="px-4 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                      AWAITING ORACLE
                    </div>
                  )} */}
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tighter bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent break-words max-w-full">
                {market.question}
              </h1>

              {market.description && (
                <Description description={market?.description} />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-5">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                  <Calendar className="w-3 h-3 text-purple-500/50" />
                  <span>
                    Opens:{" "}
                    {format(new Date(market.created_at), "MMM dd, HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                  <Calendar className="w-3 h-3 text-red-500/50" />
                  <span>
                    Closes:{" "}
                    {format(new Date(market.closing_time), "MMM dd, HH:mm")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest leading-none">
                  <Calendar className="w-3 h-3 text-blue-500/50" />
                  <span>
                    Resolution:{" "}
                    {format(new Date(market.resolution_time), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 transition-colors hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    <ChartNoAxesColumnDecreasing className="w-4 h-4 text-blue-500/50" />
                    <span>Orders</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-mono font-black text-white">
                      {market.orders_count || 0}
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 transition-colors hover:bg-white/[0.05]">
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                    <TrendingUp className="w-4 h-4 text-green-500/50" />
                    <span>Liquidity Volume</span>
                  </div>
                  <div className="flex items-baseline gap-2 overflow-hidden">
                    <div className="text-2xl sm:text-3xl font-mono font-black text-white break-words">
                      ${formatCompact(market.orders_volume.toFixed(2))}
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 transition-colors hover:bg-white/[0.05]">
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">
                    {new Date() < new Date(market.closing_time)
                      ? "Locking Down"
                      : market.active
                        ? "Archive Status"
                        : "Awaiting Settlement"}
                  </div>
                  {market.resolved &&
                  new Date(market.closing_time + "Z") < new Date() ? (
                    <div
                      className={`${
                        market.outcome === "yes"
                          ? " text-blue-400 "
                          : market.outcome === "no"
                            ? "text-red-400"
                            : " text-slate-400 "
                      } text-xl font-black  uppercase tracking-tighter`}
                    >
                      Market Resolved: {market.outcome?.toUpperCase() || "N/A"}
                    </div>
                  ) : new Date() < new Date(market.closing_time + "Z") ? (
                    <div className="text-3xl font-mono font-black text-white">
                      {formatDistance(
                        new Date(market.closing_time + "Z"),
                        new Date(),
                        { addSuffix: true },
                      )}
                    </div>
                  ) : (
                    <div className="text-2xl font-black text-orange-500 uppercase tracking-tighter">
                      Settlement Window
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:hidden">
              <SellOrder market={market} />
            </div>

            {/* Price / Participant Chart */}
            {/* <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">
                  Live Analytics
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Real-time Feed
                  </span>
                </div>
              </div>
              <div className="h-[400px]">
                <MarketChart
                  transactions={transactions || []}
                  marketCreatedAt={market.created_at}
                />
              </div>
            </div> */}

            {/* Activities */}
            <ActivitiesCard marketId={market.id} />
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 transition-all duration-500">
              <ResolvePanel
                market={market}
                // userId={user.id}
              />

              <div className="my-3">
                <DeleteMarket market={market} />
              </div>
            </div>
          </div>
        </div>

        <div className="my-30"></div>
      </main>
    </div>
  );
}
