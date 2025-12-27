import Link from 'next/link';

interface LogoProps {
  className?: string;
  showTag?: boolean;
}

export default function Logo({ className = '', showTag = true }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-3 group select-none ${className}`}>
      {/* Handcrafted Geometric SVG Emblem */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
        
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-0.5 border border-indigo-500/30 group-hover:border-indigo-400/60 shadow-lg shadow-indigo-500/20 transition-all duration-300 flex items-center justify-center overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:6px_6px]" />
          
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-white transform group-hover:scale-110 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              fill="url(#logo-grad)"
              stroke="url(#logo-stroke)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="logo-grad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" />
                <stop offset="0.5" stopColor="#818CF8" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="logo-stroke" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A5B4FC" />
                <stop offset="1" stopColor="#67E8F9" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            Tool<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-400">Forge</span>
          </span>
          {showTag && (
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              FREE
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-tight -mt-0.5 hidden sm:inline">
          Webmaster &amp; Developer Suite
        </span>
      </div>
    </Link>
  );
}
