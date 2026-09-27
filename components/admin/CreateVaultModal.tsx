"use client";

import { useState } from "react";
import { Vault, ShieldCheck, CheckCircle2, AlertCircle, ArrowUpRight, Wallet } from "lucide-react";
import { connectStellarWallet, signSorobanXdr } from "@/lib/defindex";

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateVaultModal({ isOpen, onClose, onSuccess }: CreateVaultModalProps) {
  const [name, setName] = useState("Forecast USD Vault");
  const [symbol, setSymbol] = useState("fUSD");
  const [asset, setAsset] = useState("USDC");
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet");
  const [feeBps, setFeeBps] = useState(1000); // 10.00% Performance Fee Cut
  const [depositTokens, setDepositTokens] = useState("20"); // 20 XLM / 10 USDC
  const [managerAddr, setManagerAddr] = useState("");
  const [feeReceiverAddr, setFeeReceiverAddr] = useState("");
  const [connectedAddr, setConnectedAddr] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOpen) return null;

  const handleAutoFillWallet = async () => {
    try {
      const addr = await connectStellarWallet(network.toUpperCase());
      if (!addr) {
        setStatusMsg({ type: "error", text: "Wallet connection was cancelled or failed." });
        return;
      }
      setConnectedAddr(addr);
      setManagerAddr(addr);
      setFeeReceiverAddr(addr);
    } catch (err: any) {
      setStatusMsg({ type: "error", text: "Failed to connect wallet for auto-fill." });
    }
  };

  const handleDeployVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managerAddr || !feeReceiverAddr) {
      setStatusMsg({ type: "error", text: "Please enter Manager and Fee Receiver wallet addresses." });
      return;
    }

    setIsProcessing(true);
    setStatusMsg(null);

    try {
      let activeAddr = connectedAddr;
      if (!activeAddr) {
        activeAddr = await connectStellarWallet(network.toUpperCase());
        if (!activeAddr) {
          throw new Error("Stellar wallet connection is required to sign deployment.");
        }
        setConnectedAddr(activeAddr);
      }

      const token = localStorage.getItem("access_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const amountStroops = Math.round(Number(depositTokens) * 1e7);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

      // 1. Request unsigned deployment XDR from backend gateway (or DeFindex API)
      const res = await fetch(`${baseUrl}/vaults/create`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name,
          symbol,
          asset,
          vault_fee_bps: Number(feeBps),
          amount: amountStroops,
          manager_address: managerAddr,
          fee_receiver_address: feeReceiverAddr,
          network,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        let errStr = data.detail || "Failed to generate vault deployment XDR.";
        if (typeof errStr === "object") errStr = JSON.stringify(errStr);
        throw new Error(errStr);
      }

      const respObj = data.data || data;
      const unsignedXdr = respObj.xdr || respObj.operationXDR || respObj.transaction_xdr || respObj.XDR;
      if (!unsignedXdr) {
        console.error("Missing XDR in response data keys:", Object.keys(data || {}));
        throw new Error(`No unsigned deployment XDR returned from Yield Factory. Response keys: ${Object.keys(data || {}).join(", ")}`);
      }

      // 2. Prompt Admin's wallet to sign deployment XDR
      const signedXdr = await signSorobanXdr(unsignedXdr, activeAddr, network.toUpperCase());
      if (!signedXdr) {
        throw new Error("Vault deployment signing was cancelled or failed.");
      }

      // 3. Broadcast signed deployment XDR to Stellar network
      const submitRes = await fetch(`${baseUrl}/vaults/create/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          signed_xdr: signedXdr,
          network,
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        throw new Error(submitData.detail || "Failed to broadcast vault deployment.");
      }

      const submitObj = submitData.data || submitData;
      const deployedContractId = submitObj.contract_address || submitObj.vault_address || respObj.predictedVaultAddress || submitObj.hash || "C_DEPLOYED_VAULT";

      // 4. Register newly deployed Vault in Forecast Database
      await fetch(`${baseUrl}/vaults/register`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name,
          vault_address: deployedContractId,
          asset,
          protocol: "defindex",
        }),
      });

      setStatusMsg({
        type: "success",
        text: `Successfully deployed & registered Forecast Vault! Contract Address: ${deployedContractId}`,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Vault deployment failed.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0d0d0f]/90 border border-white/10 rounded-[2.5rem] max-w-lg w-full p-6 shadow-2xl relative my-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
            <Vault className="w-5 h-5 text-slate-300" />
            <span>Deploy Custom Yield Vault</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm p-1 bg-transparent border-none cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleDeployVault} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Vault Name (Max 24 Chars)</label>
            <input
              type="text"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Symbol (Max 10 Chars)</label>
              <input
                type="text"
                value={symbol}
                maxLength={10}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Underlying Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-600"
              >
                <option value="USDC">USDC (Stablecoin)</option>
                <option value="XLM">XLM (Native Stellar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Network</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as "testnet" | "mainnet")}
              className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="testnet">Testnet (Stellar Test Network)</option>
              <option value="mainnet">Mainnet (Public Global Network)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">Manager Wallet Address</label>
              <button
                type="button"
                onClick={handleAutoFillWallet}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-transparent border-none"
              >
                <Wallet className="w-3 h-3" /> Auto-fill connected wallet
              </button>
            </div>
            <input
              type="text"
              value={managerAddr}
              onChange={(e) => setManagerAddr(e.target.value)}
              placeholder="GAAZI4TCR3..."
              className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-3.5 py-2.5 font-mono text-slate-100 text-xs focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Forecast Treasury Fee Receiver</label>
            <input
              type="text"
              value={feeReceiverAddr}
              onChange={(e) => setFeeReceiverAddr(e.target.value)}
              placeholder="GAAZI4TCR3..."
              className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-3.5 py-2.5 font-mono text-slate-100 text-xs focus:outline-none focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Initial Deposit Allocation ({asset})
            </label>
            <input
              type="number"
              value={depositTokens}
              onChange={(e) => setDepositTokens(e.target.value)}
              placeholder="e.g. 20"
              min={1}
              step="any"
              className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-600"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Amount deposited into strategies on vault initialization (Converted to {Number(depositTokens || 0) * 1e7} stroops).
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Platform Performance Fee (Basis Points: {feeBps} bps = {(feeBps / 100).toFixed(2)}%)
            </label>
            <input
              type="number"
              value={feeBps}
              onChange={(e) => setFeeBps(Number(e.target.value))}
              min={0}
              max={10000}
              className="w-full bg-[#0a0a0b] border border-white/5 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-600"
            />
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${statusMsg.type === "success"
                  ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-300"
                  : "bg-rose-950/60 border border-rose-500/40 text-rose-300"
                }`}
            >
              {statusMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50 border-none"
            >
              {isProcessing ? "Deploying Vault..." : "Deploy Vault"}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
