import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Zap, Activity, Clock, Download } from 'lucide-react';
import ExecuteButton from '../game/ExecuteButton';
import Card from '../ui/Card';
import StatDisplay from '../ui/StatDisplay';
import GlitchText from '../ui/GlitchText';
import Button from '../ui/Button';

// Hooks
import { useTelegram } from '../../hooks/useTelegram';

// Stores
import useUserStore from '../../stores/userStore';
import useClickerStore from '../../stores/clickerStore';

const TerminalScreen = () => {
  const [activityLog, setActivityLog] = useState([
    { id: 1, text: 'System initialized...', time: '09:42:15', type: 'info' },
    { id: 2, text: 'Connected to node ASIA-1', time: '09:42:16', type: 'success' },
    { id: 3, text: 'Botnet mining started', time: '09:42:17', type: 'info' },
  ]);

  // Telegram hook for haptic feedback
  const { hapticImpact, hapticNotification } = useTelegram();

  // Stores
  const { 
    balance, 
    botnets, 
    passiveIncome: userPassiveIncome,
  } = useUserStore();

  const {
    energy,
    maxEnergy,
    clickPower,
    accumulatedPassive,
    click,
    collectPassive,
    isLoading,
  } = useClickerStore();

  // Handle execute/click
  const handleExecute = useCallback(async () => {
    if (energy < 1) {
      hapticNotification('error');
      return;
    }

    // Call API through store
    const result = await click();

    if (result.success) {
      // Haptic feedback
      hapticImpact('light');

      // Add to activity log
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      setActivityLog(prev => [
        { 
          id: Date.now(), 
          text: `Mined ${result.earned} $BITZ (Power: ${clickPower})`, 
          time: timeStr, 
          type: 'success' 
        },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    } else {
      hapticNotification('error');
      
      // Add error to log
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      setActivityLog(prev => [
        { 
          id: Date.now(), 
          text: result.error || 'Click failed', 
          time: timeStr, 
          type: 'error' 
        },
        ...prev.slice(0, 9),
      ]);
    }
  }, [energy, click, clickPower, hapticImpact, hapticNotification]);

  // Handle collect passive income
  const handleCollectPassive = useCallback(async () => {
    if (accumulatedPassive < 1) return;

    const result = await collectPassive();

    if (result.success) {
      hapticNotification('success');
      
      // Add to activity log
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      
      setActivityLog(prev => [
        { 
          id: Date.now(), 
          text: `Collected ${Math.floor(result.collected)} $BITZ from botnets`, 
          time: timeStr, 
          type: 'success' 
        },
        ...prev.slice(0, 9),
      ]);
    }
  }, [accumulatedPassive, collectPassive, hapticNotification]);

  // Auto-scroll activity log effect for passive income
  useEffect(() => {
    const interval = setInterval(() => {
      if (userPassiveIncome > 0 && Math.random() > 0.8) {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setActivityLog(prev => [
          { 
            id: Date.now(), 
            text: `Botnet generated passive income`, 
            time: timeStr, 
            type: 'info' 
          },
          ...prev.slice(0, 9),
        ]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [userPassiveIncome]);

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-primary';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-alert';
      default: return 'text-primary/70';
    }
  };

  // Check if can click
  const canClick = energy >= 1 && !isLoading;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatDisplay
          label="Current Balance"
          value={Math.floor(balance)}
          icon={Zap}
          suffix="$BITZ"
          size="md"
        />
        <StatDisplay
          label="Passive Income"
          value={userPassiveIncome.toFixed(1)}
          icon={Cpu}
          suffix="/sec"
          size="md"
        />
      </div>

      {/* Execute button section */}
      <Card className="py-8">
        <div className="flex flex-col items-center">
          <p className="text-xs text-primary/50 font-mono uppercase tracking-wider mb-4">
            Click to mine $BITZ
          </p>
          <ExecuteButton
            onExecute={handleExecute}
            disabled={!canClick}
            energy={energy}
            maxEnergy={maxEnergy}
          />
          <div className="flex items-center gap-4 mt-4 text-xs text-primary/40 font-mono">
            <span>Energy cost: 1 per click</span>
            <span>|</span>
            <span>Power: {clickPower}</span>
          </div>
        </div>
      </Card>

      {/* Passive income collection */}
      {accumulatedPassive > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-primary/50 font-mono uppercase">Unclaimed Income</p>
              <p className="text-xl font-mono font-bold text-primary">
                {Math.floor(accumulatedPassive)} $BITZ
              </p>
            </div>
            <Button
              onClick={handleCollectPassive}
              disabled={accumulatedPassive < 1}
              icon={Download}
              variant="primary"
              size="sm"
            >
              Collect
            </Button>
          </div>
        </Card>
      )}

      {/* Botnet summary */}
      {botnets && botnets.length > 0 && (
        <Card title="Active Botnets" icon={Cpu}>
          <div className="space-y-2">
            {botnets.map((botnet, index) => (
              <motion.div
                key={botnet.id}
                className="flex items-center justify-between py-2 border-b border-primary/10 last:border-b-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="font-mono text-sm text-primary">{botnet.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm text-primary">
                    x{botnet.owned}
                  </span>
                  <span className="font-mono text-xs text-primary/50 ml-2">
                    +{(botnet.income * botnet.owned).toFixed(1)}/sec
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Activity log */}
      <Card title="Activity Log" icon={Activity}>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          <AnimatePresence initial={false}>
            {activityLog.map((entry, index) => (
              <motion.div
                key={entry.id}
                className="flex items-start gap-2 py-1 font-mono text-xs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="text-primary/40 whitespace-nowrap">[{entry.time}]</span>
                <span className={getLogColor(entry.type)}>
                  {entry.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* System status */}
      <div className="flex items-center justify-center gap-4 text-xs text-primary/40 font-mono">
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          ONLINE
        </span>
        <span>|</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          LATENCY: 12ms
        </span>
        <span>|</span>
        <span>NODE: ASIA-1</span>
      </div>
    </div>
  );
};

export default TerminalScreen;
