/**
 * DevKit Logo Component
 * A modern developer-themed logo with gradients and code symbols
 */

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background gradient circle */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="bracketGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.7" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main circle background */}
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="url(#logoGradient)"
        filter="url(#glow)"
      />

      {/* Inner subtle ring */}
      <circle
        cx="20"
        cy="20"
        r="15"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="0.5"
        fill="none"
      />

      {/* Code brackets */}
      <g fill="url(#bracketGradient)">
        {/* Left bracket */}
        <path d="M12 14 L8 20 L12 26" stroke="url(#bracketGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Right bracket */}
        <path d="M28 14 L32 20 L28 26" stroke="url(#bracketGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Slash */}
        <line x1="24" y1="28" x2="30" y2="12" stroke="url(#bracketGradient)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Accent dot */}
      <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

// Logo with text
export function LogoWithText({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
        DevKit
      </span>
    </div>
  );
}

// Compact logo for small spaces
export function LogoCompact({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradientCompact" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <circle
        cx="20"
        cy="20"
        r="18"
        fill="url(#logoGradientCompact)"
      />

      {/* Simplified brackets */}
      <path d="M13 15 L9 20 L13 25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M27 15 L31 20 L27 25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
