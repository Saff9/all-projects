// src/app/error.tsx
"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Production: No console log
  }, [error]);

  return (
    <div className="min-h-screen bg-nta-bg flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="font-heading font-bold text-2xl text-[#003580] mb-2">Something went wrong</h1>
      <p className="text-gray-500 font-sans mb-6 max-w-md">
        An unexpected error occurred. Please try again. If the problem persists, visit the official NTA portal directly.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="nta-btn px-6 py-3 rounded-lg font-heading font-bold text-base"
        >
          Try Again
        </button>
        <a
          href="https://jeemain.nta.ac.in"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-[#003580] text-[#003580] px-6 py-3 rounded-lg font-heading font-bold text-base hover:bg-[#003580] hover:text-white transition-colors"
        >
          Visit NTA Portal
        </a>
      </div>
    </div>
  );
}
