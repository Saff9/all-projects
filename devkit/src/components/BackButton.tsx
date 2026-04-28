'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Keyboard } from 'lucide-react';

interface BackButtonProps {
  showText?: boolean;
  className?: string;
}

export default function BackButton({ showText = true, className = '' }: BackButtonProps) {
  const pathname = usePathname();

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    }
  }, []);

  // Keyboard shortcut for going back (Escape key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack]);

  // Don't show on homepage
  if (pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-all duration-200 ${className}`}
      aria-label="Go back to tools"
    >
      <ArrowLeft className="w-4 h-4" />
      {showText && <span>Back to Tools</span>}
      <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white/10 rounded ml-1">
        <Keyboard className="w-3 h-3" />
        <span>ESC</span>
      </kbd>
    </button>
  );
}
