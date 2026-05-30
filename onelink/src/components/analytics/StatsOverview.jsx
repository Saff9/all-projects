import { motion } from 'framer-motion';
import {
  Eye,
  MousePointer,
  TrendingUp,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';

const StatsOverview = ({
  stats = {},
  className = '',
}) => {
  const {
    totalViews,
    totalClicks,
    uniqueVisitors,
    avgClickRate,
    viewsChange,
    clicksChange,
  } = stats;

  const mainStats = [
    {
      label: 'Total Views',
      value: totalViews || 0,
      change: viewsChange,
      icon: Eye,
      color: 'primary',
    },
    {
      label: 'Total Clicks',
      value: totalClicks || 0,
      change: clicksChange,
      icon: MousePointer,
      color: 'success',
    },
    {
      label: 'Unique Visitors',
      value: uniqueVisitors || 0,
      icon: Users,
      color: 'secondary',
    },
    {
      label: 'Click Rate',
      value: avgClickRate ? `${avgClickRate}%` : '0%',
      icon: TrendingUp,
      color: 'accent',
    },
  ];

  const iconColors = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
    secondary: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400',
    success: 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400',
    accent: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400',
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                  {stat.change !== undefined && (
                    <p
                      className={`text-sm mt-1 ${
                        stat.change >= 0 ? 'text-success-500' : 'text-error-500'
                      }`}
                    >
                      {stat.change >= 0 ? '+' : ''}{stat.change}% vs last period
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${iconColors[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Device Breakdown Component
export const DeviceBreakdown = ({
  data = {},
  className = '',
}) => {
  const { mobile = 0, desktop = 0, tablet = 0 } = data;
  const total = mobile + desktop + tablet || 1;

  const devices = [
    { name: 'Desktop', value: desktop, icon: Monitor, color: 'bg-primary-500' },
    { name: 'Mobile', value: mobile, icon: Smartphone, color: 'bg-success-500' },
    { name: 'Tablet', value: tablet, icon: Tablet, color: 'bg-secondary-500' },
  ];

  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Device Breakdown
      </h3>

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        {devices.map((device) => {
          const Icon = device.icon;
          const percentage = Math.round((device.value / total) * 100);
          return (
            <div key={device.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {device.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${device.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        {devices.map((device) => (
          <div key={device.name} className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {device.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {device.name}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Geographic Breakdown
export const GeographicBreakdown = ({
  data = [],
  maxItems = 5,
  className = '',
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Top Locations
        </h3>
        <Globe className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {data.slice(0, maxItems).map((item, index) => {
          const percentage = Math.round((item.value / total) * 100);
          return (
            <motion.div
              key={item.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="w-6 text-sm text-gray-500 dark:text-gray-400">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.value} ({percentage}%)
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Quick Stats Row
export const QuickStatsRow = ({
  stats = [],
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className={`p-2 rounded-lg ${stat.color || 'bg-gray-100 dark:bg-gray-800'}`}>
            <stat.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;