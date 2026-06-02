import { motion } from 'framer-motion';
import { Eye, MousePointer, Link as LinkIcon, TrendingUp } from 'lucide-react';

// Helper function to format numbers compactly
const formatCompactNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

/**
 * ProfileStats Component
 * Displays public statistics for a profile
 * 
 * @param {object} stats - Stats object containing totalViews, totalClicks, linkCount
 * @param {boolean} showTrend - Show trend indicator
 * @param {string} variant - Display variant: 'default', 'compact', 'cards'
 * @param {string} className - Additional CSS classes
 */
const ProfileStats = ({
  stats = {},
  showTrend = false,
  variant = 'default',
  className = '',
}) => {
  const { totalViews = 0, totalClicks = 0, linkCount = 0 } = stats;

  const statsItems = [
    {
      label: 'Views',
      value: totalViews,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Clicks',
      value: totalClicks,
      icon: MousePointer,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Links',
      value: linkCount,
      icon: LinkIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  // Default variant - horizontal layout
  if (variant === 'default') {
    return (
      <motion.div
        className={`flex items-center justify-center gap-6 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {statsItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCompactNumber(stat.value)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Compact variant - inline layout
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-4 text-sm ${className}`}>
        {statsItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center gap-1.5">
              <Icon className={`w-4 h-4 ${stat.color}`} />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatCompactNumber(stat.value)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Cards variant - card layout
  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-3 gap-3 ${className}`}>
        {statsItems.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className={`
                p-4 rounded-xl
                bg-white dark:bg-gray-800
                border border-gray-100 dark:border-gray-700
                shadow-sm
                text-center
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCompactNumber(stat.value)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {stat.label}
              </p>
              {showTrend && (
                <div className="flex items-center justify-center gap-0.5 mt-1 text-green-500 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>12%</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  return null;
};

/**
 * ProfileStatsInline Component
 * Inline stats display for compact views
 */
export const ProfileStatsInline = ({ stats = {}, className = '' }) => {
  const { totalViews = 0, totalClicks = 0 } = stats;

  return (
    <div className={`flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      <span className="flex items-center gap-1">
        <Eye className="w-4 h-4" />
        {formatCompactNumber(totalViews)}
      </span>
      <span className="text-gray-300 dark:text-gray-600">·</span>
      <span className="flex items-center gap-1">
        <MousePointer className="w-4 h-4" />
        {formatCompactNumber(totalClicks)}
      </span>
    </div>
  );
};

/**
 * ProfileStatsDetailed Component
 * Detailed stats with percentages and comparisons
 */
export const ProfileStatsDetailed = ({
  stats = {},
  previousStats = {},
  className = '',
}) => {
  const { totalViews = 0, totalClicks = 0, linkCount = 0 } = stats;
  const { totalViews: prevViews = 0, totalClicks: prevClicks = 0 } = previousStats;

  const calculateChange = (current, previous) => {
    if (previous === 0) return { value: 0, positive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change).toFixed(1), positive: change >= 0 };
  };

  const viewsChange = calculateChange(totalViews, prevViews);
  const clicksChange = calculateChange(totalClicks, prevClicks);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Views */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCompactNumber(totalViews)}
            </p>
          </div>
        </div>
        {viewsChange.value > 0 && (
          <div className={`flex items-center gap-1 text-sm ${viewsChange.positive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`w-4 h-4 ${!viewsChange.positive && 'rotate-180'}`} />
            <span>{viewsChange.value}%</span>
          </div>
        )}
      </div>

      {/* Clicks */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <MousePointer className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Clicks</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCompactNumber(totalClicks)}
            </p>
          </div>
        </div>
        {clicksChange.value > 0 && (
          <div className={`flex items-center gap-1 text-sm ${clicksChange.positive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className={`w-4 h-4 ${!clicksChange.positive && 'rotate-180'}`} />
            <span>{clicksChange.value}%</span>
          </div>
        )}
      </div>

      {/* Click Rate */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Click Rate</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: totalViews > 0 ? `${(totalClicks / totalViews) * 100}%` : 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Links Count */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <LinkIcon className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Active Links</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{linkCount}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;