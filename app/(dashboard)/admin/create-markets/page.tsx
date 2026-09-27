"use client";

import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";
import { CreateMarkets } from "@/components/admin/CreateMarkets";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateMarketsPage() {
  return (
    <AdminGuard requireFullAdmin={false}>
      <CreateMarketsPageContent />
    </AdminGuard>
  );
}

function CreateMarketsPageContent() {
  return (
    <div className="min-h-screen bg-black">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/admin "
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-10 text-sm font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Exit Create Market</span>
        </Link>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Create Markets
          </h1>
          <p className="text-slate-400  md:text-lg">
            Create new prediction markets for users to predict outcomes across
            real-world events, business, politics, and financial markets
          </p>
        </div>

        <CreateMarkets />

        <div className="my-20"></div>
      </main>
    </div>
  );
}
