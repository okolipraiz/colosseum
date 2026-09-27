"use client";

import {
  useFundWallet,
  useFundWalletCrypto,
  useFundWalletNOWPayments,
  useFundWalletNgn,
  useGetLiveRate,
} from "@/hooks/user";
import {
  ArrowRight,
  Clock,
  Landmark,
  RefreshCw,
  Wallet,
  Copy,
  Bitcoin,
  Check,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useRouter, useSearchParams } from "next/navigation";
import { CRYPTO_NETWORKS } from "./WalletModal";
import { useWallet } from "@/context/wallet-provider";
import { DepositSuccessScreen } from "./DepositSuccessScreen";

const PAYMENT_METHODS = [
  {
    id: "fiat",
    label: "Deposit Fiat",
    icon: Landmark,
    description: "Naira to Crypto",
  },
  {
    id: "naira",
    label: "Deposit Naira",
    icon: Wallet,
    description: "Use Naira to trade",
  },
  {
    id: "crypto",
    label: "Deposit Crypto",
    icon: Bitcoin,
    description: "Fund directly with crypto",
  },
];

// const DEPOSIT_FEE_PERCENTAGE = 1.5;

const calculateFeeNGN = (amount: any) => {
  if (amount < 2000) return 50;
  if (amount <= 30000) return 100;
  return amount * 0.01;
};

const calculateDepositBreakdown = (amount: any) => {
  const fee = calculateFeeNGN(amount);
  const netAmount = amount - fee;

  return { fee, netAmount };
};

const DEPOSIT_FEE_PERCENTAGE = (amount: number) => {
  if (!amount || amount <= 0) return 0;

  const fee = calculateFeeNGN(amount);
  return (fee / amount) * 100;
};

