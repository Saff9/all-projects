import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebApp from '@twa-dev/sdk';

function App() {
  const [user, setUser] = useState(null);
  const [waterCount, setWaterCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);

  // Initialize Telegram WebApp
  useEffect(() => {
    // Check if running inside Telegram WebApp
    const telegram = WebApp;
    if (telegram && telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
      setIsTelegram(true);
      const tgUser = telegram.initDataUnsafe.user;
      setUser({
        id: tgUser.id,
        first_name: tgUser.first_name || 'Friend',
        username: tgUser.username || ''
      });
      
      // Initialize Telegram WebApp
      telegram.ready();
      telegram.expand();
    } else {
      // Fallback for browser development
      setIsTelegram(false);
      const storedUser = localStorage.getItem('gossipGardenUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Create mock user for development
        const mockUser = {
          id: Math.floor(Math.random() * 1000000),
          first_name: 'Developer',
          username: 'dev'
        };
        setUser(mockUser);
        localStorage.setItem('gossipGardenUser', JSON.stringify(mockUser));
      }
    }
  }, []);

  // Determine plant image based on water count
  const getPlantImage = () => {
    if (waterCount === 0) return '/images/seed.svg';
    if (waterCount >= 1 && waterCount <= 5) return '/images/sprout.svg';
    if (waterCount >= 6 && waterCount <= 10) return '/images/bud.svg';
    return '/images/flower.svg';
  };

  // Get plant stage name
  const getPlantStage = () => {
    if (waterCount === 0) return 'Seed';
    if (waterCount >= 1 && waterCount <= 5) return 'Sprout';
    if (waterCount >= 6 && waterCount <= 10) return 'Bud';
    return 'Flower';
  };

  // Copy share link to clipboard
  const handleGetWater = async () => {
    if (!user) return;
    
    const shareLink = `t.me/GossipGardenBot?startapp=${user.id}`;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      
      // Haptic feedback if available in Telegram
      if (isTelegram && WebApp.HapticFeedback) {
        WebApp.HapticFeedback.notificationOccurred('success');
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Simulate receiving a message (for development/testing)
  const simulateMessage = () => {
    setWaterCount(prev => prev + 1);
    
    // Haptic feedback if available
    if (isTelegram && WebApp.HapticFeedback) {
      WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  // Plant image animation variants
  const plantVariants = {
    initial: { scale: 0.5, opacity: 0, y: 20 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: { 
      scale: 0.5, 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-[#E0F2F1] flex items-center justify-center p-4 font-sans">
      <motion.div 
        className="max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header / Welcome */}
        <motion.div 
          className="text-center mb-6"
          variants={itemVariants}
        >
          <h1 className="text-2xl font-bold text-[#795548] mb-1">
            {user ? `Welcome, ${user.first_name}!` : 'Welcome to Gossip Garden'}
          </h1>
          <p className="text-[#795548] text-opacity-70 text-sm">
            Grow your plant with anonymous messages from friends
          </p>
        </motion.div>

        {/* Plant Display */}
        <motion.div 
          className="bg-white rounded-3xl shadow-lg p-8 mb-6 text-center"
          variants={itemVariants}
        >
          {/* Water Count Badge */}
          <div className="inline-flex items-center gap-2 bg-[#E0F2F1] px-4 py-2 rounded-full mb-6">
            <span className="text-2xl">💧</span>
            <span className="text-[#795548] font-bold">{waterCount} Water</span>
          </div>

          {/* Plant Image with Animation */}
          <div className="h-48 flex items-center justify-center mb-4">
            <AnimatePresence mode="wait">
              <motion.img
                key={getPlantImage()}
                src={getPlantImage()}
                alt={getPlantStage()}
                className="w-40 h-40 object-contain"
                variants={plantVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              />
            </AnimatePresence>
          </div>

          {/* Plant Stage Label */}
          <motion.p 
            className="text-[#795548] font-semibold text-lg"
            key={getPlantStage()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {getPlantStage()} Stage
          </motion.p>
          <p className="text-[#795548] text-opacity-60 text-sm mt-1">
            {waterCount === 0 
              ? 'Share your link to receive water!' 
              : waterCount < 10 
                ? `${10 - waterCount} more messages to bloom!` 
                : 'Your plant is fully bloomed! 🌸'}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="space-y-3">
          {/* Get Water Button */}
          <button
            onClick={handleGetWater}
            className="w-full bg-[#795548] text-[#FFF9C4] font-bold py-4 rounded-2xl shadow-md hover:bg-[#5D4037] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-xl">🔗</span>
            {copied ? 'Link Copied!' : 'Get Water (Copy Link)'}
          </button>

          {/* Development: Simulate Message Button */}
          {!isTelegram && (
            <button
              onClick={simulateMessage}
              className="w-full bg-[#FFF9C4] text-[#795548] font-semibold py-3 rounded-2xl border-2 border-[#795548] border-opacity-20 hover:bg-[#FFF59D] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span className="text-xl">🧪</span>
              Simulate Message (Dev Only)
            </button>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div 
          className="mt-6 text-center"
          variants={itemVariants}
        >
          <p className="text-[#795548] text-opacity-60 text-xs">
            Share your link with friends to receive anonymous messages and grow your plant!
          </p>
        </motion.div>

        {/* Development Mode Indicator */}
        {!isTelegram && (
          <motion.div 
            className="mt-4 text-center"
            variants={itemVariants}
          >
            <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">
              🛠️ Development Mode
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;
