import { motion } from 'framer-motion';
import { Link as LinkIcon, Zap } from 'lucide-react';

const NeonTemplate = ({
  profile,
  links = [],
  onLinkClick,
  neonColor = 'cyan',
  className = '',
}) => {
  const { displayName, username, bio, avatarURL } = profile || {};

  const neonColors = {
    cyan: {
      glow: 'shadow-cyan-500/50',
      border: 'border-cyan-500',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      hover: 'hover:shadow-cyan-400/60',
    },
    pink: {
      glow: 'shadow-pink-500/50',
      border: 'border-pink-500',
      text: 'text-pink-400',
      bg: 'bg-pink-500/10',
      hover: 'hover:shadow-pink-400/60',
    },
    green: {
      glow: 'shadow-green-500/50',
      border: 'border-green-500',
      text: 'text-green-400',
      bg: 'bg-green-500/10',
      hover: 'hover:shadow-green-400/60',
    },
    purple: {
      glow: 'shadow-purple-500/50',
      border: 'border-purple-500',
      text: 'text-purple-400',
      bg: 'bg-purple-500/10',
      hover: 'hover:shadow-purple-400/60',
    },
    orange: {
      glow: 'shadow-orange-500/50',
      border: 'border-orange-500',
      text: 'text-orange-400',
      bg: 'bg-orange-500/10',
      hover: 'hover:shadow-orange-400/60',
    },
  };

  const colors = neonColors[neonColor] || neonColors.cyan;

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
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      className={`min-h-screen bg-gray-950 text-white relative overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(${colors.text.replace('text-', 'rgba(var(--')} / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Animated Glow Lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute h-px w-full ${colors.bg.replace('/10', '/30')}`}
            style={{ top: `${(i + 1) * 25}%` }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Profile Header */}
          <motion.div className="text-center mb-10" variants={itemVariants}>
            <div className="relative inline-block mb-5">
              {avatarURL ? (
                <div className={`p-1 rounded-full bg-gray-900 ring-2 ${colors.border} shadow-lg ${colors.glow}`}>
                  <img
                    src={avatarURL}
                    alt={displayName}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                </div>
              ) : (
                <div className={`w-32 h-32 rounded-full bg-gray-900 flex items-center justify-center ring-2 ${colors.border} shadow-lg ${colors.glow}`}>
                  <span className={`text-4xl font-bold ${colors.text}`}>
                    {displayName?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              
              {/* Zap decoration */}
              <motion.div
                className={`absolute -top-2 -right-2 p-2 bg-gray-900 rounded-full ring-2 ${colors.border} ${colors.glow}`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className={`w-4 h-4 ${colors.text}`} />
              </motion.div>
            </div>
            
            <h1 className={`text-3xl font-bold mb-2 ${colors.text} drop-shadow-[0_0_10px_currentColor]`}>
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
                className={`
                  block w-full p-4
                  bg-gray-900/80 backdrop-blur-sm
                  border-2 ${colors.border}
                  rounded-xl
                  transition-all duration-300
                  group
                  shadow-lg ${colors.glow} ${colors.hover}
                  hover:scale-[1.02]
                `}
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <span className={colors.text}>
                      {link.icon || '01'}
                    </span>
                  </div>
                  <span className={`font-semibold flex-1 group-hover:${colors.text} transition-colors`}>
                    {link.title}
                  </span>
                  <motion.svg
                    className={`w-5 h-5 ${colors.text}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
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
              className={`inline-flex items-center gap-1.5 text-xs ${colors.text} hover:opacity-80 transition-opacity`}
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

export default NeonTemplate;