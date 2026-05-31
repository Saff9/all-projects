import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ExternalLink, 
  MoreVertical, 
  Eye, 
  MousePointer, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  GripVertical,
  Plus
} from 'lucide-react';
import { formatCompactNumber, formatRelativeTime } from '../../utils/helpers';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const RecentLinks = ({
  links = [],
  onEdit,
  onDelete,
  onToggle,
  loading = false,
  showAddButton = true,
  maxItems = 5,
  className = '',
}) => {
  const [menuOpen, setMenuOpen] = useState(null);

  const displayedLinks = links.slice(0, maxItems);

  const getLinkIcon = (url) => {
    try {
      const domain = new URL(url).hostname;
      if (domain.includes('youtube')) return '📺';
      if (domain.includes('twitter') || domain.includes('x.com')) return '🐦';
      if (domain.includes('instagram')) return '📷';
      if (domain.includes('linkedin')) return '💼';
      if (domain.includes('github')) return '🐙';
      if (domain.includes('tiktok')) return '🎵';
      if (domain.includes('facebook')) return '👤';
      return '🔗';
    } catch {
      return '🔗';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white dark:bg-gray-900
        rounded-2xl
        border border-gray-100 dark:border-gray-800
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Links
        </h3>
        <div className="flex items-center gap-2">
          {links.length > maxItems && (
            <Link
              to="/editor#links"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
            >
              View all ({links.length})
            </Link>
          )}
          {showAddButton && (
            <Link to="/editor#links">
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Links List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? (
          // Loading skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : displayedLinks.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              No links yet
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add your first link to get started
            </p>
            {showAddButton && (
              <Link to="/editor#links">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </Link>
            )}
          </div>
        ) : (
          // Links
          <AnimatePresence>
            {displayedLinks.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Drag Handle */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    {link.iconURL ? (
                      <img src={link.iconURL} alt="" className="w-6 h-6 rounded" />
                    ) : (
                      getLinkIcon(link.url)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {link.title}
                      </h4>
                      <Badge
                        variant={link.isActive ? 'success' : 'default'}
                        size="sm"
                      >
                        {link.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {link.url}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MousePointer className="w-4 h-4" />
                      <span>{formatCompactNumber(link.clickCount || 0)}</span>
                    </div>
                  </div>

                  {/* Actions Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === link.id ? null : link.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {menuOpen === link.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10"
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open Link
                          </a>
                          <button
                            onClick={() => {
                              onEdit?.(link);
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              onToggle?.(link);
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            {link.isActive ? (
                              <>
                                <ToggleRight className="w-4 h-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4" />
                                Activate
                              </>
                            )}
                          </button>
                          <hr className="my-1 border-gray-100 dark:border-gray-700" />
                          <button
                            onClick={() => {
                              onDelete?.(link);
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="flex items-center gap-4 mt-2 pl-16 sm:hidden text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <MousePointer className="w-3.5 h-3.5" />
                    <span>{formatCompactNumber(link.clickCount || 0)} clicks</span>
                  </div>
                  {link.updatedAt && (
                    <span>Updated {formatRelativeTime(link.updatedAt)}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {displayedLinks.length > 0 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <Link
            to="/editor#links"
            className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            Manage all links →
          </Link>
        </div>
      )}

      {/* Click outside to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setMenuOpen(null)}
        />
      )}
    </motion.div>
  );
};

// Compact version for sidebar
export const CompactRecentLinks = ({
  links = [],
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Recent Links
      </h4>
      <div className="space-y-2">
        {links.slice(0, 3).map((link) => (
          <Link
            key={link.id}
            to="/editor#links"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm">{getLinkIcon(link.url)}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
              {link.title}
            </span>
            <span className="text-xs text-gray-400">
              {formatCompactNumber(link.clickCount || 0)}
            </span>
          </Link>
        ))}
      </div>
      {links.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
          No links yet
        </p>
      )}
    </div>
  );
};

export default RecentLinks;