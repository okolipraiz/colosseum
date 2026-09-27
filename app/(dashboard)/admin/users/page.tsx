"use client";
import { useState } from "react";
import { useGetAllUsers } from "@/hooks/admin/user";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminGuard from "@/components/admin/AdminGuard";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function UsersPage() {
  return (
    <AdminGuard requireFullAdmin={true}>
      <UsersPageContent />
    </AdminGuard>
  );
}

function UsersPageContent() {
  const [search, setSearch] = useState("");

  const avatarStyle = (idx: number): React.CSSProperties => {
    const gradients = [
      "conic-gradient(from 0deg, #a855f7, #6366f1, #3b82f6, #a855f7)",
      "conic-gradient(from 90deg, #6366f1, #8b5cf6, #a855f7, #6366f1)",
      "conic-gradient(from 180deg, #6366f1, #4f46e5, #818cf8, #6366f1)",
      "linear-gradient(135deg, #22c55e, #a855f7, #ec4899)",
      "conic-gradient(from 45deg, #3b82f6, #a855f7, #ec4899, #3b82f6)",
      "linear-gradient(135deg, #f59e0b, #ef4444)",
    ];
    return { background: gradients[idx % gradients.length] };
  };

  const { data: users } = useGetAllUsers();

  const filtered = users?.users?.filter((l) => {
    const query = search.toLowerCase().trim();
    const firstName = l.first_name?.toLowerCase() || "";
    const lastName = l.last_name?.toLowerCase() || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return (
      firstName.includes(query) ||
      lastName.includes(query) ||
      fullName.includes(query)
    );
  });

  const sorted = [...(filtered || [])].sort(
    (a, b) => b.wallet_balance - a.wallet_balance,
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <AdminNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            Users
          </h1>

          <Link
            href="/admin/roles"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 font-bold text-xs transition active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          >
            <Shield className="w-4 h-4" />
            Manage User Roles
          </Link>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden bg-[#121214]/60 border border-white/5">
          {/* Search */}
          <div className="flex items-center gap-3 px-3 py-3 border-b border-[#1a1a1a]">
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="#555"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="bg-transparent outline-none text-sm flex-1 text-white placeholder:text-[#555]"
            />
          </div>

          {/* Header */}
          <div className="grid grid-cols-[60px_60px_1fr_120px] items-center px-3 py-3 border-b border-[#1a1a1a] text-[#777] text-sm font-semibold">
            <div>S/N</div>
            <div />
            <div>Name</div>
            <div className="text-right">Wallet</div>
          </div>

          {/* Rows */}
          {sorted?.map((user, idx) => (
            <div
              key={user.id}
              className="grid grid-cols-[60px_60px_1fr_120px] items-center px-3 py-4 border-b border-[#141414] hover:bg-[#111] transition-colors"
            >
              {/* S/N */}
              <div className="text-white text-sm font-medium">{idx + 1}</div>

              {/* Avatar */}
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={avatarStyle(idx)}
                >
                  {user.first_name?.charAt(0)}
                </div>
              </div>

              {/* Name */}
              <div className="text-white text-sm font-medium truncate flex items-center justify-between pr-4">
                <Link
                  href={`/admin/users/${user.id}/portfolio?firstName=${user.first_name}&lastName=${user.last_name}`}
                  className="hover:underline"
                >
                  {user.first_name.trim()} {user.last_name.trim()}
                </Link>
              </div>

              {/* Wallet */}
              <div className="text-green-400 font-semibold text-sm text-right">
                ${user.wallet_balance.toFixed(2)}
              </div>
            </div>
          ))}

          {!filtered?.length && (
            <div className="text-center text-[#555] py-6 text-sm">
              No users found
            </div>
          )}
        </div>
        <div className="my-30" />
      </main>
    </div>
  );
}
