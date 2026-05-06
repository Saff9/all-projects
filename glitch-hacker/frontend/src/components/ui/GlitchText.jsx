import { motion } from 'framer-motion';

const GlitchText = ({ text, size = 'md', color = 'primary', className = '' }) => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  };

  const colors = {
    primary: 'text-primary',
    alert: 'text-alert',
    white: 'text-white',
    muted: 'text-primary/60',
  };

  const glitchVariants = {
    initial: { x: 0 },
    hover: {
      x: [0, -3, 3, -3, 3, 0],
      transition: { duration: 0.3, ease: 'linear' }
    }
  };

  const letterVariants = {
    initial: { opacity: 1 },
    hover: (i) => ({
      opacity: [1, 0.8, 1, 0.9, 1],
      x: [0, Math.random() * 4 - 2, 0],
      transition: {
        duration: 0.1,
        delay: i * 0.02,
        repeat: 2
      }
    })
  };

  return (
    <motion.span
      className={`relative inline-block font-mono font-bold ${sizes[size]} ${colors[color]} ${className}`}
      initial="initial"
      whileHover="hover"
      variants={glitchVariants}
      data-text={text}
    >
      {/* Main text */}
      <span className="relative z-10">
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={letterVariants}
            className="inline-block"
            style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char}
          </motion.span>
        ))}
      </span>
      
      {/* Glitch layers */}
      <motion.span
        className="absolute top-0 left-0 -z-10 text-alert opacity-0"
        variants={{
          hover: {
            opacity: [0, 0.8, 0, 0.6, 0],
            x: [-2, 2, -2, 0],
            clipPath: [
              'inset(0 0 0 0)',
              'inset(20% 0 60% 0)',
              'inset(60% 0 20% 0)',
              'inset(0 0 0 0)'
            ],
            transition: { duration: 0.3 }
          }
        }}
        aria-hidden="true"
      >
        {text}
      </motion.span>
      
      <motion.span
        className="absolute top-0 left-0 -z-20 text-primary opacity-0"
        variants={{
          hover: {
            opacity: [0, 0.8, 0, 0.6, 0],
            x: [2, -2, 2, 0],
            clipPath: [
              'inset(0 0 0 0)',
              'inset(60% 0 20% 0)',
              'inset(20% 0 60% 0)',
              'inset(0 0 0 0)'
            ],
            transition: { duration: 0.3, delay: 0.05 }
          }
        }}
        aria-hidden="true"
      >
        {text}
      </motion.span>
    </motion.span>
  );
};

export default GlitchText;
