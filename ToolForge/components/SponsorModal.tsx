'use client';

import { useState } from 'react';
import { Heart, Copy, Check, X, ExternalLink, Sparkles, Shield, Coins, CreditCard } from 'lucide-react';
import { RAZORPAY_DONATE_URL, CRYPTO_DONATE_ADDRESS, GITHUB_REPO_URL } from '@/lib/seo-utils';

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SponsorModal({ isOpen, onClose }: SponsorModalProps) {
  const [copiedCrypto, setCopiedCrypto] = useState(false);

  if (!isOpen) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(CRYPTO_DONATE_ADDRESS);
    setCopiedCrypto(true);
    setTimeout(() => setCopiedCrypto(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
              <Heart className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Sponsor &amp; Support ToolForge
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep these 21+ web tools 100% free, private, and ad-light.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: Razorpay / Cards / UPI */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 border border-indigo-200/70 dark:border-indigo-800/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Option 1: Cards / UPI / International
              </span>
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-indigo-600 text-white">
              Instant
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Support via <strong>Razorpay</strong> (UPI, Google Pay, PhonePe, Paytm, Visa/Mastercard, NetBanking).
          </p>

          <a
            href={RAZORPAY_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
          >
            <span>Donate via Razorpay (@CodeChap)</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Option 2: Crypto (Solana / USDT) */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Option 2: Crypto (Solana / SOL / USDT)
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Solana Network</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            Send SOL or SPL tokens to this wallet address:
          </p>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 text-slate-200 border border-slate-800">
            <span className="font-mono text-xs truncate flex-1 select-all text-emerald-400">
              {CRYPTO_DONATE_ADDRESS}
            </span>
            <button
              onClick={copyAddress}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white shrink-0 flex items-center gap-1 transition-colors"
            >
              {copiedCrypto ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCrypto ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer Star & Close */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1"
          >
            <span>⭐️ Star us on GitHub</span>
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
