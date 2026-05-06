import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Crosshair, Shield, Clock, Zap, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import TargetCard from '../game/TargetCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import GlitchText from '../ui/GlitchText';
import Modal from '../ui/Modal';

// Hooks
import { useTelegram } from '../../hooks/useTelegram';

// Stores
import useUserStore from '../../stores/userStore';
import usePVPStore from '../../stores/pvpStore';

const PVPScreen = () => {
  const [hackResult, setHackResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Telegram hook
  const { hapticImpact, hapticNotification } = useTelegram();

  // Stores
  const { 
    balance, 
    updateBalance,
    pvp: userPvp,
  } = useUserStore();

  const {
    targets,
    currentTarget,
    cooldownRemaining,
    scan,
    hack,
    fetchCooldown,
    selectTarget,
    isScanning,
    isHacking,
  } = usePVPStore();

  // Fetch cooldown on mount
  useEffect(() => {
    const initialize = async () => {
      await fetchCooldown();
      setIsInitialized(true);
    };
    initialize();
  }, [fetchCooldown]);

  const handleScan = async () => {
    if (balance < 50) {
      hapticNotification('error');
      return;
    }

    hapticImpact('medium');
    const result = await scan();

    if (result.success) {
      // Update local balance
      updateBalance(-result.cost);
      hapticNotification('success');
    } else {
      hapticNotification('error');
    }
  };

  const handleHack = async (targetId) => {
    hapticImpact('heavy');
    const result = await hack(targetId);

    if (result.success !== undefined) {
      setHackResult({
        success: result.success,
        target: result.target?.username || 'Unknown',
        stolen: result.stolen || 0,
        success_rate: result.success_rate,
        message: result.success
          ? `Successfully extracted ${result.stolen} $BITZ from ${result.target?.username}`
          : `Hack failed! ${result.target?.username}'s firewall blocked your attack.`,
      });
      
      setShowResultModal(true);
      
      if (result.success && result.stolen > 0) {
        updateBalance(result.stolen);
        hapticNotification('success');
      } else {
        hapticNotification('error');
      }
    }
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setHackResult(null);
    if (hackResult?.success) {
      selectTarget(null); // Clear target on success
    }
  };

  const handleSelectTarget = (target) => {
    selectTarget(target);
    hapticImpact('light');
  };

  // Calculate cooldown seconds for display
  const cooldownSeconds = Math.ceil(cooldownRemaining / 1000);
  const canAffordScan = balance >= 50;
  const scanCost = 50;

  // Loading state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <GlitchText text="NETWORK PVP" size="2xl" color="primary" />
        <p className="text-xs text-primary/50 font-mono mt-1">
          Scan for targets and hack other players
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-xs text-primary/50 font-mono uppercase">Your Virus</p>
          <p className="font-mono text-2xl font-bold text-primary">
            Lv.{userPvp?.virusLevel || 1}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-primary/50 font-mono uppercase">Scan Cost</p>
          <p className={`font-mono text-2xl font-bold ${canAffordScan ? 'text-primary' : 'text-alert'}`}>
            {scanCost} $BITZ
          </p>
        </Card>
      </div>

      {/* Scan button */}
      <Button
        variant="primary"
        size="lg"
        disabled={!canAffordScan || cooldownRemaining > 0 || isScanning}
        onClick={handleScan}
        className="w-full"
      >
        <span className="flex items-center justify-center gap-3">
          {isScanning ? (
            <motion.div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : cooldownRemaining > 0 ? (
            <Clock className="w-5 h-5" />
          ) : (
            <Crosshair className="w-5 h-5" />
          )}
          <span>
            {isScanning 
              ? 'SCANNING...' 
              : cooldownRemaining > 0 
                ? `COOLDOWN (${cooldownSeconds}s)` 
                : 'SCAN NETWORK'
            }
          </span>
        </span>
      </Button>

      {/* Targets display */}
      {targets.length > 0 && !currentTarget && (
        <Card title="Select Target" icon={Network}>
          <div className="space-y-3">
            {targets.map((target, index) => (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-surface-light/50 rounded border border-primary/10 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => handleSelectTarget(target)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-primary font-semibold">
                      @{target.username}
                    </p>
                    <p className="text-xs text-primary/50 font-mono">
                      Firewall Lv.{target.firewall?.level || 1}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary/50 font-mono">Est. Loot</p>
                    <p className="font-mono text-sm text-primary">
                      {target.estimatedLoot?.toLocaleString()} $BITZ
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Selected Target display */}
      <AnimatePresence mode="wait">
        <TargetCard
          target={currentTarget}
          isScanning={isScanning}
          isHacking={isHacking}
          canAfford={balance >= 50}
          onHack={() => currentTarget && handleHack(currentTarget.id)}
        />
      </AnimatePresence>

      {/* PVP Info */}
      <Card title="PVP Rules" icon={Shield}>
        <div className="space-y-2 text-xs text-primary/70 font-mono">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
            <p>Scanning costs {scanCost} $BITZ per attempt</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
            <p>5 second cooldown between scans</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
            <p>Success rate depends on your virus vs target firewall</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5" />
            <p>Steal up to 10% of target's balance on success</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-alert rounded-full mt-1.5" />
            <p>Failed hacks cost {scanCost} $BITZ with no reward</p>
          </div>
        </div>
      </Card>

      {/* Hack result modal */}
      <Modal
        isOpen={showResultModal}
        onClose={closeResultModal}
        title={hackResult?.success ? 'HACK SUCCESSFUL' : 'HACK FAILED'}
      >
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="mb-4"
          >
            {hackResult?.success ? (
              <CheckCircle className="w-16 h-16 mx-auto text-primary" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto text-alert" />
            )}
          </motion.div>
          
          <p className="font-mono text-lg text-primary mb-2">
            {hackResult?.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
          </p>
          
          <p className="font-mono text-sm text-primary/70 mb-4">
            {hackResult?.message}
          </p>

          {hackResult?.success && (
            <motion.div
              className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs text-primary/50 font-mono uppercase">Stolen</p>
              <p className="font-mono text-2xl font-bold text-primary">
                +{hackResult.stolen?.toLocaleString()} $BITZ
              </p>
            </motion.div>
          )}

          <Button
            variant={hackResult?.success ? 'primary' : 'ghost'}
            size="md"
            onClick={closeResultModal}
            className="w-full"
          >
            {hackResult?.success ? 'EXCELLENT' : 'TRY AGAIN'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default PVPScreen;
