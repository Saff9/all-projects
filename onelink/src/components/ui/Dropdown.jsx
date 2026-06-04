import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const Dropdown = ({
  trigger,
  items = [],
  align = 'left',
  width = 'auto',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  const handleEscape = useCallback((event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClickOutside, handleEscape]);

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  const widths = {
    auto: 'min-w-[10rem]',
    sm: 'w-32',
    md: 'w-48',
    lg: 'w-64',
    full: 'w-full',
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`
              absolute z-50 mt-2
              ${alignments[align]}
              ${widths[width]}
              py-1
              bg-white dark:bg-gray-900
              rounded-xl shadow-lg
              border border-gray-100 dark:border-gray-800
              focus:outline-none
            `}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15 }}
            role="menu"
            aria-orientation="vertical"
          >
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <div
                    key={index}
                    className="my-1 border-t border-gray-100 dark:border-gray-800"
                  />
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={`
                    w-full px-4 py-2
                    flex items-center gap-3
                    text-left text-sm
                    transition-colors duration-150
                    ${item.disabled
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                    ${item.active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''}
                  `}
                  role="menuitem"
                >
                  {item.icon && (
                    <span className="flex-shrink-0 opacity-70">{item.icon}</span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.active && (
                    <Check className="w-4 h-4 text-primary-500" />
                  )}
                  {item.shortcut && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Dropdown Select Component
export const DropdownSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  searchable = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5
          flex items-center justify-between
          bg-white dark:bg-gray-900
          border-2 rounded-xl
          text-left text-sm
          transition-all duration-200
          ${error
            ? 'border-error-500 dark:border-error-400'
            : isOpen
              ? 'border-primary-500 dark:border-primary-400 ring-4 ring-primary-500/10'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-50 w-full mt-2 py-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 max-h-60 overflow-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            role="listbox"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`
                    w-full px-4 py-2
                    flex items-center gap-2
                    text-left text-sm
                    transition-colors duration-150
                    ${option.value === value
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.icon && (
                    <span className="flex-shrink-0">{option.icon}</span>
                  )}
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-primary-500" />
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1.5 text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      )}
    </div>
  );
};

// User Dropdown Component
export const UserDropdown = ({
  user,
  items = [],
  align = 'right',
  className = '',
}) => {
  const defaultItems = [
    { label: 'Your Profile', icon: null, onClick: () => {} },
    { label: 'Settings', icon: null, onClick: () => {} },
    { divider: true },
    { label: 'Sign out', icon: null, onClick: () => {} },
  ];

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      }
      items={items.length > 0 ? items : defaultItems}
      align={align}
      className={className}
    />
  );
};

export default Dropdown;