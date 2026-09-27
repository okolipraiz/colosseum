"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/dashboard/Navbar";
import AdminGuard from "@/components/admin/AdminGuard";
import CreateVaultModal from "@/components/admin/CreateVaultModal";
import ManageVaultModal from "@/components/admin/ManageVaultModal";
import { Vault, Plus, ShieldCheck, TrendingUp, RefreshCw, Copy, Check, Settings } from "lucide-react";

interface VaultPool {
  id: string;
  name: string;
  vault_address: string;
  asset: string;
  protocol: string;
  active: boolean;
  apy: number;
}

export default function AdminCreateVaultsPage() {
  return (
    <AdminGuard requireFullAdmin={true}>
      <AdminCreateVaultsPageContent />
    </AdminGuard>
  );
}

function AdminCreateVaultsPageContent() {
  const [pools, setPools] = useState<VaultPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedManagePool, setSelectedManagePool] = useState<VaultPool | null>(null);

  const fetchVaults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vaults`);
      if (res.ok) {
        const data = await res.json();
        setPools(data);
      }
    } catch (err) {
      console.error("Error fetching vaults:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedId(addr);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/[0.03] text-slate-300 border border-white/10 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Forecast Admin Panel
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Custom Vault Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Deploy and manage dedicated Forecast Soroban vaults on Stellar. Configure Treasury 20% fee cuts and strategy allocations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchVaults}
              className="p-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-slate-300 rounded-xl transition cursor-pointer"
              title="Refresh Vaults"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center gap-2 text-sm cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy New Vault</span>
            </button>
          </div>
        </div>

        {/* Vault List */}
        {pools.length === 0 && !loading ? (
          <div className="bg-[#0d0d0f]/60 border border-white/10 rounded-[2.5rem] p-12 text-center max-w-md mx-auto my-12 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Vault className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">No Yield Vaults Deployed Yet</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Create your first Forecast-owned yield vault to serve as prediction market yield escrows and user Earn Hub pools.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition border-none cursor-pointer"
            >
              Deploy First Vault
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <div key={pool.id} className="bg-[#0d0d0f]/60 border border-white/10 hover:border-white/20 transition-all duration-500 rounded-[2.5rem] p-6 shadow-xl flex flex-col justify-between relative overflow-hidden backdrop-blur-xl group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                        <Vault className="w-6 h-6 text-slate-300" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-100">{pool.name}</h3>
                        <span className="text-xs text-slate-400 capitalize">{pool.protocol} • {pool.asset}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 px-2.5 py-1 rounded-full">
                      <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-extrabold text-white">{pool.apy.toFixed(1)}% APY</span>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 mb-4 text-xs flex justify-between items-center">
                    <span className="text-slate-400">Contract ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-300 text-[11px] truncate max-w-[140px]" title={pool.vault_address}>
                        {pool.vault_address}
                      </span>
                      <button
                        onClick={() => handleCopy(pool.vault_address)}
                        className="text-slate-400 hover:text-white transition"
                      >
                        {copiedId === pool.vault_address ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Fee Cut: <strong className="text-slate-200 font-mono">20% Treasury</strong></span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      ● Active Pool
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedManagePool(pool)}
                    className="w-full py-2 bg-white/[0.03] hover:bg-white/[0.06] text-slate-200 font-semibold rounded-xl transition text-xs border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manage Vault Strategy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CreateVaultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchVaults();
        }}
      />

      <ManageVaultModal
        isOpen={!!selectedManagePool}
        onClose={() => setSelectedManagePool(null)}
        vault={selectedManagePool}
      />
    </div>
  );
}
