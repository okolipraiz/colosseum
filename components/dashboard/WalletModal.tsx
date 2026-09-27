"use client";

import {
  useCreateRecipient,
  useFundWallet,
  useFundWalletCrypto,
  useFundWalletNOWPayments,
  useFundWalletNgn,
  useGetBanks,
  useGetLiveRate,
  useGetRecipients,
  useGetWalletBalance,
  useWithdrawFunds,
  useWithdrawFundsCrypto,
  useWithdrawNOWPayments,
} from "@/hooks/user";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Landmark,
  Plus,
  RefreshCw,
  Shield,
  Wallet,
  Copy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { CopyToClipboard } from "react-copy-to-clipboard";

export const CRYPTO_NETWORKS = [
  // Busha
  {
    id: "USDT-BSC",
    label: "USDT (BSC)",
    currency: "USDT",
    network: "BSC",
    gateway: "busha",
  },
  {
    id: "USDT-TRX",
    label: "USDT (Tron)",
    currency: "USDT",
    network: "TRX",
    gateway: "busha",
  },
  // NOWPayments
  {
    id: "usdcstellar",
    label: "USD (Stellar)",
    currency: "XLM",
    network: "XLM",
    gateway: "nowpayments",
  },
  {
    id: "usdtsol",
    label: "USDT (Solana)",
    currency: "USDTSOL",
    network: "SOL",
    gateway: "nowpayments",
  },
];

