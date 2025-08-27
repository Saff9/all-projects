'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function Splash() {
  const router = useRouter();
  const { loading, user, fetchUserProfile } = useApp();
  const [statusText, setStatusText] = useState('Establishing Connection...');
  const [showRetry, setShowRetry] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Cycling status messages
    const statuses = [
      "Gathering the swarm...",
      "Minting prestige...",
      "Syncing with the hive...",
      "Polishing the gold...",
      "Establishing Connection..."
    ];
    let i = 0;
    
    const interval = setInterval(() => {
      i = (i + 1) % statuses.length;
      setStatusText(statuses[i]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Once backend loading is done and user exists, redirect to home page
    if (!loading && user) {
      const redirectTimer = setTimeout(() => {
        router.push('/home');
      }, 500); // Small delay for smooth transition
      return () => clearTimeout(redirectTimer);
    }

    // If loading is done but no user — backend might be down
    if (!loading && !user) {
      const retryTimer = setTimeout(() => {
        setShowRetry(true);
      }, 500);
      return () => clearTimeout(retryTimer);
    }
  }, [loading, user, router]);

  const handleRetry = async () => {
    setRetrying(true);
    setShowRetry(false);
    setStatusText('Reconnecting...');
    try {
      await fetchUserProfile();
    } finally {
      setRetrying(false);
    }
  };

  // Subtle mascot movement on pointer move
  const [mascotStyle, setMascotStyle] = useState({});
  const handlePointerMove = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      const x = (window.innerWidth / 2 - e.pageX) / 50;
      const y = (window.innerHeight / 2 - e.pageY) / 50;
      setMascotStyle({
        transform: `translate(${x}px, ${y}px)`
      });
    }
  };

  return (
    <div 
      className="bg-background text-on-background min-h-screen flex flex-col overflow-hidden"
      onPointerMove={handlePointerMove}
    >
      {/* Splash Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center relative px-container-padding">
        {/* Center Mascot Section */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Animated Mascot Halo */}
          <div 
            className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center animate-halo transition-transform duration-300"
            style={mascotStyle}
          >
            <div className="absolute inset-0 bg-primary-container/10 rounded-full blur-[60px]"></div>
            <img 
              alt="CJP Mascot" 
              className="w-full h-full object-contain relative z-20" 
              src="/mascot.jpg"
            />
          </div>
          
          {/* Identity Cluster */}
          <div className="text-center flex flex-col items-center">
            {/* Huge Bold Gold Typography */}
            <h1 className="font-display-lg-mobile text-[84px] leading-tight md:text-[120px] font-extrabold gold-shimmer tracking-tighter uppercase">
              CJP
            </h1>
            {/* Elegant Subline */}
            <p className="font-label-mono text-label-mono tracking-[0.4em] text-primary-container uppercase mt-[-10px] opacity-90">
              CockRoach Janta Party
            </p>
          </div>
        </div>

        {/* Atmospheric Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-container/5 blur-[120px] rounded-full"></div>
        </div>
      </main>

      {/* Footer Loading Section */}
      <footer className="w-full pb-16 px-container-padding flex flex-col items-center gap-6">
        {/* Status Message */}
        <span className="font-label-mono text-label-mono text-on-surface-variant/40 uppercase tracking-widest transition-opacity duration-300">
          {showRetry ? 'Connection Failed' : statusText}
        </span>

        {showRetry ? (
          /* Retry button — shown when backend is down */
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-on-surface-variant/60 text-center max-w-[220px]">
              Could not connect to server. Check your connection and try again.
            </p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="bg-primary text-black font-extrabold py-3 px-8 rounded-xl text-sm active:scale-95 transition-all shadow-md shadow-amber-500/20 disabled:opacity-60"
            >
              {retrying ? 'Reconnecting...' : 'Retry'}
            </button>
          </div>
        ) : (
          /* Gold Pulsing Loading Bar Container */
          <div className="w-full max-w-xs h-[2px] bg-outline-variant/20 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-primary-container/10"></div>
            <div className="loading-bar-inner h-full w-1/2 absolute top-0 left-0"></div>
          </div>
        )}
      </footer>
    </div>
  );
}
