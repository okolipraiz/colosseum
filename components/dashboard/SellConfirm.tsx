import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AlertTriangle } from "lucide-react";
import { OrderTypes } from "@/types/market";
import { useSellMarketOrders } from "@/hooks/markets";
import { toast } from "sonner";

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

const PLATFORM_FEE_PERCENT = 70;

interface SellConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedOrders: OrderTypes[];
  NGN_USD_RATE: number;
  market: any;
}

function ConfirmationContent({
  selectedOrders,
  onClose,
  onConfirm,
  market,
}: Omit<SellConfirmationProps, "open">) {
  const totalAmount = selectedOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalCost = selectedOrders.reduce((sum, o) => sum + o.quota, 0); 
  const platformFee = (totalAmount * PLATFORM_FEE_PERCENT) / 100;
  const payout = totalAmount - platformFee;
  const pnl = payout - totalAmount;
  const isProfit = pnl >= totalAmount;

  const { mutate, isPending } = useSellMarketOrders();

  const handleSellOrder = () => {
    if (market?.outcome || market?.resolved || new Date(market.closing_time + "Z") < new Date()) {
      toast.error("Market is closed for trading.");
      return;
    }
    toast.promise(
      new Promise((resolve, reject) => {
        mutate(
          {
            order_ids: [...selectedOrders.map((item) => item.id)],
          },
          {
            onSuccess: async (response) => {
              // router.push(routes.dashboard.page);
              onConfirm();
              resolve(response);
            },
            onError: (error) => {
              reject(error);
            },
          },
        );
      }),
      {
        loading: "Sumbitting, please wait...",
      },
    );
  };

  return (
    <div className="p-2 space-y-5">
      {/* Warning */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-yellow-400/80 font-bold uppercase tracking-wide leading-relaxed">
          Note: Selling before the outcome, always incurs loss and this action
          is irreversible. Once confirmed, your orders will be closed
          immediately.
        </p>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
            Total Value
          </span>
          <span className="font-mono font-black text-white text-sm">
            ${totalAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
            Early Exit Penalty ({PLATFORM_FEE_PERCENT}%)
          </span>
          <span className="font-mono font-black text-red-400 text-sm">
            - ${platformFee.toFixed(2)}
          </span>
        </div>

        <div className="h-px bg-white/10" />

        <div className="flex justify-between items-center">
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
            You Receive
          </span>
          <span className="font-mono font-black text-white text-lg">
            ${payout.toFixed(2)}
          </span>
        </div>
      </div>

      {/* PnL */}
      <div
        className={`rounded-2xl border p-4 flex items-center justify-between ${
          isProfit
            ? "bg-emerald-500/10 border-emerald-500/20"
            : "bg-red-500/10 border-red-500/20"
        }`}
      >
        <div>
          <div
            className={`text-[10px] font-black uppercase tracking-widest ${
              isProfit ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isProfit ? "🟢 Profit" : "🔴 Loss"}
          </div>
          <div className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase">
            vs your entry cost of ${totalCost / 100}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-xl font-mono font-black ${
              isProfit ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isProfit ? "+" : ""}${pnl.toFixed(2)}
          </div>
          <div
            className={`text-[10px] font-bold ${
              isProfit ? "text-emerald-400/60" : "text-red-400/60"
            }`}
          >
            {isProfit ? "+" : ""}
            {((pnl / totalCost) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border border-white/10 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
        >
          Cancel
        </button>
        <button
          disabled={isPending}
          onClick={handleSellOrder}
          className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-400 text-white text-[11px] font-black uppercase tracking-widest transition-all"
        >
          {isPending ? "Selling" : "   Confirm Sell"}
        </button>
      </div>
    </div>
  );
}

export function SellConfirmation({
  open,
  onClose,
  onConfirm,
  selectedOrders,
  NGN_USD_RATE,
  market,
}: SellConfirmationProps) {
  const isMobile = useIsMobile();

  const props = { selectedOrders, NGN_USD_RATE, onClose, onConfirm, market };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent className="bg-[#0d0d0f] border-white/10 px-4 pb-8">
          <DrawerHeader>
            <DrawerTitle className="text-white font-black uppercase tracking-widest text-sm">
              Confirm Sale — {selectedOrders?.length} Order
              {selectedOrders?.length > 1 ? "s" : ""}
            </DrawerTitle>
          </DrawerHeader>
          <ConfirmationContent {...props} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0d0d0f] border border-white/10 rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase tracking-widest text-sm">
            Confirm Sale — {selectedOrders?.length} Order
            {selectedOrders?.length > 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>
        <ConfirmationContent {...props} />
      </DialogContent>
    </Dialog>
  );
}
