import React from 'react';

interface TeleVaultLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const TeleVaultLogo: React.FC<TeleVaultLogoProps> = ({
  size = 32,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Geometric Shield Emblem */}
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-xl bg-zinc-900 border border-white/10 shadow-sm shrink-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/6 h-4/6 text-zinc-100"
        >
          {/* Minimalist Shield Outline */}
          <path
            d="M12 2L4 5.5V11.5C4 16.5 7.4 21.1 12 22.5C16.6 21.1 20 16.5 20 11.5V5.5L12 2Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Telegram / Vault Core */}
          <path
            d="M12 7V17M8.5 10.5L12 14L15.5 10.5"
            stroke="#38bdf8"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-white">
              TeleVault
            </span>
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 font-medium">
              E2EE
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-normal mt-0.5">
            Zero-Knowledge Cloud
          </span>
        </div>
      )}
    </div>
  );
};
