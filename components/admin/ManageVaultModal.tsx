"use client";

import { useState } from "react";
import { Vault, ShieldCheck, CheckCircle2, AlertCircle, Wallet, ArrowUpRight } from "lucide-react";
import { 
  connectStellarWallet, 
  signSorobanXdr, 
  submitWithdrawSignedXdr,
  prepareRebalanceXdr,
  prepareRescueXdr,
  preparePauseStrategyXdr,
  prepareUnpauseStrategyXdr,
  prepareUpgradeXdr
} from "@/lib/defindex";

interface ManageVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: {
    name: string;
    vault_address: string;
    asset: string;
  } | null;
}

type ManagementTab = "rebalance" | "rescue" | "pause" | "upgrade";

export default function ManageVaultModal({ isOpen, onClose, vault }: ManageVaultModalProps) {
  const [activeTab, setActiveTab] = useState<ManagementTab>("rebalance");
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet");
  const [callerAddr, setCallerAddr] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [rebalanceInstructions, setRebalanceInstructions] = useState<string>(
    JSON.stringify(
      [
        {
          "type": "Invest",
          "strategy_address": "CA3D5AJR5CGGBORDPAIKHD7OX46Z563J47YOWR2HJ447P2PZ4W64KNH7",
          "amount": 10000000
        }
      ],
      null,
      2
    )
  );
  const [strategyAddress, setStrategyAddress] = useState("");
  const [newWasmHash, setNewWasmHash] = useState("");

  if (!isOpen || !vault) return null;

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setStatusMsg(null);
    try {
      const addr = await connectStellarWallet(network.toUpperCase());
      if (addr) {
        setCallerAddr(addr);
      } else {
        setStatusMsg({
          type: "error",
          text: "Wallet connection was cancelled or failed.",
        });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Failed to connect Stellar wallet." });
    } finally {
      setIsConnecting(false);
    }
  };

  const executeAdminAction = async (prepareFn: () => Promise<any>, successText: string) => {
    if (!callerAddr) {
      setStatusMsg({ type: "error", text: "Please connect your admin/manager wallet first." });
      return;
    }

    setIsProcessing(true);
    setStatusMsg(null);

    try {
      // 1. Fetch unsigned XDR from backend
      const prepRes = await prepareFn();
      if (prepRes.error) {
        throw new Error(prepRes.error);
      }

      const unsignedXdr = prepRes.xdr || prepRes.transaction_xdr;
      if (!unsignedXdr) {
        throw new Error("No transaction XDR returned from backend.");
      }

      // 2. Request transaction signing
      const signedXdr = await signSorobanXdr(unsignedXdr, callerAddr, network.toUpperCase());
      if (!signedXdr) {
        throw new Error("Transaction signing was cancelled or failed.");
      }

      // 3. Submit signed XDR to network
      const submitRes = await submitWithdrawSignedXdr(vault.vault_address, signedXdr);
      if (submitRes.error) {
        throw new Error(submitRes.error);
      }

      setStatusMsg({
        type: "success",
        text: `${successText}! Tx Hash: ${submitRes.hash || "Submitted"}`,
      });
    } catch (err: any) {
      let msg = err.message || "Operation failed.";
      try {
        const parsed = JSON.parse(msg);
        if (parsed.message) msg = parsed.message;
      } catch (e) {}
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRebalance = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsedInstructions: any[];
    try {
      parsedInstructions = JSON.parse(rebalanceInstructions);
      if (!Array.isArray(parsedInstructions)) {
        throw new Error("Instructions must be a JSON array.");
      }
    } catch (err: any) {
      setStatusMsg({ type: "error", text: `Invalid JSON format: ${err.message}` });
      return;
    }

    await executeAdminAction(
      () => prepareRebalanceXdr(vault.vault_address, callerAddr, parsedInstructions),
      "Successfully submitted rebalance transaction"
    );
  };

  const handleRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strategyAddress) {
      setStatusMsg({ type: "error", text: "Please enter strategy address." });
      return;
    }
    await executeAdminAction(
      () => prepareRescueXdr(vault.vault_address, callerAddr, strategyAddress),
      `Successfully initiated rescue for strategy ${strategyAddress}`
    );
  };

  const handlePauseStrategy = async (pause: boolean) => {
    if (!strategyAddress) {
      setStatusMsg({ type: "error", text: "Please enter strategy address." });
      return;
    }
    const prepareFn = pause 
      ? () => preparePauseStrategyXdr(vault.vault_address, callerAddr, strategyAddress)
      : () => prepareUnpauseStrategyXdr(vault.vault_address, callerAddr, strategyAddress);

    await executeAdminAction(
      prepareFn,
      `Successfully ${pause ? "paused" : "unpaused"} strategy ${strategyAddress}`
    );
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWasmHash) {
      setStatusMsg({ type: "error", text: "Please enter new WASM hash." });
      return;
    }
    await executeAdminAction(
      () => prepareUpgradeXdr(vault.vault_address, callerAddr, newWasmHash),
      "Successfully prepared upgrade WASM transaction"
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d0d0f]/90 border border-white/10 rounded-[2.5rem] max-w-lg w-full p-6 shadow-2xl backdrop-blur-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto font-sans text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-300" />
            <span>Manage Vault: {vault.name}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-sm p-1 bg-transparent border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Info */}
        <div className="mb-4 text-xs bg-white/[0.02] border border-white/5 rounded-xl p-3 flex justify-between">
          <div>
            <span className="text-slate-400 block mb-0.5">Vault Address</span>
            <span className="font-mono text-slate-300 select-all truncate max-w-[200px] block">{vault.vault_address}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block mb-0.5">Asset</span>
            <span className="font-bold text-slate-200 block">{vault.asset}</span>
          </div>
        </div>

        {/* Network selector */}
        <div className="mb-4">
          <label className="block text-slate-300 font-semibold text-xs mb-1">Target Network</label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value as "testnet" | "mainnet")}
            disabled={!!callerAddr}
            className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-blue-600 font-medium disabled:opacity-50"
          >
            <option value="testnet">Testnet (Stellar Test Network)</option>
            <option value="mainnet">Mainnet (Public Global Network)</option>
          </select>
        </div>

        {/* Wallet connection */}
        <div className="mb-4">
          {callerAddr ? (
            <div className="flex items-center justify-between text-xs bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-300">
              <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                <Wallet className="w-4 h-4 shrink-0" />
                <span className="font-mono truncate">{callerAddr}</span>
              </div>
              <button
                onClick={() => {
                  setCallerAddr("");
                  setStatusMsg(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline shrink-0 ml-2 cursor-pointer bg-transparent border-none"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="w-full text-xs py-2 px-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-slate-200 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? "Connecting Wallet..." : "Connect Manager / Admin Wallet"}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0a0a0b] p-1 rounded-xl mb-6 border border-white/10">
          {(["rebalance", "rescue", "pause", "upgrade"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setStatusMsg(null);
              }}
              className={`w-1/4 py-1.5 text-[11px] font-bold rounded-lg transition-all capitalize cursor-pointer border ${
                activeTab === tab
                  ? "bg-white/[0.03] text-white border-white/10"
                  : "bg-transparent text-slate-400 hover:text-slate-200 border-transparent"
              }`}
            >
              {tab === "pause" ? "Pause" : tab}
            </button>
          ))}
        </div>

        {/* Tab Forms */}
        {activeTab === "rebalance" && (
          <form onSubmit={handleRebalance} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Rebalance Instructions (JSON Array)
              </label>
              <textarea
                value={rebalanceInstructions}
                onChange={(e) => setRebalanceInstructions(e.target.value)}
                rows={6}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-300 text-xs font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border-none cursor-pointer"
            >
              {isProcessing ? "Preparing Rebalance..." : "Confirm Rebalance"}
            </button>
          </form>
        )}

        {activeTab === "rescue" && (
          <form onSubmit={handleRescue} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Strategy Address to Rescue Assets From
              </label>
              <input
                type="text"
                placeholder="Strategy contract ID starting with C..."
                value={strategyAddress}
                onChange={(e) => setStrategyAddress(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border-none cursor-pointer"
            >
              {isProcessing ? "Preparing Rescue..." : "Confirm Rescue Operation"}
            </button>
          </form>
        )}

        {activeTab === "pause" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Strategy Address
              </label>
              <input
                type="text"
                placeholder="Strategy contract ID starting with C..."
                value={strategyAddress}
                onChange={(e) => setStrategyAddress(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handlePauseStrategy(true)}
                disabled={isProcessing}
                className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer border-none"
              >
                Pause Strategy
              </button>
              <button
                onClick={() => handlePauseStrategy(false)}
                disabled={isProcessing}
                className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer border-none"
              >
                Unpause Strategy
              </button>
            </div>
          </div>
        )}

        {activeTab === "upgrade" && (
          <form onSubmit={handleUpgrade} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                New WASM Code Hash
              </label>
              <input
                type="text"
                placeholder="Enter 64-character hex hash..."
                value={newWasmHash}
                onChange={(e) => setNewWasmHash(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border-none cursor-pointer"
            >
              {isProcessing ? "Preparing Upgrade..." : "Confirm WASM Upgrade"}
            </button>
          </form>
        )}

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`p-3 rounded-lg text-xs mt-6 flex items-start gap-2 ${
              statusMsg.type === "success"
                ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-300"
                : "bg-rose-950/60 border border-rose-500/40 text-rose-300"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <span className="break-all">{statusMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
