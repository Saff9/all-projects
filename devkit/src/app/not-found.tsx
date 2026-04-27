"use client";

import { memo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/icons/Logo";

const popularTools = [
  { name: "JSON Formatter", href: "/json-formatter" },
  { name: "Base64 Encoder", href: "/base64" },
  { name: "Password Generator", href: "/password-generator" },
  { name: "QR Code Generator", href: "/qr-generator" },
  { name: "Timestamp Converter", href: "/timestamp" },
  { name: "JWT Decoder", href: "/jwt-decoder" },
];

function NotFoundContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <svg width="800" height="800" viewBox="0 0 800 800" fill="none">
          <text x="100" y="400" fontSize="600" fill="white" fontFamily="monospace">{"{ }"}</text>
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        <div className="flex justify-center mb-8">
          <div className="animate-float-3d">
            <Logo size={64} />
          </div>
        </div>

        <div className="text-center mb-8 perspective-3d">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-tilt">
            404
          </h1>
          <p className="text-2xl text-white/80 font-light">
            Page Not Found
          </p>
          <p className="text-white/60 mt-2">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-lg blur transition-all duration-300 ${isHovered ? 'opacity-75' : 'opacity-25'}`} />
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search for a tool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full px-6 py-4 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md text-white font-medium hover:opacity-90 transition-opacity btn-3d"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        <div className="flex justify-center mb-12">
          <Link
            href="/"
            className="group flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all hover:scale-105 btn-3d"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 card-3d">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            Popular Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularTools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/80 hover:text-white text-sm transition-all hover:scale-105 text-center hover-3d"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-6 text-sm">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            All Tools
          </Link>
          <Link href="/json-formatter" className="text-white/60 hover:text-white transition-colors">
            JSON Tools
          </Link>
          <Link href="/hash-generator" className="text-white/60 hover:text-white transition-colors">
            Security Tools
          </Link>
          <a href="mailto:support@devkit.com" className="text-white/60 hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/30 text-sm">
        Made with ❤️ by DevKit
      </div>
    </div>
  );
}

export default memo(NotFoundContent);
