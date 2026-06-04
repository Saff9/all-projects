import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
  '3xl': 'w-24 h-24 text-3xl',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
  '2xl': 'w-4 h-4',
  '3xl': 'w-5 h-5',
};

const Avatar = ({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  shape = 'circle',
  status,
  statusPosition = 'bottom-right',
  className = '',
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Generate background color from name
  const getColorFromName = (name) => {
    if (!name) return 'bg-gray-400';
    const colors = [
      'bg-primary-500',
      'bg-secondary-500',
      'bg-accent-500',
      'bg-success-500',
      'bg-warning-500',
      'bg-error-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    busy: 'bg-error-500',
    away: 'bg-warning-500',
  };

  const showFallback = !src || imageError;
  const initials = getInitials(name);

  const baseStyles = `
    relative inline-flex items-center justify-center
    flex-shrink-0
    ${sizes[size]}
    ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'}
    ${onClick ? 'cursor-pointer' : ''}
    overflow-hidden
    ${className}
  `;

  const avatarVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    hover: onClick ? { scale: 1.05 } : {},
    tap: onClick ? { scale: 0.95 } : {},
  };

  return (
    <motion.div
      className={baseStyles}
      onClick={onClick}
      variants={avatarVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.2 }}
    >
      {showFallback ? (
        <div
          className={`
            w-full h-full flex items-center justify-center
            ${getColorFromName(name)}
            text-white font-medium
          `}
        >
          {initials || <User className="w-1/2 h-1/2" />}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      {/* Status Indicator */}
      {status && (
        <span
          className={`
            absolute ${statusPosition.includes('bottom') ? 'bottom-0' : 'top-0'}
            ${statusPosition.includes('right') ? 'right-0' : 'left-0'}
            ${statusSizes[size]}
            ${statusColors[status]}
            rounded-full ring-2 ring-white dark:ring-gray-900
          `}
        />
      )}
    </motion.div>
  );
};

// Avatar Group Component
export const AvatarGroup = ({
  avatars = [],
  max = 4,
  size = 'md',
  shape = 'circle',
  className = '',
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          shape={shape}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            ${sizes[size]}
            ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'}
            flex items-center justify-center
            bg-gray-100 dark:bg-gray-800
            text-gray-600 dark:text-gray-300
            font-medium
            ring-2 ring-white dark:ring-gray-900
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// Avatar Upload Component
export const AvatarUpload = ({
  src,
  name,
  size = '2xl',
  onUpload,
  className = '',
}) => {
  return (
    <label className={`relative cursor-pointer group ${className}`}>
      <Avatar src={src} name={name} size={size} />
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          bg-black/50 rounded-full
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
        `}
      >
        <span className="text-white text-sm font-medium">Change</span>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onUpload) {
            onUpload(file);
          }
        }}
      />
    </label>
  );
};

export default Avatar;