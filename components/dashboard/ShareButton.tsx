'use client'

import { Share2, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareButtonProps {
  marketId: string;
  asset: string;
  question?: string;
  variant?: "icon" | "full";
}

export default function ShareButton({
  marketId,
  question,
  variant = "full",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Create sharing URL
    const url = `${window.location.origin}/markets/${marketId}`;

    // Copy to clipboard
    navigator?.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Optional: Also try to use Web Share API if available
    if (navigator.share) {
      navigator
        .share({
          title: `Check out this prediction on Forecast by anomaly`,
          text: `${question}`,
          url: url,
        })
        .catch(() => {
          // Fallback to just clipboard copy (already done)
        });
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleShare}
        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group/share"
        title="Share Market"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Share2 className="w-3.5 h-3.5 group-hover/share:scale-110 transition-transform" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all group/share flex items-center gap-2"
      title="Share Market"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-green-500">
            Copied
          </span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 group-hover/share:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Share
          </span>
        </>
      )}
    </button>
  );
}
