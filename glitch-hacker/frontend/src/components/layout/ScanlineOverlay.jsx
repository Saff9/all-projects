import { motion } from 'framer-motion';

const ScanlineOverlay = () => {
  return (
    <>
      {/* Horizontal scanlines */}
      <div 
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{
          background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 255, 65, 0.03) 50%)',
          backgroundSize: '100% 4px',
        }}
      />
      
      {/* Moving scanline */}
      <motion.div
        className="fixed left-0 right-0 h-px bg-primary/20 pointer-events-none z-[101]"
        style={{
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.5), 0 0 20px rgba(0, 255, 65, 0.3)',
        }}
        initial={{ top: '-5%' }}
        animate={{ top: '105%' }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-[99]"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />
      
      {/* Screen flicker */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[98] bg-primary/5"
        animate={{
          opacity: [0, 0.02, 0, 0.01, 0],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 5,
          times: [0, 0.1, 0.2, 0.3, 1],
        }}
      />
      
      {/* Corner decorations */}
      <div className="fixed top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/30 pointer-events-none z-[100]" />
      <div className="fixed top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30 pointer-events-none z-[100]" />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/30 pointer-events-none z-[100]" />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/30 pointer-events-none z-[100]" />
    </>
  );
};

export default ScanlineOverlay;
