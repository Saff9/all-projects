import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, User, Image, Link as LinkIcon, Palette, Share2 } from 'lucide-react';

const ProfileCompletion = ({
  completionPercentage = 0,
  tasks = [],
  className = '',
}) => {
  const defaultTasks = [
    { id: 'profile', label: 'Add profile photo', completed: false, href: '/editor#profile' },
    { id: 'bio', label: 'Write a bio', completed: false, href: '/editor#bio' },
    { id: 'links', label: 'Add your first link', completed: false, href: '/editor#links' },
    { id: 'theme', label: 'Customize your theme', completed: false, href: '/editor#theme' },
    { id: 'share', label: 'Share your profile', completed: false, href: '/editor#share' },
  ];

  const displayTasks = tasks.length > 0 ? tasks : defaultTasks;
  const completedCount = displayTasks.filter(t => t.completed).length;
  const percentage = completionPercentage || Math.round((completedCount / displayTasks.length) * 100);

  const getProgressColor = () => {
    if (percentage < 30) return 'bg-error-500';
    if (percentage < 70) return 'bg-warning-500';
    return 'bg-success-500';
  };

  const getTaskIcon = (taskId) => {
    switch (taskId) {
      case 'profile':
        return <User className="w-4 h-4" />;
      case 'bio':
        return <User className="w-4 h-4" />;
      case 'links':
        return <LinkIcon className="w-4 h-4" />;
      case 'theme':
        return <Palette className="w-4 h-4" />;
      case 'share':
        return <Share2 className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white dark:bg-gray-900
        rounded-2xl p-6
        border border-gray-100 dark:border-gray-800
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Profile Completion
        </h3>
        <span className={`text-2xl font-bold ${
          percentage < 30 ? 'text-error-500' :
          percentage < 70 ? 'text-warning-500' :
          'text-success-500'
        }`}>
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getProgressColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {percentage === 100
            ? "🎉 Your profile is complete!"
            : `${displayTasks.length - completedCount} tasks remaining`
          }
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {displayTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={task.href}
              className={`
                flex items-center gap-3 p-3 rounded-xl
                transition-colors
                ${task.completed
                  ? 'bg-success-50 dark:bg-success-900/20'
                  : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {/* Status Icon */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${task.completed
                  ? 'bg-success-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              `}>
                {task.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  getTaskIcon(task.id)
                )}
              </div>

              {/* Task Label */}
              <span className={`
                flex-1 text-sm
                ${task.completed
                  ? 'text-success-700 dark:text-success-400 line-through'
                  : 'text-gray-700 dark:text-gray-300'
                }
              `}>
                {task.label}
              </span>

              {/* Arrow */}
              {!task.completed && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      {percentage < 100 && (
        <Link
          to="/editor"
          className="block mt-4 text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          Complete your profile →
        </Link>
      )}
    </motion.div>
  );
};

// Compact version for sidebar
export const CompactProfileCompletion = ({
  percentage = 0,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Profile
        </span>
        <span className={`text-sm font-bold ${
          percentage < 30 ? 'text-error-500' :
          percentage < 70 ? 'text-warning-500' :
          'text-success-500'
        }`}>
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            percentage < 30 ? 'bg-error-500' :
            percentage < 70 ? 'bg-warning-500' :
            'bg-success-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};

export default ProfileCompletion;