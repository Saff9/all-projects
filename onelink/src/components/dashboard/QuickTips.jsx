import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lightbulb, ChevronRight, X, ExternalLink, ArrowRight } from 'lucide-react';

const QuickTips = ({
  tips = [],
  dismissible = true,
  showAll = false,
  className = '',
}) => {
  const [dismissedTips, setDismissedTips] = useState([]);
  const [expanded, setExpanded] = useState(showAll);

  const defaultTips = [
    {
      id: 'add-links',
      title: 'Add your links',
      description: 'Start by adding your most important links - your website, social media, or portfolio.',
      href: '/editor#links',
      icon: '🔗',
    },
    {
      id: 'customize-theme',
      title: 'Customize your theme',
      description: 'Make your profile stand out with custom colors, fonts, and animated backgrounds.',
      href: '/editor#theme',
      icon: '🎨',
    },
    {
      id: 'add-bio',
      title: 'Write a compelling bio',
      description: 'Tell visitors who you are and what you do in a few sentences.',
      href: '/editor#bio',
      icon: '✍️',
    },
    {
      id: 'share-profile',
      title: 'Share your profile',
      description: 'Add your OneLink URL to your social media bios to drive traffic.',
      href: '/editor#share',
      icon: '📢',
    },
    {
      id: 'track-analytics',
      title: 'Track your analytics',
      description: 'See how many people are viewing and clicking your links.',
      href: '/analytics',
      icon: '📊',
    },
    {
      id: 'qr-code',
      title: 'Use QR codes',
      description: 'Download your QR code to share your profile on printed materials.',
      href: '/editor#qr',
      icon: '📱',
    },
  ];

  const displayTips = tips.length > 0 ? tips : defaultTips;
  const visibleTips = displayTips.filter(tip => !dismissedTips.includes(tip.id));
  const shownTips = expanded ? visibleTips : visibleTips.slice(0, 3);

  const dismissTip = (tipId) => {
    setDismissedTips(prev => [...prev, tipId]);
  };

  if (visibleTips.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-gradient-to-br from-primary-50 to-secondary-50
        dark:from-gray-800 dark:to-gray-900
        rounded-2xl p-6
        border border-primary-100 dark:border-gray-700
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Tips
          </h3>
        </div>
        {visibleTips.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            {expanded ? 'Show less' : `Show all (${visibleTips.length})`}
          </button>
        )}
      </div>

      {/* Tips List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {shownTips.map((tip, index) => (
            <motion.div
              key={tip.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <Link
                to={tip.href}
                className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all"
              >
                {/* Icon */}
                <span className="text-2xl flex-shrink-0">{tip.icon}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {tip.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {tip.description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />

                {/* Dismiss Button */}
                {dismissible && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      dismissTip(tip.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div className="mt-4 pt-4 border-t border-primary-100 dark:border-gray-700">
        <a
          href="https://help.onelink.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
        >
          View all guides and tutorials
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};

// Single tip card for inline display
export const TipCard = ({
  icon,
  title,
  description,
  href,
  onDismiss,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-center gap-4 p-4
        bg-primary-50 dark:bg-primary-900/20
        border border-primary-100 dark:border-primary-800
        rounded-xl
        ${className}
      `}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <Link
        to={href}
        className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700"
      >
        Learn more
        <ArrowRight className="w-4 h-4" />
      </Link>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

export default QuickTips;