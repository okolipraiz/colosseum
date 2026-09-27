"use client";

import Navbar from "@/components/dashboard/Navbar";
import ProfileVault from "@/components/profile/ProfileVault";
import ShareWinModal from "@/components/dashboard/ShareWinModal";
import Link from "next/link";
import {
  Calendar,
  TrendingUp,
  History,
  User as UserIcon,
  Mail,
  RefreshCw,
  Pencil,
  UserPen,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  useGetUserInfo,
  useGetWalletBalance,
  useUpdateUserInfo,
} from "@/hooks/user";
import { useWallet } from "@/context/wallet-provider";
import { useForm } from "react-hook-form";
import { countries } from "@/data/country";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState<number>(
    new Date(expiresAt).getTime() - Date.now(),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(new Date(expiresAt).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (timeLeft <= 0) return <span className="text-red-500">Expired</span>;

  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <span className="text-orange-400">
      {minutes}m {seconds}s
    </span>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile } = useGetUserInfo();
  const { mutate, isPending } = useUpdateUserInfo();

  const { data: walletData } = useGetWalletBalance();
  const { transactions, statusCheck, refetchTransactions } = useWallet();
  const [editProfile, setEditProfile] = useState(false);
  const [profileTab, setProfileTab] = useState<"profile" | "password">(
    "profile",
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedPayoutTransactionId, setSelectedPayoutTransactionId] =
    useState("");

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    formState: { errors: passwordErrors },
  } = useForm();

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

  const onProfileSubmit = (values: any) => {
    const payload = {
      email: values.email.toLowerCase().trim(),
      first_name: values.first_name,
      last_name: values.last_name,
      phone_number: values.phone_number,
      address: values.address,
      country: values.country,
    };

    toast.promise(
      new Promise((resolve, reject) => {
        mutate(
          { ...payload },
          {
            onSuccess: async (response) => {
              resolve(response);
            },
            onError: (error) => {
              reject(error);
            },
          },
        );
      }),
      {
        loading: "Sumbitting, please wait...",
      },
    );
  };

  const onPasswordSubmit = (values: any) => {
    if (values.new_password.length < 8) {
      toast.error("Uhh, something went wrong!", {
        description: "Password must be at least 8 characters long",
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      });
      return;
    }

    const payload = {
      old_password: values.current_password,
      new_password: values.new_password,
      confirmPassword: values.confirmPassword,
    };

    toast.promise(
      new Promise((resolve, reject) => {
        mutate(
          { ...payload },
          {
            onSuccess: async (response) => {
              router.push(`/login`);
              resolve(response);
            },
            onError: (error) => {
              reject(error);
            },
          },
        );
      }),
      {
        loading: "Sumbitting, please wait...",
      },
    );
  };

  // Prefill form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        country: profile.country || "",
      });
    }
  }, [profile, reset]);

  useEffect(() => {
    refetchTransactions();
  }, []);
  
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-purple-500/30 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full -z-10" />

      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <UserIcon className="w-3 h-3" />
            <span>Settings</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-slate-500 text-lg mt-2 font-medium">
            Configure your presence and monitor liquidity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* User Card */}
            <div className="bg-[#0d0d0f] rounded-[2.5rem] p-8 border border-white/[0.05] shadow-2xl relative group">
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.first_name || "User"}
                      className="w-28 h-28 rounded-[2rem] object-cover ring-2 ring-white/5 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br bg-blue-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl ring-2 ring-white/5 group-hover:scale-105 transition-transform duration-500">
                      {profile?.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-[#0d0d0f] rounded-full shadow-lg" />
                </div>

                <h2 className="text-2xl font-black text-white mb-1 tracking-tight">
                  {(
                    `${profile?.first_name} ${profile?.last_name}` ||
                    "Anonymous Explorer"
                  ).toUpperCase()}
                </h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-6">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{profile?.email}</span>
                </div>

                <div
                  onClick={() => setEditProfile(!editProfile)}
                  className="flex items-center hover:underline hover:text-blue-500 gap-1 text-[10px] cursor-pointer font-black uppercase tracking-[0.2em]"
                >
                  <div>{editProfile ? "Close" : "Edit"} Profile</div>
                  <Pencil className="h-3 w-3" />
                </div>

                <div className="mt-6 w-full">
                  <Link
                    href="/profile/affiliate"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition duration-300 text-[10px] font-black uppercase tracking-[0.2em] w-full"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Affiliate Program
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Total Cycles
                  </span>
                  <span className="text-xl font-mono font-black text-white">
                    {profile?.total_trades || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    CREATED AT
                  </span>
                  <span className="text-sm font-black text-slate-300 uppercase tracking-tight">
                    {profile?.created_at
                      ? format(new Date(profile.created_at), "MMM dd, yyyy")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Client-side Vault Interaction */}
            <ProfileVault walletData={walletData} />
          </div>

          {/* Activity */}
          {editProfile ? (
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-[#0d0d0f]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserPen className="w-5 h-5 text-blue-500" />
                      <h3 className="text-xl font-black text-white tracking-tight uppercase">
                        Edit Profile
                      </h3>
                    </div>
                    <span
                      onClick={() => setEditProfile(false)}
                      className="text-[10px] font-black cursor-pointer text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Close ✕
                    </span>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 mt-6 bg-white/[0.03] p-1 rounded-2xl border border-white/5 w-fit">
                    <button
                      onClick={() => setProfileTab("profile")}
                      className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                        profileTab === "profile"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-3 h-3" />
                        Profile
                      </span>
                    </button>
                    <button
                      onClick={() => setProfileTab("password")}
                      className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                        profileTab === "password"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        🔑 Password
                      </span>
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  {/* ── PROFILE TAB ── */}
                  {profileTab === "profile" && (
                    <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            {...registerProfile("first_name", {
                              required: "First name is required",
                            })}
                            placeholder="First Name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                          />
                          {profileErrors.first_name && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              {profileErrors.first_name.message as string}
                            </span>
                          )}
                        </div>

                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            {...registerProfile("last_name", {
                              required: "Last name is required",
                            })}
                            placeholder="Last Name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                          />
                          {profileErrors.last_name && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              {profileErrors.last_name.message as string}
                            </span>
                          )}
                        </div>

                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            {...registerProfile("email", {
                              required: "Email is required",
                            })}
                            placeholder="your@email.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                          />
                          {profileErrors.email && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              {profileErrors.email.message as string}
                            </span>
                          )}
                        </div>

                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            {...registerProfile("phone")}
                            placeholder="+234 000 000 0000"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                          />
                          {profileErrors.phone && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              {profileErrors.phone.message as string}
                            </span>
                          )}
                        </div>

                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            {...registerProfile("address", {
                              required: "Address is required",
                            })}
                            placeholder="123 Street, City"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                          />
                          {profileErrors.address && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              {profileErrors.address.message as string}
                            </span>
                          )}
                        </div>

                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Country
                          </label>
                          <select
                            {...registerProfile("country", {
                              required: "Country is required",
                            })}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                          >
                            <option value="" className="bg-[#0d0d0f]">
                              Select Country
                            </option>
                            {countries.map((country, index) => (
                              <option
                                key={index}
                                value={country.label}
                                className="bg-[#0d0d0f]"
                              >
                                {country.label}
                              </option>
                            ))}
                          </select>
                          {profileErrors.country && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              {profileErrors.country.message as string}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">
                          All fields are required
                        </p>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="px-8 py-3 rounded-xl bg-blue-600 cursor-pointer hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5"
                        >
                          {isPending ? " Saving Changes..." : " Save Changes"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* ── PASSWORD TAB ── */}
                  {profileTab === "password" && (
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 mb-6">
                          <p className="text-[11px] text-blue-400 font-black uppercase tracking-widest">
                            🔒 Choose a strong password with at least 8
                            characters
                          </p>
                        </div>

                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            {...registerPassword("current_password", {
                              required: "Current password is required",
                            })}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                          />
                          {passwordErrors.current_password && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              {
                                passwordErrors.current_password
                                  .message as string
                              }
                            </span>
                          )}
                        </div>

                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            {...registerPassword("new_password", {
                              required: "New password is required",
                              minLength: {
                                value: 8,
                                message: "Minimum 8 characters",
                              },
                            })}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                          />
                          {passwordErrors.new_password && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              {passwordErrors.new_password.message as string}
                            </span>
                          )}
                        </div>

                        <div className="w-full">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            {...registerPassword("confirm_password", {
                              required: "Please confirm your password",
                              validate: (val) =>
                                val === watch("new_password") ||
                                "Passwords do not match",
                            })}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                          />
                          {passwordErrors.confirm_password && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              {
                                passwordErrors.confirm_password
                                  .message as string
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black">
                          You will be logged out after changing password
                        </p>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5"
                        >
                          {isPending ? "Updating Password" : " Update Password"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 space-y-8">
              {/* Transaction History */}
              <div className="bg-[#0d0d0f]/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-purple-500" />
                      <h3 className="text-xl font-black text-white tracking-tight uppercase">
                        History Log
                      </h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Last 10 Events
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="group relative overflow-hidden rounded-3xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 p-5"
                      >
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                            <div
                              className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl bg-white/[0.02] ${getTransactionColor(tx.type).replace("text-", "border-").replace("400", "500/20")} ${getTransactionColor(tx.type)} shadow-inner group-hover:scale-110 transition-transform duration-500`}
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
                              className={`text-2xl font-mono font-black ${getTransactionColor(tx.type)} tracking-tighter`}
                            >
                              {["deposit", "payout", "funding"].includes(
                                tx.type,
                              )
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
                                        setSelectedPayoutTransactionId(tx.id);
                                        setIsShareModalOpen(true);
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
                    <div className="py-20 text-center rounded-[2rem] border border-dashed border-white/5">
                      <TrendingUp className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                      <h3 className="text-lg font-black text-slate-600 uppercase tracking-widest">
                        No History Logs
                      </h3>
                      <p className="text-slate-700 text-sm mt-1">
                        No transaction events detected on this account.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="my-20"></div>
      </main>

      <ShareWinModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSelectedPayoutTransactionId("");
        }}
        transactionId={selectedPayoutTransactionId}
      />
    </div>
  );
}
