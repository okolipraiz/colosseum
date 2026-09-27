'use client'

import { useState } from 'react'
import { Wallet } from 'lucide-react'
import WalletModal from '../dashboard/WalletModal'
// import { Profile } from '@/types'

// interface ProfileVaultProps {
//     profile: Profile | null
// }

export default function ProfileVault({ walletData }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full text-left bg-[#0d0d0f]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative transition-all duration-500 hover:border-blue-500/50 hover:shadow-blue-500/10 group"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full" />
        <div className="absolute top-6 right-8 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
          Access Vault
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center shadow-inner">
            <Wallet className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
              Available Balance
            </div>
            <div className="text-4xl font-mono font-black text-white tracking-tighter">
              $
              {walletData?.balance?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </button>

      <WalletModal
        // profile={profile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
