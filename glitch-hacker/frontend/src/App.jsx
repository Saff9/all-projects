import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WebAppProvider } from '@vkruglikov/react-telegram-web-app';

// Layout Components
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import ScanlineOverlay from './components/layout/ScanlineOverlay';

// Screen Components
import TerminalScreen from './components/screens/TerminalScreen';
import ShopScreen from './components/screens/ShopScreen';
import PVPScreen from './components/screens/PVPScreen';
import ProfileScreen from './components/screens/ProfileScreen';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useGameLoop } from './hooks/useGameLoop';
import { useTelegram } from './hooks/useTelegram';

// Stores
import useUserStore from './stores/userStore';
import useClickerStore from './stores/clickerStore';

function App() {
  const [activeTab, setActiveTab] = useState('terminal');
  
  // Auth hook
  const { 
    isAuthenticated, 
    isLoading: isAuthLoading, 
    isInitialized,
    autoLogin,
    devAutoLogin,
    telegramUser,
  } = useAuth();
  
  // Telegram hook
  const { hapticSelection, expand } = useTelegram();
  
  // User store
  const { 
    fetchUser,
    isLoading: isUserLoading,
  } = useUserStore();
  
  // Clicker store
  const { 
    fetchStatus,
  } = useClickerStore();

  // Development mode: auto-login with mock data if not in Telegram
  useEffect(() => {
    const devAutoLogin = async () => {
      if (!isAuthenticated && !localStorage.getItem('auth_token') && isInitialized) {
        // Check if we're in development mode
        if (import.meta.env.DEV) {
          console.log('Development mode: Attempting auto-login...');
          const result = await autoLogin();
          if (!result.success) {
            console.log('Dev auto-login failed, will show auth screen');
          }
        }
      }
    };
    
    devAutoLogin();
  }, [isInitialized, isAuthenticated, autoLogin]);

  // Initialize auth and fetch user data
  useEffect(() => {
    const initialize = async () => {
      if (!isInitialized) return;
      
      // Try to auto-login with Telegram
      if (!isAuthenticated && !import.meta.env.DEV) {
        await autoLogin();
      }
      
      // Fetch user data and clicker status
      if (isAuthenticated || localStorage.getItem('auth_token')) {
        await fetchUser();
        await fetchStatus();
      }
    };
    
    initialize();
  }, [isInitialized, isAuthenticated, autoLogin, fetchUser, fetchStatus]);

  // Start game loop when authenticated
  useGameLoop(isAuthenticated && !isAuthLoading);

  // Expand Telegram WebApp on mount
  useEffect(() => {
    expand();
  }, [expand]);

  // Handle tab change with haptic feedback
  const handleTabChange = (tab) => {
    hapticSelection();
    setActiveTab(tab);
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'terminal':
        return <TerminalScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'pvp':
        return <PVPScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return null;
    }
  };

  // Loading screen
  if (isAuthLoading || isUserLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ScanlineOverlay />
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.h1
            className="text-2xl font-mono font-bold text-primary mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            INITIALIZING...
          </motion.h1>
          <p className="text-sm font-mono text-primary/50">
            {isAuthLoading ? 'Authenticating...' : 'Loading system modules'}
          </p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated screen
  if (!isAuthenticated && !localStorage.getItem('auth_token')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ScanlineOverlay />
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-mono font-bold text-primary mb-4">
            THE GLITCH HACKER
          </h1>
          <p className="text-sm font-mono text-primary/70 mb-8">
            Access denied. Please open this app through Telegram.
          </p>
          {import.meta.env.DEV && (
            <button
              onClick={async () => {
                await devAutoLogin();
              }}
              className="px-4 py-2 bg-primary/20 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/30 transition-colors"
            >
              [DEV] Auto Login
            </button>
          )}
          {telegramUser && (
            <div className="text-xs font-mono text-primary/50">
              User: {telegramUser.username || telegramUser.first_name}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <WebAppProvider>
      <div className="min-h-screen bg-background text-primary font-mono">
        <ScanlineOverlay />
        
        {/* Header */}
        <Header />

        {/* Main content */}
        <main className="max-w-md mx-auto px-4 pt-4 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom navigation */}
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />
      </div>
    </WebAppProvider>
  );
}

export default App;
