import { motion } from 'framer-motion';
import { User, Shield, Zap, Crosshair, Lock, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import GlitchText from '../ui/GlitchText';

const TargetCard = ({
  target,
  onHack,
  canAfford = true,
  isScanning = false,
  disabled = false,
}) => {
  if (isScanning) {
    return (
      <motion.div
        className="bg-surface border border-primary/30 rounded-lg p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-primary/30 border-t-primary flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Crosshair className="w-8 h-8 text-primary/50" />
        </motion.div>
        <p className="font-mono text-primary animate-pulse">SCANNING NETWORK...</p>
        <p className="font-mono text-xs text-primary/50 mt-2">Searching for vulnerable targets</p>
      </motion.div>
    );
  }

  if (!target) {
    return (
      <motion.div
        className="bg-surface border border-primary/20 rounded-lg p-6 text-center opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
      >
        <Crosshair className="w-12 h-12 mx-auto mb-3 text-primary/30" />
        <p className="font-mono text-primary/50">NO TARGET SELECTED</p>
        <p className="font-mono text-xs text-primary/30 mt-2">Scan network to find targets</p>
      </motion.div>
    );
  }

  const { username, balance, firewallLevel, virusLevel, isOnline } = target;
  const hackCost = 50;
  const isDisabled = disabled || !canAfford;

  // Calculate success probability (mock logic)
  const successRate = Math.max(10, Math.min(90, 50 + (virusLevel - firewallLevel) * 10));

  return (
    <motion.div
      className="relative bg-surface border border-primary/50 rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Target found banner */}
      <motion.div
        className="bg-alert/20 border-b border-alert/30 px-4 py-2 flex items-center justify-center gap-2"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <AlertTriangle className="w-4 h-4 text-alert" />
        <span className="font-mono text-xs text-alert uppercase tracking-wider">
          Target Acquired
        </span>
      </motion.div>

      <div className="p-4">
        {/* Target header */}
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            className="relative w-16 h-16 rounded-full bg-surface-light border-2 border-primary/50 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <User className="w-8 h-8 text-primary" />
            {/* Online indicator */}
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-surface ${
              isOnline ? 'bg-primary' : 'bg-gray-500'
            }`} />
          </motion.div>

          <div className="flex-1">
            <GlitchText text={`@${username}`} size="lg" color="primary" />
            <div className="flex items-center gap-3 mt-1">
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                isOnline ? 'bg-primary/20 text-primary' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Target stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface-light/50 rounded-lg p-3 border border-primary/10">
            <div className="flex items-center gap-2 text-primary/60 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Balance</span>
            </div>
            <p className="font-mono font-bold text-primary">
              {balance.toLocaleString()} <span className="text-xs">$BITZ</span>
            </p>
          </div>

          <div className="bg-surface-light/50 rounded-lg p-3 border border-primary/10">
            <div className="flex items-center gap-2 text-primary/60 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Firewall</span>
            </div>
            <p className="font-mono font-bold text-primary">
              Lv.{firewallLevel}
            </p>
          </div>
        </div>

        {/* Success rate indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-mono text-primary/60 uppercase">Success Rate</span>
            <span className={`text-xs font-mono font-bold ${
              successRate >= 70 ? 'text-primary' : 
              successRate >= 40 ? 'text-yellow-500' : 'text-alert'
            }`}>
              {successRate}%
            </span>
          </div>
          <div className="h-2 bg-surface-light rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                successRate >= 70 ? 'bg-primary' : 
                successRate >= 40 ? 'bg-yellow-500' : 'bg-alert'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${successRate}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Hack button */}
        <Button
          variant="danger"
          size="lg"
          disabled={isDisabled}
          onClick={onHack}
          className="w-full"
        >
          <span className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <Crosshair className="w-5 h-5" />
              INITIATE HACK
            </span>
            <span className="text-sm">
              {hackCost} $BITZ
            </span>
          </span>
        </Button>

        {!canAfford && (
          <p className="text-xs text-alert text-center mt-2 font-mono">
            Insufficient funds for hack attempt
          </p>
        )}
      </div>

      {/* Corner decorations */}
      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
      <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
    </motion.div>
  );
};

export default TargetCard;
