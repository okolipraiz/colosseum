import AffiliateSettings from "@/components/dashboard/AffiliateSettings";
import Navbar from "@/components/dashboard/Navbar";
import { Users2 } from "lucide-react";

const AffiliatePage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full -z-10" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Users2 className="w-3 h-3" />
            <span>Affiliate</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
            Affiliate Settings
          </h1>
          <p className="text-slate-500 text-lg mt-2 font-medium">
            Monitor and manage your affiliate settings, track referrals, and
            optimize your earnings with ease.
          </p>
        </div>

        <AffiliateSettings />

        <div className="my-20"></div>
      </main>
    </div>
  );
};

export default AffiliatePage;
