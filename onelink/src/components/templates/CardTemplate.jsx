import { motion } from 'framer-motion';
import { Link as LinkIcon, MapPin, Briefcase, Calendar, ArrowRight } from 'lucide-react';

const CardTemplate = ({
  profile,
  links = [],
  onLinkClick,
  className = '',
}) => {
  const { displayName, username, bio, avatarURL, themeSettings } = profile || {};
  const primaryColor = themeSettings?.primaryColor || '#3b82f6';
  const secondaryColor = themeSettings?.secondaryColor || '#8b5cf6';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
  };

  return (
    <motion.div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 dark:opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Profile Card */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-6"
          variants={cardVariants}
          whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        >
          {/* Cover Gradient */}
          <div 
            className="h-32 sm:h-40 relative"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          >
            {/* Decorative Elements */}
            <motion.div
              className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-white/10"
              animate={{ scale: [1.2, 1, 1.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6 sm:px-8">
            {/* Avatar */}
            <div className="relative -mt-16 sm:-mt-20 mb-4">
              {avatarURL ? (
                <motion.img
                  src={avatarURL}
                  alt={displayName}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                />
              ) : (
                <motion.div
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <span className="text-4xl sm:text-5xl font-bold text-gray-400 dark:text-gray-300">
                    {displayName?.charAt(0) || '?'}
                  </span>
                </motion.div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {displayName || 'Your Name'}
                </h1>
                {username && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                    @{username}
                  </p>
                )}
                {bio && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-md">
                    {bio}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4 sm:gap-6">
                <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                    {links.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Links</p>
                </div>
                <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: primaryColor }}>
                    {profile?.stats?.totalViews || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {links.map((link, index) => (
            <motion.a
              key={link.id || index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLinkClick?.(link)}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              variants={cardVariants}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Hover Gradient */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`,
                }}
              />

              <div className="relative flex items-center gap-4">
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                  }}
                >
                  {link.icon || '🔗'}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                    {link.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {new URL(link.url).hostname}
                  </p>
                </div>

                <motion.div
                  className="text-gray-400 group-hover:text-primary-500 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Empty State */}
        {links.length === 0 && (
          <motion.div
            className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl"
            variants={cardVariants}
          >
            <p className="text-gray-500 dark:text-gray-400">No links yet</p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          className="mt-8 text-center"
          variants={cardVariants}
        >
          <a
            href="https://onelink.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <LinkIcon className="w-3 h-3" />
            <span>Powered by OneLink</span>
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CardTemplate;