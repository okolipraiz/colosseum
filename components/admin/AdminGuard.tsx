"use client";

import React from "react";
import Link from "next/link";
import { useGetUserInfo } from "@/hooks/user";
import { ShieldAlert, ArrowLeft, PlusIcon } from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";

interface AdminGuardProps {
  children: React.ReactNode;
  requireFullAdmin?: boolean;
  requireSuperuser?: boolean;
}

export default function AdminGuard({
  children,
  requireFullAdmin = true,
  requireSuperuser = false,
}: AdminGuardProps) {
  const { data: profile, isLoading } = useGetUserInfo();

  const isSubadmin = profile?.is_subadmin || profile?.role === "subadmin";
  const isSuperuser = profile?.is_superuser || profile?.role === "superuser";
  const isFullAdmin = profile?.is_full_admin || (profile?.is_staff && !isSubadmin) || isSuperuser;
  const isAdmin = profile?.is_admin || profile?.is_staff || profile?.is_superuser || isSubadmin || isFullAdmin;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium text-sm">Verifying permissions...</p>
      </div>
    );
  }

  // Check superuser requirement
  if (requireSuperuser && !isSuperuser) {
    return <AccessDeniedView title="Superuser Privileges Required" message="You need superuser privileges to access role management and system override functions." />;
  }

  // Check full admin requirement
  if (requireFullAdmin && !isFullAdmin) {
    return <AccessDeniedView title="Access Restricted for Subadmin Role" message="Your account is configured with Market Creator (Subadmin) privileges. Access to financial data, users, yield vaults, audit logs, and system settings is restricted." />;
  }

  // Check general admin requirement
  if (!isAdmin) {
    return <AccessDeniedView title="Admin Access Required" message="You need admin privileges to access this area." />;
  }

  return <>{children}</>;
}

function AccessDeniedView({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col">
      <AdminNavbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#121214]/90 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white mb-3">
            {title}
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/admin/create-markets"
              prefetch={false}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-95"
            >
              <PlusIcon className="w-4 h-4" />
              Go to Create Markets
            </Link>

            <Link
              href="/admin"
              prefetch={false}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm text-slate-300 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
