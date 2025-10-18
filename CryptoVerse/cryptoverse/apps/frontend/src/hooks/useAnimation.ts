import { useCallback, useRef, useState } from 'react';
import { useGameStore } from '../stores';

// ==========================================
// Types
// ==========================================

interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
}

interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

// ==========================================
// Hook
// ==========================================

export function useAnimation() {
  const { animationsEnabled, particlesEnabled } = useGameStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Check if animations are enabled
  const canAnimate = animationsEnabled;

  // Fade in animation variants
  const fadeIn = useCallback(
    (options?: AnimationOptions) => {
      if (!canAnimate) {
        return { opacity: 1 };
      }
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
          duration: options?.duration || 0.3,
          delay: options?.delay || 0,
          ease: options?.easing || 'easeOut',
        },
      };
    },
    [canAnimate]
  );

  // Scale animation variants
  const scaleIn = useCallback(
    (options?: AnimationOptions) => {
      if (!canAnimate) {
        return { scale: 1, opacity: 1 };
      }
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
        transition: {
          duration: options?.duration || 0.3,
          delay: options?.delay || 0,
          ease: options?.easing || 'easeOut',
        },
      };
    },
    [canAnimate]
  );

  // Slide up animation variants
  const slideUp = useCallback(
    (options?: AnimationOptions) => {
      if (!canAnimate) {
        return { y: 0, opacity: 1 };
      }
      return {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 50, opacity: 0 },
        transition: {
          duration: options?.duration || 0.3,
          delay: options?.delay || 0,
          ease: options?.easing || 'easeOut',
        },
      };
    },
    [canAnimate]
  );

  // Slide down animation variants
  const slideDown = useCallback(
    (options?: AnimationOptions) => {
      if (!canAnimate) {
        return { y: 0, opacity: 1 };
      }
      return {
        initial: { y: -50, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -50, opacity: 0 },
        transition: {
          duration: options?.duration || 0.3,
          delay: options?.delay || 0,
          ease: options?.easing || 'easeOut',
        },
      };
    },
    [canAnimate]
  );

  // Spring animation variants
  const spring = useCallback(
    (options?: SpringOptions) => {
      if (!canAnimate) {
        return { scale: 1 };
      }
      return {
        initial: { scale: 0.8 },
        animate: { scale: 1 },
        transition: {
          type: 'spring',
          stiffness: options?.stiffness || 300,
          damping: options?.damping || 20,
          mass: options?.mass || 1,
        },
      };
    },
    [canAnimate]
  );

  // Bounce animation
  const bounce = useCallback(
    (options?: AnimationOptions) => {
      if (!canAnimate) {
        return { scale: 1 };
      }
      return {
        initial: { scale: 0.3 },
        animate: { scale: 1 },
        transition: {
          duration: options?.duration || 0.5,
          ease: [0.68, -0.55, 0.265, 1.55],
        },
      };
    },
    [canAnimate]
  );

  // Pulse animation
  const pulse = useCallback(
    (options?: AnimationOptions) => {
      if (!canAnimate) {
        return {};
      }
      return {
        animate: {
          scale: [1, 1.05, 1],
        },
        transition: {
          duration: options?.duration || 0.5,
          repeat: Infinity,
          repeatDelay: 1,
        },
      };
    },
    [canAnimate]
  );

  // Shake animation
  const shake = useCallback(
    (options?: AnimationOptions) => {
      if (!canAnimate) {
        return {};
      }
      return {
        animate: {
          x: [0, -10, 10, -10, 10, 0],
        },
        transition: {
          duration: options?.duration || 0.5,
        },
      };
    },
    [canAnimate]
  );

  // Stagger children animation
  const stagger = useCallback(
    (staggerDelay: number = 0.1) => {
      if (!canAnimate) {
        return {};
      }
      return {
        transition: {
          staggerChildren: staggerDelay,
        },
      };
    },
    [canAnimate]
  );

  // Tap animation (for buttons)
  const tap = useCallback(() => {
    if (!canAnimate) {
      return {};
    }
    return {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    };
  }, [canAnimate]);

  // Hover animation
  const hover = useCallback(
    (scale: number = 1.02) => {
      if (!canAnimate) {
        return {};
      }
      return {
        scale,
        transition: {
          duration: 0.2,
        },
      };
    },
    [canAnimate]
  );

  // Number counter animation
  const countUp = useCallback(
    (
      start: number,
      end: number,
      duration: number = 1000,
      callback: (value: number) => void
    ) => {
      if (!canAnimate) {
        callback(end);
        return;
      }

      const startTime = performance.now();
      const diff = end - start;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = start + diff * easeOut;

        callback(Math.round(currentValue));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      setIsAnimating(true);
      animationRef.current = requestAnimationFrame(animate);
    },
    [canAnimate]
  );

  // Cancel animation
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    cancelAnimation();
  }, [cancelAnimation]);

  return {
    canAnimate,
    particlesEnabled,
    isAnimating,
    fadeIn,
    scaleIn,
    slideUp,
    slideDown,
    spring,
    bounce,
    pulse,
    shake,
    stagger,
    tap,
    hover,
    countUp,
    cancelAnimation,
    cleanup,
  };
}

export default useAnimation;