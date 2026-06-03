import { motion } from 'framer-motion';
import { Link as LinkIcon } from 'lucide-react';

const MinimalTemplate = ({
  profile,
  links = [],
  onLinkClick,
  className = '',
}) => {
  const { displayName, username, bio, avatarURL } = profile || {};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={`min-h-screen bg-white dark:bg-gray-950 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Profile Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          {avatarURL ? (
            <img
              src={avatarURL}
              alt={displayName}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-2 ring-gray-100 dark:ring-gray-800"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-3xl font-medium text-gray-400">
                {displayName?.charAt(0) || '?'}
              </span>
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {displayName || 'Your Name'}
          </h1>
          
          {username && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
              @{username}
            </p>
          )}
          
          {bio && (
            <p className="text-gray-600 dark:text-gray-300 text-sm max-w-xs mx-auto">
              {bio}
            </p>
          )}
        </motion.div>

        {/* Links */}
        <div className="space-y-3">
          {links.map((link, index) => (
            <motion.a
              key={link.id || index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLinkClick?.(link)}
              className="block w-full p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl text-center transition-all duration-200 group"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-gray-900 dark:text-white font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {link.title}
              </span>
            </motion.a>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          className="mt-12 text-center"
          variants={itemVariants}
        >
          <a
            href="https://onelink.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span>Powered by OneLink</span>
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MinimalTemplate;