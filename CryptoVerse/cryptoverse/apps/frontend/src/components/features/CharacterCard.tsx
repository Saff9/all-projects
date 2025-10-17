'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { RARITY_COLORS, MAX_CHARACTER_LEVEL } from '../../utils/constants';
import { formatNumber } from '../../utils/format';
import { CharacterWithProgress, CharacterAbility } from '../../services';

// ==========================================
// Types
// ==========================================

// Re-export CharacterWithProgress as Character for backward compatibility
export type Character = CharacterWithProgress;

export interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
  onUpgrade?: () => void;
  compact?: boolean;
  showUpgrade?: boolean;
  isUpgrading?: boolean;
  className?: string;
}

// ==========================================
// Component
// ==========================================

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  onClick,
  onUpgrade,
  compact = false,
  showUpgrade = false,
  isUpgrading = false,
  className,
}) => {
  const rarityColor = RARITY_COLORS[character.rarity] || RARITY_COLORS.common;
  const levelProgress = ((character.level ?? 1) / (character.maxLevel || MAX_CHARACTER_LEVEL)) * 100;

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={twMerge(
          clsx(
            'relative p-3 rounded-xl cursor-pointer',
            'bg-slate-800/50 border border-white/10',
            'hover:border-purple-500/50 transition-colors',
            !character.owned && 'opacity-50',
            className
          )
        )}
      >
        {/* Character Icon */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-2"
          style={{ backgroundColor: `${rarityColor}20` }}
        >
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span>🦸</span>
          )}
        </div>

        {/* Name & Level */}
        <p className="font-semibold text-sm truncate">{character.name}</p>
        <p className="text-xs text-gray-400">Lv. {character.level}</p>

        {/* Rarity indicator */}
        <div
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{ backgroundColor: rarityColor }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={twMerge(
        clsx(
          'relative overflow-hidden rounded-2xl cursor-pointer',
          'bg-gradient-to-br from-slate-800 to-slate-900',
          'border-2 transition-all duration-300',
          character.owned ? 'hover:shadow-lg' : 'opacity-60 grayscale',
          className
        )
      )}
      style={{
        borderColor: character.owned ? `${rarityColor}50` : 'rgba(255,255,255,0.1)',
        boxShadow: character.owned ? `0 0 30px ${rarityColor}20` : undefined,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${rarityColor} 0%, transparent 50%)`,
        }}
      />

      {/* Header */}
      <div className="relative p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{character.name}</h3>
              <Badge
                variant="rarity"
                rarity={character.rarity}
                size="sm"
              />
            </div>
            {character.description && (
              <p className="text-xs text-gray-400 line-clamp-2">
                {character.description}
              </p>
            )}
          </div>

          {/* Character Image */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${rarityColor}20` }}
          >
            {character.imageUrl ? (
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span>🦸</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="relative px-4 pb-4">
        {/* Level Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">Level {character.level}</span>
            <span className="text-gray-400">
              Max: {character.maxLevel || MAX_CHARACTER_LEVEL}
            </span>
          </div>
          <ProgressBar
            value={levelProgress}
            color={rarityColor}
            size="sm"
          />
        </div>

        {/* Multiplier */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Multiplier</span>
          <span
            className="font-bold"
            style={{ color: rarityColor }}
          >
            {(character.currentMultiplier ?? 1).toFixed(1)}x
          </span>
        </div>

        {/* Upgrade Button */}
        {showUpgrade && character.owned && (character.level ?? 1) < (character.maxLevel || MAX_CHARACTER_LEVEL) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onUpgrade?.();
            }}
            disabled={isUpgrading}
            className={twMerge(
              clsx(
                'w-full py-2 px-4 rounded-lg font-semibold text-sm',
                'bg-gradient-to-r from-purple-500 to-blue-500',
                'hover:from-purple-600 hover:to-blue-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-200'
              )
            )}
          >
            {isUpgrading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⏳
                </motion.span>
                Upgrading...
              </span>
            ) : (
              <span>Upgrade • {formatNumber(character.upgradeCost || 0)} 💎</span>
            )}
          </motion.button>
        )}

        {/* Locked indicator */}
        {!character.owned && (
          <div className="text-center py-2">
            <span className="text-sm text-gray-400">
              {character.unlocked ? '🔒 Not Owned' : `🔒 ${character.unlockCondition || 'Locked'}`}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ==========================================
// Character Grid Component
// ==========================================

export interface CharacterGridProps {
  characters: Character[];
  onCharacterClick?: (character: Character) => void;
  onUpgrade?: (character: Character) => void;
  upgradingId?: string | null;
  compact?: boolean;
  showUpgrade?: boolean;
  className?: string;
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  onCharacterClick,
  onUpgrade,
  upgradingId,
  compact = false,
  showUpgrade = false,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'grid gap-4',
          compact ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          className
        )
      )}
    >
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          onClick={() => onCharacterClick?.(character)}
          onUpgrade={() => onUpgrade?.(character)}
          compact={compact}
          showUpgrade={showUpgrade}
          isUpgrading={upgradingId === character.id}
        />
      ))}
    </div>
  );
};

