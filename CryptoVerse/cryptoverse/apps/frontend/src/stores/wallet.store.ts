import { create } from 'zustand';
import { Wallet } from '@cryptoverse/shared';
import {
  walletService,
  WalletBalance,
  Transaction,
  TransferData,
  StakeData,
  UnstakeData,
  ConnectWalletData,
  StakeInfo,
} from '../services';

// ==========================================
// Types
// ==========================================

interface WalletState {
  balance: WalletBalance | null;
  transactions: Transaction[];
  connectedWallets: Wallet[];
  stakes: StakeInfo[];
  isLoading: boolean;
  isTransferring: boolean;
  isStaking: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface WalletActions {
  fetchBalance: () => Promise<void>;
  fetchTransactions: (page?: number, limit?: number, type?: string) => Promise<void>;
  fetchConnectedWallets: () => Promise<void>;
  transfer: (data: TransferData) => Promise<Transaction>;
  stake: (data: StakeData) => Promise<StakeInfo>;
  unstake: (data: UnstakeData) => Promise<Transaction>;
  connectWallet: (data: ConnectWalletData) => Promise<Wallet>;
  disconnectWallet: (walletId: string) => Promise<void>;
  updateBalance: (coins: number) => void;
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type WalletStore = WalletState & WalletActions;

// ==========================================
// Initial State
// ==========================================

const initialState: WalletState = {
  balance: null,
  transactions: [],
  connectedWallets: [],
  stakes: [],
  isLoading: false,
  isTransferring: false,
  isStaking: false,
  error: null,
  pagination: null,
};

// ==========================================
// Wallet Store
// ==========================================

export const useWalletStore = create<WalletStore>()((set, get) => ({
  ...initialState,

  fetchBalance: async () => {
    try {
      const balance = await walletService.getBalance();
      set({ balance });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch balance';
      set({ error: message });
    }
  },

  fetchTransactions: async (page = 1, limit = 20, type?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await walletService.getTransactions(page, limit, type);
      set({
        transactions: response.transactions,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
      set({ error: message, isLoading: false });
    }
  },

  fetchConnectedWallets: async () => {
    try {
      const connectedWallets = await walletService.getWallets();
      set({ connectedWallets });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch wallets';
      set({ error: message });
    }
  },

  transfer: async (data: TransferData) => {
    set({ isTransferring: true, error: null });
    try {
      const transaction = await walletService.transfer(data);
      // Update balance after transfer
      await get().fetchBalance();
      // Add transaction to list
      const transactions = [transaction, ...get().transactions];
      set({ transactions, isTransferring: false });
      return transaction;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transfer failed';
      set({ error: message, isTransferring: false });
      throw error;
    }
  },

  stake: async (data: StakeData) => {
    set({ isStaking: true, error: null });
    try {
      const stakeInfo = await walletService.stake(data);
      // Update balance after staking
      await get().fetchBalance();
      set({ isStaking: false });
      return stakeInfo;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Staking failed';
      set({ error: message, isStaking: false });
      throw error;
    }
  },

  unstake: async (data: UnstakeData) => {
    set({ isStaking: true, error: null });
    try {
      const transaction = await walletService.unstake(data);
      // Update balance after unstaking
      await get().fetchBalance();
      set({ isStaking: false });
      return transaction;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unstaking failed';
      set({ error: message, isStaking: false });
      throw error;
    }
  },

  connectWallet: async (data: ConnectWalletData) => {
    set({ isLoading: true, error: null });
    try {
      const wallet = await walletService.connectWallet(data);
      const connectedWallets = [...get().connectedWallets, wallet];
      set({ connectedWallets, isLoading: false });
      return wallet;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect wallet';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  disconnectWallet: async (walletId: string) => {
    try {
      await walletService.disconnectWallet(walletId);
      const connectedWallets = get().connectedWallets.filter((w) => w.id !== walletId);
      set({ connectedWallets });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect wallet';
      set({ error: message });
      throw error;
    }
  },

  updateBalance: (coins: number) => {
    const balance = get().balance;
    if (balance) {
      set({ balance: { ...balance, coins } });
    }
  },

  addTransaction: (transaction: Transaction) => {
    const transactions = [transaction, ...get().transactions];
    set({ transactions });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set(initialState);
  },
}));

export default useWalletStore;