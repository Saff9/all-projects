import { motion } from 'framer-motion';
import { Link as LinkIcon, Sparkles } from 'lucide-react';

const GradientTemplate = ({
  profile,
  links = [],
  onLinkClick,
  gradient = 'sunset',
  className = '',
}) => {
  const { displayName, username, bio, avatarURL } = profile || {};

  const gradients = {
    sunset: 'from-orange-400 via-pink-500 to-purple-600',
    ocean: 'from-cyan-400 via-blue-500 to-indigo-600',
    forest: 'from-emerald-400 via-teal-500 to-cyan-600',
    aurora: 'from-purple-400 via-pink-500 to-red-500',
    cosmic: 'from-violet-600 via-purple-500 to-fuchsia-500',
    rainbow: 'from-red-500 via-yellow-500 to-green-500',
    midnight: 'from-slate-900 via-purple-900 to-slate-900',
    fire: 'from-yellow-400 via-orange-500 to-red-600',
  };

  const selectedGradient = gradients[gradient] || gradients.sunset;

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
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      className={`min-h-screen relative overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${selectedGradient} animate-gradient`}
        style={{ backgroundSize: '200% 200%' }}
      />
      
      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25, 0],
              y: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Profile Header */}
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <div className="relative inline-block mb-4">
              {avatarURL ? (
                <img
                  src={avatarURL}
                  alt={displayName}
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-white/30 shadow-2xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
                  <span className="text-4xl font-bold text-white">
                    {displayName?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              
              {/* Sparkle decoration */}
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </motion.div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
              {displayName || 'Your Name'}
            </h1>
            
            {username && (
              <p className="text-white/80 text-sm mb-3">
                @{username}
              </p>
            )}
            
            {bio && (
              <p className="text-white/90 text-sm max-w-xs mx-auto leading-relaxed">
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
                className="block w-full p-4 bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/20 rounded-2xl text-center transition-all duration-300 group"
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-white font-semibold drop-shadow">
                  {link.title}
                </span>
              </motion.a>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            className="mt-10 text-center"
            variants={itemVariants}
          >
            <a
              href="https://onelink.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/80 transition-colors"
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

export default GradientTemplate;