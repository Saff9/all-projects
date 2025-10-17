'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { formatNumber, formatWithCommas, formatDate, formatCountdown } from '../../utils/format';

// ==========================================
// Types
// ==========================================

export interface Airdrop {
  id: string;
  name: string;
  description: string;
  tokenName: string;
  tokenSymbol: string;
  logoUrl?: string;
  totalSupply: number;
  allocatedAmount: number;
  claimedAmount: number;
  startDate: string | Date;
  endDate: string | Date;
  status: 'upcoming' | 'active' | 'ended' | 'claimed';
  eligibility?: {
    isEligible: boolean;
    reason?: string;
    allocatedTokens: number;
    claimedTokens: number;
  };
  requirements?: string[];
}

// ==========================================
// Airdrop Card Component
// ==========================================

export interface AirdropCardProps {
  airdrop: Airdrop;
  onClaim?: () => void;
  onCheckEligibility?: () => void;
  isClaiming?: boolean;
  className?: string;
}

export const AirdropCard: React.FC<AirdropCardProps> = ({
  airdrop,
  onClaim,
  onCheckEligibility,
  isClaiming = false,
  className,
}) => {
  const now = new Date();
  const startDate = new Date(airdrop.startDate);
  const endDate = new Date(airdrop.endDate);
  const isActive = airdrop.status === 'active' || (now >= startDate && now <= endDate);
  const isUpcoming = airdrop.status === 'upcoming' || now < startDate;
  const isEnded = airdrop.status === 'ended' || now > endDate;

  const progressPercentage = (airdrop.claimedAmount / airdrop.allocatedAmount) * 100;
  const timeRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / 1000));

  const getStatusBadge = () => {
    if (airdrop.eligibility?.claimedTokens && airdrop.eligibility.claimedTokens > 0) {
      return <Badge variant="success">Claimed</Badge>;
    }
    if (isEnded) {
      return <Badge variant="default">Ended</Badge>;
    }
    if (isUpcoming) {
      return <Badge variant="warning">Upcoming</Badge>;
    }
    if (isActive) {
      return <Badge variant="success">Active</Badge>;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        clsx(
          'relative overflow-hidden rounded-2xl',
          'bg-gradient-to-br from-slate-800 to-slate-900',
          'border border-white/10',
          className
        )
      )}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
            {airdrop.logoUrl ? (
              <img
                src={airdrop.logoUrl}
                alt={airdrop.tokenName}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span>🎁</span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold">{airdrop.name}</h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-400">{airdrop.tokenName} ({airdrop.tokenSymbol})</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-2">
        <p className="text-sm text-gray-400">{airdrop.description}</p>
      </div>

      {/* Progress */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">Claimed</span>
          <span className="text-gray-400">
            {formatNumber(airdrop.claimedAmount)} / {formatNumber(airdrop.allocatedAmount)}
          </span>
        </div>
        <ProgressBar value={progressPercentage} size="sm" />
      </div>

      {/* Eligibility Status */}
      {airdrop.eligibility && (
        <div className="px-4 pb-2">
          <div
            className={twMerge(
              clsx(
                'p-3 rounded-lg',
                airdrop.eligibility.isEligible
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-slate-800/50 border border-white/5'
              )
            )}
          >
            {airdrop.eligibility.isEligible ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-400">You're eligible!</p>
                  <p className="text-xs text-gray-400">
                    Allocation: {formatNumber(airdrop.eligibility.allocatedTokens)} {airdrop.tokenSymbol}
                  </p>
                </div>
                {airdrop.eligibility.claimedTokens > 0 ? (
                  <span className="text-xs text-green-400">✓ Claimed</span>
                ) : (
                  <span className="text-xs text-yellow-400">Unclaimed</span>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-400">
                  {airdrop.eligibility.reason || 'Not eligible'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Info */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Start: {formatDate(startDate)}</span>
          {isActive && <span>Ends in: {formatCountdown(timeRemaining)}</span>}
          {isUpcoming && <span>Starts: {formatDate(startDate)}</span>}
          {isEnded && <span>Ended: {formatDate(endDate)}</span>}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 pt-2">
        {isActive && airdrop.eligibility?.isEligible && airdrop.eligibility.claimedTokens === 0 && (
          <Button
            variant="primary"
            fullWidth
            onClick={onClaim}
            isLoading={isClaiming}
          >
            Claim {formatNumber(airdrop.eligibility.allocatedTokens)} {airdrop.tokenSymbol}
          </Button>
        )}
        {isActive && !airdrop.eligibility && (
          <Button
            variant="secondary"
            fullWidth
            onClick={onCheckEligibility}
          >
            Check Eligibility
          </Button>
        )}
        {airdrop.eligibility?.claimedTokens && airdrop.eligibility.claimedTokens > 0 && (
          <div className="text-center text-sm text-green-400">
            ✓ You claimed {formatNumber(airdrop.eligibility.claimedTokens)} {airdrop.tokenSymbol}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ==========================================
// Airdrop List Component
// ==========================================

export interface AirdropListProps {
  airdrops: Airdrop[];
  onClaim?: (airdrop: Airdrop) => void;
  onCheckEligibility?: (airdrop: Airdrop) => void;
  claimingId?: string | null;
  className?: string;
}

export const AirdropList: React.FC<AirdropListProps> = ({
  airdrops,
  onClaim,
  onCheckEligibility,
  claimingId,
  className,
}) => {
  if (airdrops.length === 0) {
    return (
      <div className={twMerge(clsx('text-center py-8', className))}>
        <span className="text-4xl mb-2 block">🎁</span>
        <p className="text-gray-400">No airdrops available</p>
      </div>
    );
  }

  return (
    <div className={twMerge(clsx('space-y-4', className))}>
      {airdrops.map((airdrop) => (
        <AirdropCard
          key={airdrop.id}
          airdrop={airdrop}
          onClaim={() => onClaim?.(airdrop)}
          onCheckEligibility={() => onCheckEligibility?.(airdrop)}
          isClaiming={claimingId === airdrop.id}
        />
      ))}
    </div>
  );
};

// ==========================================
// Eligibility Check Component
// ==========================================

export interface EligibilityCheckProps {
  airdrop: Airdrop;
  onCheck: () => void;
  isLoading?: boolean;
  className?: string;
}

export const EligibilityCheck: React.FC<EligibilityCheckProps> = ({
  airdrop,
  onCheck,
  isLoading = false,
  className,
}) => {
  return (
    <Card variant="glass" className={twMerge(clsx('p-4', className))}>
      <div className="text-center">
        <span className="text-4xl mb-2 block">🔍</span>
        <h3 className="font-bold mb-2">Check Your Eligibility</h3>
        <p className="text-sm text-gray-400 mb-4">
          Verify if you're eligible for the {airdrop.name} airdrop
        </p>
        <Button
          variant="primary"
          onClick={onCheck}
          isLoading={isLoading}
        >
          Check Eligibility
        </Button>
      </div>
    </Card>
  );
};

// ==========================================
// Airdrop Summary Component
// ==========================================

export interface AirdropSummaryProps {
  totalAirdrops: number;
  activeAirdrops: number;
  totalClaimed: number;
  totalPending: number;
  className?: string;
}

export const AirdropSummary: React.FC<AirdropSummaryProps> = ({
  totalAirdrops,
  activeAirdrops,
  totalClaimed,
  totalPending,
  className,
}) => {
  return (
    <Card variant="glass" className={twMerge(clsx('p-4', className))}>
      <h3 className="font-semibold mb-3">Airdrop Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-lg bg-slate-800/30">
          <p className="text-2xl font-bold text-white">{totalAirdrops}</p>
          <p className="text-xs text-gray-400">Total Airdrops</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-800/30">
          <p className="text-2xl font-bold text-green-400">{activeAirdrops}</p>
          <p className="text-xs text-gray-400">Active</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-800/30">
          <p className="text-2xl font-bold text-yellow-400">{formatNumber(totalClaimed)}</p>
          <p className="text-xs text-gray-400">Claimed</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-800/30">
          <p className="text-2xl font-bold text-purple-400">{formatNumber(totalPending)}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
      </div>
    </Card>
  );
};

export default AirdropCard;