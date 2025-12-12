// components/InstallPrompt.tsx
'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 8 seconds on mobile, 6 seconds on desktop
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const delay = isMobile ? 8000 : 6000;
      
      setTimeout(() => {
        setShowPrompt(true);
      }, delay);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Listen for custom show install prompt event from menu
    const handleShowInstallPrompt = () => {
      setShowPrompt(true);
    };

    window.addEventListener('showInstallPrompt', handleShowInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('showInstallPrompt', handleShowInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setShowPrompt(false);
          setDeferredPrompt(null);
        }
      } catch (error) {
        console.error('Error installing app:', error);
      }
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        alert('To install this app, tap the share button and then "Add to Home Screen".');
      } else if (/Android/i.test(navigator.userAgent)) {
        alert('To install this app, tap the menu button (three dots) and then "Install App".');
      } else {
        alert('To install this app, follow your browser\'s instructions for installing PWAs.');
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    const dismissedUntil = new Date();
    dismissedUntil.setDate(dismissedUntil.getDate() + 7);
    localStorage.setItem('installPromptDismissed', dismissedUntil.toISOString());
  };

  // Check if prompt was recently dismissed
  useEffect(() => {
    const dismissedUntil = localStorage.getItem('installPromptDismissed');
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (showPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 dark:bg-kashmir-dark-neutral-100/95 backdrop-blur-sm border-t border-kashmir-light-neutral-200 dark:border-kashmir-dark-neutral-300 shadow-2xl">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-kashmir-light-blue-500 dark:bg-kashmir-dark-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">❄️</span>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200 text-sm">
                  Install SkyKash
                </h3>
                <p className="text-xs text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400">
                  Get the full app experience
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="bg-kashmir-light-blue-500 hover:bg-kashmir-light-blue-600 dark:bg-kashmir-dark-blue-500 dark:hover:bg-kashmir-dark-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="bg-kashmir-light-neutral-200 hover:bg-kashmir-light-neutral-300 dark:bg-kashmir-dark-neutral-300 dark:hover:bg-kashmir-dark-neutral-400 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
