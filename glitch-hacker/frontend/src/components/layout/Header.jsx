import { motion } from 'framer-motion';
import { User, Zap, Shield, Award } from 'lucide-react';
import EnergyBar from '../ui/EnergyBar';
import GlitchText from '../ui/GlitchText';

// Stores
import useUserStore from '../../stores/userStore';
import useClickerStore from '../../stores/clickerStore';
import useAuthStore from '../../stores/authStore';

const Header = () => {
  // Get data from stores
  const { profile } = useUserStore();
  const { balance } = useUserStore();
  const { energy, maxEnergy } = useClickerStore();
  const { user: authUser } = useAuthStore();

  const username = profile?.username || authUser?.username || 'Hacker';
  const avatar = profile?.photoUrl || null;
  const userId = profile?.id || authUser?.id || '0';

  // Determine rank based on total earned
  const totalEarned = profile?.totalEarned || 0;
  const getRank = (earned) => {
    if (earned >= 100000) return 'Glitch Master';
    if (earned >= 50000) return 'Elite Hacker';
    if (earned >= 20000) return 'Cyber Punk';
    if (earned >= 10000) return 'Net Runner';
    if (earned >= 5000) return 'Code Breaker';
    return 'Script Kiddie';
  };

  const rank = getRank(totalEarned);

  const rankColors = {
    'Script Kiddie': 'bg-gray-500',
    'Code Breaker': 'bg-blue-500',
    'Net Runner': 'bg-purple-500',
    'Cyber Punk': 'bg-pink-500',
    'Elite Hacker': 'bg-yellow-500',
    'Glitch Master': 'bg-primary',
  };

  return (
    <motion.header
      className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-primary/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="max-w-md mx-auto px-4 py-3">
        {/* Top row - User info and Rank */}
        <div className="flex items-center justify-between mb-3">
          {/* User profile */}
          <div className="flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 rounded-full bg-surface border-2 border-primary/50 overflow-hidden flex items-center justify-center"
              whileHover={{ scale: 1.1, borderColor: '#00FF41' }}
            >
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-primary/70" />
              )}
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-background" />
            </motion.div>
            
            <div>
              <p className="font-mono text-sm text-primary font-semibold">
                @{username}
              </p>
              <p className="font-mono text-[10px] text-primary/50 uppercase tracking-wider">
                ID: {userId.toString().slice(0, 8)}
              </p>
            </div>
          </div>
          
          {/* Rank badge */}
          <motion.div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${rankColors[rank] || 'bg-gray-500'} bg-opacity-20 border border-current`}
            whileHover={{ scale: 1.05 }}
          >
            <Award className="w-3.5 h-3.5" />
            <span className="text-xs font-mono font-semibold uppercase">
              {rank}
            </span>
          </motion.div>
        </div>
        
        {/* Balance display */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-3 py-2 bg-surface/50 rounded-lg border border-primary/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Zap className="w-5 h-5 text-primary" />
          <GlitchText 
            text={Math.floor(balance).toLocaleString()} 
            size="2xl" 
            color="primary"
          />
          <span className="font-mono text-lg text-primary/70">$BITZ</span>
        </motion.div>
        
        {/* Energy bar */}
        <EnergyBar value={Math.floor(energy)} max={maxEnergy} />
        
        {/* Decorative line */}
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>
    </motion.header>
  );
};

export default Header;
