import { motion } from 'framer-motion';

const variants = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
  success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
  warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
  error: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  gradient: 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white',
  outline: 'border-2 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  glow: 'bg-primary-500 text-white shadow-lg shadow-primary-500/50',
};

const sizes = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  iconPosition = 'left',
  removable = false,
  onRemove,
  rounded = false,
  pulse = false,
  className = '',
}) => {
  const baseStyles = `
    inline-flex items-center gap-1
    font-medium
    ${rounded ? 'rounded-full' : 'rounded-lg'}
    ${sizes[size]}
    ${variants[variant]}
    ${className}
  `;

  return (
    <motion.span
      className={baseStyles}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      <span className="truncate">{children}</span>
      
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </motion.span>
  );
};

// Status Badge Component
export const StatusBadge = ({
  status,
  size = 'sm',
  className = '',
}) => {
  const statusConfig = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    verified: { variant: 'primary', label: 'Verified' },
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'success', label: 'Published' },
    archived: { variant: 'error', label: 'Archived' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge
      variant={config.variant}
      size={size}
      rounded
      className={className}
    >
      {config.label}
    </Badge>
  );
};

// Count Badge Component (for notifications, etc.)
export const CountBadge = ({
  count,
  max = 99,
  variant = 'error',
  size = 'xs',
  className = '',
}) => {
  const displayCount = count > max ? `${max}+` : count;

  if (count === 0) return null;

  return (
    <Badge
      variant={variant}
      size={size}
      rounded
      className={`min-w-[1.25rem] justify-center ${className}`}
    >
      {displayCount}
    </Badge>
  );
};

// Dot Badge Component
export const DotBadge = ({
  variant = 'error',
  size = 'md',
  className = '',
  children,
}) => {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  };

  return (
    <span className={`relative inline-flex items-center ${className}`}>
      {children}
      <span
        className={`
          absolute -top-0.5 -right-0.5
          ${dotSizes[size]}
          ${dotColors[variant]}
          rounded-full
          ring-2 ring-white dark:ring-gray-900
        `}
      />
    </span>
  );
};

// Tier Badge Component (for subscription tiers)
export const TierBadge = ({
  tier,
  size = 'sm',
  className = '',
}) => {
  const tierConfig = {
    free: { variant: 'default', label: 'Free', icon: null },
    pro: { variant: 'primary', label: 'Pro', icon: 'PRO' },
    enterprise: { variant: 'gradient', label: 'Enterprise', icon: 'ENT' },
  };

  const config = tierConfig[tier] || tierConfig.free;

  return (
    <Badge
      variant={config.variant}
      size={size}
      rounded
      className={`uppercase tracking-wider ${className}`}
    >
      {config.label}
    </Badge>
  );
};

// New Feature Badge
export const NewBadge = ({
  size = 'sm',
  className = '',
}) => {
  return (
    <Badge
      variant="gradient"
      size={size}
      rounded
      pulse
      className={`uppercase tracking-wider ${className}`}
    >
      New
    </Badge>
  );
};

export default Badge;