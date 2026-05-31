import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit3,
  Palette,
  BarChart3,
  QrCode,
  Share2,
  Settings,
  ExternalLink,
} from 'lucide-react';

const QuickActions = ({ className = '' }) => {
  const actions = [
    {
      label: 'Add Link',
      description: 'Add a new link to your profile',
      icon: Plus,
      href: '/editor/links',
      color: 'bg-primary-500 hover:bg-primary-600',
    },
    {
      label: 'Edit Profile',
      description: 'Update your profile details',
      icon: Edit3,
      href: '/editor',
      color: 'bg-secondary-500 hover:bg-secondary-600',
    },
    {
      label: 'Change Theme',
      description: 'Customize your profile look',
      icon: Palette,
      href: '/editor/theme',
      color: 'bg-accent-500 hover:bg-accent-600',
    },
    {
      label: 'View Analytics',
      description: 'Check your profile stats',
      icon: BarChart3,
      href: '/analytics',
      color: 'bg-success-500 hover:bg-success-600',
    },
  ];

  const secondaryActions = [
    { label: 'QR Code', icon: QrCode, href: '/editor/qr' },
    { label: 'Share', icon: Share2, href: '/editor/share' },
    { label: 'Settings', icon: Settings, href: '/settings' },
    { label: 'View Live', icon: ExternalLink, href: '/preview', external: true },
  ];

  return (
    <div className={className}>
      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={action.href}
                className={`
                  block p-4 rounded-xl
                  ${action.color}
                  text-white
                  transition-all duration-200
                  group
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-xs text-white/80 mt-0.5 truncate">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        {secondaryActions.map((action) => {
          const Icon = action.icon;
          return action.external ? (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary-500">
                {action.label}
              </span>
            </a>
          ) : (
            <Link
              key={action.label}
              to={action.href}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-primary-500">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// Quick Actions Panel (for sidebar)
export const QuickActionsPanel = ({ className = '' }) => {
  const actions = [
    { label: 'Add Link', icon: Plus, href: '/editor/links', color: 'text-primary-500' },
    { label: 'Edit Profile', icon: Edit3, href: '/editor', color: 'text-secondary-500' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics', color: 'text-success-500' },
    { label: 'Settings', icon: Settings, href: '/settings', color: 'text-gray-500' },
  ];

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Quick Actions
      </h3>
      <div className="space-y-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <Icon className={`w-4 h-4 ${action.color}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// Floating Action Button
export const FloatingActionButton = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: 'Add Link', icon: Plus, href: '/editor/links' },
    { label: 'Edit Profile', icon: Edit3, href: '/editor' },
    { label: 'View Analytics', icon: BarChart3, href: '/analytics' },
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <motion.div className="relative">
        {/* Action Items */}
        <motion.div
          className="absolute bottom-16 right-0 flex flex-col gap-2 items-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={action.href}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {action.label}
                  </span>
                  <Icon className="w-4 h-4 text-primary-500" />
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Button */}
        <motion.button
          className="w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default QuickActions;