export const WalletDepositScreen = () => {
  const router = useRouter();
  const { data: rate } = useGetLiveRate();
  const NGN_USD_RATE = rate?.rate || 1500;

  const searchParams = useSearchParams();
  const paymentMethod = searchParams.get("selectedDeposited") || "";
  const [depositDetails, setDepositDetails] = useState<any>(null);
  const [isMethodMenuOpen, setIsMethodMenuOpen] = useState(false);
  const methodMenuRef = useRef<HTMLDivElement>(null);

  const [ngnAmount, setNgnAmount] = useState<any>(null);
  const [cryptoAmount, setCryptoAmount] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("usdcstellar");

  const fundWallet = useFundWallet();
  const fundWalletCrypto = useFundWalletCrypto();
  const fundWalletNOWPayments = useFundWalletNOWPayments();
  const fundWalletNgn = useFundWalletNgn();
  const [completedAmount, setCompletedAmount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 1800 seconds
  const [isCountdownActive, setIsCountdownActive] = useState(false);

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
    PAYMENT_METHODS.find((m) => m.id === paymentMethod) || PAYMENT_METHODS[0];

  const handleSelectMethod = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selectedDeposited", id);
    router.push(`?${params.toString()}`);
    setIsMethodMenuOpen(false);
    setDepositDetails(null);
    setNgnAmount(null);
    setCryptoAmount(null);
  };

  const { statusCheck } = useWallet();

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (statusCheck?.data?.status === "completed") {
      setCompletedAmount(
        Number(
          statusCheck.data.amount ??
            depositDetails?.target_amount ??
            ngnAmount ??
            cryptoAmount ??
            0,
        ),
      );

      setShowSuccess(true);
    }
  }, [
    statusCheck?.data?.status,
    statusCheck?.data?.amount,
    depositDetails,
    ngnAmount,
    cryptoAmount,
  ]);

  useEffect(() => {
    if (!depositDetails) {
      setIsCountdownActive(false);
      setTimeLeft(30 * 60);
      return;
    }

    setIsCountdownActive(true);
    setTimeLeft(30 * 60);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCountdownActive(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [depositDetails]);

  return (
    <>
      {!showSuccess && (
        <div className="md:flex justify-center ">
          {" "}
          <div className="max-w-xl animate-in slide-in-from-right-4 duration-500 space-y-6">
            <div className="p-3 md:p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              {depositDetails && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-center">
                    <div className="text-[10px] uppercase font-black tracking-widest text-blue-400 mb-1">
                      {paymentMethod === "crypto" && "Amount to Send"}
                      {paymentMethod === "fiat" && "Target Amount (USDT)"}
                      {paymentMethod === "naira" && "Payin Amount (NGN)"}
                    </div>

                    <div className="text-3xl font-black text-white">
                      {paymentMethod === "crypto" &&
                        `$${Number(depositDetails.target_amount).toFixed(2)}`}

                      {paymentMethod === "fiat" &&
                        `$${Number(depositDetails.target_amount).toFixed(2)}`}

                      {paymentMethod === "naira" &&
                        `₦${Number(ngnAmount).toLocaleString()}`}
                    </div>

                    {paymentMethod === "naira" && (
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        ≈ ${(Number(ngnAmount) / NGN_USD_RATE).toFixed(2)} USDT
                      </div>
                    )}
                    {paymentMethod === "fiat" && (
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        ≈ ₦
                        {Number(
                          depositDetails.target_amount * NGN_USD_RATE,
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {paymentMethod === "naira" && (
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold uppercase md:tracking-widest">
                          You`ll receive
                        </span>
                        <div className="flex items-center gap-1 text-white font-mono font-black">
                          <div>₦{depositDetails?.target_amount} </div>
                          <div className="font-bold text-slate-400">
                            ( $
                            {(
                              Number(depositDetails.target_amount) /
                              NGN_USD_RATE
                            ).toFixed(2)}{" "}
                            USDT)
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold uppercase md:tracking-widest">
                          Status
                        </span>
                        <div className="text-orange-300 flex items-center gap-1 font-mono font-black">
                          PENDING
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold uppercase md:tracking-widest">
                          Expires In
                        </span>
                        <div className="text-orange-300 flex items-center gap-1 font-mono font-black">
                          <Clock className="w-3 h-3" />
                          {isCountdownActive ? formattedTime : "Expired"}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "fiat" && (
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold uppercase md:tracking-widest">
                          You`ll receive
                        </span>
                        <div className="flex items-center gap-1 text-white font-mono font-black">
                          <div>
                            $
                            {(Number(ngnAmount) / NGN_USD_RATE).toFixed(2)}{" "}
                          </div>
                          <div className="font-bold text-slate-400">
                            (₦
                            {Number(
                              depositDetails.target_amount * NGN_USD_RATE,
                            ).toLocaleString()}
                            )
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold uppercase md:tracking-widest">
                          Status
                        </span>
                        <div className="text-orange-300 flex items-center gap-1 font-mono font-black">
                          PENDING
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold uppercase md:tracking-widest">
                          Expires In
                        </span>
                        <div className="text-orange-300 flex items-center gap-1 font-mono font-black">
                          <Clock className="w-3 h-3" />
                          {isCountdownActive ? formattedTime : "Expired"}
                        </div>
                      </div>
                    </div>
                  )}

                  {(paymentMethod === "fiat" || paymentMethod === "naira") && (
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
                  )}

                  {paymentMethod === "crypto" && (
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
              )}

              {!depositDetails && (
                <>
                  <div
                    className="flex items-center justify-between mt-4 md:mt-0 mb-4 relative"
                    ref={methodMenuRef}
                  >
                    <span className="text-[14px] md:text-[16px] text-white-500 font-semibold uppercase ">
                      Payment Method
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
                        {PAYMENT_METHODS.map((method) => {
                          const Icon = method.icon;
                          const isActive = method.id === paymentMethod;
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
                              {isActive && (
                                <Check className="w-4 h-4 text-blue-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <hr className="my-6" />

                  {paymentMethod === "fiat" && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="sm:flex items-center gap-1">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                              <span className="mt-1 md:mt-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase">
                                Live Rate Applied
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            1 USDT ≈ {NGN_USD_RATE} NGN
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-5 my-2">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <div>
                            <div>Fund with Naira</div>{" "}
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
                        onClick={handleFund}
                        disabled={
                          fundWallet.isPending || fundWalletNgn.isPending
                        }
                        className={`w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]`}
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

                      {/* NEW: fee breakdown */}
                      {ngnAmount && Number(ngnAmount) > 0 && (
                        <DepositSummaryBox
                          amount={Number(ngnAmount)}
                          currencyLabel="NGN"
                          currencySymbol="₦"
                          accent="blue"
                          convertedLabel="USDT"
                          convertedSymbol="$"
                          convertedAmount={
                            calculateDepositBreakdown(Number(ngnAmount))
                              .netAmount / NGN_USD_RATE
                          }
                        />
                      )}
                    </>
                  )}

                  {paymentMethod === "naira" && (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="md:flex items-center gap-1">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Quick Deposit (Naira)
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            NGN ${ngnAmount || 0} ≈ $
                            {(
                              parseFloat(ngnAmount || 0) / NGN_USD_RATE
                            ).toFixed(2)}{" "}
                            USDT
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
                        onClick={handleFundNgnQuick}
                        disabled={
                          fundWallet.isPending || fundWalletNgn.isPending
                        }
                        className={`w-full py-4 rounded-2xl
                     bg-green-600 hover:bg-green-500
                   disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]`}
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

                      {/* NEW: fee breakdown */}
                      {ngnAmount && Number(ngnAmount) > 0 && (
                        <DepositSummaryBox
                          amount={Number(ngnAmount)}
                          currencyLabel="NGN"
                          currencySymbol="₦"
                          accent="green"
                        />
                      )}
                    </>
                  )}

                  {paymentMethod === "crypto" && (
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

                      {/* NEW: fee breakdown */}
                      {cryptoAmount && Number(cryptoAmount) > 0 && (
                        <DepositSummaryBox
                          amount={Number(cryptoAmount)}
                          currencyLabel={
                            CRYPTO_NETWORKS.find(
                              (n) => n.id === selectedNetwork,
                            )?.gateway === "nowpayments"
                              ? "USD"
                              : CRYPTO_NETWORKS.find(
                                  (n) => n.id === selectedNetwork,
                                )?.currency || "CRYPTO"
                          }
                          accent="orange"
                        />
                      )}
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
                    Fiat Latency
                  </span>
                  Deposits typically settle within 1-5 minutes Payments. Your
                  USD balance will be updated automatically.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <DepositSuccessScreen
          amount={completedAmount}
          paymentMethod={paymentMethod}
          onContinue={() => {
            setShowSuccess(false);
            setCompletedAmount(0);
            setDepositDetails(null);
            setNgnAmount(null);
            setCryptoAmount(null);
            router.push("/markets");
          }}
        />
      )}
    </>
  );
};

const DepositSummaryBox = ({
  amount,
  currencyLabel,
  currencySymbol = "",
  accent = "blue",
  convertedLabel,
  convertedAmount,
  convertedSymbol = "",
}: {
  amount: number;
  currencyLabel: string;
  currencySymbol?: string;
  accent?: "blue" | "green" | "orange";
  convertedLabel?: string;
  convertedAmount?: number;
  convertedSymbol?: string;
}) => {
  if (!amount || amount <= 0) return null;

  const { fee, netAmount } = calculateDepositBreakdown(amount);
  const feePercentage = DEPOSIT_FEE_PERCENTAGE(amount);

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
          Fee ({feePercentage.toFixed(2)}%)
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
