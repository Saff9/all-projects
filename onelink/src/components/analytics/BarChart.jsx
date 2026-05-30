import { motion } from 'framer-motion';

const BarChart = ({
  data = [],
  title,
  height = 200,
  horizontal = false,
  showValues = true,
  color = 'primary',
  className = '',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const colors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    gradient: 'bg-gradient-to-t from-primary-500 to-secondary-500',
  };

  const barColor = colors[color] || colors.primary;

  if (horizontal) {
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

        <div className="space-y-3">
          {data.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="w-20 text-sm text-gray-600 dark:text-gray-400 truncate">
                {item.label}
              </span>
              <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <motion.div
                  className={`h-full ${barColor} rounded-lg`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
              </div>
              {showValues && (
                <span className="w-12 text-sm font-medium text-gray-900 dark:text-white text-right">
                  {item.value}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

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

      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((item, index) => (
          <motion.div
            key={item.label}
            className="flex-1 flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {showValues && (
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {item.value}
              </span>
            )}
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden flex-1 flex items-end">
              <motion.div
                className={`w-full ${barColor} rounded-t-lg`}
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Grouped Bar Chart
export const GroupedBarChart = ({
  data = [],
  groups = [],
  height = 200,
  className = '',
}) => {
  const maxValue = Math.max(...data.flatMap((d) => groups.map((g) => d[g.key] || 0)), 1);

  const groupColors = {
    0: 'bg-primary-500',
    1: 'bg-secondary-500',
    2: 'bg-accent-500',
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-end justify-between gap-4" style={{ height }}>
        {data.map((item, index) => (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex gap-1 flex-1 items-end">
              {groups.map((group, groupIndex) => (
                <motion.div
                  key={group.key}
                  className={`flex-1 ${groupColors[groupIndex] || groupColors[0]} rounded-t-lg`}
                  initial={{ height: 0 }}
                  animate={{ height: `${((item[group.key] || 0) / maxValue) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {groups.map((group, index) => (
          <div key={group.key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${groupColors[index] || groupColors[0]}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {group.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Progress Bar Chart
export const ProgressBarChart = ({
  data = [],
  className = '',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={`space-y-4 ${className}`}>
      {data.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {item.value} ({Math.round((item.value / maxValue) * 100)}%)
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Circular Progress Chart
export const CircularProgressChart = ({
  data = [],
  size = 120,
  strokeWidth = 12,
  className = '',
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  let accumulatedOffset = 0;

  const colors = [
    '#3b82f6', // primary
    '#6366f1', // secondary
    '#f97316', // accent
    '#22c55e', // success
    '#f59e0b', // warning
    '#ef4444', // error
  ];

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-gray-800"
          />

          {/* Data segments */}
          {data.map((item, index) => {
            const percentage = item.value / total;
            const strokeDashoffset = circumference * (1 - percentage);
            const strokeDasharray = circumference;
            const offset = accumulatedOffset;
            accumulatedOffset += circumference * percentage;

            return (
              <motion.circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={colors[index % colors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: offset - circumference + circumference * percentage,
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  strokeDashoffset: circumference - accumulatedOffset + circumference * percentage,
                }}
              />
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {total}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.label}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;