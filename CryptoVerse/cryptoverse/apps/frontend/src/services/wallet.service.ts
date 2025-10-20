import { api } from './api';
import { Wallet } from '@cryptoverse/shared';

// ==========================================
// Types
// ==========================================

export interface WalletBalance {
  coins: number;
  staked: number;
  pendingRewards: number;
  totalEarned: number;
}

export interface Transaction {
  id: string;
  type: 'tap' | 'transfer' | 'stake' | 'unstake' | 'reward' | 'referral' | 'achievement' | 'quest' | 'airdrop' | 'earn' | 'spend';
  amount: number;
  description: string;
  status?: 'pending' | 'completed' | 'failed';
  fromUserId?: string;
  toUserId?: string;
  fromAddress?: string;
  toAddress?: string;
  createdAt: Date;
}

export interface TransactionHistory {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransferData {
  recipientId: string;
  amount: number;
}

export interface StakeData {
  amount: number;
  duration: number; // in days
}

export interface UnstakeData {
  stakeId: string;
}

export interface ConnectWalletData {
  address: string;
  network: string;
  signature?: string;
}

export interface StakeInfo {
  id: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  apy: number;
  rewards: number;
  isActive: boolean;
}

// ==========================================
// Wallet Service
// ==========================================

export const walletService = {
  /**
   * Get wallet balance
   */
  getBalance: async (): Promise<WalletBalance> => {
    return api.get<WalletBalance>('/wallet/balance');
  },

  /**
   * Transfer tokens to another user
   */
  transfer: async (data: TransferData): Promise<Transaction> => {
    return api.post<Transaction>('/wallet/transfer', data);
  },

  /**
   * Stake tokens
   */
  stake: async (data: StakeData): Promise<StakeInfo> => {
    return api.post<StakeInfo>('/wallet/stake', data);
  },

  /**
   * Unstake tokens
   */
  unstake: async (data: UnstakeData): Promise<Transaction> => {
    return api.post<Transaction>('/wallet/unstake', data);
  },

  /**
   * Get transaction history
   */
  getTransactions: async (
    page: number = 1,
    limit: number = 20,
    type?: string
  ): Promise<TransactionHistory> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (type) params.append('type', type);
    
    return api.get<TransactionHistory>(`/wallet/transactions?${params.toString()}`);
  },

  /**
   * Connect external wallet
   */
  connectWallet: async (data: ConnectWalletData): Promise<Wallet> => {
    return api.post<Wallet>('/wallet/connect', data);
  },

  /**
   * Get connected wallets
   */
  getWallets: async (): Promise<Wallet[]> => {
    return api.get<Wallet[]>('/wallet/connected');
  },

  /**
   * Disconnect wallet
   */
  disconnectWallet: async (walletId: string): Promise<void> => {
    return api.delete(`/wallet/${walletId}`);
  },
};

export default walletService;