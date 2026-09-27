"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import WalletModal from "@/components/dashboard/WalletModal";
import { useAuth } from "@/context/auth-provider";
import { useGetUserInfo, useGetWalletBalance } from "@/hooks/user";
import {
  Bell,
  Blocks,
  CircleDollarSign,
  Headset,
  LayoutGrid,
  LogOut,
  ShieldUser,
  Trophy,
  User,
  User2,
  Users,
  Users2,
  Wallet,
} from "lucide-react";
import { useNotifications } from "@/context/notification-provider";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { isAccess, logOut } = useAuth();
  const { data: profile } = useGetUserInfo();
  const { data: walletData } = useGetWalletBalance();
  const { notificationsData } = useNotifications();

  const router = useRouter()
  const pathname = usePathname()
  const isMarketDetailPage = /^\/markets\/[^/]+$/.test(pathname);

  const [scrolled, setScrolled] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const unreadCount = notificationsData?.unread_count || 0;

  const toggleProfile = () => {
    setOpen((prev) => !prev);
  };

  const mobileTabs = [
    { name: "Markets", path: "/markets", icon: LayoutGrid },
    {
      name: "Portfolio",
      path: "/portfolio",
      icon: CircleDollarSign,
    },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    // { name: "Earn", path: "/earn", icon: Blocks },
    { name: "Profile", path: "/profile", icon: User },
  ];

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
    // router.push(`/login?next=${encodeURIComponent(pathname)}`);
    logOut();
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-500
    ${
      scrolled
        ? "bg-[#0a0a0b]/40 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        : "bg-transparent backdrop-blur-none border-b border-transparent"
    }
  `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/markets" className="flex items-center gap-3 group">
              <div>
                <img
                  src="/logo-white.png"
                  alt="Forecast Logo"
                  className="w-24 h-8"
                />
              </div>
              {/* <div className="w-10 h-10  bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:scale-110 transition-transform duration-500">
                <span className="text-xl font-black text-white italic">FA</span>
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all duration-500">
                Forecast
              </span> */}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { name: "Markets", path: "/markets", icon: LayoutGrid },
                {
                  name: "Portfolio",
                  path: "/portfolio",
                  icon: CircleDollarSign,
                },
                { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
                // { name: "Earn", path: "/earn", icon: Blocks },
                ...(profile?.is_staff || profile?.is_superuser
                  ? [
                      {
                        name: "Admin Vaults",
                        path: "/admin/create-vaults",
                        icon: ShieldUser,
                      },
                    ]
                  : []),
              ].map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative px-4 py-2 text-sm font-bold transition-all duration-300 group ${
                    isActive(link.path)
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
                  {/* Balance Display -> Wallet Trigger */}
                  <button
                    onClick={
                      () => router.push("/wallets/overview")
                      // setIsWalletModalOpen(true)
                    }
                    data-tour="wallet-balance"
                    className="group cursor-pointer relative px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 overflow-hidden"
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

                  <WalletModal
                    profile={profile}
                    isOpen={isWalletModalOpen}
                    onClose={() => setIsWalletModalOpen(false)}
                  />

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={toggleProfile}
                      data-tour="profile-menu"
                      className="flex items-center gap-3 px-2 py-2 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer"
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
                        <span className="text-xs font-black text-white max-w-[80px] truncate leading-tight">
                          {(
                            profile?.full_name ||
                            profile?.email?.split("@")[0] ||
                            "Explorer"
                          ).toUpperCase()}
                        </span>
                      </div>
                    </button>

                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white ring-2 ring-[#0a0a0b] animate-pulse">
                        {unreadCount > 99 ? "+99" : unreadCount}
                      </span>
                    )}

                    {/* Overlay to catch clicks and close */}
                    {open && (
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                      />
                    )}

                    {/* Dropdown Menu */}
                    <div
                      className={`absolute right-0 mt-3 w-56 bg-[#121214]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 z-50 overflow-hidden ${
                        open
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2 pointer-events-none"
                      }`}
                    >
                      <div className="p-2 space-y-1">
                        {profile?.is_admin && (
                          <>
                            <Link
                              href="/admin"
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
                            >
                              <ShieldUser className="w-4 h-4 text-blue-600" />
                              Admin
                            </Link>
                            <div className="h-px bg-white/5 mx-2" />
                          </>
                        )}
                        <Link
                          href="/profile/notifications"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                        >
                          <Bell className="w-4 h-4 text-blue-600" />
                          Notifications{" "}
                          {unreadCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white ring-2 ring-[#0a0a0b] animate-pulse">
                              {unreadCount > 99 ? "+99" : unreadCount}
                            </span>
                          )}
                        </Link>
                        <div className="h-px bg-white/5 mx-2" />
                        <Link
                          href="/profile"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                        >
                          <User className="w-4 h-4 text-blue-600" />
                          My Account
                        </Link>
                        <div className="md:hidden flex h-px bg-white/5 mx-2" />{" "}
                        <Link
                          href="/profile/affiliate"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                        >
                          <Users className="w-4 h-4 text-blue-600" />
                          Affiliate
                        </Link>
                        {/* <div className="md:hidden flex h-px bg-white/5 mx-2" /> */}
                        {/* <Link
                          href="/leaderboard"
                          onClick={() => setOpen(false)}
                          className=" md:hidden flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                        >
                          <Trophy className="w-4 h-4 text-blue-600" />
                          Leaderboard
                        </Link> */}
                        {/* <div className="md:hidden">
                          <div className="h-px bg-white/5 mx-2" />
                          <Link
                            href="/earn"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                          >
                            <Wallet className="w-4 h-4 text-blue-600" />
                            Earn
                          </Link>
                        </div> */}
                        <div className="h-px bg-white/5 mx-2" />
                        <Link
                          href="/contact-us"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                        >
                          <Headset className="w-4 h-4 text-blue-600" />
                          Contact Us
                        </Link>
                        <div className="h-px bg-white/5 mx-2" />
                        <button
                          onClick={handlelogOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400/80 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition cursor-pointer"
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
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  className="group relative px-8 py-3 rounded-lg font-black text-white uppercase  transition-all duration-500 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.2)]"
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
          {/* frosted glass bar */}
          <div className="bg-[#0d0d0f]/80 backdrop-blur-2xl border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
            {/* safe area padding for phones */}
            <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {mobileTabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.path ? isActive(tab.path) : false;

                // if (tab.isSpecial) {
                //   // Wallet — elevated center button
                //   return (
                //     <button
                //       key="vault"
                //       onClick={tab.action}
                //       className="flex flex-col items-center gap-1 relative -mt-5"
                //     >
                //       <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.5)] border border-blue-400/30 active:scale-95 transition-transform">
                //         <Icon className="w-6 h-6 text-white" />
                //       </div>
                //       <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">
                //         Vault
                //       </span>
                //     </button>
                //   );
                // }

                return (
                  <Link
                    key={tab.path}
                    href={tab.path!}
                    className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-95"
                  >
                    <div
                      className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${active ? "bg-blue-500/15" : ""}`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors duration-300 ${active ? "text-blue-400" : "text-slate-500"}`}
                      />
                      {active && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${active ? "text-blue-400" : "text-slate-600"}`}
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
