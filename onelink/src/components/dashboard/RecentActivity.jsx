import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Eye,
  MousePointer,
  Clock,
  ArrowRight,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { Avatar } from '../ui';

const RecentActivity = ({
  activities = [],
  maxItems = 5,
  showViewAll = true,
  className = '',
}) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'click':
        return <MousePointer className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'view':
        return 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400';
      case 'click':
        return 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
        {showViewAll && (
          <Link
            to="/analytics"
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No recent activity
            </p>
          </div>
        ) : (
          activities.slice(0, maxItems).map((activity, index) => (
            <motion.div
              key={activity.id || index}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(
                  activity.type
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.description || formatTime(activity.timestamp)}
                </p>
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {formatTime(activity.timestamp)}
              </span>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// Activity Timeline Component
export const ActivityTimeline = ({
  activities = [],
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Timeline Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      {/* Timeline Items */}
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id || index}
            className="relative flex gap-4 pl-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Dot */}
            <div
              className={`absolute left-2.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-gray-900 ${
                activity.type === 'click'
                  ? 'bg-success-500'
                  : activity.type === 'view'
                    ? 'bg-primary-500'
                    : 'bg-gray-400'
              }`}
            />

            {/* Content */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.title}
              </p>
              {activity.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Activity Stats Summary
export const ActivitySummary = ({
  stats = {},
  className = '',
}) => {
  const { totalViews, totalClicks, avgTimeOnPage, bounceRate } = stats;

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-primary-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Views</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {totalViews || 0}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <MousePointer className="w-4 h-4 text-success-500" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Clicks</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {totalClicks || 0}
        </p>
      </div>
    </div>
  );
};

export default RecentActivity;