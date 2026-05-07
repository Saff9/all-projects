import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className={`relative w-full ${sizes[size]} bg-surface border border-primary/50 rounded-lg overflow-hidden pointer-events-auto`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated border lines */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-surface-light/30">
                  <h2 className="font-mono font-bold text-primary text-lg uppercase tracking-wider">
                    {title}
                  </h2>
                  <motion.button
                    onClick={onClose}
                    className="p-1 text-primary/60 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
              
              {/* Content */}
              <div className="p-4 relative">
                {/* Corner decorations */}
                <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50" />
                <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50" />
                <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50" />
                <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50" />
                
                {children}
              </div>
              
              {/* Bottom scan line */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Glow effect */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: 'inset 0 0 50px rgba(0, 255, 65, 0.05), 0 0 50px rgba(0, 255, 65, 0.1)'
                }}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
