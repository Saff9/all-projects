import { motion } from 'framer-motion';

// Spinner Component
export const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const colors = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    success: 'text-success-600',
    error: 'text-error-600',
  };

  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Dots Loader Component
export const DotsLoader = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colors = {
    primary: 'bg-primary-600',
    secondary: 'bg-gray-600',
    white: 'bg-white',
    success: 'bg-success-600',
    error: 'bg-error-600',
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const dotVariants = {
    initial: { scale: 0.5, opacity: 0.3 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  };

  return (
    <motion.div
      className={`flex items-center gap-1 ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`rounded-full ${sizes[size]} ${colors[color]}`}
          variants={dotVariants}
        />
      ))}
    </motion.div>
  );
};

// Pulse Loader Component
export const PulseLoader = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-500',
    white: 'bg-white',
    success: 'bg-success-500',
    error: 'bg-error-500',
  };

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <div
        className={`absolute inset-0 rounded-full ${colors[color]} animate-ping opacity-75`}
      />
      <div
        className={`absolute inset-0 rounded-full ${colors[color]}`}
      />
    </div>
  );
};

// Ring Loader Component
export const RingLoader = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const colors = {
    primary: 'border-primary-500',
    secondary: 'border-gray-500',
    white: 'border-white',
    success: 'border-success-500',
    error: 'border-error-500',
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div
        className={`
          w-full h-full rounded-full
          border-4 border-t-transparent
          ${colors[color]}
          animate-spin
        `}
      />
    </div>
  );
};

// Skeleton Component
export const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'rounded-full',
    button: 'h-10 rounded-lg',
    card: 'rounded-xl',
    image: 'rounded-lg',
  };

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700
        animate-pulse
        ${variants[variant]}
        ${className}
      `}
      style={{ width, height }}
    />
  );
};

// Skeleton Text Component
export const SkeletonText = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
};

// Skeleton Avatar Component
export const SkeletonAvatar = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  return (
    <Skeleton
      variant="avatar"
      className={`${sizes[size]} ${className}`}
    />
  );
};

// Skeleton Card Component
export const SkeletonCard = ({
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800
        rounded-xl p-5
        border border-gray-100 dark:border-gray-700
        ${className}
      `}
    >
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar size="md" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-1/3 mb-2" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

// Skeleton Profile Component
export const SkeletonProfile = ({
  className = '',
}) => {
  return (
    <div className={`text-center ${className}`}>
      <SkeletonAvatar size="2xl" className="mx-auto mb-4" />
      <Skeleton variant="title" className="w-1/2 mx-auto mb-2" />
      <Skeleton variant="text" className="w-1/3 mx-auto mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            variant="button"
            className="w-full"
          />
        ))}
      </div>
    </div>
  );
};

// Full Page Loader Component
export const PageLoader = ({
  text = 'Loading...',
  className = '',
}) => {
  return (
    <div
      className={`
        fixed inset-0
        flex flex-col items-center justify-center
        bg-white dark:bg-gray-900
        z-50
        ${className}
      `}
    >
      <RingLoader size="lg" />
      {text && (
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

// Inline Loading Component
export const InlineLoading = ({
  text = 'Loading',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Spinner size="sm" />
      <span className="text-gray-600 dark:text-gray-400">{text}</span>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({
  value = 0,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    gradient: 'bg-gradient-to-r from-primary-500 to-secondary-500',
  };

  return (
    <div className={className}>
      <div
        className={`
          w-full bg-gray-200 dark:bg-gray-700
          rounded-full overflow-hidden
          ${sizes[size]}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className={`h-full rounded-full ${colors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
};

export default Spinner;