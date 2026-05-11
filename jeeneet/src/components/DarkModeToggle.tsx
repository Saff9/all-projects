"use client";

import { useTheme } from "@/lib/ThemeContext";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-14 h-8 bg-gray-200 rounded-full animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#f7941d] focus:ring-offset-2 group"
      style={{
        background: theme === "dark" 
          ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" 
          : "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)"
      }}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Toggle slider */}
      <div
        className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-500 ease-in-out flex items-center justify-center shadow-lg ${
          theme === "dark" ? "translate-x-7 bg-[#f7941d]" : "translate-x-1 bg-white"
        }`}
      >
        {theme === "dark" ? (
          // Moon icon
          <svg
            className="w-4 h-4 text-[#0f172a]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          // Sun icon
          <svg
            className="w-4 h-4 text-[#3b82f6]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      {/* Background stars for dark mode */}
      {theme === "dark" && (
        <>
          <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full opacity-50" />
          <div className="absolute top-4 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-30" />
          <div className="absolute top-3 right-3 w-1 h-1 bg-white rounded-full opacity-40" />
        </>
      )}

      {/* Glow effect on hover */}
      <div 
        className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          theme === "dark" 
            ? "shadow-[0_0_15px_rgba(251,146,60,0.5)]" 
            : "shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        }`}
      />
    </button>
  );
}