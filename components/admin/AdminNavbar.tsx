"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import WalletModal from "@/components/dashboard/WalletModal";
import { useAuth } from "@/context/auth-provider";
import { useGetUserInfo, useGetWalletBalance } from "@/hooks/user";
import {
  Blocks,
  LogOut,
  Logs,
  PlusIcon,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  TrendingUp,
  Trophy,
  User,
  User2,
  UserRoundCog,
  Wallet,
  Wallet2Icon,
} from "lucide-react";

export default function AdminNavbar() {
  const { isAccess, logOut } = useAuth();
  const { data: profile } = useGetUserInfo();
  const { data: walletData } = useGetWalletBalance();
  const pathname = usePathname();
  const isMarketDetailPage = /^\/markets\/[^/]+$/.test(pathname);

  const [scrolled, setScrolled] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const isSubadmin = profile?.is_subadmin || profile?.role === "subadmin";
  const isSuperuser = profile?.is_superuser || profile?.role === "superuser";
  const isFullAdmin = profile?.is_full_admin || (profile?.is_staff && !isSubadmin) || isSuperuser;

  const desktopNavLinks = [
    {
      name: "Create Markets",
      path: "/admin/create-markets",
      icon: PlusIcon,
      show: true,
    },
    // {
    //   name: "Verify Markets",
    //   path: "/admin/verify-markets",
    //   icon: ShieldCheck,
    //   show: isFullAdmin,
    // },
    {
      name: "Create Vault",
      path: "/admin/create-vaults",
      icon: Blocks,
      show: isFullAdmin,
    },
    { name: "Users", path: "/admin/users", icon: User2, show: isFullAdmin },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy, show: true },
    {
      name: "Wallet",
      path: "/admin/wallet/overview",
      icon: Wallet2Icon,
      show: isFullAdmin,
    },

  ].filter((link) => link.show);

  const mobileTabs = [
    { name: "Create Markets", path: "/admin/create-markets", icon: PlusIcon, show: true },
    { name: "Users", path: "/admin/users", icon: User2, show: isFullAdmin },
    { name: "Leaderboard", path: "/leaderboard", icon: TrendingUp, show: true },
    { name: "Wallet", path: "/admin/wallet/overview", icon: Wallet2Icon, show: isFullAdmin },
  ].filter((tab) => tab.show);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handlelogOut = () => {
    logOut();
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500
    ${scrolled
            ? "bg-[#0a0a0b]/40 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            : "bg-transparent backdrop-blur-none border-b border-transparent"
          }
  `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/admin"
              prefetch={false}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:scale-110 transition-transform duration-500">
                <span className="text-xl font-black text-white italic">FA</span>
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all duration-500">
                Forecast
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  prefetch={false}
                  className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 group ${isActive(link.path)
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {link.icon && (
                      <link.icon
                        className={`w-4 h-4 ${isActive(link.path) ? "text-blue-600" : ""}`}
                      />
                    )}
                    <span>{link.name}</span>
                  </div>
                  {isActive(link.path) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-blue-600 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  )}
                  {!isActive(link.path) && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-white group-hover:w-4 transition-all duration-300 rounded-full opacity-50" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop User Menu */}
            <div className="flex items-center gap-4">
              {isAccess ? (
                <>
                  {/* Balance Display (Only for full admin) */}
                  {isFullAdmin && (
                    <button
                      onClick={() => setIsWalletModalOpen(true)}
                      className="group relative px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-0.5">
                            Wallet
                          </div>
                          <div className="font-mono text-sm font-bold text-white leading-none">
                            $
                            {(walletData?.balance ?? 0).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  <WalletModal
                    profile={profile}
                    isOpen={isWalletModalOpen}
                    onClose={() => setIsWalletModalOpen(false)}
                  />

                  {/* User Dropdown */}
                  <div className="relative group">
                    <button
                      onClick={() => setOpen((prev) => !prev)}
                      className="flex items-center gap-3 px-2 py-2 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
                    >
                      <div className="relative">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name || "User"}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-purple-500/50 transition-all"
                          />
                        ) : (
                          <div className="w-9 h-9 bg-gradient-to-br bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0a0a0b] rounded-full shadow-lg" />
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-xs font-black text-white max-w-[90px] truncate leading-tight">
                          {(
                            profile?.full_name ||
                            profile?.email?.split("@")[0] ||
                            "Explorer"
                          ).toUpperCase()}
                        </span>
                        <span className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter leading-tight">
                          {isSubadmin ? "Subadmin" : isSuperuser ? "Superadmin" : "Admin"}
                        </span>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    <div
                      className={`absolute right-0 mt-3 w-56 bg-[#121214]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 z-50 overflow-hidden ${open ? "opacity-100 visible" : "opacity-0 invisible"
                        }`}
                    >
                      <div className="p-2 space-y-1">
                        <Link
                          prefetch={false}
                          href="/markets"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                        >
                          <UserRoundCog className="w-4 h-4 text-blue-600" />
                          View on User Mode
                        </Link>
                        <div className="h-px bg-white/5 mx-2" />

                        {isFullAdmin && (
                          <>
                            <Link
                              prefetch={false}
                              href="/admin/create-vaults"
                              onClick={() => setOpen(false)}
                              className="md:hidden flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                            >
                              <Blocks className="w-4 h-4 text-blue-600" />
                              Create Yield Vault
                            </Link>
                            <div className="md:hidden flex h-px bg-white/5 mx-2" />
                          </>
                        )}

                        <Link
                          prefetch={false}
                          href="/profile"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                        >
                          <User className="w-4 h-4 text-blue-600" />
                          My Account
                        </Link>
                        <div className="h-px bg-white/5 mx-2" />

                        {isFullAdmin && (
                          <>
                            <Link
                              prefetch={false}
                              href="/admin/settings"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                            >
                              <Settings className="w-4 h-4 text-blue-600" />
                              General Settings
                            </Link>
                            <div className="h-px bg-white/5 mx-2" />

                            <Link
                              prefetch={false}
                              href="/admin/referrals"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                            >
                              <Share2 className="w-4 h-4 text-blue-600" />
                              Referrals
                            </Link>
                            <div className="h-px bg-white/5 mx-2" />

                            <Link
                              prefetch={false}
                              href="/admin/verify-markets"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                            >
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                              Verify Markets
                            </Link>
                            <div className="h-px bg-white/5 mx-2" />

                            <Link
                              prefetch={false}
                              href="/admin/logs"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                            >
                              <Logs className="w-4 h-4 text-blue-600" />
                              Audit Logs
                            </Link>
                            <div className="h-px bg-white/5 mx-2" />
                          </>
                        )}

                        {isSuperuser && (
                          <>
                            <Link
                              prefetch={false}
                              href="/admin/roles"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                            >
                              <Shield className="w-4 h-4 text-blue-600" />
                              Role Management
                            </Link>
                            <div className="h-px bg-white/5 mx-2" />
                          </>
                        )}

                        <button
                          onClick={handlelogOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400/80 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  prefetch={false}
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  className="group relative px-8 py-3 rounded-lg font-black text-white uppercase transition-all duration-500 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                >
                  <div className="absolute inset-0 bg-blue-600" />
                  <span className="relative z-10">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {isAccess && !isMarketDetailPage && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-[#0d0d0f]/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {mobileTabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.path ? isActive(tab.path) : false;

                return (
                  <Link
                    key={tab.path}
                    href={tab.path!}
                    prefetch={false}
                    className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-95"
                  >
                    <div
                      className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${active ? "bg-blue-500/15" : ""
                        }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors duration-300 ${active ? "text-blue-400" : "text-slate-500"
                          }`}
                      />
                      {active && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${active ? "text-blue-400" : "text-slate-600"
                        }`}
                    >
                      {tab.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
