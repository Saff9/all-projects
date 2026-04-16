// src/components/TerminalEasterEgg.js
'use client';
import { useEffect, useState } from 'react';

export default function TerminalEasterEgg() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Press ` (backtick) to toggle terminal, Escape to close
      if (e.key === '`' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-craft-deep border border-craft-primary w-full max-w-2xl h-96 rounded-lg p-4 font-mono text-craft-mint overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <p>Welcome to Code Craft terminal.</p>
        <p className="text-sm text-craft-muted">Type <code>help</code> for commands.</p>
        <input
          className="bg-transparent border-b border-craft-mint outline-none text-craft-mint mt-4 w-full"
          placeholder="$ "
          autoFocus
        />
      </div>
    </div>
  );
}
