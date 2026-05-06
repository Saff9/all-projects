import { motion } from 'framer-motion';
import { Terminal, ShoppingCart, Network, User } from 'lucide-react';

const BottomNav = ({ activeTab = 'terminal', onTabChange }) => {
  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'shop', label: 'Black Market', icon: ShoppingCart },
    { id: 'pvp', label: 'Network', icon: Network },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-primary/20"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Animated top border */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className="max-w-md mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-primary/40 hover:text-primary/70'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/30"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                
                {/* Glow effect for active tab */}
                {isActive && (
                  <motion.div
                    className="absolute -inset-1 bg-primary/20 rounded-xl blur-md -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                
                {/* Icon */}
                <motion.div
                  animate={isActive ? { 
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-5 h-5 relative z-10" />
                </motion.div>
                
                {/* Label */}
                <span className={`text-[10px] font-mono uppercase tracking-wider relative z-10 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {tab.label}
                </span>
                
                {/* Active dot */}
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full"
                    layoutId="activeDot"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding for mobile */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </motion.nav>
  );
};

export default BottomNav;
