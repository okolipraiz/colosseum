"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/dashboard/Navbar";
import { VaultCard } from "@/components/earn/VaultCard";
import { Vault, TrendingUp, ShieldCheck, Layers, Wallet, Loader2 } from "lucide-react";
import axios from "axios";
import { connectStellarWallet, getStellarAccountBalance, disconnectStellarWallet } from "@/lib/defindex";

interface YieldPool {
  id: string;
  name: string;
  vault_address: string;
  asset: string;
  protocol: string;
  active: boolean;
  apy: number;
}

export default function EarnPage() {
  const [pools, setPools] = useState<YieldPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<{ xlm: number; usdc: number } | null>(null);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [copied, setCopied] = useState(false);

  // Restore previous wallet session on mount if address is stored in local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeAddr = localStorage.getItem("@StellarWalletsKit/activeAddress");
      if (activeAddr) {
        setConnectedAddress(activeAddr);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchVaults() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";
        const res = await axios.get(`${baseUrl}/vaults`);
        setPools(res.data);
      } catch (err) {
        console.warn("Could not load yield pools:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVaults();
  }, []);

  useEffect(() => {
    async function loadBalance() {
      if (connectedAddress) {
        setFetchingBalance(true);
        const bal = await getStellarAccountBalance(connectedAddress);
        setBalances(bal);
        setFetchingBalance(false);
      } else {
        setBalances(null);
      }
    }
    loadBalance();
  }, [connectedAddress]);

  const handleCopy = () => {
    if (connectedAddress) {
      navigator.clipboard.writeText(connectedAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnectWallet = async () => {
    const addr = await connectStellarWallet();
    if (addr) setConnectedAddress(addr);
  };

  // Find max APY from pools or default to 12.4%
  const maxApy = pools.length > 0 ? Math.max(...pools.map(p => p.apy)) : 12.4;

  return (
    <div className="min-h-screen bg-[#060608] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:py-10 space-y-8">
        {/* Header Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Forecast Earn
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Deposit assets into automated Soroban yield vaults. Compounding yield builds platform treasury revenue while providing loss protection!
          </p>
        </div>

        {/* Metric Cards Grid - Styled like Portfolio */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 scrollbar-none">
          {/* Card 1: Stellar Account Status */}
          {connectedAddress ? (
            <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-blue-500/30 group min-w-[72vw] md:min-w-0">
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    Stellar Account
                    {copied && (
                      <span className="text-[9px] text-emerald-400 font-normal normal-case">Copied!</span>
                    )}
                  </p>
                  <h3
                    className="text-lg font-mono font-bold mt-3 truncate text-slate-200 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={handleCopy}
                    title={connectedAddress}
                  >
                    {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-6)}
                  </h3>
                  <div className="mt-2 space-y-0.5">
                    <div className="text-[10px] text-slate-400 font-mono">
                      {fetchingBalance ? "Loading..." : `${balances ? balances.xlm.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "0.00"} XLM`}
                    </div>
                    <div className="text-[10px] text-blue-400 font-mono">
                      {fetchingBalance ? "Loading..." : `${balances ? balances.usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"} USDC`}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <button
                    onClick={async () => {
                      await disconnectStellarWallet();
                      setConnectedAddress(null);
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors bg-transparent border-none cursor-pointer mt-1"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
            </div>
          ) : (
            <div
              className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-blue-500/30 group min-w-[72vw] md:min-w-0 cursor-pointer"
              onClick={handleConnectWallet}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Stellar Account
                  </p>
                  <h3 className="text-2xl font-black mt-3 tracking-tight text-slate-300 group-hover:text-blue-400 transition-colors">
                    Connect Wallet
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-2 block">
                    Self-custodial Soroban access
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
            </div>
          )}

          {/* Card 2: Highest APY */}
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-emerald-500/30 group min-w-[72vw] md:min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Highest APY
                </p>
                <h3 className="text-2xl md:text-3xl font-black mt-3 tracking-tight text-emerald-400">
                  {maxApy.toFixed(1)}% APY
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-2 block">
                  Compounding yield strategies
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
          </div>

          {/* Card 3: Yield Protocol */}
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-purple-500/30 group min-w-[72vw] md:min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Yield Protocol
                </p>
                <h3 className="text-2xl md:text-3xl font-black mt-3 tracking-tight text-purple-400">
                  Forecast
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-2 block">
                  Stellar Soroban Contracts
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
          </div>

          {/* Card 4: Platform Treasury Share */}
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-2xl transition-all duration-300 hover:border-blue-500/30 group min-w-[72vw] md:min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Loss Protection Fee
                </p>
                <h3 className="text-2xl md:text-3xl font-black mt-3 tracking-tight text-blue-400">
                  20% Fee
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-2 block">
                  Funds protection pool
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
          </div>
        </div>

        {/* Yield Pools Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-md md:text-xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <Vault className="w-5 h-5 text-blue-500" />
              <span>Available Yield Pools</span>
            </h2>
            <span className="text-xs text-slate-400">
              {pools.length} Pools Deployed
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <span className="text-sm font-black uppercase tracking-widest text-slate-500">
                Loading yield pools...
              </span>
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Vault className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">
                No Forecast Yield Vaults Deployed Yet
              </p>
              <p className="text-slate-600 text-xs max-w-md mx-auto leading-relaxed">
                Forecast Admins can deploy custom Soroban yield vaults in the Admin Panel to populate Earn Hub pools.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pools.map((pool) => (
                <VaultCard
                  key={pool.id}
                  id={pool.id}
                  name={pool.name}
                  vaultAddress={pool.vault_address}
                  asset={pool.asset}
                  protocol={pool.protocol}
                  apy={pool.apy}
                  connectedAddress={connectedAddress}
                  setConnectedAddress={setConnectedAddress}
                />
              ))}
            </div>
          )}
        </div>

        <div className="my-28"/>
      </main>
    </div>
  );
}
