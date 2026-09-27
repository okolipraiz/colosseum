"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  // DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ArrowRight, ArrowUpRight, BanknoteArrowDown, HandCoins, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function WallWithdrawalDrawer() {
  const router = useRouter();

  const handleSelectWithdrawal = (walletOption: string) => {
    if (walletOption === "bank")
      router.push("/wallets/withdrawal?selectedWithdraw=fiat");
    if (walletOption === "crypto")
      router.push("/wallets/withdrawal?selectedWithdraw=crypto");
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div>
          <button
            type="button"
            className="flex flex-col gap-2 items-center group"
          >
            <div className="w-12 h-12 bg-purple-600/10 rounded-full flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Withdraw
            </span>
          </button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="bg-[#0d0d0f] border border-white/10 shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] ">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="font-bold text-md">Select Withdrawal Method</div>
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
            <div className="mt-3 h-[220px] space-y-8">
              <div
                className="flex items-center justify-between gap-6 cursor-pointer"
                onClick={() => handleSelectWithdrawal("bank")}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <BanknoteArrowDown />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2 ">
                      Withdraw Fiat
                    </div>
                    <div className="text-[10px] font-black text-slate-600">
                      Receive cash instantly in your bank account or e-wallet
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div
                    className={`text-md md:text-2xl font-mono font-black  tracking-tighter`}
                  >
                    <ArrowRight />
                  </div>
                </div>
              </div>

              {/* Crypto */}
              <div
                className="flex items-center justify-between gap-6 cursor-pointer"
                onClick={() => handleSelectWithdrawal("crypto")}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <HandCoins />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2 ">
                      Crypto Withdrawal
                    </div>
                    <div className="text-[10px] font-black text-slate-600 ">
                      On-chain withdrawal
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div
                    className={`text-md md:text-2xl font-mono font-black  tracking-tighter`}
                  >
                    <ArrowRight />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <DrawerFooter>
            <button
              className={`w-full py-3 rounded-[12px] text-white text-lg transition
            bg-blue-500`}
            >
              Proceed
            </button>
          </DrawerFooter> */}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
