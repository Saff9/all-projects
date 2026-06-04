import { motion } from 'framer-motion';
import { Link as LinkIcon, Mail, MapPin, Calendar, ArrowUpRight } from 'lucide-react';

const SplitTemplate = ({
  profile,
  links = [],
  onLinkClick,
  className = '',
}) => {
  const { displayName, username, bio, avatarURL, themeSettings, socialLinks } = profile || {};
  const primaryColor = themeSettings?.primaryColor || '#6366f1';
  const secondaryColor = themeSettings?.secondaryColor || '#8b5cf6';

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
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
  };

  return (
    <motion.div
      className={`min-h-screen flex flex-col lg:flex-row ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Left Side - Profile */}
      <motion.div
        className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen flex items-center justify-center p-6 sm:p-8 lg:p-12"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
        }}
        variants={itemVariants}
      >
        <div className="max-w-md w-full text-center lg:text-left">
          {/* Avatar */}
          <motion.div
            className="relative inline-block mb-6 lg:mb-8"
            whileHover={{ scale: 1.05 }}
          >
            {avatarURL ? (
              <img
                src={avatarURL}
                alt={displayName}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover shadow-2xl"
                style={{
                  boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.4)`,
                }}
              />
            ) : (
              <div 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl"
              >
                <span className="text-5xl sm:text-6xl font-bold text-white">
                  {displayName?.charAt(0) || '?'}
                </span>
              </div>
            )}

            {/* Online Indicator */}
            <motion.div
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white dark:border-gray-900"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Name & Bio */}
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3"
            variants={itemVariants}
          >
            {displayName || 'Your Name'}
          </motion.h1>

          {username && (
            <motion.p
              className="text-white/70 text-lg mb-4"
              variants={itemVariants}
            >
              @{username}
            </motion.p>
          )}

          {bio && (
            <motion.p
              className="text-white/80 text-base sm:text-lg leading-relaxed mb-6"
              variants={itemVariants}
            >
              {bio}
            </motion.p>
          )}

          {/* Social Links */}
          {socialLinks && (
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-3"
              variants={itemVariants}
            >
              {Object.entries(socialLinks).slice(0, 4).map(([platform, url]) => (
                url && (
                  <motion.a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{getSocialIcon(platform)}</span>
                  </motion.a>
                )
              ))}
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            className="flex justify-center lg:justify-start gap-8 mt-8 pt-8 border-t border-white/20"
            variants={itemVariants}
          >
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">{links.length}</p>
              <p className="text-white/60 text-sm">Links</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {profile?.stats?.totalViews || 0}
              </p>
              <p className="text-white/60 text-sm">Views</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {profile?.stats?.totalClicks || 0}
              </p>
              <p className="text-white/60 text-sm">Clicks</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Links */}
      <motion.div
        className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6 sm:p-8 lg:p-12"
        variants={rightVariants}
      >
        <div className="max-w-md w-full">
          <motion.h2
            className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6"
            variants={rightVariants}
          >
            My Links
          </motion.h2>

          {/* Links List */}
          <div className="space-y-3">
            {links.map((link, index) => (
              <motion.a
                key={link.id || index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClick?.(link)}
                className="group flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
                variants={rightVariants}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Icon */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                  }}
                >
                  {link.icon || '🔗'}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {link.url}
                  </p>
                </div>

                <motion.div
                  className="text-gray-400 group-hover:text-primary-500 transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <ArrowUpRight className="w-5 h-5" />
                </motion.div>
              </motion.a>
            ))}
          </div>

          {/* Empty State */}
          {links.length === 0 && (
            <motion.div
              className="text-center py-12"
              variants={rightVariants}
            >
              <p className="text-gray-500 dark:text-gray-400">No links available</p>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center"
            variants={rightVariants}
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
    </motion.div>
  );
};

// Helper function to get social icons
function getSocialIcon(platform) {
  const icons = {
    instagram: '📷',
    twitter: '🐦',
    youtube: '▶️',
    tiktok: '🎵',
    linkedin: '💼',
    github: '💻',
    facebook: '👤',
    email: '✉️',
  };
  return icons[platform] || '🔗';
}

export default SplitTemplate;