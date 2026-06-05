import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeout;

  const handleMouseEnter = () => {
    timeout = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  const positions = {
    top: {
      container: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      arrow: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700',
    },
    bottom: {
      container: 'top-full left-1/2 -translate-x-1/2 mt-2',
      arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700',
    },
    left: {
      container: 'right-full top-1/2 -translate-y-1/2 mr-2',
      arrow: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700',
    },
    right: {
      container: 'left-full top-1/2 -translate-y-1/2 ml-2',
      arrow: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700',
    },
  };

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            className={`
              absolute z-50
              ${positions[position].container}
              px-3 py-1.5
              bg-gray-900 dark:bg-gray-700
              text-white text-sm
              rounded-lg shadow-lg
              whitespace-nowrap
              pointer-events-none
            `}
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.15 }}
            role="tooltip"
          >
            {content}
            <div
              className={`
                absolute w-0 h-0
                border-4 border-transparent
                ${positions[position].arrow}
              `}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Interactive Tooltip (Click to toggle)
export const InteractiveTooltip = ({
  children,
  content,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div onClick={() => setIsVisible(!isVisible)}>
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`
              absolute z-50
              ${positions[position]}
              px-4 py-3
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white text-sm
              rounded-xl shadow-xl
              border border-gray-100 dark:border-gray-700
              min-w-[200px] max-w-[300px]
            `}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Help Tooltip with Icon
export const HelpTooltip = ({
  content,
  size = 'sm',
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <Tooltip content={content} className={className}>
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Help"
      >
        <svg
          className={sizes[size]}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    </Tooltip>
  );
};

// Rich Tooltip with Title and Description
export const RichTooltip = ({
  children,
  title,
  description,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`
              absolute z-50
              ${positions[position]}
              px-4 py-3
              bg-gray-900 dark:bg-gray-700
              rounded-xl shadow-xl
              min-w-[200px] max-w-[280px]
              pointer-events-none
            `}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {title && (
              <p className="text-white font-medium text-sm mb-1">{title}</p>
            )}
            {description && (
              <p className="text-gray-300 text-xs">{description}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Floating Label (appears above input on focus)
export const FloatingLabel = ({
  children,
  label,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <motion.label
        className={`
          absolute left-4 transition-all pointer-events-none
          ${isFocused || hasValue
            ? 'top-0 -translate-y-1/2 text-xs text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-900 px-1'
            : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
          }
        `}
        initial={false}
        animate={{
          y: isFocused || hasValue ? '-50%' : '-50%',
          scale: isFocused || hasValue ? 0.85 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        {label}
      </motion.label>
      {children}
    </div>
  );
};

export default Tooltip;