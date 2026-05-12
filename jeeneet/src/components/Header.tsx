"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import DarkModeToggle from "./DarkModeToggle";

// Enhanced Ashoka Emblem with animation
function AshokaEmblem({ size = 52, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ashoka Emblem"
      className={`${animated ? "floating" : ""} transition-all duration-300 hover:scale-110`}
    >
      {/* Outer circle with gradient */}
      <defs>
        <linearGradient id="emblemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#003580" />
          <stop offset="100%" stopColor="#0055a5" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#emblemGradient)" stroke="#f7941d" strokeWidth="2" className="drop-shadow-lg" />
      {/* Inner white circle */}
      <circle cx="50" cy="50" r="38" fill="white" />
      {/* Chakra with animation */}
      <circle cx="50" cy="50" r="18" fill="none" stroke="#003580" strokeWidth="2.5" className={`${animated ? "pulse-animation" : ""}`} />
      <circle cx="50" cy="50" r="3" fill="#003580" />
      {/* 24 spokes */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 3.5 * Math.cos(rad);
        const y1 = 50 + 3.5 * Math.sin(rad);
        const x2 = 50 + 17.5 * Math.cos(rad);
        const y2 = 50 + 17.5 * Math.sin(rad);
        return (
          <line 
            key={i} 
            x1={x1} 
            y1={y1} 
            x2={x2} 
            y2={y2} 
            stroke="#003580" 
            strokeWidth="1.2" 
            className={`transition-all duration-300 hover:stroke-[#f7941d]`}
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        );
      })}
      {/* 4 lions suggestion (simplified silhouette) */}
      <ellipse cx="50" cy="36" rx="5" ry="4" fill="#003580" />
      <ellipse cx="50" cy="63" rx="5" ry="4" fill="#003580" />
      <ellipse cx="36" cy="50" rx="4" ry="5" fill="#003580" />
      <ellipse cx="64" cy="50" rx="4" ry="5" fill="#003580" />
      {/* NTA text inside */}
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fill="#003580"
        fontSize="9"
        fontWeight="800"
        fontFamily="Mukta, sans-serif"
        letterSpacing="1"
      >
        NTA
      </text>
    </svg>
  );
}

