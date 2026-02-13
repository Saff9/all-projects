"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
            <span className="text-2xl font-bold">!</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">System encountered an error</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              We&apos;ve logged the issue and our team is investigating. Please try refreshing the application.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all active:scale-[0.98]"
          >
            Try again
          </button>
        </motion.div>
      </body>
    </html>
  );
}
