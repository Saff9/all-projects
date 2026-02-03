"use client";

import { motion } from 'framer-motion';

interface ApexLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 32, text: 'text-sm', icon: 16 },
  md: { container: 48, text: 'text-lg', icon: 24 },
  lg: { container: 72, text: 'text-2xl', icon: 36 },
  xl: { container: 96, text: 'text-4xl', icon: 48 },
};

export function ApexLogo({ size = 'md', animated = true, className = '' }: ApexLogoProps) {
  const dimensions = sizeMap[size];
  
  const Container = animated ? motion.div : 'div';
  
  return (
    <Container
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: dimensions.container, height: dimensions.container }}
      {...(animated ? {
        animate: { 
          y: [0, -4, 0],
        },
        transition: { 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      } : {})}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(var(--primary), 0.3))' }}
      >
        <defs>
          <linearGradient id="genzGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.65 0.18 220)" />
            <stop offset="50%" stopColor="oklch(0.55 0.15 240)" />
            <stop offset="100%" stopColor="oklch(0.6 0.2 260)" />
          </linearGradient>
          <linearGradient id="genzGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.75 0.15 220)" />
            <stop offset="50%" stopColor="oklch(0.7 0.12 240)" />
            <stop offset="100%" stopColor="oklch(0.65 0.18 260)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect
          x="8"
          y="8"
          width="84"
          height="84"
          rx="24"
          className="fill-[url(#genzGradient)] dark:fill-[url(#genzGradientDark)]"
        />
        
        <path
          d="M50 20 L65 35 L65 50 L50 65 L35 50 L35 35 Z"
          fill="rgba(255,255,255,0.15)"
          className="dark:fill-white/10"
        />
        
        <text
          x="50"
          y="62"
          textAnchor="middle"
          className="fill-white font-bold"
          style={{ 
            fontSize: '42px', 
            fontFamily: 'Sora, sans-serif',
            filter: 'url(#glow)'
          }}
        >
          G
        </text>
        
        <circle cx="75" cy="25" r="8" fill="rgba(255,255,255,0.9)">
          {animated && (
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        
        <path
          d="M72 22 L75 19 L78 22 L78 25 L81 28 L78 28 L75 31 L72 28 L69 28 L72 25 Z"
          fill="oklch(0.8 0.15 60)"
          className="dark:fill-amber-400"
        >
          {animated && (
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </svg>
    </Container>
  );
}

export function ApexLogoText({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };
  
  return (
    <span className={`font-sora font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent ${textSizes[size]} ${className}`}>
      Apex AI
    </span>
  );
}
