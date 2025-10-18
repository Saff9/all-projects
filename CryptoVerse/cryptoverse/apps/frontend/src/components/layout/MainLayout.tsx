'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { ToastContainer } from '../common/Toast';
import { useAuth } from '../../hooks';

// ==========================================
// Types
// ==========================================

export interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  className?: string;
  contentClassName?: string;
}

// ==========================================
// Component
// ==========================================

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHeader = true,
  showBottomNav = true,
  className,
  contentClassName,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        clsx(
          'min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900',
          'text-white',
          className
        )
      )}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      {showHeader && isAuthenticated && <Header />}

      {/* Main Content */}
      <main
        className={twMerge(
          clsx(
            'relative z-10',
            showHeader && 'pt-16',
            showBottomNav && 'pb-20',
            contentClassName
          )
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && isAuthenticated && <BottomNav />}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

// ==========================================
// Auth Layout (for login/register pages)
// ==========================================

export interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900',
          'flex items-center justify-center p-4',
          'text-white',
          className
        )
      )}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md"
      >
        {children}
      </motion.div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default MainLayout;