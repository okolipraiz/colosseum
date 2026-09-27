"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Vault, TrendingUp, Wallet, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import { 
  connectStellarWallet, 
  prepareDepositXdr, 
  signSorobanXdr, 
  submitSignedXdr, 
  getVaultBalance, 
  prepareWithdrawXdr, 
  submitWithdrawSignedXdr 
} from "@/lib/defindex";

interface VaultCardProps {
  id: string;
  name: string;
  vaultAddress: string;
  asset: string;
  protocol: string;
  apy: number;
  connectedAddress?: string | null;
  setConnectedAddress?: (addr: string | null) => void;
}

export function VaultCard({ 
  name, 
  vaultAddress, 
  asset, 
  protocol, 
  apy,
  connectedAddress = null,
  setConnectedAddress
}: VaultCardProps) {
  const [amount, setAmount] = useState<string>("10");
  const [localWalletAddress, setLocalWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  const [balanceData, setBalanceData] = useState<{ balance_usd: number; shares: number } | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  const walletAddress = connectedAddress || localWalletAddress;

  const fetchBalance = useCallback(async (addr: string) => {
    setIsFetchingBalance(true);
    try {
      const data = await getVaultBalance(vaultAddress, addr);
      if (data && !data.error) {
        setBalanceData({
          balance_usd: parseFloat(data.balance_usd || 0),
          shares: parseFloat(data.shares || 0),
        });
      }
    } catch (err) {
      console.warn("Could not load vault balance:", err);
    } finally {
      setIsFetchingBalance(false);
    }
  }, [vaultAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
    } else {
      setBalanceData(null);
    }
  }, [walletAddress, fetchBalance]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setStatusMsg(null);
    const addr = await connectStellarWallet();
    if (addr) {
      if (setConnectedAddress) {
        setConnectedAddress(addr);
      } else {
        setLocalWalletAddress(addr);
      }
      fetchBalance(addr);
    } else {
      setStatusMsg({
        type: "error",
        text: "Wallet connection was cancelled or failed.",
      });
    }
    setIsConnecting(false);
  };

  const handleDeposit = async () => {
    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMsg({ type: "error", text: "Please enter a valid deposit amount." });
      return;
    }

    setIsProcessing(true);
    setStatusMsg(null);

    try {
      const prepRes = await prepareDepositXdr(vaultAddress, numAmount, walletAddress);
      if (prepRes.error) {
        throw new Error(prepRes.error);
      }

      const unsignedXdr = prepRes.xdr || prepRes.transaction_xdr;
      if (!unsignedXdr) {
        throw new Error("No transaction XDR returned from Yield Strategy.");
      }

      const signedXdr = await signSorobanXdr(unsignedXdr, walletAddress);
      if (!signedXdr) {
        throw new Error("Transaction signing was cancelled or failed.");
      }

      const submitRes = await submitSignedXdr(vaultAddress, signedXdr);
      if (submitRes.error) {
        throw new Error(submitRes.error);
      }

      setStatusMsg({
        type: "success",
        text: `Successfully deposited ${numAmount} ${asset} into ${name}! Tx Hash: ${submitRes.hash || "Submitted"}`,
      });

      fetchBalance(walletAddress);
    } catch (err: any) {
      let msg = err.message || "Vault deposit failed. Please try again.";
      try {
        const parsed = JSON.parse(msg);
        if (parsed.message) msg = parsed.message;
      } catch {}

      if (msg.includes("Account not found")) {
        msg = `Your Stellar wallet (${walletAddress}) is not activated on-chain yet. On Stellar, new accounts must be funded first. On Testnet, fund it instantly via Friendbot: https://friendbot.stellar.org/?addr=${walletAddress}`;
      } else if (msg.includes("MissingValue") || msg.includes("non-existing value")) {
        msg = `Vault contract (${vaultAddress}) storage is uninitialized or expired on Stellar Testnet. Please try another vault or deploy an active vault on our yield dashboard.`;
      }

      setStatusMsg({
        type: "error",
        text: msg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatusMsg({ type: "error", text: "Please enter a valid withdrawal amount." });
      return;
    }

    setIsProcessing(true);
    setStatusMsg(null);

    try {
      const prepRes = await prepareWithdrawXdr(vaultAddress, numAmount, walletAddress);
      if (prepRes.error) {
        throw new Error(prepRes.error);
      }

      const unsignedXdr = prepRes.xdr || prepRes.transaction_xdr;
      if (!unsignedXdr) {
        throw new Error("No transaction XDR returned from Yield Strategy.");
      }

      const signedXdr = await signSorobanXdr(unsignedXdr, walletAddress);
      if (!signedXdr) {
        throw new Error("Transaction signing was cancelled or failed.");
      }

      const submitRes = await submitWithdrawSignedXdr(vaultAddress, signedXdr);
      if (submitRes.error) {
        throw new Error(submitRes.error);
      }

      setStatusMsg({
        type: "success",
        text: `Successfully withdrew ${numAmount} ${asset} from ${name}! Tx Hash: ${submitRes.hash || "Submitted"}`,
      });

      fetchBalance(walletAddress);
    } catch (err: any) {
      let msg = err.message || "Vault withdrawal failed. Please try again.";
      try {
        const parsed = JSON.parse(msg);
        if (parsed.message) msg = parsed.message;
      } catch {}

      setStatusMsg({
        type: "error",
        text: msg,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openModalWithTab = (tab: "deposit" | "withdraw") => {
    setActiveTab(tab);
    setAmount("10");
    setStatusMsg(null);
    setShowModal(true);
  };

  return (
    <>
      <div className="relative h-full bg-[#0d0d0f] rounded-[2rem] p-7 border border-white/[0.05] group-hover:border-white/10 transition-all duration-500 overflow-hidden flex flex-col justify-between group">
        {/* Glow Background (on hover) */}
        <div className="absolute -inset-10 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-[80px] -z-10 bg-gradient-to-br from-blue-500 to-indigo-500 pointer-events-none" />
        
        <div>
          {/* Header */}
          <div className="flex gap-2 justify-between items-center mb-6">
            <div className="flex gap-2 items-center">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border bg-blue-500/20 text-blue-400 border-blue-500/30">
                {asset} Vault
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{apy.toFixed(1)}% APY</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-white font-black line-clamp-1 text-xl mb-1 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-500">
            {name}
          </h3>

          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
            {protocol} Strategy
          </div>

          <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed font-medium">
            Automated Stellar/Soroban yield strategy. Deposits earn compounding yield and support Forecast prediction pool liquidity.
          </p>

          {/* Contract address */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 mb-4 text-xs flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vault Contract</span>
            <span 
              className="font-mono text-slate-300 text-[11px] truncate max-w-[160px] cursor-pointer hover:text-blue-400 transition-colors" 
              title={vaultAddress}
              onClick={() => {
                navigator.clipboard.writeText(vaultAddress);
              }}
            >
              {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-6)}
            </span>
          </div>

          {/* User Live Balance Section */}
          {walletAddress && (
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 mb-6 text-xs flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Shares</span>
                {isFetchingBalance ? (
                  <span className="text-slate-500 animate-pulse">Loading...</span>
                ) : (
                  <span className="font-mono text-blue-400 font-extrabold">
                    {balanceData ? balanceData.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "0.00"} shares
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Value</span>
                {isFetchingBalance ? (
                  <span className="text-slate-500 animate-pulse">Loading...</span>
                ) : (
                  <span className="font-mono text-blue-300 font-bold">
                    {balanceData ? balanceData.balance_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "0.00"} {asset}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto relative z-10">
          <button
            onClick={() => openModalWithTab("deposit")}
            className="w-1/2 py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <span>Deposit</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => openModalWithTab("withdraw")}
            className="w-1/2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <span>Withdraw</span>
          </button>
        </div>

        {/* Bottom Bar Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/0 to-transparent group-hover:via-blue-500/20 transition-all duration-700" />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d0d0f] border border-white/5 rounded-[2rem] max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-xl text-slate-100 flex items-center gap-2">
                <Vault className="w-5 h-5 text-blue-400" />
                <span>Manage {name}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm p-1.5 bg-white/5 rounded-full border border-white/10 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex bg-white/[0.02] p-1 rounded-xl mb-4 border border-white/5">
              <button
                onClick={() => {
                  setActiveTab("deposit");
                  setStatusMsg(null);
                }}
                className={`w-1/2 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer border-none ${
                  activeTab === "deposit"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Deposit
              </button>
              <button
                onClick={() => {
                  setActiveTab("withdraw");
                  setStatusMsg(null);
                }}
                className={`w-1/2 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer border-none ${
                  activeTab === "withdraw"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Withdraw
              </button>
            </div>

            {/* Wallet status */}
            <div className="mb-4">
              {walletAddress ? (
                <div className="flex items-center justify-between text-xs bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-blue-300">
                  <div className="flex items-center gap-2 truncate max-w-[220px]">
                    <Wallet className="w-4 h-4 shrink-0 text-blue-400" />
                    <span className="font-mono truncate">{walletAddress}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (setConnectedAddress) {
                        setConnectedAddress(null);
                      } else {
                        setLocalWalletAddress(null);
                      }
                      setBalanceData(null);
                      setStatusMsg(null);
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest cursor-pointer bg-transparent border-none"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="w-full py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500 text-blue-400 text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  {isConnecting ? "Connecting Wallet..." : "Connect Stellar Wallet"}
                </button>
              )}
            </div>

            {/* Modal Balance Display */}
            {walletAddress && balanceData && (
              <div className="mb-4 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs flex justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">Your Shares</span>
                  <span className="font-bold font-mono text-slate-200">
                    {balanceData.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">Estimated Value</span>
                  <span className="font-bold font-mono text-blue-400">
                    ${balanceData.balance_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>
            )}

            {/* Amount input */}
            <div className="mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                Amount to {activeTab === "deposit" ? "Deposit" : "Withdraw"} ({asset})
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10.0"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono text-sm focus:outline-none focus:border-blue-500 focus:bg-white/[0.04] transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-widest text-slate-500">
                  {asset}
                </span>
              </div>
            </div>

            {/* Status Message */}
            {statusMsg && (
              <div
                className={`p-4 rounded-xl text-xs mb-6 flex items-start gap-2 border ${
                  statusMsg.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}
              >
                {statusMsg.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-1/2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-black uppercase tracking-wider text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={activeTab === "deposit" ? handleDeposit : handleWithdraw}
                disabled={isProcessing}
                className="w-1/2 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5 border-none cursor-pointer"
              >
                {isProcessing ? "Processing..." : activeTab === "deposit" ? "Confirm Deposit" : "Confirm Withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
