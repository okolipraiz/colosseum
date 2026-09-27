
import { WalletDepositScreen } from "@/components/dashboard/WalletDepositScreen";
import Loading from "@/components/Loading";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const WalletPage = () => {
  return (
    <>
      <div className="min-h-screen bg-black">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-10">
            <Link href="/markets">
              <div>
                <img
                  src="/logo-white.png"
                  alt="Forecast Logo"
                  className="w-24 h-8"
                />
              </div>
            </Link>

            <Link
              href="/wallets/overview"
              className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all  text-sm font-black uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Go back</span>
            </Link>
          </div>
          <div className="mt-16">
            <Suspense fallback={<Loading />}>
              <WalletDepositScreen />
            </Suspense>
          </div>

          <div className="my-20"></div>
        </main>
      </div>
    </>
  );
};

export default WalletPage;
