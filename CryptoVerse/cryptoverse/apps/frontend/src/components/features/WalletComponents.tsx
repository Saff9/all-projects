'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useWallet } from '../../hooks';
import { formatNumber, formatWithCommas, formatRelativeTime, truncateAddress } from '../../utils/format';
import { TOKEN_SYMBOL, TRANSACTION_TYPES } from '../../utils/constants';

// ==========================================
// Types
// ==========================================

export interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'transfer' | 'reward' | 'stake' | 'unstake' | 'tap' | 'referral' | 'achievement' | 'quest' | 'airdrop';
  amount: number;
  description?: string;
  status?: 'pending' | 'completed' | 'failed';
  createdAt: string | Date;
  fromAddress?: string;
  toAddress?: string;
}

// ==========================================
// Wallet Balance Component
// ==========================================

export interface WalletBalanceProps {
  balance?: { coins: number; staked: number; pendingRewards: number; totalEarned: number } | null;
  pendingBalance?: number;
  stakedBalance?: number;
  className?: string;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({
  balance,
  pendingBalance = 0,
  stakedBalance = 0,
  className,
}) => {
  const coins = balance?.coins || 0;
  const pending = balance?.pendingRewards || pendingBalance;
  const staked = balance?.staked || stakedBalance;
  
  return (
    <Card variant="glass" className={twMerge(clsx('p-6', className))}>
      {/* Main Balance */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-400 mb-2">Available Balance</p>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center gap-2"
        >
          <span className="text-4xl">{'\u{1F48E}'}</span>
          <span className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {formatWithCommas(coins)}
          </span>
        </motion.div>
        <p className="text-sm text-gray-400 mt-1">{TOKEN_SYMBOL}</p>
      </div>

      {/* Additional Balances */}
      <div className="grid grid-cols-2 gap-4">
        {pending > 0 && (
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-xs text-gray-400 mb-1">Pending</p>
            <p className="font-semibold text-yellow-400">
              {formatNumber(pending)}
            </p>
          </div>
        )}
        {staked > 0 && (
          <div className="text-center p-3 rounded-lg bg-slate-800/50">
            <p className="text-xs text-gray-400 mb-1">Staked</p>
            <p className="font-semibold text-green-400">
              {formatNumber(staked)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

// ==========================================
// Transaction List Component
// ==========================================

export interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  className?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading = false,
  className,
}) => {
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'earn':
      case 'reward':
        return '\u{1F4B0}';
      case 'spend':
        return '\u{1F4B8}';
      case 'transfer':
        return '\u{21D7}';
      case 'stake':
        return '\u{1F512}';
      case 'unstake':
        return '\u{1F513}';
      default:
        return '\u{1F48E}';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'earn':
      case 'reward':
        return 'text-green-400';
      case 'spend':
        return 'text-red-400';
      case 'transfer':
        return 'text-blue-400';
      case 'stake':
        return 'text-purple-400';
      case 'unstake':
        return 'text-yellow-400';
      default:
        return 'text-white';
    }
  };

  if (isLoading) {
    return (
      <div className={twMerge(clsx('space-y-3', className))}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={twMerge(clsx('text-center py-8', className))}>
        <span className="text-4xl mb-2 block">{'\u{1F4ED}'}</span>
        <p className="text-gray-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className={twMerge(clsx('space-y-3', className))}>
      {transactions.map((tx, index) => (
        <motion.div
          key={tx.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-white/5"
        >
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center text-xl">
            {getTransactionIcon(tx.type)}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm capitalize">
              {tx.type}
            </p>
            {tx.description && (
              <p className="text-xs text-gray-400 truncate">
                {tx.description}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {formatRelativeTime(tx.createdAt)}
            </p>
          </div>

          {/* Amount */}
          <div className="text-right">
            <p className={twMerge(clsx('font-bold', getTransactionColor(tx.type)))}>
              {tx.type === 'spend' || tx.type === 'transfer' ? '-' : '+'}
              {formatNumber(tx.amount)}
            </p>
            {tx.status === 'pending' && (
              <span className="text-xs text-yellow-400">Pending</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ==========================================
// Transfer Form Component
// ==========================================

export interface TransferFormProps {
  onSubmit: (data: { toAddress: string; amount: number }) => void;
  maxAmount: number;
  isLoading?: boolean;
  className?: string;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  onSubmit,
  maxAmount,
  isLoading = false,
  className,
}) => {
  const [toAddress, setToAddress] = React.useState('');
  const [amount, setAmount] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      toAddress,
      amount: parseFloat(amount),
    });
  };

  const setMaxAmount = () => {
    setAmount(maxAmount.toString());
  };

  return (
    <form onSubmit={handleSubmit} className={twMerge(clsx('space-y-4', className))}>
      {/* Recipient Address */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Recipient Address
        </label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Amount */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-gray-400">Amount</label>
          <button
            type="button"
            onClick={setMaxAmount}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            Max: {formatNumber(maxAmount)}
          </button>
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            max={maxAmount}
            min={0}
            step="any"
            className="w-full px-4 py-3 pr-16 rounded-xl bg-slate-800/50 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
            required
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {TOKEN_SYMBOL}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        disabled={!toAddress || !amount || parseFloat(amount) > maxAmount}
      >
        Transfer
      </Button>
    </form>
  );
};

// ==========================================
// Stake Panel Component
// ==========================================

export interface StakePanelProps {
  stakedAmount: number;
  availableBalance: number;
  apy: number;
  onStake: (amount: number) => void;
  onUnstake: (amount: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const StakePanel: React.FC<StakePanelProps> = ({
  stakedAmount,
  availableBalance,
  apy,
  onStake,
  onUnstake,
  isLoading = false,
  className,
}) => {
  const [amount, setAmount] = React.useState('');
  const [mode, setMode] = React.useState<'stake' | 'unstake'>('stake');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (mode === 'stake') {
      onStake(numAmount);
    } else {
      onUnstake(numAmount);
    }
  };

  const maxAmount = mode === 'stake' ? availableBalance : stakedAmount;

  return (
    <Card variant="glass" className={twMerge(clsx('p-4', className))}>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('stake')}
          className={twMerge(
            clsx(
              'flex-1 py-2 rounded-lg font-semibold text-sm transition-colors',
              mode === 'stake'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800/50 text-gray-400'
            )
          )}
        >
          Stake
        </button>
        <button
          onClick={() => setMode('unstake')}
          className={twMerge(
            clsx(
              'flex-1 py-2 rounded-lg font-semibold text-sm transition-colors',
              mode === 'unstake'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800/50 text-gray-400'
            )
          )}
        >
          Unstake
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-slate-800/30">
          <p className="text-xs text-gray-400 mb-1">Staked</p>
          <p className="font-bold text-green-400">{formatNumber(stakedAmount)}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-800/30">
          <p className="text-xs text-gray-400 mb-1">APY</p>
          <p className="font-bold text-purple-400">{apy}%</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">Amount</label>
            <button
              type="button"
              onClick={() => setAmount(maxAmount.toString())}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Max: {formatNumber(maxAmount)}
            </button>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            max={maxAmount}
            min={0}
            step="any"
            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 focus:border-purple-500 focus:outline-none transition-colors"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          disabled={!amount || parseFloat(amount) > maxAmount}
        >
          {mode === 'stake' ? 'Stake' : 'Unstake'}
        </Button>
      </form>
    </Card>
  );
};

export default WalletBalance;