import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingText from './FloatingText';

const ExecuteButton = ({ 
  onExecute, 
  disabled = false, 
  energy = 1000,
  maxEnergy = 1000 
}) => {
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [isPressed, setIsPressed] = useState(false);

  const hasEnergy = energy > 0;
  const isDisabled = disabled || !hasEnergy;

  const handleClick = useCallback((e) => {
    if (isDisabled) return;

    // Haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    // Get click position for floating text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Random floating text
    const texts = ['+1', '+1', 'ACCESS GRANTED', 'PACKET SENT', 'DATA MINED'];
    const text = texts[Math.floor(Math.random() * texts.length)];
    const colors = ['#00FF41', '#00FF41', '#00CC33', '#66FF66', '#99FF99'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);

    // Remove floating text after animation
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1000);

    // Call the execute handler
    onExecute?.();
  }, [isDisabled, onExecute]);

  const buttonVariants = {
    idle: {
      scale: 1,
      boxShadow: '0 0 20px rgba(0, 255, 65, 0.3), 0 0 40px rgba(0, 255, 65, 0.1)',
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 0 30px rgba(0, 255, 65, 0.5), 0 0 60px rgba(0, 255, 65, 0.3)',
    },
    tap: {
      scale: 0.95,
      boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
    },
    pulse: {
      boxShadow: [
        '0 0 20px rgba(0, 255, 65, 0.3), 0 0 40px rgba(0, 255, 65, 0.1)',
        '0 0 40px rgba(0, 255, 65, 0.5), 0 0 80px rgba(0, 255, 65, 0.3)',
        '0 0 20px rgba(0, 255, 65, 0.3), 0 0 40px rgba(0, 255, 65, 0.1)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const disabledVariants = {
    idle: {
      scale: 1,
      opacity: 0.5,
    },
  };

  return (
    <div className="relative">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        animate={!isDisabled ? {
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Secondary glow ring */}
      <motion.div
        className="absolute inset-[-10px] rounded-full border border-primary/20"
        animate={!isDisabled ? {
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />

      {/* Main button */}
      <motion.button
        className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2 ${
          isDisabled 
            ? 'bg-surface border-4 border-primary/30 cursor-not-allowed' 
            : 'bg-surface border-4 border-primary cursor-pointer'
        }`}
        variants={isDisabled ? disabledVariants : buttonVariants}
        initial="idle"
        animate={isDisabled ? 'idle' : isPressed ? 'tap' : 'pulse'}
        whileHover={!isDisabled ? 'hover' : undefined}
        whileTap={!isDisabled ? 'tap' : undefined}
        onClick={handleClick}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        disabled={isDisabled}
      >
        {/* Inner circle with gradient */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-surface-light to-surface" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.span 
            className={`font-mono font-bold text-2xl tracking-[0.2em] ${
              isDisabled ? 'text-primary/40' : 'text-primary'
            }`}
            animate={!isDisabled ? {
              textShadow: [
                '0 0 10px rgba(0, 255, 65, 0.5)',
                '0 0 20px rgba(0, 255, 65, 0.8)',
                '0 0 10px rgba(0, 255, 65, 0.5)',
              ],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            [ EXECUTE ]
          </motion.span>
          
          {!hasEnergy && (
            <span className="text-xs text-alert font-mono mt-1">NO ENERGY</span>
          )}
        </div>

        {/* Decorative corners on button */}
        <span className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-primary/50" />
        <span className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-primary/50" />
        <span className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-primary/50" />
        <span className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-primary/50" />
      </motion.button>

      {/* Floating texts container */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        <AnimatePresence>
          {floatingTexts.map((ft) => (
            <FloatingText
              key={ft.id}
              text={ft.text}
              x={ft.x}
              y={ft.y}
              color={ft.color}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExecuteButton;
