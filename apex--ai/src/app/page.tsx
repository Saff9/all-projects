"use client";

import { ChatInterface } from '@/components/ChatInterface';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from 'sonner';

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="relative min-h-screen overflow-hidden bg-background">
        <div 
          className="fixed inset-0 z-0 transition-colors duration-500"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, oklch(0.92 0.03 220 / 40%) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, oklch(0.9 0.04 180 / 30%) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, oklch(0.95 0.02 240 / 20%) 0%, transparent 70%),
              linear-gradient(180deg, var(--background) 0%, var(--background) 100%)
            `
          }}
        />
        
        <div className="fixed inset-0 z-0 dark:opacity-100 opacity-0 transition-opacity duration-500"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, oklch(0.25 0.05 220 / 50%) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, oklch(0.2 0.04 260 / 40%) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, oklch(0.18 0.03 240 / 30%) 0%, transparent 70%)
            `
          }}
        />
        
        <div className="relative z-10">
          <ChatInterface />
        </div>

        <Toaster 
          position="top-center" 
          toastOptions={{
            className: 'glass-strong border-border/50',
            duration: 4000,
          }}
        />
      </main>
    </ErrorBoundary>
  );
}
