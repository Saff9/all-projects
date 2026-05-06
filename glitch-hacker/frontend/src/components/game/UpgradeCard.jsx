import { motion } from 'framer-motion';
import { Cpu, Zap, TrendingUp, Lock } from 'lucide-react';
import Button from '../ui/Button';

const UpgradeCard = ({
  name,
  level,
  income,
  cost,
  owned = 0,
  maxOwned = null,
  canAfford = true,
  onBuy,
  icon: Icon = Cpu,
  disabled = false,
}) => {
  const isMaxed = maxOwned && owned >= maxOwned;
  const isDisabled = disabled || !canAfford || isMaxed;

  return (
    <motion.div
      className="relative bg-surface border border-primary/30 rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: 'rgba(0, 255, 65, 0.6)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Level badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-surface-light rounded text-xs font-mono text-primary/70">
        Lv.{level}
      </div>

      <div className="p-4">
        {/* Header with icon and name */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-6 h-6 text-primary" />
          </motion.div>
          
          <div>
            <h3 className="font-mono font-bold text-primary text-sm uppercase">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-primary/60">
              <TrendingUp className="w-3 h-3" />
              <span>+{income} $BITZ/sec</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between mb-4 py-2 border-y border-primary/10">
          <div className="text-center">
            <p className="text-[10px] text-primary/50 uppercase tracking-wider">Owned</p>
            <p className="font-mono font-bold text-primary">
              {owned}{maxOwned ? `/${maxOwned}` : ''}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-[10px] text-primary/50 uppercase tracking-wider">Income</p>
            <p className="font-mono font-bold text-primary">
              {(income * owned).toLocaleString()} <span className="text-xs text-primary/60">/sec</span>
            </p>
          </div>
        </div>

        {/* Buy button */}
        <Button
          variant={isMaxed ? 'ghost' : canAfford ? 'primary' : 'ghost'}
          size="md"
          disabled={isDisabled}
          onClick={onBuy}
          className="w-full"
        >
          {isMaxed ? (
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              MAXED OUT
            </span>
          ) : (
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                BUY
              </span>
              <span className={canAfford ? 'text-primary' : 'text-alert'}>
                {cost.toLocaleString()} $BITZ
              </span>
            </span>
          )}
        </Button>
      </div>

      {/* Corner decorations */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/50" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/50" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary/50" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/50" />

      {/* Progress indicator for owned items */}
      {owned > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-light">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: maxOwned ? `${(owned / maxOwned) * 100}%` : '100%' }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default UpgradeCard;
