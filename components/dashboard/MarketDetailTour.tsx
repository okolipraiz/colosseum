"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import AppTour, { type TourStep } from "@/components/dashboard/AppTour";

const TOUR_STEPS: TourStep[] = [
  {
    id: "outcome-odds",
    title: "Live odds",
    description:
      "This bar shows what the market currently believes — it re-prices in real time as positions come in.",
  },
  {
    id: "market-resolution",
    title: "When it resolves",
    description:
      "Every market lists when it opens, when it closes, and when the outcome gets resolved.",
  },
  {
    id: "trading-tabs",
    title: "Buy or sell",
    description: "Switch between opening a new position and selling one you already hold.",
  },
  {
    id: "trading-outcome",
    title: "Pick your outcome",
    description: "Select the outcome you want to back — price and odds update as you choose.",
  },
  {
    id: "trading-execute",
    title: "Execute your order",
    description: "Set an amount and confirm here. Your position goes live immediately.",
    // On mobile this lives inside a drawer that isn't mounted until opened —
    // tap the outcome trigger first so the drawer's content actually exists.
    openTrigger: "trading-outcome",
  },
];

export default function MarketDetailTour() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/10 text-slate-400 hover:text-white hover:bg-white/6 hover:border-white/20 transition-all text-xs font-bold"
      >
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Take a tour</span>
      </button>

      <AppTour
        steps={TOUR_STEPS}
        storageKey="forecast_tour_market_detail_seen"
        ready={true}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
