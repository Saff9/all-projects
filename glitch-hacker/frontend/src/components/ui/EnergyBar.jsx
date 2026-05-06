import { motion } from 'framer-motion';

const EnergyBar = ({ value = 1000, max = 1000, showNumeric = true }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // Determine color based on percentage
  let colorClass = 'bg-primary';
  let glowColor = 'rgba(0, 255, 65, 0.5)';
  
  if (percentage < 25) {
    colorClass = 'bg-alert';
    glowColor = 'rgba(255, 51, 51, 0.5)';
  } else if (percentage < 50) {
    colorClass = 'bg-yellow-500';
    glowColor = 'rgba(234, 179, 8, 0.5)';
  }

  return (
    <div className="w-full">
      {/* Label row */}
      {showNumeric && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-mono text-primary/70 uppercase tracking-wider">
            Energy
          </span>
          <motion.span 
            className={`text-xs font-mono font-bold ${percentage < 25 ? 'text-alert' : percentage < 50 ? 'text-yellow-500' : 'text-primary'}`}
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {value}/{max}
          </motion.span>
        </div>
      )}
      
      {/* Progress bar container */}
      <div className="relative h-3 bg-surface-light rounded-full overflow-hidden border border-primary/20">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,255,65,0.3) 4px, rgba(0,255,65,0.3) 5px)'
          }} />
        </div>
        
        {/* Fill bar */}
        <motion.div
          className={`absolute top-0 left-0 h-full ${colorClass} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{
            boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
        
        {/* Segments for cyberpunk look */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-background/50 last:border-r-0" />
          ))}
        </div>
      </div>
      
      {/* Low energy warning */}
      {percentage < 25 && (
        <motion.p
          className="text-xs text-alert mt-1 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ⚠ LOW ENERGY - WAIT FOR RECHARGE
        </motion.p>
      )}
    </div>
  );
};

export default EnergyBar;
