import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Subject color mapping
 */
export const subjectColors = {
  physics: {
    bg: 'bg-physics',
    text: 'text-physics',
    light: 'bg-physics/10',
    border: 'border-physics',
  },
  chemistry: {
    bg: 'bg-chemistry',
    text: 'text-chemistry',
    light: 'bg-chemistry/10',
    border: 'border-chemistry',
  },
  mathematics: {
    bg: 'bg-mathematics',
    text: 'text-mathematics',
    light: 'bg-mathematics/10',
    border: 'border-mathematics',
  },
  biology: {
    bg: 'bg-biology',
    text: 'text-biology',
    light: 'bg-biology/10',
    border: 'border-biology',
  },
} as const;

/**
 * Difficulty level colors
 */
export const difficultyColors = {
  easy: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    light: 'bg-green-500/10',
    border: 'border-green-500',
  },
  medium: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    light: 'bg-yellow-500/10',
    border: 'border-yellow-500',
  },
  hard: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    light: 'bg-red-500/10',
    border: 'border-red-500',
  },
} as const;

/**
 * Common animation variants for Framer Motion
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/**
 * Stagger animation for lists
 */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Default transition settings
 */
export const defaultTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};
