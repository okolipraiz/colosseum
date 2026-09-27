"use client";

import {
  useCreateRecipient,
  useGetBanks,
  useGetLiveRate,
  useGetRecipients,
  useGetUserInfo,
  useGetWalletBalance,
  useWithdrawFunds,
  useWithdrawFundsCrypto,
  useWithdrawNOWPayments,
} from "@/hooks/user";
import {
  ArrowRight,
  Landmark,
  RefreshCw,
  Bitcoin,
  Check,
  ChevronDown,
  Plus,
  Shield,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { CRYPTO_NETWORKS } from "./WalletModal";

const WITHDRAWAL_METHODS = [
  {
    id: "bank",
    label: "Withdraw Fiat",
    icon: Landmark,
    description: "Naira to Crypto",
  },
  {
    id: "crypto",
    label: "Withdraw Crypto",
    icon: Bitcoin,
    description: "Withdraw Crypto",
  },
];

const DEPOSIT_FEE_PERCENTAGE = 1.5;

const calculateDepositBreakdown = (
  amount: number,
  feePercentage = DEPOSIT_FEE_PERCENTAGE,
) => {
  const fee = (amount * feePercentage) / 100;
  const netAmount = amount - fee;
  return { fee, netAmount };
};

export const WalletWithdrawalScreeen = () => {
  const router = useRouter();
  const { data: rate } = useGetLiveRate();
  const {data: profile} = useGetUserInfo()
  const NGN_USD_RATE = rate?.rate || 1500;

  const searchParams = useSearchParams();
  const withdrawMethod = searchParams.get("selectedWithdraw") || "";
  const [depositDetails, setDepositDetails] = useState<any>(null);
  const [isMethodMenuOpen, setIsMethodMenuOpen] = useState(false);
  const methodMenuRef = useRef<HTMLDivElement>(null);

  const [ngnAmount, setNgnAmount] = useState<any>(null);
  const [cryptoAmount, setCryptoAmount] = useState<any>(null);

  const { data: walletData, refetch: refetchBalance } = useGetWalletBalance();

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
          },
        },
      );
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        methodMenuRef.current &&
        !methodMenuRef.current.contains(event.target as Node)
      ) {
        setIsMethodMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeMethod =
    WITHDRAWAL_METHODS.find((m) => m.id === withdrawMethod) ||
    WITHDRAWAL_METHODS[0];

  const handleSelectMethod = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selectedWithdraw", id);
    router.push(`?${params.toString()}`);
    setIsMethodMenuOpen(false);
    setDepositDetails(null);
    setNgnAmount(null);
    setCryptoAmount(null);
    setWithdrawalType(id as "bank" | "crypto");
  };

  useEffect(() => {
    if (withdrawMethod === "bank" || withdrawMethod === "crypto") {
      setWithdrawalType(withdrawMethod);
    }
  }, [withdrawMethod]);

  return (
    <div className="md:flex justify-center ">
      {" "}
      <div className="max-w-xl animate-in slide-in-from-right-4 duration-500 space-y-6">
        <div
          className="flex items-center justify-between mt-4 md:mt-0 mb-4 relative"
          ref={methodMenuRef}
        >
          <span className="text-[14px] md:text-[16px] text-white-500 font-semibold uppercase ">
            Withdrawal Method
          </span>

          <button
            onClick={() => setIsMethodMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <activeMethod.icon className="w-4 h-4 text-slate-300" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {activeMethod.label}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                isMethodMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isMethodMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {WITHDRAWAL_METHODS.map((method) => {
                const Icon = method.icon;
                const isActive = method.id === withdrawMethod;
                return (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${
                      isActive ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                        isActive
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-white/5 border-white/10 text-slate-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-white uppercase tracking-widest">
                        {method.label}
                      </div>
                      <div className="text-[9px] font-bold text-slate-500 mt-0.5">
                        {method.description}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <hr className="my-6" />

        <div className="p-3 md:p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
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
                      Withdrawable Amount: $
                      {walletData?.withdrawable_balance.toFixed(2) || "0"} ~ ₦
                      {Math.max(
                        0,
                        parseFloat(walletData?.withdrawable_balance || "0") *
                          NGN_USD_RATE -
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
                        onChange={(e) => setSelectedRecipientId(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white font-mono font-bold focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                      >
                        <option value="" className="bg-slate-900 text-white">
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
                          onChange={(e) => setWithdrawAmount(e.target.value)}
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
                  onChange={(e) => setCryptoWithdrawAddress(e.target.value)}
                  placeholder="Enter crypto wallet address"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-white font-mono font-bold focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700 placeholder:font-sans placeholder:font-black placeholder:text-[10px] placeholder:uppercase"
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  {CRYPTO_NETWORKS.find((n) => n.id === cryptoWithdrawNetwork)
                    ?.currency || "CRYPTO"}
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
          className={`block p-6 rounded-2xl ${withdrawalType === "bank" ? "bg-purple-500/5 border border-purple-500/10" : "bg-orange-500/5 border border-orange-500/10"}`}
        >
          <div className="flex items-start gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
            <Shield
              className={`w-5 h-5 flex-shrink-0 ${withdrawalType === "bank" ? "text-purple-500" : "text-orange-500"}`}
            />
            <div>
              <span className="text-white font-black block mb-1">
                {withdrawalType === "bank" ? "Risk Protocol" : "Crypto Safety"}
              </span>
              {withdrawalType === "bank"
                ? "Withdrawals map USD directly into your local NGN account based on the live conversion rate. Standard processing is sub-60 minutes."
                : "Ensure you have full control of the wallet address before initiating withdrawal. All crypto transfers are irreversible."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DepositSummaryBox = ({
  amount,
  currencyLabel,
  currencySymbol = "",
  feePercentage = DEPOSIT_FEE_PERCENTAGE,
  accent = "blue",
  convertedLabel,
  convertedAmount,
  convertedSymbol = "",
}: {
  amount: number;
  currencyLabel: string;
  currencySymbol?: string;
  feePercentage?: number;
  accent?: "blue" | "green" | "orange";
  convertedLabel?: string;
  convertedAmount?: number;
  convertedSymbol?: string;
}) => {
  if (!amount || amount <= 0) return null;

  const { fee, netAmount } = calculateDepositBreakdown(amount, feePercentage);

  const accentStyles = {
    blue: "border-blue-500/20 bg-blue-500/5",
    green: "border-green-500/20 bg-green-500/5",
    orange: "border-orange-500/20 bg-orange-500/5",
  };

  return (
    <div
      className={`mt-4 p-4 rounded-2xl border ${accentStyles[accent]} space-y-2 animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      <div className="flex justify-between items-center text-[10px]">
        <span className="text-slate-500 font-bold uppercase tracking-widest">
          You`re depositing
        </span>
        <span className="text-white font-mono font-black">
          {currencySymbol}
          {amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {currencyLabel}
        </span>
      </div>

      <div className="flex justify-between items-center text-[10px]">
        <span className="text-slate-500 font-bold uppercase tracking-widest">
          Fee ({feePercentage}%)
        </span>
        <span className="text-red-400 font-mono font-black">
          -{currencySymbol}
          {fee.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {currencyLabel}
        </span>
      </div>

      <hr className="border-white/10" />

      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-300 font-bold uppercase tracking-widest">
          {convertedLabel ? "You'll receive (approx.)" : "You'll receive"}
        </span>
        <span className="text-white font-mono font-black text-sm">
          {convertedLabel && convertedAmount !== undefined
            ? `${convertedSymbol}${convertedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${convertedLabel}`
            : `${currencySymbol}${netAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${currencyLabel}`}
        </span>
      </div>
    </div>
  );
};
