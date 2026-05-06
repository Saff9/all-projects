import { motion } from 'framer-motion';

const Card = ({ title, children, className = '', icon: Icon, headerAction }) => {
  return (
    <motion.div
      className={`relative bg-surface border border-primary/30 rounded-lg overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ borderColor: 'rgba(0, 255, 65, 0.6)' }}
    >
      {/* Animated scan line at top */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-surface-light/50">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            <h3 className="font-mono font-semibold text-primary text-sm uppercase tracking-wider">
              {title}
            </h3>
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 relative">
        {/* Corner decorations */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/50" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/50" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/50" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/50" />
        
        {children}
      </div>
      
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          boxShadow: 'inset 0 0 30px rgba(0, 255, 65, 0.05)'
        }}
      />
    </motion.div>
  );
};

export default Card;