// ==========================================
// Character Detail Modal Content
// ==========================================

export interface CharacterDetailProps {
  character: Character;
  onUpgrade?: () => void;
  isUpgrading?: boolean;
  className?: string;
}

export const CharacterDetail: React.FC<CharacterDetailProps> = ({
  character,
  onUpgrade,
  isUpgrading,
  className,
}) => {
  const rarityColor = RARITY_COLORS[character.rarity] || RARITY_COLORS.common;

  return (
    <div className={twMerge(clsx('p-4', className))}>
      {/* Character Header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ backgroundColor: `${rarityColor}20` }}
        >
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <span>🦸</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold">{character.name}</h2>
            <Badge variant="rarity" rarity={character.rarity} />
          </div>
          <p className="text-sm text-gray-400">Level {character.level}</p>
        </div>
      </div>

      {/* Description */}
      {character.description && (
        <p className="text-sm text-gray-300 mb-6">{character.description}</p>
      )}

      {/* Stats */}
      <Card variant="glass" className="p-4 mb-6">
        <h3 className="font-semibold mb-3">Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Multiplier</span>
            <span className="font-bold" style={{ color: rarityColor }}>
              {(character.currentMultiplier ?? 1).toFixed(1)}x
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Base Multiplier</span>
            <span>{(character.baseMultiplier ?? 1).toFixed(1)}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Level</span>
            <span>{character.level} / {character.maxLevel || MAX_CHARACTER_LEVEL}</span>
          </div>
        </div>
      </Card>

      {/* Abilities */}
      {character.abilities && character.abilities.length > 0 && (
        <Card variant="glass" className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Abilities</h3>
          <div className="space-y-3">
            {character.abilities.map((ability) => (
              <div
                key={ability.id}
                className="p-3 rounded-lg bg-slate-800/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{ability.name}</span>
                  <Badge
                    variant={ability.type === 'passive' ? 'default' : 'success'}
                    size="sm"
                  >
                    {ability.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400">{ability.description}</p>
                {ability.value !== undefined && (
                  <p className="text-xs text-purple-400 mt-1">
                    +{(ability.value * 100).toFixed(0)}% effect
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upgrade Button */}
      {character.owned && (character.level ?? 1) < (character.maxLevel || MAX_CHARACTER_LEVEL) && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUpgrade}
          disabled={isUpgrading}
          className={twMerge(
            clsx(
              'w-full py-3 px-6 rounded-xl font-bold',
              'bg-gradient-to-r from-purple-500 to-blue-500',
              'hover:from-purple-600 hover:to-blue-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )
          )}
        >
          {isUpgrading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                ⏳
              </motion.span>
              Upgrading...
            </span>
          ) : (
            <span>
              Upgrade to Level {(character.level ?? 1) + 1} • {formatNumber(character.upgradeCost || 0)} 💎
            </span>
          )}
        </motion.button>
      )}
    </div>
  );
};

export default CharacterCard;