// Enhanced National emblem text badge
function GoiStripe() {
  return (
    <div className="bg-[#00174f] text-white text-[11px] py-1.5 px-4 flex items-center justify-between border-b border-[#f7941d]/30 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {/* Enhanced Indian flag tricolor strip with shadow */}
        <div className="flex flex-col w-4 rounded-sm overflow-hidden shadow-md" style={{ height: 11 }}>
          <div className="flex-1 bg-[#FF9933] transition-all duration-300 hover:brightness-110" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808] transition-all duration-300 hover:brightness-110" />
        </div>
        <span className="font-sans tracking-wide">
          भारत सरकार &nbsp;|&nbsp; Government of India &nbsp;|&nbsp; Ministry of Education
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-3">
        <a
          href="https://nta.ac.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#f7941d] transition-all duration-300 underline underline-offset-2 hover:scale-105 transform"
        >
          nta.ac.in
        </a>
        <span className="text-gray-500">|</span>
        <a
          href="https://jeemain.nta.ac.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#f7941d] transition-all duration-300 underline underline-offset-2 hover:scale-105 transform"
        >
          jeemain.nta.ac.in
        </a>
      </div>
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`shadow-xl transition-all duration-300 ${scrolled ? 'sticky top-0 z-50 backdrop-blur-md' : ''}`} 
      style={{ background: "linear-gradient(180deg,#001f4d 0%,#003580 100%)" }}
    >
      <GoiStripe />

      {/* ── Brand bar ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 relative">


        {/* Left: emblem + title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0 slide-up">
          <div className="shrink-0">
            <AshokaEmblem size={48} animated={true} />
          </div>

          {/* Enhanced Vertical divider with glow */}
          <div className="hidden sm:block w-px h-14 bg-gradient-to-b from-transparent via-white/30 to-transparent" />

            <div className="min-w-0">
              <div className="text-[#f7941d] text-[10px] sm:text-[11px] font-sans font-semibold tracking-widest uppercase fade-in">
                National Testing Agency
              </div>
              <div className="font-heading font-extrabold text-white text-lg sm:text-xl lg:text-2xl leading-tight fade-in">
                JEE Main 2026 — Session 2
              </div>
              <div className="text-blue-200 text-xs font-sans mt-0.5 truncate fade-in">
                Exam Hall Finder &amp; Admit Card Portal
              </div>
            </div>
        </div>

        {/* Right: desktop nav with enhanced styling */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-sans font-medium shrink-0">
          {[
            { href: "/", label: "Home", icon: "🏠" },
            { href: "#search", label: "Find Hall", icon: "🔍" },
            { href: "#news", label: "Live Updates", icon: "📰" },
            { href: "#faq", label: "FAQ", icon: "❓" },
            { href: "#links", label: "Links", icon: "🔗" },
          ].map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded-lg hover:bg-white/10 text-white hover:text-[#f7941d] transition-all duration-300 hover:scale-105 transform relative group fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="hidden sm:inline">{n.icon}</span>
              <span className="ml-1">{n.label}</span>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
          
          {/* Dark Mode Toggle */}
          <div className="mx-2">
            <DarkModeToggle />
          </div>
          
          <a
            href="https://jeemain.nta.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-4 py-2 rounded-lg font-heading font-bold text-sm transition-all duration-300 hover:scale-105 transform relative overflow-hidden group"
            style={{ background: "#f7941d", color: "#fff" }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#d97c0c")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#f7941d")}
          >
            <span className="relative z-10">Official Portal ↗</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </a>
        </nav>

        {/* Mobile hamburger and dark mode toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <DarkModeToggle />
          <button
            className={`text-white text-2xl px-2 transition-all duration-300 ${menuOpen ? 'rotate-90' : 'hover:scale-110 transform'}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute top-1 left-0 w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`absolute top-3 left-0 w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`absolute top-5 left-0 w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Mobile nav drawer with glass effect */}
      {menuOpen && (
        <div className="lg:hidden glass-effect border-t border-blue-800/50 px-4 pb-4 pt-3 flex flex-col gap-1 text-sm font-sans fade-in">
          {[
            { href: "/", label: "🏠 Home" },
            { href: "#search", label: "🔍 Find Exam Hall" },
            { href: "#news", label: "📰 Live Updates" },
            { href: "#faq", label: "❓ FAQ" },
            { href: "#links", label: "🔗 Important Links" },
          ].map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenuOpen(false)}
              className="text-white hover:text-[#f7941d] py-2.5 px-3 rounded-lg border-b border-blue-800/50 transition-all duration-300 hover:bg-white/5 hover:scale-102 transform"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {n.label}
            </Link>
          ))}
          <a
            href="https://jeemain.nta.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-center py-3 rounded-lg font-heading font-bold text-sm text-white transition-all duration-300 hover:scale-105 transform"
            style={{ background: "#f7941d" }}
          >
            Go to Official NTA Portal ↗
          </a>
        </div>
      )}

      {/* Enhanced Alert / marquee bar with gradient background */}
      <div className="text-white text-xs py-2.5 px-4 flex items-center gap-3 border-t border-[#f7941d]/40 relative overflow-hidden fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f7941d]/10 to-transparent animate-pulse" />
        <span
          className="shrink-0 text-[10px] font-heading font-bold px-2.5 py-1 rounded-full uppercase tracking-wide animate-pulse relative z-10"
          style={{ background: "#f7941d" }}
        >
          🔔 Alert
        </span>
        <span className="font-sans relative z-10">
          JEE Main 2026 Session 2 Admit Card expected to be released today on{" "}
          <a
            href="https://jeemain.nta.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[#f7d27d] hover:text-white transition-colors duration-300 hover:scale-105 transform inline-block"
          >
            jeemain.nta.ac.in
          </a>
          . Keep refreshing the official portal.
        </span>
      </div>
    </header>
  );
}
