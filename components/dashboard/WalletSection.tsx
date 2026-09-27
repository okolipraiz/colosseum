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
  useGetUserInfo,
  useGetWalletBalance,
  useWithdrawFunds,
  useWithdrawFundsCrypto,
  useWithdrawNOWPayments,
} from "@/hooks/user";
import {
  RefreshCw,
  Shield,
  ArrowLeftRight,
  RefreshCcw,
  TrendingUp,
  History,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CountdownTimer } from "@/app/(dashboard)/profile/page";
import { useWallet } from "@/context/wallet-provider";
import { format } from "date-fns";
import { WalletDepositDrawer } from "./WalletDepositDrawer";
import { WallWithdrawalDrawer } from "./WallWithdrawalDrawer";

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

const WalletSection = () => {
  const { data: profile } = useGetUserInfo();
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
  const { transactions, statusCheck } = useWallet();

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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return "↓";
      case "withdraw":
        return "↑";
      case "stake":
        return "📊";
      case "payout":
        return "💰";
      default:
        return "•";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "payout":
        return "text-green-400";
      case "withdraw":
      case "stake":
        return "text-red-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div>
      <div className="flex md:flex-col flex-row justify-start lg:justify-center items-center gap-8 md:gap-6 w-full md:text-center">
        <div>
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest">
            <Shield className="w-3 h-3" />
            Asset Protection Active
          </div>

          <div className="text-6xl font-mono font-black text-white tracking-tighter">
            $
            {(walletData?.balance ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-4 block">
            Total Valuation (USDT)
          </span>
        </div>
      </div>

      <div className="mt-5 md:mt-5 md:flex md:flex-col flex-row justify-start lg:justify-center items-center gap-8 md:gap-6 w-full md:text-center">
        <div className="space-x-6 flex items-center md:justify-evenly lg:justify-center">
          <div>
            <WalletDepositDrawer />
          </div>

          <div>
            <WallWithdrawalDrawer />
          </div>

          <div>
            <button
              onClick={() =>
                toast.info("Internal Transfer Feature Coming soon.")
              }
              className="flex flex-col gap-2 items-center group"
            >
              <div className="w-12 h-12 bg-gray-600/10 rounded-full flex items-center justify-center border border-gray-500/20 text-gray-400 group-hover:scale-110 transition-transform">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Internal
              </span>
            </button>
          </div>

          <div>
            <button
              onClick={() => toast.info("Convert Feature Coming soon.")}
              className="flex flex-col gap-2 items-center group"
            >
              <div className="w-12 h-12 bg-gray-600/10 rounded-full flex items-center justify-center border border-gray-500/20 text-gray-400 group-hover:scale-110 transition-transform">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Convert
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="md:flex justify-center items-center mt-10 ">
        <div className="md:max-w-xl space-y-8">
          {/* Transaction History */}
          <div className="bg-[#0d0d0f]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl h-[430px] overflow-y-scroll">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="md:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-blue-500" />
                  <h3 className="text-md md:text-xl font-black text-white tracking-tight uppercase">
                    Transaction Log
                  </h3>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Last 10 Events
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {transactions && transactions.length > 0 ? (
                transactions
                  .filter(
                    (tx) => tx.type === "withdrawal" || tx.type === "deposit",
                  )
                  .map((tx: any) => (
                    <div
                      key={tx.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 p-5"
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div
                            className={`w-10 h-14 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center text-2xl bg-white/[0.02] ${getTransactionColor(tx.type).replace("text-", "border-").replace("400", "500/20")} ${getTransactionColor(tx.type)} shadow-inner group-hover:scale-110 transition-transform duration-500`}
                          >
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <div className="text-lg font-black text-white uppercase tracking-tight">
                                {tx.type === "trade_fee"
                                  ? "Trade Fee"
                                  : tx.type}
                              </div>
                              {tx.outcome && (
                                <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-white/5 truncate max-w-[150px]">
                                  {tx.outcome}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {format(
                                new Date(tx.created_at),
                                "MMM dd, yyyy • HH:mm",
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <div
                            className={`text-md md:text-2xl font-mono font-black ${getTransactionColor(tx.type)} tracking-tighter`}
                          >
                            {["deposit", "payout", "funding"].includes(tx.type)
                              ? "+"
                              : "-"}
                            {tx.currency === "USD" ? "$" : "₦"}
                            {(tx.target_amount && tx.status === "pending"
                              ? tx.target_amount
                              : tx.amount
                            ).toFixed(2)}
                          </div>

                          {tx.type !== "withdrawal" && (
                            <div className="flex items-center gap-2 mt-1">
                              {tx.status === "pending" &&
                                tx.external_reference && (
                                  <button
                                    onClick={() => statusCheck.refetch()}
                                    disabled={statusCheck.isRefetching}
                                    className="text-white hover:text-blue-400 disabled:opacity-50 transition-colors"
                                    title="Sync Transaction"
                                  >
                                    <RefreshCw
                                      className={`w-3 h-3 ${statusCheck.isRefetching && "animate-spin"}`}
                                    />
                                  </button>
                                )}
                              <div
                                className={`text-[9px] font-black uppercase tracking-widest ${
                                  tx.status === "completed"
                                    ? "text-green-500/60"
                                    : tx.status === "pending"
                                      ? "text-orange-500/60"
                                      : "text-red-500/60"
                                }`}
                              >
                                {tx.status}
                              </div>
                              {tx.type === "payout" &&
                                tx.status === "completed" &&
                                tx.external_reference && (
                                  <button
                                    onClick={() => {
                                      // setSelectedPayoutTransactionId(tx.id);
                                      // setIsShareModalOpen(true);
                                    }}
                                    className="mt-1.5 flex items-center gap-1 px-2 py-0.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm shadow-blue-500/5 active:scale-95"
                                  >
                                    Share Win
                                  </button>
                                )}
                            </div>
                          )}
                        </div>
                      </div>

                      {tx.status === "pending" && tx.pay_in_details && (
                        <div className="mt-4 pt-4 border-t border-white/5 animate-in fade-in zoom-in-95 duration-500">
                          <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-bold uppercase tracking-widest">
                                Bank Name
                              </span>
                              <span className="text-white font-mono font-black">
                                {
                                  tx.pay_in_details?.recipient_details
                                    ?.bank_name
                                }
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-bold uppercase tracking-widest">
                                Account Name
                              </span>
                              <span className="text-white font-mono font-black truncate max-w-[150px]">
                                {
                                  tx.pay_in_details?.recipient_details
                                    ?.account_name
                                }
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs bg-white/5 p-2 rounded-lg">
                              <span className="text-slate-500 font-bold uppercase tracking-widest">
                                Account Number
                              </span>
                              <span className="text-blue-400 font-mono font-black text-lg">
                                {
                                  tx.pay_in_details?.recipient_details
                                    ?.account_number
                                }
                              </span>
                            </div>
                            {tx.expires_at && (
                              <div className="flex justify-between items-center text-xs pt-2">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">
                                  Expires In
                                </span>
                                <span className="font-mono font-black">
                                  <CountdownTimer expiresAt={tx.expires_at} />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="py-20 text-center rounded-[2rem] border border-dashed border-white/5 px-10">
                  <TrendingUp className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                  <h3 className="text-lg font-black text-slate-600 uppercase tracking-widest">
                    No Transaction Logs
                  </h3>
                  <p className="text-slate-700 text-sm mt-1">
                    No transaction events detected on this account.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSection;
