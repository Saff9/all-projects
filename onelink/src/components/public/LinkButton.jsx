import { motion } from 'framer-motion';
import { ExternalLink, Mail, Phone, FileText } from 'lucide-react';

const LinkButton = ({
  link,
  onClick,
  variant = 'default',
  index = 0,
  className = '',
}) => {
  const { title, url, description, iconURL, type = 'link' } = link;

  // Get icon based on link type
  const getTypeIcon = () => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'phone':
        return <Phone className="w-5 h-5" />;
      case 'file':
        return <FileText className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const variants = {
    default: `
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      hover:bg-gray-50 dark:hover:bg-gray-700/50
      hover:border-gray-300 dark:hover:border-gray-600
      hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50
    `,
    filled: `
      bg-gray-100 dark:bg-gray-800
      hover:bg-gray-200 dark:hover:bg-gray-700
    `,
    outline: `
      bg-transparent
      border-2 border-gray-300 dark:border-gray-600
      hover:border-primary-500 dark:hover:border-primary-400
      hover:bg-primary-50 dark:hover:bg-primary-900/20
    `,
    gradient: `
      bg-gradient-to-r from-primary-500 to-secondary-500
      text-white
      hover:from-primary-600 hover:to-secondary-600
      shadow-lg shadow-primary-500/25
    `,
    glass: `
      bg-white/20 dark:bg-gray-800/20
      backdrop-blur-md
      border border-white/30 dark:border-gray-700/30
      hover:bg-white/30 dark:hover:bg-gray-700/30
    `,
    shadow: `
      bg-white dark:bg-gray-800
      shadow-md
      hover:shadow-xl
      hover:-translate-y-0.5
    `,
  };

  const handleClick = () => {
    // Track click
    onClick?.(link);
    
    // Open link
    if (type === 'email') {
      window.location.href = `mailto:${url}`;
    } else if (type === 'phone') {
      window.location.href = `tel:${url}`;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        w-full p-4 rounded-xl
        flex items-center gap-4
        text-left
        transition-all duration-300
        group
        ${variants[variant]}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <div
        className={`
          w-12 h-12 rounded-xl
          flex items-center justify-center
          flex-shrink-0
          transition-all duration-300
          ${variant === 'gradient'
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400'
          }
        `}
      >
        {iconURL ? (
          <img
            src={iconURL}
            alt={title}
            className="w-6 h-6 object-contain"
          />
        ) : (
          getTypeIcon()
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`
            font-semibold truncate
            ${variant === 'gradient' ? 'text-white' : 'text-gray-900 dark:text-white'}
          `}
        >
          {title}
        </p>
        {description && (
          <p
            className={`
              text-sm truncate mt-0.5
              ${variant === 'gradient' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}
            `}
          >
            {description}
          </p>
        )}
      </div>

      {/* Arrow */}
      <motion.div
        className={`
          flex-shrink-0
          transition-all duration-300
          ${variant === 'gradient' ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}
          group-hover:translate-x-1
        `}
        animate={{ x: 0 }}
        whileHover={{ x: 3 }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </motion.div>
    </motion.button>
  );
};

// Compact Link Button Variant
export const CompactLinkButton = ({
  link,
  onClick,
  index = 0,
  className = '',
}) => {
  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick?.(link)}
      className={`
        inline-flex items-center gap-2 px-4 py-2
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        rounded-full
        text-sm font-medium
        text-gray-700 dark:text-gray-300
        transition-all duration-200
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {link.iconURL && (
        <img src={link.iconURL} alt="" className="w-4 h-4" />
      )}
      {link.title}
    </motion.a>
  );
};

// Icon Only Link Button
export const IconLinkButton = ({
  link,
  onClick,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  return (
    <motion.button
      onClick={() => onClick?.(link)}
      className={`
        ${sizes[size]}
        rounded-full
        bg-gray-100 dark:bg-gray-800
        hover:bg-primary-100 dark:hover:bg-primary-900/30
        flex items-center justify-center
        text-gray-600 dark:text-gray-400
        hover:text-primary-600 dark:hover:text-primary-400
        transition-all duration-200
        ${className}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={link.title}
    >
      {link.iconURL ? (
        <img src={link.iconURL} alt={link.title} className="w-5 h-5" />
      ) : (
        <ExternalLink className="w-5 h-5" />
      )}
    </motion.button>
  );
};

export default LinkButton;