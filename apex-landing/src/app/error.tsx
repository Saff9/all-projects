'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10">
          <RefreshCw className="w-10 h-10 text-white/40" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">System Anomaly</h1>
        <p className="text-muted-foreground mb-12">
          An unexpected logical error has occurred. Our systems are recovering.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
          >
            Restart Engine
          </button>
          <Link
            href="/"
            className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Base
          </Link>
        </div>
      </div>
    </div>
  );
}
