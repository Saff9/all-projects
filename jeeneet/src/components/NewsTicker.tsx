// src/components/NewsTicker.tsx
"use client";

import { useState, useEffect } from "react";

interface TickerProps {
  items: { title: string; link: string }[];
}

export default function NewsTicker({ items }: TickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [visibleItems, setVisibleItems] = useState(items);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) {
      setVisibleItems([]);
      return;
    }
    
    setVisibleItems(items);
  }, [items]);

  useEffect(() => {
    if (visibleItems.length === 0) return;
    
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prev) => (prev + 1) % visibleItems.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [visibleItems.length, isPaused]);

  if (!visibleItems || visibleItems.length === 0) return null;

  const currentItem = visibleItems[currentIndex];
  const nextItem = visibleItems[(currentIndex + 1) % visibleItems.length];

  return (
    <div className="relative bg-gradient-to-r from-[#003580] via-[#002a66] to-[#003580] dark:from-[#0a0a0f] dark:via-[#0f172a] dark:to-[#0a0a0f] text-white flex items-center overflow-hidden py-3 shadow-lg">
      {/* Background animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 dark:via-white/10 to-transparent animate-pulse" />
      </div>
      
      {/* LIVE Badge */}
      <div className="shrink-0 relative z-10 ml-2">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white font-heading font-bold text-xs px-3 py-1.5 uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5 card-premium">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          <span>LIVE</span>
        </div>
      </div>

      {/* News Content */}
      <div 
        className="overflow-hidden flex-1 relative px-4 cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onClick={() => {
          if (currentItem?.link) {
            window.open(currentItem.link, '_blank', 'noopener,noreferrer');
          }
        }}
      >
        <div className="relative h-6 flex items-center">
          {/* Current item */}
          <div 
            className={`absolute inset-0 flex items-center text-sm font-sans transition-all duration-500 ${isPaused ? 'opacity-100' : 'opacity-100'}`}
            style={{ 
              transform: isPaused ? 'translateX(0)' : 'translateX(0)',
            }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-yellow-300">📰</span>
              <span className="hover:text-yellow-300 transition-colors duration-300">
                {currentItem?.title || "Loading latest updates..."}
              </span>
              {currentItem?.link && (
                <span className="text-xs text-blue-300 hover:text-blue-200 transition-colors">
                  Read more →
                </span>
              )}
            </span>
          </div>
          
          {/* Next item (hidden but ready for transition) */}
          <div 
            className="absolute inset-0 flex items-center text-sm font-sans opacity-0"
            style={{ 
              transform: 'translateX(100%)',
            }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-yellow-300">📰</span>
              <span>{nextItem?.title || ""}</span>
            </span>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
          <div 
            className="h-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-3000 ease-linear"
            style={{ 
              width: isPaused ? 'var(--progress-width, 0%)' : '100%',
              '--progress-width': '0%',
              animation: isPaused ? 'none' : 'progress 3s linear infinite'
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Navigation dots */}
      <div className="shrink-0 flex items-center gap-1 mx-2">
        {visibleItems.slice(0, 5).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-yellow-300 scale-125' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to news item ${index + 1}`}
          />
        ))}
      </div>

      {/* Control buttons */}
      <div className="shrink-0 flex items-center gap-1 mr-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-all duration-300 hover:scale-110"
          aria-label={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + visibleItems.length) % visibleItems.length)}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-all duration-300 hover:scale-110"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % visibleItems.length)}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs transition-all duration-300 hover:scale-110"
          aria-label="Next"
        >
          ›
        </button>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
