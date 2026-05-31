import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  change,
  changeType = 'increase',
  icon,
  iconColor = 'primary',
  subtitle,
  onClick,
  className = '',
}) => {
  const iconColors = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    secondary: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400',
    success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
    error: 'bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400',
    accent: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
  };

  const changeColors = {
    increase: 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20',
    decrease: 'text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-900/20',
    neutral: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800',
  };

  const ChangeIcon = changeType === 'increase' ? TrendingUp : changeType === 'decrease' ? TrendingDown : Minus;

  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-900
        rounded-2xl p-6
        border border-gray-100 dark:border-gray-800
        shadow-sm
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        transition-all duration-200
        ${className}
      `}
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`
                  inline-flex items-center gap-1
                  px-2 py-0.5 rounded-full
                  text-xs font-medium
                  ${changeColors[changeType]}
                `}
              >
                <ChangeIcon className="w-3 h-3" />
                {change}
              </span>
              {subtitle && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-xl ${iconColors[iconColor]}`}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Mini Stats Card
export const MiniStatsCard = ({
  title,
  value,
  icon,
  className = '',
}) => {
  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-900
        rounded-xl p-4
        border border-gray-100 dark:border-gray-800
        flex items-center gap-3
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {icon && (
        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
};

// Stats Card Grid
export const StatsCardGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Animated Stats Card
export const AnimatedStatsCard = ({
  title,
  value,
  icon,
  delay = 0,
  className = '',
}) => {
  return (
    <motion.div
      className={`
        bg-gradient-to-br from-primary-500 to-secondary-500
        rounded-2xl p-6
        text-white
        shadow-lg shadow-primary-500/25
        ${className}
      `}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-white/20">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Comparison Stats Card
export const ComparisonStatsCard = ({
  title,
  currentValue,
  previousValue,
  icon,
  formatValue = (v) => v,
  className = '',
}) => {
  const change = currentValue - previousValue;
  const changePercent = previousValue > 0 ? ((change / previousValue) * 100).toFixed(1) : 0;
  const changeType = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral';

  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-900
        rounded-2xl p-6
        border border-gray-100 dark:border-gray-800
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {icon && (
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatValue(currentValue)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            vs {formatValue(previousValue)} last period
          </p>
        </div>
        
        <div
          className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${changeType === 'increase' ? 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400' : ''}
            ${changeType === 'decrease' ? 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400' : ''}
            ${changeType === 'neutral' ? 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''}
          `}
        >
          {change > 0 ? '+' : ''}{changePercent}%
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;