import { motion } from 'framer-motion';
import { Link as LinkIcon, MapPin, Calendar, Sparkles } from 'lucide-react';

const GlassTemplate = ({
  profile,
  links = [],
  onLinkClick,
  className = '',
}) => {
  const { displayName, username, bio, avatarURL, themeSettings } = profile || {};
  const primaryColor = themeSettings?.primaryColor || '#6366f1';
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
  };

  return (
    <motion.div
      className={`min-h-screen relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${primaryColor}40 0%, ${secondaryColor}30 50%, #1e1b4b 100%)`,
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${primaryColor}30` }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${secondaryColor}30` }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: '#ffffff10' }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Glass Card Container */}
        <motion.div
          className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl"
          variants={itemVariants}
        >
          {/* Profile Header */}
          <motion.div className="text-center mb-6" variants={itemVariants}>
            <div className="relative inline-block">
              {avatarURL ? (
                <motion.img
                  src={avatarURL}
                  alt={displayName}
                  className="w-28 h-28 rounded-full mx-auto object-cover ring-4 ring-white/30 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  style={{
                    boxShadow: `0 0 30px ${primaryColor}40`,
                  }}
                />
              ) : (
                <motion.div
                  className="w-28 h-28 rounded-full mx-auto bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center ring-4 ring-white/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-4xl font-bold text-white/80">
                    {displayName?.charAt(0) || '?'}
                  </span>
                </motion.div>
              )}
              
              {/* Verified Badge */}
              <motion.div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </motion.div>
            </div>

            <motion.h1
              className="text-2xl sm:text-3xl font-bold text-white mt-4 mb-1"
              variants={itemVariants}
            >
              {displayName || 'Your Name'}
            </motion.h1>

            {username && (
              <motion.p
                className="text-white/60 text-sm mb-3"
                variants={itemVariants}
              >
                @{username}
              </motion.p>
            )}

            {bio && (
              <motion.p
                className="text-white/80 text-sm sm:text-base max-w-xs mx-auto leading-relaxed"
                variants={itemVariants}
              >
                {bio}
              </motion.p>
            )}
          </motion.div>

          {/* Stats Row */}
          <motion.div
            className="flex justify-center gap-6 mb-6 py-4 border-y border-white/10"
            variants={itemVariants}
          >
            <div className="text-center">
              <p className="text-xl font-bold text-white">{links.length}</p>
              <p className="text-xs text-white/50">Links</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {profile?.stats?.totalViews || 0}
              </p>
              <p className="text-xs text-white/50">Views</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {profile?.stats?.totalClicks || 0}
              </p>
              <p className="text-xs text-white/50">Clicks</p>
            </div>
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
                className="block w-full p-4 backdrop-blur-md bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 rounded-2xl transition-all duration-300 group"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02, 
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  {link.icon && (
                    <span className="text-xl sm:text-2xl">{link.icon}</span>
                  )}
                  <span className="flex-1 text-white font-medium text-sm sm:text-base group-hover:text-white transition-colors">
                    {link.title}
                  </span>
                  <motion.span
                    className="text-white/40 group-hover:text-white/80 transition-colors"
                    whileHover={{ x: 3 }}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </motion.span>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            className="mt-8 pt-6 border-t border-white/10 text-center"
            variants={itemVariants}
          >
            <a
              href="https://onelink.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              <span>Powered by OneLink</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GlassTemplate;