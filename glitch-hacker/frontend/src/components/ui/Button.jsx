import { motion } from 'framer-motion';

const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'relative font-mono font-semibold uppercase tracking-wider transition-all duration-200 overflow-hidden';
  
  const variants = {
    primary: 'bg-surface border-2 border-primary text-primary hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] hover:shadow-primary-glow',
    danger: 'bg-surface border-2 border-alert text-alert hover:shadow-[0_0_20px_rgba(255,51,51,0.5)] hover:shadow-alert-glow',
    ghost: 'bg-transparent border-2 border-primary/50 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl',
  };

  const disabledStyles = disabled || loading
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer active:scale-95';

  const glitchVariants = {
    initial: { x: 0 },
    hover: {
      x: [0, -2, 2, -2, 0],
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? "hover" : undefined}
      initial="initial"
      variants={glitchVariants}
      {...props}
    >
      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {children}
      </span>
      
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-current" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-current" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-current" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-current" />
    </motion.button>
  );
};

export default Button;
