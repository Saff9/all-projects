import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatDisplay = ({ 
  label, 
  value, 
  icon: Icon, 
  trend = null, 
  suffix = '',
  prefix = '',
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: {
      container: 'p-2',
      icon: 'w-4 h-4',
      label: 'text-[10px]',
      value: 'text-sm',
    },
    md: {
      container: 'p-3',
      icon: 'w-5 h-5',
      label: 'text-xs',
      value: 'text-lg',
    },
    lg: {
      container: 'p-4',
      icon: 'w-6 h-6',
      label: 'text-sm',
      value: 'text-2xl',
    },
    xl: {
      container: 'p-5',
      icon: 'w-8 h-8',
      label: 'text-base',
      value: 'text-4xl',
    },
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };

  const trendColors = {
    up: 'text-primary',
    down: 'text-alert',
    neutral: 'text-primary/50',
  };

  const TrendIcon = trend ? trendIcons[trend] : null;
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <motion.div
      className={`bg-surface border border-primary/20 rounded-lg ${sizes[size].container} ${className}`}
      whileHover={{ borderColor: 'rgba(0, 255, 65, 0.5)', scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Icon and Label */}
        <div className="flex items-center gap-2">
          {Icon && (
            <motion.div
              className={`${sizes[size].icon} text-primary/70`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-full h-full" />
            </motion.div>
          )}
          <span className={`${sizes[size].label} font-mono text-primary/50 uppercase tracking-wider`}>
            {label}
          </span>
        </div>
        
        {/* Right side - Trend indicator */}
        {TrendIcon && (
          <motion.div
            className={`${trendColors[trend]}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <TrendIcon className="w-4 h-4" />
          </motion.div>
        )}
      </div>
      
      {/* Value display */}
      <div className="mt-2">
        <AnimatePresence mode="wait">
          <motion.span
            key={value}
            className={`${sizes[size].value} font-mono font-bold text-primary block`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {prefix}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {displayValue}
            </motion.span>
            {suffix && (
              <span className="text-primary/60 text-sm ml-1">{suffix}</span>
            )}
          </motion.span>
        </AnimatePresence>
      </div>
      
      {/* Decorative corner */}
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/30" />
    </motion.div>
  );
};

export default StatDisplay;
