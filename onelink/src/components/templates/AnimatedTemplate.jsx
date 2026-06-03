import { motion, AnimatePresence } from 'framer-motion';
import { Link as LinkIcon, Sparkles, Heart, Star, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const AnimatedTemplate = ({
  profile,
  links = [],
  onLinkClick,
  className = '',
}) => {
  const { displayName, username, bio, avatarURL, themeSettings } = profile || {};
  const primaryColor = themeSettings?.primaryColor || '#f43f5e';
  const secondaryColor = themeSettings?.secondaryColor || '#8b5cf6';
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredLink, setHoveredLink] = useState(null);

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    },
  };

  // Floating animation for decorative elements
  const floatAnimation = {
    y: [-10, 10, -10],
    rotate: [-5, 5, -5],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  };

  return (
    <motion.div
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: `${primaryColor}30` }}
          animate={{
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 0.5, scale: { duration: 8, repeat: Infinity } }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${secondaryColor}30` }}
          animate={{
            x: mousePosition.x * -2,
            y: mousePosition.y * -2,
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 0.5, scale: { duration: 10, repeat: Infinity } }}
        />

        {/* Floating Shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
            animate={floatAnimation}
            transition={{ delay: i * 0.5 }}
          >
            {i % 3 === 0 ? (
              <Star className="w-6 h-6 text-white/20" />
            ) : i % 3 === 1 ? (
              <Heart className="w-5 h-5 text-pink-400/20" />
            ) : (
              <Sparkles className="w-5 h-5 text-purple-400/20" />
            )}
          </motion.div>
        ))}

        {/* Particle Effect */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Profile Section */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          {/* Animated Avatar Ring */}
          <motion.div
            className="relative inline-block mb-6"
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
            }}
          >
            {/* Rotating Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
                padding: '4px',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-full h-full rounded-full bg-gray-900" />
            </motion.div>

            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full blur-xl opacity-50"
              style={{ backgroundColor: primaryColor }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {avatarURL ? (
              <motion.img
                src={avatarURL}
                alt={displayName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mx-auto object-cover relative z-10 border-4 border-gray-900"
                whileHover={{ scale: 1.1 }}
              />
            ) : (
              <motion.div
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full mx-auto bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center relative z-10 border-4 border-gray-900"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-4xl sm:text-5xl font-bold text-white">
                  {displayName?.charAt(0) || '?'}
                </span>
              </motion.div>
            )}

            {/* Animated Badge */}
            <motion.div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Active
            </motion.div>
          </motion.div>

          {/* Name with Gradient Text */}
          <motion.h1
            className="text-3xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, #fff, ${primaryColor})`,
            }}
            variants={itemVariants}
          >
            {displayName || 'Your Name'}
          </motion.h1>

          {username && (
            <motion.p
              className="text-gray-400 text-sm mb-3"
              variants={itemVariants}
            >
              @{username}
            </motion.p>
          )}

          {bio && (
            <motion.p
              className="text-gray-300 text-sm sm:text-base max-w-xs mx-auto leading-relaxed"
              variants={itemVariants}
            >
              {bio}
            </motion.p>
          )}
        </motion.div>

        {/* Links with Hover Effects */}
        <div className="space-y-4">
          <AnimatePresence>
            {links.map((link, index) => (
              <motion.a
                key={link.id || index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onLinkClick?.(link)}
                className="block relative overflow-hidden group"
                variants={itemVariants}
                onHoverStart={() => setHoveredLink(index)}
                onHoverEnd={() => setHoveredLink(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                  }}
                  animate={{
                    borderColor: hoveredLink === index ? primaryColor : 'rgba(255,255,255,0.1)',
                  }}
                />

                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${primaryColor}40, transparent)`,
                  }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />

                {/* Content */}
                <div className="relative p-4 sm:p-5 flex items-center gap-4 border border-white/10 rounded-2xl group-hover:border-white/20 transition-colors">
                  {/* Icon with Animation */}
                  <motion.div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)`,
                    }}
                    animate={hoveredLink === index ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {link.icon || '🔗'}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <motion.h3
                      className="font-semibold text-white truncate"
                      animate={{ x: hoveredLink === index ? 5 : 0 }}
                    >
                      {link.title}
                    </motion.h3>
                    <p className="text-sm text-gray-400 truncate">
                      {new URL(link.url).hostname}
                    </p>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className="text-gray-400"
                    animate={{
                      x: hoveredLink === index ? 5 : 0,
                      color: hoveredLink === index ? primaryColor : '#9ca3af',
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </motion.div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          className="mt-10 text-center"
          variants={itemVariants}
        >
          <motion.a
            href="https://onelink.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-3 h-3" />
            </motion.div>
            <span>Powered by OneLink</span>
          </motion.a>
        </motion.div>
      </div>

      {/* Corner Decorations */}
      <motion.div
        className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top left, ${primaryColor}20, transparent 70%)`,
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at bottom right, ${secondaryColor}20, transparent 70%)`,
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
      />
    </motion.div>
  );
};

export default AnimatedTemplate;