import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const LineChart = ({
  data = [],
  title,
  value,
  change,
  changeType = 'increase',
  color = 'primary',
  height = 200,
  showGrid = true,
  className = '',
}) => {
  // Calculate chart dimensions
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  // Generate path for the line
  const generatePath = () => {
    if (data.length === 0) return '';
    
    const width = 100;
    const chartHeight = 80;
    const padding = 5;
    
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = chartHeight - padding - ((point.value - minValue) / range) * (chartHeight - padding * 2);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate area path
  const generateAreaPath = () => {
    if (data.length === 0) return '';
    
    const width = 100;
    const chartHeight = 80;
    const padding = 5;
    
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = chartHeight - padding - ((point.value - minValue) / range) * (chartHeight - padding * 2);
      return `${x},${y}`;
    });
    
    const firstX = padding;
    const lastX = width - padding;
    const bottomY = chartHeight - padding;
    
    return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
  };

  const colors = {
    primary: { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.1)' },
    secondary: { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.1)' },
    success: { stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.1)' },
    warning: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)' },
    error: { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.1)' },
  };

  const chartColor = colors[color] || colors.primary;

  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4 text-success-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-error-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-success-500' : 'text-error-500'
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid Lines */}
          {showGrid && (
            <g className="text-gray-100 dark:text-gray-800">
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y * 0.8}
                  x2="100"
                  y2={y * 0.8}
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              ))}
            </g>
          )}

          {/* Area */}
          <motion.path
            d={generateAreaPath()}
            fill={chartColor.fill}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Line */}
          <motion.path
            d={generatePath()}
            fill="none"
            stroke={chartColor.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Data Points */}
          {data.map((point, index) => {
            const x = 5 + (index / (data.length - 1)) * 90;
            const y = 80 - 5 - ((point.value - minValue) / range) * 70;
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={chartColor.stroke}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
              />
            );
          })}
        </svg>

        {/* X-axis Labels */}
        {data.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 dark:text-gray-500 transform translate-y-5">
            {data.slice(0, Math.min(5, data.length)).map((point, index) => (
              <span key={index}>{point.label}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Simple Sparkline Component
export const Sparkline = ({
  data = [],
  color = 'primary',
  width = 100,
  height = 30,
  className = '',
}) => {
  const maxValue = Math.max(...data, 1);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  const generatePath = () => {
    if (data.length === 0) return '';
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const strokeColors = {
    primary: '#3b82f6',
    secondary: '#6366f1',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <motion.path
        d={generatePath()}
        fill="none"
        stroke={strokeColors[color] || strokeColors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
    </svg>
  );
};

// Area Chart Component
export const AreaChart = ({
  data = [],
  title,
  color = 'primary',
  height = 200,
  className = '',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  const generateAreaPath = () => {
    if (data.length === 0) return '';
    
    const width = 100;
    const chartHeight = 80;
    const padding = 5;
    
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = chartHeight - padding - ((point.value - minValue) / range) * (chartHeight - padding * 2);
      return `${x},${y}`;
    });
    
    return `M ${padding},${chartHeight - padding} L ${points.join(' L ')} L ${width - padding},${chartHeight - padding} Z`;
  };

  const colors = {
    primary: { fill: 'url(#primaryGradient)', stroke: '#3b82f6' },
    secondary: { fill: 'url(#secondaryGradient)', stroke: '#6366f1' },
    success: { fill: 'url(#successGradient)', stroke: '#22c55e' },
  };

  const chartColor = colors[color] || colors.primary;

  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {title && (
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          {title}
        </h3>
      )}

      <div style={{ height }}>
        <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(14, 165, 233, 0.3)" />
              <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
            </linearGradient>
            <linearGradient id="secondaryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(217, 70, 239, 0.3)" />
              <stop offset="100%" stopColor="rgba(217, 70, 239, 0)" />
            </linearGradient>
            <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0)" />
            </linearGradient>
          </defs>

          <motion.path
            d={generateAreaPath()}
            fill={chartColor.fill}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export default LineChart;