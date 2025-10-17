'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TapButton, TapEffect, ParticleEffect, CriticalHit } from './TapButton';
import { EnergyBar } from './EnergyBar';
import { Card } from '../common/Card';
import { useMining, useUser, useHaptics, useTelegram } from '../../hooks';
import { formatNumber, formatWithCommas } from '../../utils/format';
import { GAME_CONFIG } from '../../utils/constants';

// ==========================================
// Types
// ==========================================

interface TapEffectData {
  id: number;
  x: number;
  y: number;
  value: number;
  isCritical: boolean;
}

interface ParticleData {
  id: number;
  x: number;
  y: number;
  color: string;
}

// ==========================================
// Component
// ==========================================

export const MiningScreen: React.FC = () => {
  const {
    stats: miningStats,
    localEnergy,
    localCombo,
    comboMultiplier,
    isMining,
    tap,
    startMining,
    energyPercentage,
  } = useMining();
  
  const { stats } = useUser();
  const haptic = useHaptics();
  const { haptic: telegramHaptic } = useTelegram();
  
  const [tapEffects, setTapEffects] = useState<TapEffectData[]>([]);
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [showCritical, setShowCritical] = useState(false);
  const [effectId, setEffectId] = useState(0);

  // Start mining session on mount
  useEffect(() => {
    startMining();
  }, [startMining]);

  // Handle tap
  const handleTap = useCallback(
    async (e: React.MouseEvent | React.TouchEvent) => {
      if (localEnergy <= 0) {
        haptic.error();
        return;
      }

      // Get tap position
      let x: number, y: number;
      if ('touches' in e) {
        const touch = e.touches[0];
        x = touch.clientX;
        y = touch.clientY;
      } else {
        x = e.clientX;
        y = e.clientY;
      }

      // Execute tap
      const result = await tap(x, y);
      if (!result) return;
      
      const isCritical = result.isCritical;
      const reward = result.coinsEarned * (result.comboMultiplier || 1);

      // Haptic feedback
      if (isCritical) {
        haptic.heavy();
        setShowCritical(true);
      } else {
        haptic.tap();
      }

      // Add tap effect
      const newEffect: TapEffectData = {
        id: effectId,
        x: x - 20,
        y: y - 20,
        value: reward,
        isCritical,
      };
      setTapEffects((prev) => [...prev, newEffect]);
      setEffectId((prev) => prev + 1);

      // Add particles
      const colors = ['#A855F7', '#3B82F6', '#F59E0B', '#10B981'];
      for (let i = 0; i < 5; i++) {
        const particle: ParticleData = {
          id: effectId + i,
          x,
          y,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
        setParticles((prev) => [...prev, particle]);
      }

      // Clean up effects after animation
      setTimeout(() => {
        setTapEffects((prev) => prev.filter((e) => e.id !== newEffect.id));
        setParticles((prev) => prev.filter((p) => p.id < effectId + 5));
      }, 1000);
    },
    [localEnergy, tap, haptic, effectId]
  );

  // Handle critical hit complete
  const handleCriticalComplete = useCallback(() => {
    setShowCritical(false);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Stats Display */}
      <div className="w-full max-w-sm mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            {formatWithCommas(stats?.totalTokens || 0)} 💎
          </h2>
          <p className="text-sm text-gray-400">
            Total Mined
          </p>
        </motion.div>

        {/* Combo Indicator */}
        {localCombo > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <span className="font-bold text-yellow-400">
                {localCombo}x Combo! ({comboMultiplier.toFixed(1)}x)
              </span>
            </span>
          </motion.div>
        )}

        {/* Energy Bar */}
        <EnergyBar
          current={localEnergy}
          max={miningStats?.maxEnergy || 1000}
          className="mb-4"
        />
      </div>

      {/* Tap Button Container */}
      <div className="relative">
        {/* Tap Effects */}
        <AnimatePresence>
          {tapEffects.map((effect) => (
            <TapEffect key={effect.id} {...effect} />
          ))}
        </AnimatePresence>

        {/* Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <ParticleEffect key={particle.id} {...particle} />
          ))}
        </AnimatePresence>

        {/* Critical Hit Animation */}
        <CriticalHit show={showCritical} onComplete={handleCriticalComplete} />

        {/* Tap Button */}
        <motion.div
          onClick={handleTap}
          className="cursor-pointer"
        >
          <TapButton
            onTap={() => {}}
            disabled={localEnergy <= 0}
            size="xl"
          >
            <div className="flex flex-col items-center">
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl"
              >
                ⚡
              </motion.span>
              <span className="text-sm font-bold text-white/80 mt-2">TAP</span>
            </div>
          </TapButton>
        </motion.div>
      </div>

      {/* Mining Stats */}
      <div className="w-full max-w-sm mt-8">
        <Card variant="glass" className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Per Tap</p>
              <p className="font-bold text-purple-400">
                +{formatNumber(stats?.tokensPerTap || 1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total Taps</p>
              <p className="font-bold text-blue-400">
                {formatNumber(stats?.totalTaps || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Level</p>
              <p className="font-bold text-yellow-400">
                {stats?.level || 1}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Low Energy Warning */}
      {localEnergy <= 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <Card variant="glass" className="p-4 text-center border-red-500/30">
            <p className="text-red-400 font-semibold">
              ⚠️ Out of Energy!
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Wait for energy to regenerate or use an energy boost
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// ==========================================
// Mining Stats Component
// ==========================================

export interface MiningStatsProps {
  stats: {
    totalTokens: number;
    totalTaps: number;
    tokensPerTap: number;
    level: number;
    criticalChance: number;
  };
  className?: string;
}

export const MiningStats: React.FC<MiningStatsProps> = ({ stats, className }) => {
  return (
    <Card variant="glass" className={twMerge(clsx('p-4', className))}>
      <h3 className="text-sm font-semibold text-gray-400 mb-3">Mining Stats</h3>
      <div className="space-y-3">
        <StatRow label="Total Mined" value={`${formatWithCommas(stats.totalTokens)} 💎`} />
        <StatRow label="Total Taps" value={formatNumber(stats.totalTaps)} />
        <StatRow label="Per Tap" value={`+${stats.tokensPerTap}`} />
        <StatRow label="Critical Chance" value={`${(stats.criticalChance * 100).toFixed(1)}%`} />
      </div>
    </Card>
  );
};

// ==========================================
// Stat Row Helper
// ==========================================

const StatRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

export default MiningScreen;