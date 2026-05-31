import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  MousePointer,
  GripVertical,
  MoreVertical,
  Copy,
} from 'lucide-react';
import { Badge, Dropdown } from '../ui';

const LinkPreview = ({
  link,
  onEdit,
  onDelete,
  onToggleActive,
  showStats = true,
  draggable = false,
  className = '',
}) => {
  const { id, title, url, isActive, clickCount, iconURL, description } = link;

  const menuItems = [
    {
      label: 'Edit',
      icon: <Edit3 className="w-4 h-4" />,
      onClick: () => onEdit?.(link),
    },
    {
      label: 'Copy URL',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => navigator.clipboard.writeText(url),
    },
    {
      label: isActive ? 'Disable' : 'Enable',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onToggleActive?.(link),
    },
    { divider: true },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => onDelete?.(link),
    },
  ];

  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-900
        rounded-xl border border-gray-100 dark:border-gray-800
        p-4
        group
        ${!isActive ? 'opacity-60' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      layout
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {draggable && (
          <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pt-1">
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {iconURL ? (
            <img src={iconURL} alt={title} className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-lg font-semibold text-gray-400">
              {title?.charAt(0)?.toUpperCase() || 'L'}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
              {title}
            </h4>
            {!isActive && (
              <Badge variant="default" size="xs">
                Disabled
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
            {url}
          </p>

          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2">
              {description}
            </p>
          )}

          {/* Stats */}
          {showStats && (
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MousePointer className="w-3.5 h-3.5" />
                <span>{clickCount || 0} clicks</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            title="Open link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <Dropdown
            trigger={
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            }
            items={menuItems}
            align="right"
          />
        </div>
      </div>
    </motion.div>
  );
};

// Link Preview List
export const LinkPreviewList = ({
  links = [],
  onEdit,
  onDelete,
  onToggleActive,
  onReorder,
  showStats = true,
  draggable = false,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {links.map((link, index) => (
        <LinkPreview
          key={link.id}
          link={link}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          showStats={showStats}
          draggable={draggable}
        />
      ))}
    </div>
  );
};

// Compact Link Preview
export const CompactLinkPreview = ({
  link,
  onClick,
  className = '',
}) => {
  const { title, url, isActive, clickCount, iconURL } = link;

  return (
    <motion.div
      className={`
        flex items-center gap-3 p-3
        bg-white dark:bg-gray-900
        rounded-lg border border-gray-100 dark:border-gray-800
        hover:border-gray-200 dark:hover:border-gray-700
        transition-colors cursor-pointer
        ${!isActive ? 'opacity-60' : ''}
        ${className}
      `}
      onClick={() => onClick?.(link)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        {iconURL ? (
          <img src={iconURL} alt={title} className="w-4 h-4 object-contain" />
        ) : (
          <span className="text-sm font-medium text-gray-400">
            {title?.charAt(0)?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {title}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <MousePointer className="w-3 h-3" />
        <span>{clickCount || 0}</span>
      </div>
    </motion.div>
  );
};

// Link Preview Card (for dashboard overview)
export const LinkPreviewCard = ({
  links = [],
  maxLinks = 3,
  className = '',
}) => {
  const displayLinks = links.slice(0, maxLinks);
  const remainingCount = links.length - maxLinks;

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Your Links
        </h3>
        <Link
          to="/editor/links"
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
        >
          Manage
        </Link>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            No links yet
          </p>
          <Link
            to="/editor/links"
            className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
          >
            Add your first link
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {displayLinks.map((link) => (
              <CompactLinkPreview key={link.id} link={link} />
            ))}
          </div>

          {remainingCount > 0 && (
            <Link
              to="/editor/links"
              className="block text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800"
            >
              +{remainingCount} more links
            </Link>
          )}
        </>
      )}
    </div>
  );
};

export default LinkPreview;