export default function WalletModal({ profile, isOpen, onClose }: any) {
  const { data: rate } = useGetLiveRate();
  const NGN_USD_RATE = rate?.rate || 1500;
  const [activeTab, setActiveTab] = useState<
    "overview" | "deposit" | "withdraw"
  >("overview");
  const [depositDetails, setDepositDetails] = useState<any>(null);
  const [ngnAmount, setNgnAmount] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"fiat" | "crypto">("fiat");
  const [cryptoAmount, setCryptoAmount] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("usdcstellar");
  const { data: walletData, refetch: refetchBalance } = useGetWalletBalance();
  const fundWallet = useFundWallet();
  const fundWalletCrypto = useFundWalletCrypto();
  const fundWalletNOWPayments = useFundWalletNOWPayments();
  const fundWalletNgn = useFundWalletNgn();

  const [fiatMethod, setFiatMethod] = useState<"standard" | "quick">(
    "standard",
  );

  const { data: banks } = useGetBanks();
  const { data: recipients } = useGetRecipients();
  const createRecipient = useCreateRecipient();
  const withdrawFunds = useWithdrawFunds();
  const withdrawFundsCrypto = useWithdrawFundsCrypto();
  const withdrawNOWPayments = useWithdrawNOWPayments();

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [newBank, setNewBank] = useState({
    account_name: "",
    account_number: "",
    bank_name: "",
    bank_code: "",
  });
  const [withdrawalType, setWithdrawalType] = useState<"bank" | "crypto">(
    "bank",
  );
  const [cryptoWithdrawNetwork, setCryptoWithdrawNetwork] =
    useState<string>("usdcstellar");
  const [cryptoWithdrawAddress, setCryptoWithdrawAddress] =
    useState<string>("");

  const handleCreateBank = async () => {
    if (
      !newBank.account_name ||
      !newBank.account_number ||
      !newBank.bank_name ||
      !newBank.bank_code
    ) {
      toast.error("Please fill all bank details");
      return;
    }
    createRecipient.mutate(newBank, {
      onSuccess: () => {
        setIsAddingBank(false);
        setNewBank({
          account_name: "",
          account_number: "",
          bank_name: "",
          bank_code: "",
        });
      },
    });
  };

  const handleWithdraw = async () => {
    if (walletData.balance < 2) {
      toast.error(
        "Insufficient balance for withdrawal, Minimum  withdrawal balance required is 2 USDT",
      );
      return;
    }

    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedRecipientId) {
      toast.error("Please select a bank account");
      return;
    }

    withdrawFunds.mutate(
      {
        busha_recipient_id: selectedRecipientId,
        amount: Number(withdrawAmount),
      },
      {
        onSuccess: () => {
          setWithdrawAmount("");
          setActiveTab("overview");
        },
      },
    );
  };

  const handleCryptoWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!cryptoWithdrawAddress) {
      toast.error("Please enter a crypto address");
      return;
    }
    if (!cryptoWithdrawNetwork) {
      toast.error("Please select a network");
      return;
    }

    const network = CRYPTO_NETWORKS.find((n) => n.id === cryptoWithdrawNetwork);
    if (!network) {
      toast.error("Invalid network selected");
      return;
    }

    if (network.gateway === "nowpayments") {
      withdrawNOWPayments.mutate(
        {
          amount: Number(withdrawAmount),
          currency: network.currency,
          address: cryptoWithdrawAddress,
        },
        {
          onSuccess: () => {
            setWithdrawAmount("");
            setCryptoWithdrawAddress("");
            setActiveTab("overview");
          },
        },
      );
    } else {
      withdrawFundsCrypto.mutate(
        {
          amount: Number(withdrawAmount),
          network: network.network,
          address: cryptoWithdrawAddress,
          currency: network.currency,
        },
        {
          onSuccess: () => {
            setWithdrawAmount("");
            setCryptoWithdrawAddress("");
            setActiveTab("overview");
          },
        },
      );
    }
  };

  const handleFund = async () => {
    if (!ngnAmount || isNaN(Number(ngnAmount)) || Number(ngnAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (ngnAmount < 3000) {
      toast.error("Minimum deposit amount is 3000 NGN");
      return;
    }
    fundWallet.mutate(
      {
        amount: Number(ngnAmount),
        source_currency: "NGN",
        target_currency: "USDT",
        pay_in_type: "temporary_bank_account",
      },
      {
        onSuccess: (data) => {
          setDepositDetails(data);
        },
      },
    );
  };

  const handleFundNgnQuick = async () => {
    if (!ngnAmount || isNaN(Number(ngnAmount)) || Number(ngnAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    // Quick deposit allows lower minimums
    if (ngnAmount < 500) {
      toast.error("Minimum quick deposit amount is 500 NGN");
      return;
    }
    fundWalletNgn.mutate(
      {
        amount: Number(ngnAmount),
        source_currency: "NGN",
        target_currency: "NGN",
        pay_in_type: "temporary_bank_account",
      },
      {
        onSuccess: (data) => {
          setDepositDetails(data);
        },
      },
    );
  };

  const handleFundCrypto = async () => {
    if (
      !cryptoAmount ||
      isNaN(Number(cryptoAmount)) ||
      Number(cryptoAmount) <= 0
    ) {
      toast.error("Please enter a valid amount");
      return;
    }

    const network = CRYPTO_NETWORKS.find((n) => n.id === selectedNetwork);
    if (!network) {
      toast.error("Invalid network selected");
      return;
    }

    if (network.gateway === "nowpayments") {
      fundWalletNOWPayments.mutate(
        {
          amount: Number(cryptoAmount),
          source_currency: network.currency,
        },
        {
          onSuccess: (data) => {
            setDepositDetails(data);
          },
        },
      );
    } else {
      fundWalletCrypto.mutate(
        {
          amount: Number(cryptoAmount),
          source_currency: network.currency,
          target_currency: "USDT",
          pay_in_type: "address",
          network: network.network,
        },
        {
          onSuccess: (data) => {
            setDepositDetails(data);
          },
        },
      );
    }
  };

  const onCopyHandler = (values: any, label: string) => {
    if (label === "bank_name") {
      toast.info(
        `Bank Name ${values.toUpperCase()} copied to clipboard successfully.`,
      );
    } else if (label === "account_number") {
      toast.info(
        `Account Number ${values.toUpperCase()} copied to clipboard successfully.`,
      );
    } else if (label === "account_name") {
      toast.info(
        `Account Name ${values.toUpperCase()} copied to clipboard successfully.`,
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      refetchBalance();
    }
  }, [isOpen, refetchBalance]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 ">
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-[#0d0d0f] rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 blur-[80px] rounded-full -z-10" />

        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Balance
              </h2>
              <p className="hidden md:flex text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">
                Registry ID: {profile?.id?.slice(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-xs uppercase"
          >
            ESC
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {(["overview", "deposit", "withdraw"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
              <div className="text-center py-10 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
                <div className="relative z-10">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block">
                    Total Valuation (USDT)
                  </span>
                  <div className="text-6xl font-mono font-black text-white tracking-tighter mb-2">
                    $
                    {(walletData?.balance.toFixed(2) ?? 0.0)?.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest">
                    <Shield className="w-3 h-3" />
                    Asset Protection Active
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab("deposit")}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                    <ArrowDownLeft className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Deposit
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("withdraw")}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 hover:bg-white/[0.05] transition-all group"
                >
                  <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">
                    Withdraw
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "deposit" && (
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">
              <div className="p-3 md:p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                {depositDetails ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-center">
                      <div className="text-[10px] uppercase font-black tracking-widest text-blue-400 mb-1">
                        {paymentMethod === "crypto"
                          ? "Amount to Send"
                          : fiatMethod === "quick"
                            ? "Target Amount (NGN)"
                            : "Target Amount (USDT)"}
                      </div>
                      <div className="text-3xl font-black text-white">
                        {paymentMethod === "crypto"
                          ? depositDetails.pay_amount
                            ? `${depositDetails.pay_amount} ${depositDetails.pay_currency?.toUpperCase()}`
                            : `$${Number(depositDetails.target_amount).toFixed(2)}`
                          : fiatMethod === "quick"
                            ? `₦${Number(depositDetails.target_amount).toLocaleString()}`
                            : `$${Number(depositDetails.target_amount).toFixed(2)}`}
                      </div>
                      {paymentMethod === "crypto" &&
                        depositDetails.price_amount && (
                          <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            ≈ ${Number(depositDetails.price_amount).toFixed(2)}{" "}
                            USD Credit
                          </div>
                        )}
                      {fiatMethod === "quick" ? (
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          ≈ $
                          {(
                            Number(depositDetails.target_amount) / NGN_USD_RATE
                          ).toFixed(2)}{" "}
                          USDT
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                          ≈ ₦
                          {Number(
                            depositDetails.target_amount * NGN_USD_RATE,
                          ).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {paymentMethod === "fiat" ? (
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold uppercase md:tracking-widest">
                            Bank Name
                          </span>
                          <div className="flex items-center gap-1 text-white font-mono font-black">
                            <div>
                              {
                                depositDetails.pay_in?.recipient_details
                                  ?.bank_name
                              }
                            </div>

                            <CopyToClipboard
                              text={
                                depositDetails.pay_in?.recipient_details
                                  ?.bank_name
                              }
                              onCopy={() =>
                                onCopyHandler(
                                  depositDetails.pay_in?.recipient_details
                                    ?.bank_name,
                                  "bank_name",
                                )
                              }
                            >
                              <Copy className="cursor-pointer" size={13} />
                            </CopyToClipboard>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold uppercase md:tracking-widest">
                            Account Name
                          </span>
                          <div className="flex items-center gap-1 text-white font-mono font-black truncate max-w-[150px]">
                            <div>
                              {
                                depositDetails.pay_in?.recipient_details
                                  ?.account_name
                              }
                            </div>

                            <CopyToClipboard
                              text={
                                depositDetails.pay_in?.recipient_details
                                  ?.account_name
                              }
                              onCopy={() =>
                                onCopyHandler(
                                  depositDetails.pay_in?.recipient_details
                                    ?.account_name,
                                  "account_name",
                                )
                              }
                            >
                              <Copy className="cursor-pointer" size={13} />
                            </CopyToClipboard>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg">
                          <span className="text-slate-500 font-bold uppercase md:tracking-widest">
                            Account Number
                          </span>
                          <div className="flex items-center gap-1 text-blue-400 font-mono font-black text-lg">
                            <div>
                              {" "}
                              {
                                depositDetails.pay_in?.recipient_details
                                  ?.account_number
                              }
                            </div>

                            <CopyToClipboard
                              text={
                                depositDetails.pay_in?.recipient_details
                                  ?.account_number
                              }
                              onCopy={() =>
                                onCopyHandler(
                                  depositDetails.pay_in?.recipient_details
                                    ?.account_number,
                                  "account_number",
                                )
                              }
                            >
                              <Copy className="cursor-pointer" size={15} />
                            </CopyToClipboard>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-widest">
                            Network
                          </span>
                          <span className="text-white font-mono font-black uppercase">
                            {depositDetails.network ||
                              depositDetails.pay_in?.network ||
                              "CRYPTO"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                            Deposit Address
                          </span>
                          <div className="bg-white/5 p-3 rounded-lg break-all">
                            <span className="text-orange-400 font-mono font-black text-sm">
                              {depositDetails.pay_address ||
                                depositDetails.pay_in?.address}
                            </span>
                          </div>
                        </div>
                        {(depositDetails.payin_extra_id ||
                          depositDetails.pay_in?.memo) && (
                          <div className="flex flex-col gap-2">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                              Memo/Tag
                            </span>
                            <div className="bg-white/5 p-3 rounded-lg">
                              <span className="text-orange-400 font-mono font-black text-sm">
                                {depositDetails.payin_extra_id ||
                                  depositDetails.pay_in?.memo}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setDepositDetails(null);
                        setNgnAmount(null);
                        setCryptoAmount(null);
                      }}
                      className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white font-black uppercase tracking-widest text-[10px]"
                    >
                      Make another deposit
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Payment Method
                      </span>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => {
                          setPaymentMethod("fiat");
                          setNgnAmount(null);
                          setCryptoAmount(null);
                        }}
                        className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                          paymentMethod === "fiat"
                            ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                            : "bg-white/5 hover:bg-white/10 text-slate-400"
                        }`}
                      >
                        Fiat (Naira)
                      </button>
                      <button
                        onClick={() => {
                          setPaymentMethod("crypto");
                          setNgnAmount(null);
                          setCryptoAmount(null);
                        }}
                        className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                          paymentMethod === "crypto"
                            ? "bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                            : "bg-white/5 hover:bg-white/10 text-slate-400"
                        }`}
                      >
                        Crypto
                      </button>
                    </div>

                    {paymentMethod === "fiat" ? (
                      <>
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => setFiatMethod("standard")}
                            className={`flex-1 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all border ${
                              fiatMethod === "standard"
                                ? "bg-white/10 border-blue-500/50 text-white"
                                : "bg-transparent border-white/5 text-slate-500 hover:text-slate-400"
                            }`}
                          >
                            Naira to Crypto (Min ₦3000)
                          </button>
                          <button
                            onClick={() => setFiatMethod("quick")}
                            className={`flex-1 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all border ${
                              fiatMethod === "quick"
                                ? "bg-white/10 border-green-500/50 text-white"
                                : "bg-transparent border-white/5 text-slate-500 hover:text-slate-400"
                            }`}
                          >
                            Naira to Naira (Min ₦500)
                          </button>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <div className="md:flex items-center gap-1">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                              {fiatMethod === "standard" ? (
                                <div className="flex items-center gap-1">
                                  <div>Fund with Naira</div>{" "}
                                  <span className="mt-1 md:mt-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase">
                                    Live Rate Applied
                                  </span>
                                </div>
                              ) : (
                                "Quick Deposit (Naira)"
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                              {fiatMethod === "standard"
                                ? `1 USDT ≈ ${NGN_USD_RATE} NGN`
                                : `NGN ${ngnAmount || 0} ≈ ${(parseFloat(ngnAmount || 0) / NGN_USD_RATE).toFixed(2)} USDT`}
                            </div>
                          </div>
                        </div>

                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                            ₦
                          </div>
                          <input
                            type="number"
                            value={ngnAmount}
                            onChange={(e) => setNgnAmount(e.target.value)}
                            placeholder="Enter amount in Naira"
                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white font-mono font-bold focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 placeholder:font-sans placeholder:font-black placeholder:text-[10px] placeholder:uppercase"
                          />
                        </div>

                        <button
                          onClick={
                            fiatMethod === "standard"
                              ? handleFund
                              : handleFundNgnQuick
                          }
                          disabled={
                            fundWallet.isPending || fundWalletNgn.isPending
                          }
                          className={`w-full py-4 rounded-2xl ${
                            fiatMethod === "standard"
                              ? "bg-blue-600 hover:bg-blue-500"
                              : "bg-green-600 hover:bg-green-500"
                          } disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]`}
                        >
                          {fundWallet.isPending || fundWalletNgn.isPending ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Fund Wallet
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Fund with Crypto
                          </span>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[8px] font-black uppercase">
                            Live Rate Applied
                          </div>
                        </div>

                        <div className="md:flex items-center gap-2 w-full space-y-4 md:space-y-0">
                          <select
                            value={selectedNetwork}
                            onChange={(e) => setSelectedNetwork(e.target.value)}
                            className="w-full md:w-[30%] bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white font-mono font-bold focus:outline-none focus:border-orange-500/50 transition-all appearance-none"
                          >
                            {CRYPTO_NETWORKS.map((net) => (
                              <option
                                key={net.id}
                                value={net.id}
                                className="bg-slate-900 text-white"
                              >
                                {net.label}
                              </option>
                            ))}
                          </select>

                          <div className="relative group flex-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                              {CRYPTO_NETWORKS.find(
                                (n) => n.id === selectedNetwork,
                              )?.gateway === "nowpayments"
                                ? "USD"
                                : CRYPTO_NETWORKS.find(
                                    (n) => n.id === selectedNetwork,
                                  )?.currency || "CRYPTO"}
                            </div>
                            <input
                              type="number"
                              value={cryptoAmount}
                              onChange={(e) => setCryptoAmount(e.target.value)}
                              placeholder={`Enter amount in ${CRYPTO_NETWORKS.find((n) => n.id === selectedNetwork)?.gateway === "nowpayments" ? "USD" : "crypto"}`}
                              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-16 pr-4 text-white font-mono font-bold focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700 placeholder:font-sans placeholder:font-black placeholder:text-[10px] placeholder:uppercase"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleFundCrypto}
                          disabled={
                            fundWalletCrypto.isPending ||
                            fundWalletNOWPayments.isPending
                          }
                          className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                        >
                          {fundWalletCrypto.isPending ||
                          fundWalletNOWPayments.isPending ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              Fund Wallet
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="p-4 md:p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 hidden md:block">
                <div className="flex items-start gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="text-white font-black block mb-1">
                      Standard Latency
                    </span>
                    Deposits typically settle within 1-5 minutes Payments. Your
                    USD balance will be updated automatically.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "withdraw" && (
            <div className="animate-in slide-in-from-left-4 duration-500 space-y-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setWithdrawalType("bank");
                    setWithdrawAmount("");
                    setCryptoWithdrawAddress("");
                  }}
                  className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    withdrawalType === "bank"
                      ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)]"
                      : "bg-white/5 hover:bg-white/10 text-slate-400"
                  }`}
                >
                  Bank (NGN)
                </button>
                <button
                  onClick={() => {
                    setWithdrawalType("crypto");
                    setWithdrawAmount("");
                    setSelectedRecipientId("");
                  }}
                  className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    withdrawalType === "crypto"
                      ? "bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                      : "bg-white/5 hover:bg-white/10 text-slate-400"
                  }`}
                >
                  Crypto
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                {withdrawalType === "bank" && isAddingBank ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between pointer-events-none mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Attach New Bank
                      </span>
                    </div>

                    <input
                      type="text"
                      value={newBank.account_name}
                      onChange={(e) =>
                        setNewBank({ ...newBank, account_name: e.target.value })
                      }
                      placeholder="Account Name"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white font-mono font-bold focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700 placeholder:font-sans placeholder:font-black placeholder:text-[10px] placeholder:uppercase"
                    />
                    <input
                      type="text"
                      value={newBank.account_number}
                      onChange={(e) =>
                        setNewBank({
                          ...newBank,
                          account_number: e.target.value,
                        })
                      }
                      placeholder="Account Number"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white font-mono font-bold focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700 placeholder:font-sans placeholder:font-black placeholder:text-[10px] placeholder:uppercase"
                    />
                    <select
                      value={newBank.bank_code}
                      onChange={(e) => {
                        const code = e.target.value;
                        const bank = banks?.find((b: any) => b.code === code);
                        setNewBank({
                          ...newBank,
                          bank_code: code,
                          bank_name: bank ? bank.name : "",
                        });
                      }}
                      className="w-full bg-[#1c1c1f] border border-white/5 rounded-2xl py-4 px-4 text-white font-mono font-bold focus:outline-none focus:border-purple-500/50 transition-all cursor-pointer"
                    >
                      <option
                        value=""
                        disabled
                        className="text-slate-500 bg-[#1c1c1f]"
                      >
                        -- Select Bank --
                      </option>
                      {banks?.map((b: any) => (
                        <option
                          key={b.code}
                          value={b.code}
                          className="text-white bg-[#1c1c1f]"
                        >
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAddingBank(false)}
                        className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-white font-black uppercase tracking-widest text-[10px]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateBank}
                        disabled={createRecipient.isPending}
                        className="flex-1 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(147,51,234,0.2)]"
                      >
                        {createRecipient.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          "Save Bank"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {withdrawalType === "bank" && (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Withdraw via Transfer
                          </span>

                          <button
                            onClick={() => setIsAddingBank(true)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[9px] font-black uppercase transition-colors border border-purple-500/20"
                          >
                            <Plus className="w-3 h-3" />
                            Add Bank
                          </button>
                        </div>

                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-center">
                          <div
                            style={{ fontFamily: "monospace" }}
                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                          >
                            Withdrawable Amount: ${walletData?.withdrawable_balance.toFixed(2) || '0'} ~ ₦
                            {Math.max(
                              0,
                              parseFloat(walletData?.withdrawable_balance || "0") * NGN_USD_RATE -
                                150,
                            ).toLocaleString()}
                          </div>
                        </div>

                        {!recipients || recipients.length === 0 ? (
                          <div className="text-center py-8 rounded-2xl bg-black/20 border border-white/5">
                            <Landmark className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                            <p className="text-xs text-slate-400 font-bold">
                              No saved bank accounts.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <select
                              value={selectedRecipientId}
                              onChange={(e) =>
                                setSelectedRecipientId(e.target.value)
                              }
                              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white font-mono font-bold focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                            >
                              <option
                                value=""
                                className="bg-slate-900 text-white"
                              >
                                -- Select Bank Account --
                              </option>
                              {recipients.map((rec: any) => (
                                <option
                                  key={rec.id}
                                  value={rec.busha_recipient_id}
                                  className="bg-slate-900 text-white"
                                >
                                  {rec.bank_name} - {rec.account_number}
                                </option>
                              ))}
                            </select>

                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                                USD
                              </div>
                              <input
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) =>
                                  setWithdrawAmount(e.target.value)
                                }
                                placeholder="Enter Amount"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-16 pr-4 text-white font-mono font-bold focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700 placeholder:font-sans placeholder:font-black placeholder:text-[10px] placeholder:uppercase"
                              />
                            </div>

                            <button
                              onClick={handleWithdraw}
                              disabled={withdrawFunds.isPending}
                              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(147,51,234,0.2)]"
                            >
                              {withdrawFunds.isPending ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  Initiate Withdrawal
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {withdrawalType === "crypto" && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Withdraw to Crypto Wallet
                      </span>
                    </div>

                    <select
                      value={cryptoWithdrawNetwork}
                      onChange={(e) => setCryptoWithdrawNetwork(e.target.value)}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white font-mono font-bold focus:outline-none focus:border-orange-500/50 transition-all appearance-none"
                    >
                      {CRYPTO_NETWORKS.map((net) => (
                        <option
                          key={net.id}
                          value={net.id}
                          className="bg-slate-900 text-white"
                        >
                          {net.label}
                        </option>
                      ))}
                    </select>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        value={cryptoWithdrawAddress}
                        onChange={(e) =>
                          setCryptoWithdrawAddress(e.target.value)
                        }
                        placeholder="Enter crypto wallet address"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white font-mono font-bold focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700 placeholder:font-sans placeholder:font-black placeholder:text-[10px] placeholder:uppercase"
                      />
                    </div>

                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                        {CRYPTO_NETWORKS.find(
                          (n) => n.id === cryptoWithdrawNetwork,
                        )?.currency || "CRYPTO"}
                      </div>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Enter Amount"
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-20 pr-4 text-white font-mono font-bold focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700 placeholder:font-sans placeholder:font-black placeholder:text-[10px] placeholder:uppercase"
                      />
                    </div>

                    <button
                      onClick={handleCryptoWithdraw}
                      disabled={
                        withdrawFunds.isPending ||
                        withdrawFundsCrypto.isPending ||
                        withdrawNOWPayments.isPending
                      }
                      className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(234,88,12,0.2)]"
                    >
                      {withdrawFunds.isPending ||
                      withdrawFundsCrypto.isPending ||
                      withdrawNOWPayments.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Initiate Withdrawal
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div
                className={`hidden md:block p-6 rounded-2xl ${withdrawalType === "bank" ? "bg-purple-500/5 border border-purple-500/10" : "bg-orange-500/5 border border-orange-500/10"}`}
              >
                <div className="flex items-start gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                  <Shield
                    className={`w-5 h-5 flex-shrink-0 ${withdrawalType === "bank" ? "text-purple-500" : "text-orange-500"}`}
                  />
                  <div>
                    <span className="text-white font-black block mb-1">
                      {withdrawalType === "bank"
                        ? "Risk Protocol"
                        : "Crypto Safety"}
                    </span>
                    {withdrawalType === "bank"
                      ? "Withdrawals map USD directly into your local NGN account based on the live conversion rate. Standard processing is sub-60 minutes."
                      : "Ensure you have full control of the wallet address before initiating withdrawal. All crypto transfers are irreversible."}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 text-center">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
            Forecast by Anomaly Financial Layer v0.0.1
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
