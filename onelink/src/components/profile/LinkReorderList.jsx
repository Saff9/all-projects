import { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  MoreVertical,
} from 'lucide-react';
import { Badge, Dropdown } from '../ui';

const LinkReorderList = ({
  links = [],
  onReorder,
  onEdit,
  onDelete,
  onToggleActive,
  className = '',
}) => {
  const [items, setItems] = useState(links);

  const handleReorder = (newOrder) => {
    setItems(newOrder);
    onReorder?.(newOrder);
  };

  return (
    <div className={className}>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="space-y-2"
      >
        <AnimatePresence>
          {items.map((link) => (
            <Reorder.Item
              key={link.id}
              value={link}
              className="list-none"
            >
              <motion.div
                className={`
                  bg-white dark:bg-gray-900
                  rounded-xl border border-gray-100 dark:border-gray-800
                  p-4
                  flex items-center gap-3
                  cursor-grab active:cursor-grabbing
                  ${!link.isActive ? 'opacity-60' : ''}
                `}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                whileHover={{ scale: 1.01 }}
                layout
              >
                {/* Drag Handle */}
                <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Order Number */}
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  {items.findIndex((l) => l.id === link.id) + 1}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {link.iconURL ? (
                    <img src={link.iconURL} alt={link.title} className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-400">
                      {link.title?.charAt(0)?.toUpperCase() || 'L'}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {link.title}
                    </p>
                    {!link.isActive && (
                      <Badge variant="default" size="xs">Hidden</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {link.url}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleActive?.(link)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title={link.isActive ? 'Hide link' : 'Show link'}
                  >
                    {link.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => onEdit?.(link)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="Edit link"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete?.(link)}
                    className="p-2 rounded-lg hover:bg-error-50 dark:hover:bg-error-900/20 text-gray-500 hover:text-error-600 dark:hover:text-error-400 transition-colors"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No links yet. Add your first link to get started.
          </p>
        </div>
      )}
    </div>
  );
};

// Simple Reorder List (without drag handle)
export const SimpleReorderList = ({
  items = [],
  onReorder,
  renderItem,
  className = '',
}) => {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className={`space-y-2 ${className}`}
    >
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          className="list-none"
        >
          {renderItem?.(item)}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
};

// Drag Handle Component
export const DragHandle = ({ className = '' }) => {
  return (
    <div className={`cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ${className}`}>
      <GripVertical className="w-5 h-5" />
    </div>
  );
};

export default LinkReorderList;