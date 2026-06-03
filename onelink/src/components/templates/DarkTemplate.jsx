import { motion } from 'framer-motion';
import { Link as LinkIcon, Moon, Star } from 'lucide-react';

const DarkTemplate = ({
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
      className={`min-h-screen bg-gray-950 text-white relative overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Starfield Background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Profile Header */}
          <motion.div className="text-center mb-10" variants={itemVariants}>
            <div className="relative inline-block mb-5">
              {avatarURL ? (
                <img
                  src={avatarURL}
                  alt={displayName}
                  className="w-32 h-32 rounded-full object-cover ring-2 ring-gray-800 shadow-xl shadow-purple-500/10"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center ring-2 ring-gray-700">
                  <span className="text-4xl font-bold text-gray-400">
                    {displayName?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              
              {/* Moon decoration */}
              <motion.div
                className="absolute -top-3 -right-3 p-2 bg-gray-900 rounded-full ring-1 ring-gray-700"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Moon className="w-4 h-4 text-purple-400" />
              </motion.div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {displayName || 'Your Name'}
            </h1>
            
            {username && (
              <p className="text-gray-400 text-sm mb-4">
                @{username}
              </p>
            )}
            
            {bio && (
              <p className="text-gray-300 text-sm max-w-xs mx-auto leading-relaxed">
                {bio}
              </p>
            )}
          </motion.div>

          {/* Links */}
          <div className="space-y-4">
            {links.map((link, index) => (
              <motion.a
                key={link.id || index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClick?.(link)}
                className="block w-full p-4 bg-gray-900/80 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-300 group backdrop-blur-sm"
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
                    <Star className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <span className="text-white font-medium flex-1">
                    {link.title}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
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
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Powered by OneLink</span>
            </a>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DarkTemplate;