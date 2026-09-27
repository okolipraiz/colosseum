import Navbar from "@/components/dashboard/Navbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const LegalSection = ({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3 py-6 border-b border-white/10 last:border-b-0">
    <h2 className="text-lg md:text-xl font-bold text-white">{heading}</h2>
    <div className="flex flex-col gap-3 text-slate-400 text-sm leading-relaxed">
      {children}
    </div>
  </section>
);

const LegalPageLayout = ({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 text-sm font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Go back</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            {title}
          </h1>
          <p className="text-slate-500 text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 sm:px-8">
          {children}
        </div>
      </main>

      <div className="my-30" />
    </div>
  );
};

export default LegalPageLayout;
