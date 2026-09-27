import type { Metadata } from "next";
import Navbar from "@/components/dashboard/Navbar";
import NotificationCard from "@/components/dashboard/NotificationCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const NotificationPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/markets"
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 text-sm font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Go back</span>
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Notifications
          </h1>
        </div>

        <NotificationCard />
      </main>
    </div>
  );
};

export default NotificationPage;
