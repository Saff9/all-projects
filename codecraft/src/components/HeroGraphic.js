// src/components/HeroGraphic.js
'use client';

export default function HeroGraphic() {
  return (
    <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
      {/* Subtle outer glow ring */}
      <div className="absolute inset-0 bg-gradient-to-tr from-craft-primary/20 via-craft-glow/20 to-craft-mint/20 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Main SVG Illustration */}
      <svg 
        viewBox="0 0 500 500" 
        className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-visible"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="lobeBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0072F5" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="lobePurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7928CA" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="lobeMint" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#222635" stopOpacity="0" />
            <stop offset="50%" stopColor="#222635" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#222635" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0072F5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0072F5" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Grid Lines */}
        <g opacity="0.4">
          <circle cx="250" cy="250" r="220" stroke="url(#gridGrad)" strokeWidth="1.5" strokeDasharray="4 8" />
          <circle cx="250" cy="250" r="170" stroke="url(#gridGrad)" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="120" stroke="url(#gridGrad)" strokeWidth="1.5" strokeDasharray="2 4" />
          <line x1="250" y1="30" x2="250" y2="470" stroke="url(#gridGrad)" strokeWidth="1.5" />
          <line x1="30" y1="250" x2="470" y2="250" stroke="url(#gridGrad)" strokeWidth="1.5" />
        </g>

        {/* Central AI Core Glow */}
        <circle cx="250" cy="250" r="90" fill="url(#coreGlow)" className="animate-pulse" />

        {/* Interconnected Mesh Nodes */}
        <g stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.4" fill="none">
          <path d="M250 250 L180 160 M250 250 L320 160 M250 250 L160 280 M250 250 L340 280 M250 250 L250 360" />
        </g>

        {/* Mesh Node Dots */}
        <g fill="#F8FAFC">
          <circle cx="180" cy="160" r="4" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="320" cy="160" r="4" className="animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <circle cx="160" cy="280" r="4" className="animate-ping" style={{ animationDuration: '3.5s', animationDelay: '1s' }} />
          <circle cx="340" cy="280" r="4" className="animate-ping" style={{ animationDuration: '2.8s', animationDelay: '1.2s' }} />
          <circle cx="250" cy="360" r="4" className="animate-ping" style={{ animationDuration: '3.2s', animationDelay: '0.8s' }} />
          
          <circle cx="180" cy="160" r="4" />
          <circle cx="320" cy="160" r="4" />
          <circle cx="160" cy="280" r="4" />
          <circle cx="340" cy="280" r="4" />
          <circle cx="250" cy="360" r="4" />
        </g>

        {/* Central Lobe Vector / Emblem */}
        <g className="origin-center animate-float">
          {/* Main Core Hexagon / Poly */}
          <polygon points="250,190 302,220 302,280 250,310 198,280 198,220" fill="url(#lobeBlue)" fillOpacity="0.9" stroke="#F8FAFC" strokeWidth="2" strokeOpacity="0.3" />
          <polygon points="250,205 287,227 287,273 250,295 213,273 213,227" fill="url(#lobePurple)" fillOpacity="0.8" />
          <circle cx="250" cy="250" r="22" fill="url(#lobeMint)" />
          <circle cx="250" cy="250" r="8" fill="#F8FAFC" />
        </g>

        {/* Floating Geometric Elements (Outer Ring) */}
        {/* Floating Cube 1 (Top Right) */}
        <g className="origin-center animate-float" style={{ animationDelay: '1s', animationDuration: '7s' }}>
          <rect x="350" y="100" width="45" height="45" rx="12" fill="url(#lobePurple)" transform="rotate(15 372 122)" stroke="#F8FAFC" strokeWidth="1.5" strokeOpacity="0.2" />
          <circle cx="372" cy="122" r="8" fill="#F8FAFC" fillOpacity="0.8" />
        </g>

        {/* Floating Sphere 2 (Top Left) */}
        <g className="origin-center animate-float" style={{ animationDelay: '2.5s', animationDuration: '6.5s' }}>
          <circle cx="130" cy="120" r="28" fill="url(#lobeBlue)" stroke="#F8FAFC" strokeWidth="1.5" strokeOpacity="0.2" />
          <path d="M115 110 Q130 95 145 110" stroke="#F8FAFC" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>

        {/* Floating Emerald Pill 3 (Bottom Left) */}
        <g className="origin-center animate-float" style={{ animationDelay: '1.5s', animationDuration: '8s' }}>
          <rect x="90" y="320" width="70" height="36" rx="18" fill="url(#lobeMint)" transform="rotate(-20 125 338)" stroke="#F8FAFC" strokeWidth="1.5" strokeOpacity="0.2" />
          <circle cx="112" cy="335" r="6" fill="#F8FAFC" />
          <circle cx="138" cy="342" r="6" fill="#F8FAFC" fillOpacity="0.5" />
        </g>

        {/* Floating Diamond 4 (Bottom Right) */}
        <g className="origin-center animate-float" style={{ animationDelay: '0.5s', animationDuration: '6s' }}>
          <rect x="340" y="320" width="50" height="50" rx="14" fill="url(#lobeBlue)" transform="rotate(45 365 345)" stroke="#F8FAFC" strokeWidth="1.5" strokeOpacity="0.2" />
          <circle cx="365" cy="345" r="10" fill="url(#lobeMint)" />
        </g>

        {/* Orbiting Tiny Satellites */}
        <g className="origin-center animate-spin-slow" style={{ animationDuration: '25s' }}>
          <circle cx="250" cy="35" r="6" fill="#0072F5" />
          <circle cx="465" cy="250" r="5" fill="#7928CA" />
          <circle cx="250" cy="465" r="7" fill="#10B981" />
          <circle cx="35" cy="250" r="5" fill="#3B82F6" />
        </g>
      </svg>
    </div>
  );
}
