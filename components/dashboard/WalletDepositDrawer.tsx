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
import {
  ArrowDownLeft,
  ArrowRight,
  BanknoteArrowUp,
  Coins,
  Wallet2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function WalletDepositDrawer() {
  const router = useRouter();

  const handleSelectDeposit = (depositOption: string) => {
    if (depositOption === "fiat")
      router.push("/wallets/deposit?selectedDeposited=fiat");
    if (depositOption === "naira")
      router.push("/wallets/deposit?selectedDeposited=naira");
    if (depositOption === "crypto")
      router.push("/wallets/deposit?selectedDeposited=crypto");
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div>
          <button
            type="button"
            className="flex flex-col gap-2 items-center group"
          >
            <div className="w-12 h-12 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Deposit
            </span>
          </button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="bg-[#0d0d0f] border border-white/10 shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] ">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="font-bold text-md">Select Payment Method</div>
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
                onClick={() => handleSelectDeposit("fiat")}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <Wallet2 />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2 ">
                      Deposit Fiat
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-white/5 truncate max-w-[150px]">
                        Recommend
                      </span>
                    </div>
                    <div className="text-[10px] font-black text-slate-600 ">
                      Naira to Crypto, and Minimum deposit is ₦3000
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

              {/* Naira to naira */}
              <div
                className="flex items-center justify-between gap-6 cursor-pointer"
                onClick={() => handleSelectDeposit("naira")}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <BanknoteArrowUp />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2 ">
                      Deposit Naira
                    </div>
                    <div className="text-[10px] font-black text-slate-600 ">
                      Use Naira, to trade and Minimum deposit is ₦500
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
                onClick={() => handleSelectDeposit("crypto")}
              >
                <div className="flex items-center gap-2">
                  <div>
                    <Coins />
                  </div>
                  <div>
                    <div className="flex items-center flex-wrap gap-2 ">
                      Deposit Crypto
                    </div>
                    <div className="text-[10px] font-black text-slate-600 ">
                      More Choices, Better Prices, Fund your wallet directly
                      with USDT, BTC, or other supported assets
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
