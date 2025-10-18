'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHaptics, useAnimation as useAnimationUtils } from '../../hooks';

// ==========================================
// Types
// ==========================================

export interface TapButtonProps {
  onTap: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
}

export interface TapEffectProps {
  x: number;
  y: number;
  value: number;
  isCritical?: boolean;
  id: number;
}

// ==========================================
// Component
// ==========================================

export const TapButton: React.FC<TapButtonProps> = ({
  onTap,
  disabled = false,
  size = 'xl',
  className,
  children,
}) => {
  const haptic = useHaptics();
  const { pulse, shake } = useAnimationUtils();
  const controls = useAnimation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Motion values for 3D effect
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  // Transform for glow effect
  const glowOpacity = useTransform(rotateX, [-10, 0, 10], [0.3, 0.6, 0.3]);
  
  // Size classes
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    xl: 'w-48 h-48',
  };

  // Handle tap
  const handleTap = useCallback(() => {
    if (disabled) return;
    
    // Haptic feedback
    haptic.tap();
    
    // Trigger animation
    controls.start({
      scale: [1, 0.95, 1],
      transition: { duration: 0.1 },
    });
    
    // Call onTap callback
    onTap();
  }, [disabled, haptic, controls, onTap]);

  // Handle mouse move for 3D effect
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;
      
      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateXValue = ((e.clientY - centerY) / (rect.height / 2)) * -10;
      const rotateYValue = ((e.clientX - centerX) / (rect.width / 2)) * 10;
      
      rotateX.set(rotateXValue);
      rotateY.set(rotateYValue);
    },
    [rotateX, rotateY]
  );

  // Reset rotation on mouse leave
  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.button
      ref={buttonRef}
      animate={controls}
      onClick={handleTap}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      className={twMerge(
        clsx(
          'relative rounded-full',
          sizeClasses[size],
          'bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600',
          'shadow-lg shadow-purple-500/30',
          'flex items-center justify-center',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:shadow-xl active:shadow-purple-500/40',
          className
        )
      )}
    >
      {/* Outer glow */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="absolute inset-0 rounded-full bg-purple-400 blur-xl"
      />
      
      {/* Inner circle */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.5) 0%, transparent 50%)',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {children || (
            <>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                ⚡
              </motion.span>
              <span className="text-sm font-bold text-white/80 mt-1">TAP</span>
            </>
          )}
        </div>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/4 bg-gradient-to-b from-white/30 to-transparent rounded-full blur-sm" />
      </div>
    </motion.button>
  );
};

// ==========================================
// Tap Effect Component
// ==========================================

export const TapEffect: React.FC<TapEffectProps> = ({
  x,
  y,
  value,
  isCritical = false,
  id,
}) => {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -80, scale: 1.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ left: x, top: y }}
      className={twMerge(
        clsx(
          'absolute pointer-events-none z-50',
          'font-bold text-2xl',
          isCritical
            ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]'
            : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'
        )
      )}
    >
      {isCritical && '💥 '}
      +{value}
    </motion.div>
  );
};

// ==========================================
// Particle Effect Component
// ==========================================

export interface ParticleEffectProps {
  x: number;
  y: number;
  color?: string;
  id: number;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  x,
  y,
  color = '#A855F7',
  id,
}) => {
  const randomAngle = Math.random() * 360;
  const randomDistance = 50 + Math.random() * 50;
  
  const endX = x + Math.cos((randomAngle * Math.PI) / 180) * randomDistance;
  const endY = y + Math.sin((randomAngle * Math.PI) / 180) * randomDistance;

  return (
    <motion.div
      key={id}
      initial={{ opacity: 1, x, y, scale: 1 }}
      animate={{ opacity: 0, x: endX, y: endY, scale: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute pointer-events-none z-40"
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
};

// ==========================================
// Critical Hit Animation
// ==========================================

export interface CriticalHitProps {
  show: boolean;
  onComplete: () => void;
}

export const CriticalHit: React.FC<CriticalHitProps> = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <motion.div
        initial={{ rotate: -10 }}
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.3, repeat: 2 }}
        className="text-4xl font-bold text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]"
      >
        CRITICAL!
      </motion.div>
    </motion.div>
  );
};

export default TapButton;