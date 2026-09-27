"use client";

import React, { useState } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";
import { useGetAdminUsers, useUpdateUserRole, UserRoleItem } from "@/hooks/admin/roles";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Search,
  Users,
  Shield,
  PlusIcon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit3,
} from "lucide-react";

export default function RolesManagementPage() {
  return (
    <AdminGuard requireSuperuser={true}>
      <RolesManagementContent />
    </AdminGuard>
  );
}

function RolesManagementContent() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserRoleItem | null>(null);
  const [targetRole, setTargetRole] = useState<string>("subadmin");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data: rolesData, isLoading, refetch } = useGetAdminUsers(
    roleFilter,
    0,
    1000,
    searchQuery
  );
  const updateRoleMutation = useUpdateUserRole();

  const filteredUsers = (rolesData?.users || []).filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const email = user.email?.toLowerCase() || "";
    const firstName = user.first_name?.toLowerCase() || "";
    const lastName = user.last_name?.toLowerCase() || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return (
      email.includes(q) ||
      firstName.includes(q) ||
      lastName.includes(q) ||
      fullName.includes(q)
    );
  });

  const handleOpenRoleModal = (user: UserRoleItem) => {
    setSelectedUser(user);
    setTargetRole(user.role || "user");
    setIsModalOpen(true);
  };

  const handleRoleChange = () => {
    if (!selectedUser) return;
    updateRoleMutation.mutate(
      { userId: selectedUser.id, role: targetRole },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superuser":
        return (
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full flex items-center gap-1.5 w-fit">
            <Shield className="w-3 h-3" />
            Superadmin
          </span>
        );
      case "admin":
        return (
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center gap-1.5 w-fit">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        );
      case "subadmin":
        return (
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1.5 w-fit">
            <PlusIcon className="w-3 h-3" />
            Subadmin (Market Creator)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-full flex items-center gap-1.5 w-fit">
            <Users className="w-3 h-3" />
            User
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Admin Role Management
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              Assign roles and permissions (Superadmin, Admin, Subadmin / Market Creator, User).
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs transition active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Roles
          </button>
        </div>

        {/* Role Explanation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#121214]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
              <Shield className="w-4 h-4" />
              Superadmin
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full platform governance, role assignment, and manual wallet balance adjustments.
            </p>
          </div>

          <div className="bg-[#121214]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
              <ShieldCheck className="w-4 h-4" />
              Full Admin
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access to Users, Platform Wallets, Yield Vaults, Referrals, Audit Logs, and Settings.
            </p>
          </div>

          <div className="bg-[#121214]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <PlusIcon className="w-4 h-4" />
              Subadmin (Market Creator)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Can ONLY create and resolve prediction markets. Blocked from users, wallets, vaults, and settings.
            </p>
          </div>

          <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm mb-2">
              <Users className="w-4 h-4" />
              Standard User
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Normal user platform account with trading, portfolio, and earning access.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
            {["all", "superuser", "admin", "subadmin", "user"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                  roleFilter === role
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {role === "subadmin" ? "Subadmin (Market Creator)" : role}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121214] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Users Role Table */}
        <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">Loading user roles...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="font-bold text-sm">No users found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Current Role</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Date Joined</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white">
                          {user.first_name || user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : "Unnamed User"}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{user.email}</div>
                      </td>
                      <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
                      <td className="py-4 px-6">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400">
                            <UserCheck className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400">
                            <UserX className="w-3.5 h-3.5" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs transition active:scale-95"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Change Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Role Reassignment Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121214] border border-white/15 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white mb-1">Update User Role</h3>
            <p className="text-xs text-slate-400 mb-6">
              Reassign permissions for <span className="text-white font-mono">{selectedUser.email}</span>
            </p>

            <div className="space-y-3 mb-8">
              {[
                {
                  id: "subadmin",
                  label: "Subadmin (Market Creator)",
                  desc: "Can ONLY create and resolve markets. Blocked from users, wallets, vaults, settings.",
                },
                {
                  id: "admin",
                  label: "Full Admin",
                  desc: "Full access to users, vaults, wallets overview, settings, referrals, logs.",
                },
                {
                  id: "superuser",
                  label: "Superadmin",
                  desc: "Full governance, role management, and wallet balance updates.",
                },
                {
                  id: "user",
                  label: "Standard User",
                  desc: "Normal predictor account with trading privileges only.",
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    targetRole === item.id
                      ? "bg-blue-600/10 border-blue-500 text-white"
                      : "bg-[#1a1a1e]/60 border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={item.id}
                    checked={targetRole === item.id}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="mt-1 accent-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-white mb-0.5">{item.label}</div>
                    <div className="text-[11px] text-slate-400 leading-tight">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChange}
                disabled={updateRoleMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.4)] transition active:scale-95 disabled:opacity-50"
              >
                {updateRoleMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm Role Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
