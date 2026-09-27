"use client";

import React, { useState, useEffect } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";
import { useGetSystemSettings, useUpdateSystemSettings } from "@/hooks/admin/settings";
import {
  Settings,
  Gift,
  Percent,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCw,
  Sliders,
  DollarSign,
} from "lucide-react";

export default function GeneralSettingsPage() {
  return (
    <AdminGuard requireFullAdmin={true}>
      <GeneralSettingsContent />
    </AdminGuard>
  );
}

function GeneralSettingsContent() {
  const { data: settings, isLoading, refetch } = useGetSystemSettings();
  const updateMutation = useUpdateSystemSettings();

  const [signupBonus, setSignupBonus] = useState<number>(5.0);
  const [staticReferralEnabled, setStaticReferralEnabled] = useState<boolean>(true);
  const [feeSharingEnabled, setFeeSharingEnabled] = useState<boolean>(true);
  const [feeSharePercentage, setFeeSharePercentage] = useState<number>(1.0);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);

  useEffect(() => {
    if (settings) {
      setSignupBonus(settings.referral_signup_bonus ?? 5.0);
      setStaticReferralEnabled(settings.static_referral_enabled ?? true);
      setFeeSharingEnabled(settings.affiliate_fee_sharing_enabled ?? true);
      setFeeSharePercentage(settings.default_affiliate_fee_share_percentage ?? 1.0);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      referral_signup_bonus: signupBonus,
      static_referral_enabled: staticReferralEnabled,
      affiliate_fee_sharing_enabled: feeSharingEnabled,
      default_affiliate_fee_share_percentage: feeSharePercentage,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Settings className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                General System Settings
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              Manage platform-wide configurations, affiliate defaults, and operational modes.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs transition active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Config
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium">Loading system settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form Cards */}
              <div className="lg:col-span-2 space-y-6">
                {/* Referral & Incentive Settings */}
                <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Referral & Affiliate Defaults
                      </h2>
                      <p className="text-xs text-slate-400">
                        Default signup bonuses and fee-sharing percentages for all users
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Signup Bonus Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Default Referral Signup Bonus (USD)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={signupBonus}
                          onChange={(e) => setSignupBonus(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#1a1a1e] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono font-bold focus:outline-none focus:border-blue-500 transition"
                          placeholder="5.00"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Bonus awarded to newly referred accounts upon sign-up.
                      </p>
                    </div>

                    {/* Static Referral Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#1a1a1e]/60 rounded-2xl border border-white/5">
                      <div>
                        <div className="text-sm font-bold text-white mb-0.5">
                          Static Referral Rewards
                        </div>
                        <div className="text-xs text-slate-400">
                          Enable fixed USD bonuses for successful user sign-ups
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStaticReferralEnabled(!staticReferralEnabled)}
                        className={`p-1.5 rounded-xl transition-all duration-300 ${
                          staticReferralEnabled ? "text-blue-400 bg-blue-500/10" : "text-slate-600 bg-white/5"
                        }`}
                      >
                        {staticReferralEnabled ? (
                          <ToggleRight className="w-8 h-8" />
                        ) : (
                          <ToggleLeft className="w-8 h-8" />
                        )}
                      </button>
                    </div>

                    {/* Dynamic Affiliate Program Toggle */}
                    <div className="flex items-center justify-between p-4 bg-[#1a1a1e]/60 rounded-2xl border border-white/5">
                      <div>
                        <div className="text-sm font-bold text-white mb-0.5">
                          Dynamic Affiliate Program
                        </div>
                        <div className="text-xs text-slate-400">
                          Enable trade-based affiliate rewards credited directly to user main balance
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFeeSharingEnabled(!feeSharingEnabled)}
                        className={`p-1.5 rounded-xl transition-all duration-300 ${
                          feeSharingEnabled ? "text-blue-400 bg-blue-500/10" : "text-slate-600 bg-white/5"
                        }`}
                      >
                        {feeSharingEnabled ? (
                          <ToggleRight className="w-8 h-8" />
                        ) : (
                          <ToggleLeft className="w-8 h-8" />
                        )}
                      </button>
                    </div>

                  </div>
                </div>

                {/* System Operational Mode */}
                <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Platform Operational Controls
                      </h2>
                      <p className="text-xs text-slate-400">
                        Operational flags and system maintenance controls
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#1a1a1e]/60 rounded-2xl border border-white/5">
                    <div>
                      <div className="text-sm font-bold text-white mb-0.5 flex items-center gap-2">
                        System Maintenance Mode
                        {maintenanceMode && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Temporarily restrict market ordering for scheduled maintenance
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`p-1.5 rounded-xl transition-all duration-300 ${
                        maintenanceMode ? "text-amber-400 bg-amber-500/10" : "text-slate-600 bg-white/5"
                      }`}
                    >
                      {maintenanceMode ? (
                        <ToggleRight className="w-8 h-8" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & Save Panel */}
              <div className="space-y-6">
                <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl sticky top-28">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    Configuration Status
                  </h3>

                  <div className="space-y-3 mb-6 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400">Signup Bonus</span>
                      <span className="font-mono font-bold text-white">${signupBonus.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400">Static Referrals</span>
                      <span className={`font-bold ${staticReferralEnabled ? "text-green-400" : "text-slate-500"}`}>
                        {staticReferralEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400">Fee Share Program</span>
                      <span className={`font-bold ${feeSharingEnabled ? "text-green-400" : "text-slate-500"}`}>
                        {feeSharingEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-slate-400">Fee Share Rate</span>
                      <span className="font-mono font-bold text-white">{feeSharePercentage}%</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white shadow-[0_0_24px_rgba(37,99,235,0.4)] transition-all duration-300 active:scale-95 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Settings
                      </>
                    )}
                  </button>

                  {updateMutation.isSuccess && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-400 font-medium justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                      Settings successfully saved!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
