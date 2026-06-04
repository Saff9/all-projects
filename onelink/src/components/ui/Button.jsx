import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Button variants configuration
const variants = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400 dark:hover:text-gray-900',
  ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  danger: 'bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 text-white shadow-lg shadow-error-500/25',
  success: 'bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white shadow-lg shadow-success-500/25',
  gradient: 'bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-500 hover:from-primary-700 hover:via-secondary-600 hover:to-accent-600 text-white shadow-lg',
};

// Button sizes configuration
const sizes = {
  xs: 'px-2.5 py-1.5 text-xs rounded-md',
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-5 py-3 text-base rounded-xl',
  xl: 'px-6 py-3.5 text-base rounded-xl',
};

// Icon positions
const iconPositions = {
  left: 'flex-row',
  right: 'flex-row-reverse',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  as = 'button',
  ...props
}, ref) => {
  const Component = as === 'button' ? motion.button : motion[as] || motion.button;

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium tracking-wide
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${fullWidth ? 'w-full' : ''}
  `;

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: disabled ? 1 : 1.02 },
    tap: { scale: disabled ? 1 : 0.98 },
  };

  return (
    <Component
      ref={ref}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${icon ? iconPositions[iconPosition] : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      whileHover="hover"
      whileTap="tap"
      initial="initial"
      variants={buttonVariants}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children && <span className="truncate">{children}</span>}
    </Component>
  );
});

Button.displayName = 'Button';

// Icon Button variant
export const IconButton = forwardRef(({
  children,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const iconSizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      className={`${iconSizes[size]} !p-0 aspect-square ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

// Button Group component
export const ButtonGroup = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`inline-flex rounded-lg shadow-sm ${className}`}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
};

export default Button;