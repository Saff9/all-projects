import { motion } from 'framer-motion';

const FloatingText = ({ text, x, y, color = '#00FF41' }) => {
  const isLongText = text.length > 3;

  return (
    <motion.span
      className="absolute font-mono font-bold pointer-events-none whitespace-nowrap"
      style={{
        left: x,
        top: y,
        color: color,
        textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
        fontSize: isLongText ? '12px' : '16px',
      }}
      initial={{ 
        opacity: 1, 
        y: 0, 
        scale: 0.5,
        rotate: 0,
      }}
      animate={{ 
        opacity: 0, 
        y: -80, 
        scale: isLongText ? 1.2 : 1.5,
        rotate: Math.random() * 20 - 10,
      }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 1, 
        ease: 'easeOut',
      }}
    >
      {/* Glitch layers */}
      <motion.span
        className="absolute top-0 left-0 -z-10"
        style={{ color: '#FF3333' }}
        animate={{
          x: [-1, 1, -1, 0],
          opacity: [0.5, 0.8, 0.5, 0],
        }}
        transition={{ duration: 0.2, repeat: 2 }}
      >
        {text}
      </motion.span>
      
      <motion.span
        className="absolute top-0 left-0 -z-20"
        style={{ color: '#00FF41' }}
        animate={{
          x: [1, -1, 1, 0],
          opacity: [0.5, 0.8, 0.5, 0],
        }}
        transition={{ duration: 0.2, repeat: 2, delay: 0.05 }}
      >
        {text}
      </motion.span>
      
      {/* Main text */}
      {text}
    </motion.span>
  );
};

export default FloatingText;
