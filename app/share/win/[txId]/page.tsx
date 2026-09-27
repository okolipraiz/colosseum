import { Metadata } from "next";
import Link from "next/link";
import { Trophy, TrendingUp } from "lucide-react";

interface Props {
  params: Promise<{ txId: string }>;
}

interface WinData {
  question: string;
  side: string;
  payout: number;
  amount_wagered?: number;
}

async function fetchWinData(
  txId: string,
  baseUrl: string,
): Promise<WinData | null> {
  try {
    const res = await fetch(
      `${baseUrl}/orders/payout/transaction/${txId}/details`,
      {
        cache: "no-store",
      },
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Fetch failed:", e);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { txId } = await params;
  const frontUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:4000";
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const data = await fetchWinData(txId, baseUrl);

  const title = data
    ? `Won $${data.payout.toFixed(2)} on Forecast!`
    : "My Prediction Win!";
  const desc = data
    ? `I correctly predicted "${data.side}" for "${data.question}". Total payout: $${data.payout.toFixed(2)}`
    : "Check out my winning prediction on Forecast!";
  const imageUrl = `${frontUrl}/og-image.png`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: [{ url: imageUrl, width: 400, height: 600 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default async function ShareWinPage({ params }: Props) {
  const { txId } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const data = await fetchWinData(txId, baseUrl);

  const profit = data?.amount_wagered
    ? data.payout - data.amount_wagered
    : null;

  return (
    <div className="min-h-screen bg-[#080809] flex flex-col items-center justify-center p-4 text-white">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8 select-none">
        <img src="/logo-white.png" className="w-36" alt="logo" />
      </div>

      {/* Win Card */}
      <div className="w-full max-w-[340px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f0f11] mb-8">
        {/* Card top glow bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600  to-blue-400" />

        <div className="p-6 flex flex-col gap-5">
          {/* Trophy badge */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">
                Winning Prediction
              </p>
              <p className="text-sm font-black text-white">
                {data ? "Correct Call!" : "Winner!"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5" />

          {/* Question */}
          {data ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">
                Market
              </p>
              <p className="text-sm font-semibold text-slate-100 leading-snug">
                {data.question}
              </p>
            </div>
          ) : (
            <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
          )}

          {/* Predicted side pill */}
          {data && (
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">
                Predicted
              </p>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-black uppercase tracking-wide">
                {data.side}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-white/5" />

          {/* Payout row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-1">
                Total Payout
              </p>
              {data ? (
                <p className="text-4xl font-black text-white tracking-tight">
                  ${data.payout.toFixed(2)}
                </p>
              ) : (
                <div className="h-10 w-32 rounded-xl bg-white/5 animate-pulse" />
              )}
            </div>

            {profit !== null && profit > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-black">
                  +${profit.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card footer */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <p className="text-[11px] text-slate-600 font-medium">
            forecast.anomalyforex.com
          </p>
          <p className="text-[11px] text-slate-600 font-mono">
            #{txId.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-[340px]">
        <Link
          href="/markets"
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-center uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20 transition-all"
        >
          Predict Now on Forecast
        </Link>
        <Link
          href="/"
          className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-black text-center uppercase tracking-wider text-xs transition-all text-slate-300 hover:text-white"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
