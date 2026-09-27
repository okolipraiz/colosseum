'use client'
import { Check } from "lucide-react";

export const DepositSuccessScreen = ({
  amount,
  paymentMethod,
  onContinue,
}: {
  amount: number;
  paymentMethod: string;
  onContinue: () => void;
}) => {
  return (
    <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="mx-auto w-24 h-24 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center animate-in zoom-in-75 duration-500">
          <Check className="w-12 h-12 text-green-400" />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.35em] font-black text-green-400">
            Deposit Successful
          </div>

          <div className="text-4xl font-black text-white">
            {paymentMethod === "naira"
              ? `₦${Number(amount).toLocaleString()}`
              : `$${Number(amount).toFixed(2)}`}
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            Your funds have been added to your wallet and are now available for
            trading.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 uppercase font-bold tracking-wider">
              Status
            </span>
            <span className="text-green-400 font-black uppercase">
              Completed
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-slate-500 uppercase font-bold tracking-wider">
              Funds Added
            </span>
            <span className="text-white font-black">
              {paymentMethod === "naira"
                ? `₦${Number(amount).toLocaleString()}`
                : `$${Number(amount).toFixed(2)}`}
            </span>
          </div>
        </div>

        <button
          type='button'
          onClick={onContinue}
          className="cursor-pointer w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 transition-all text-white font-black uppercase tracking-widest text-xs"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
