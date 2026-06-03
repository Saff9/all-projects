import { motion } from 'framer-motion';
import { Link as LinkIcon, ExternalLink, Zap } from 'lucide-react';

const NeonGlowTemplate = ({
  profile,
  links = [],
  onLinkClick,
  neonColor = 'cyan',
  className = '',
}) => {
  const { displayName, username, bio, avatarURL, themeSettings } = profile || {};
  
  // Neon color presets
  const neonColors = {
    cyan: { primary: '#00ffff', secondary: '#00d4ff', glow: '#00ffff' },
    pink: { primary: '#ff00ff', secondary: '#ff69b4', glow: '#ff00ff' },
    green: { primary: '#00ff00', secondary: '#39ff14', glow: '#00ff00' },
    purple: { primary: '#bf00ff', secondary: '#9b59b6', glow: '#bf00ff' },
    orange: { primary: '#ff6600', secondary: '#ff9500', glow: '#ff6600' },
  };

  const colors = neonColors[neonColor] || neonColors.cyan;
  const primaryColor = themeSettings?.primaryColor || colors.primary;

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
    hidden: { opacity: 0, y: 30, x: -20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12
      }
    },
  };

  return (
    <motion.div
      className={`min-h-screen relative overflow-hidden bg-gray-950 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(${colors.primary}20 1px, transparent 1px),
            linear-gradient(90deg, ${colors.primary}20 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Neon Glow Orbs */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
        style={{ backgroundColor: `${colors.glow}20` }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl"
        style={{ backgroundColor: `${colors.secondary}20` }}
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Profile Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          {/* Avatar with Neon Ring */}
          <div className="relative inline-block mb-4">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.secondary}, ${colors.primary})`,
                padding: '3px',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <div className="w-full h-full rounded-full bg-gray-950" />
            </motion.div>
            
            {avatarURL ? (
              <motion.img
                src={avatarURL}
                alt={displayName}
                className="w-28 h-28 rounded-full mx-auto object-cover relative z-10"
                style={{
                  boxShadow: `0 0 40px ${colors.glow}60`,
                }}
                whileHover={{ scale: 1.05 }}
              />
            ) : (
              <motion.div
                className="w-28 h-28 rounded-full mx-auto bg-gray-900 flex items-center justify-center relative z-10"
                style={{
                  boxShadow: `0 0 40px ${colors.glow}40`,
                }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-4xl font-bold" style={{ color: colors.primary }}>
                  {displayName?.charAt(0) || '?'}
                </span>
              </motion.div>
            )}
          </div>

          <motion.h1
            className="text-3xl sm:text-4xl font-bold mb-2"
            style={{ 
              color: '#fff',
              textShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}50`,
            }}
            variants={itemVariants}
          >
            {displayName || 'Your Name'}
          </motion.h1>

          {username && (
            <motion.p
              className="text-sm mb-3"
              style={{ color: colors.primary }}
              variants={itemVariants}
            >
              @{username}
            </motion.p>
          )}

          {bio && (
            <motion.p
              className="text-gray-400 text-sm sm:text-base max-w-xs mx-auto"
              variants={itemVariants}
            >
              {bio}
            </motion.p>
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
              className="block w-full p-4 bg-gray-900/80 border rounded-xl transition-all duration-300 group relative overflow-hidden"
              style={{
                borderColor: `${colors.primary}40`,
              }}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                borderColor: colors.primary,
              }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px ${colors.glow}40, inset 0 0 20px ${colors.glow}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${colors.primary}20, transparent)`,
                }}
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              <div className="relative flex items-center gap-3">
                {link.icon && (
                  <span className="text-2xl">{link.icon}</span>
                )}
                <span 
                  className="flex-1 font-medium text-white group-hover:text-white transition-colors"
                >
                  {link.title}
                </span>
                <motion.div
                  whileHover={{ x: 5, scale: 1.1 }}
                  style={{ color: colors.primary }}
                >
                  <ExternalLink className="w-5 h-5" />
                </motion.div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Powered By */}
        <motion.div
          className="mt-10 text-center"
          variants={itemVariants}
        >
          <a
            href="https://onelink.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Zap className="w-3 h-3" style={{ color: colors.primary }} />
            <span>Powered by OneLink</span>
          </a>
        </motion.div>
      </div>

      {/* Corner Decorations */}
      <div 
        className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 rounded-tl-3xl opacity-30"
        style={{ borderColor: colors.primary }}
      />
      <div 
        className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 rounded-br-3xl opacity-30"
        style={{ borderColor: colors.secondary }}
      />
    </motion.div>
  );
};

export default NeonGlowTemplate;