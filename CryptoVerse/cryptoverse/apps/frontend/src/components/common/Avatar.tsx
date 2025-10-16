'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==========================================
// Types
// ==========================================

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  level?: number;
  showLevel?: boolean;
  isOnline?: boolean;
  className?: string;
}

// ==========================================
// Styles
// ==========================================

const sizeStyles: Record<AvatarSize, { container: string; text: string; badge: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs', badge: 'w-2 h-2' },
  sm: { container: 'w-8 h-8', text: 'text-sm', badge: 'w-2.5 h-2.5' },
  md: { container: 'w-10 h-10', text: 'text-base', badge: 'w-3 h-3' },
  lg: { container: 'w-14 h-14', text: 'text-lg', badge: 'w-4 h-4' },
  xl: { container: 'w-20 h-20', text: 'text-2xl', badge: 'w-5 h-5' },
};

// ==========================================
// Helper Functions
// ==========================================

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name: string): string => {
  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

// ==========================================
// Component
// ==========================================

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  level,
  showLevel = false,
  isOnline,
  className,
}) => {
  const styles = sizeStyles[size];
  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? getColorFromName(name) : 'bg-slate-600';

  return (
    <div className={twMerge('relative inline-block', className)}>
      {/* Avatar Container */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={twMerge(
          clsx(
            'relative rounded-full overflow-hidden',
            styles.container,
            !src && bgColor
          )
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className={clsx(
              'w-full h-full flex items-center justify-center text-white font-semibold',
              styles.text
            )}
          >
            {initials}
          </div>
        )}
      </motion.div>

      {/* Level Badge */}
      {showLevel && level !== undefined && (
        <div
          className={clsx(
            'absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500',
            'flex items-center justify-center text-white font-bold',
            size === 'xs' && 'w-3 h-3 text-[6px]',
            size === 'sm' && 'w-4 h-4 text-[8px]',
            size === 'md' && 'w-5 h-5 text-[10px]',
            size === 'lg' && 'w-6 h-6 text-xs',
            size === 'xl' && 'w-8 h-8 text-sm'
          )}
        >
          {level}
        </div>
      )}

      {/* Online Indicator */}
      {isOnline !== undefined && (
        <div
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-slate-900',
            styles.badge,
            isOnline ? 'bg-green-500' : 'bg-slate-500'
          )}
        />
      )}
    </div>
  );
};

// ==========================================
// Avatar Group
// ==========================================

export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={twMerge('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
          className="ring-2 ring-slate-900"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={clsx(
            'rounded-full bg-slate-700 flex items-center justify-center text-white font-medium ring-2 ring-slate-900',
            sizeStyles[size].container,
            sizeStyles[size].text
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;