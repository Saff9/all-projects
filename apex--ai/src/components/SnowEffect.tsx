"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Snowflake {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface ChinarLeaf {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

interface SnowEffectProps {
  enabled?: boolean;
}

export function SnowEffect({ enabled = true }: SnowEffectProps) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const [leaves, setLeaves] = useState<ChinarLeaf[]>([]);

  useEffect(() => {
    if (!enabled) return;
    
    const flakes: Snowflake[] = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 15,
      opacity: Math.random() * 0.4 + 0.2,
    }));
    setSnowflakes(flakes);

    const chinarColors = [
      'var(--chinar-orange)',
      'var(--chinar-red)', 
      'var(--chinar-gold)',
    ];

    const leafItems: ChinarLeaf[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 15 + 10,
      duration: Math.random() * 15 + 20,
      delay: Math.random() * 20,
      color: chinarColors[Math.floor(Math.random() * chinarColors.length)],
    }));
    setLeaves(leafItems);
  }, [enabled]);

  return (
    <AnimatePresence>
      {enabled && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        >
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="absolute animate-snowfall"
              style={{
                left: `${flake.x}%`,
                width: flake.size,
                height: flake.size,
                animationDuration: `${flake.duration}s`,
                animationDelay: `${flake.delay}s`,
                opacity: flake.opacity,
              }}
            >
              <div 
                className="w-full h-full rounded-full"
                style={{ 
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(230,240,255,0.4) 100%)',
                  boxShadow: '0 0 3px rgba(255,255,255,0.5)'
                }} 
              />
            </div>
          ))}
          
          {leaves.map((leaf) => (
            <div
              key={`leaf-${leaf.id}`}
              className="absolute animate-chinar-drift"
              style={{
                left: `${leaf.x}%`,
                width: leaf.size,
                height: leaf.size,
                animationDuration: `${leaf.duration}s`,
                animationDelay: `${leaf.delay}s`,
              }}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))' }}>
                <path
                  d="M12 2C12 2 8 6 8 10C8 12 9 14 12 15C15 14 16 12 16 10C16 6 12 2 12 2ZM12 15C12 15 10 17 10 19C10 21 11 22 12 22C13 22 14 21 14 19C14 17 12 15 12 15ZM7 12C5 12 3 13 3 15C3 17 5 18 7 17C7 17 8 16 8 14C8 13 7 12 7 12ZM17 12C17 12 16 13 16 14C16 16 17 17 17 17C19 18 21 17 21 15C21 13 19 12 17 12Z"
                  fill={leaf.color}
                />
              </svg>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
