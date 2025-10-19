import { useCallback, useEffect } from 'react';
import { useWalletStore, useAuthStore } from '../stores';
import { TransferData, StakeData, UnstakeData, ConnectWalletData } from '../services';

// ==========================================
// Hook
// ==========================================

export function useWallet() {
  const { isAuthenticated } = useAuthStore();
  const {
    balance,
    transactions,
    connectedWallets,
    stakes,
    isLoading,
    isTransferring,
    isStaking,
    error,
    pagination,
    fetchBalance,
    fetchTransactions,
    fetchConnectedWallets,
    transfer,
    stake,
    unstake,
    connectWallet,
    disconnectWallet,
    updateBalance,
    addTransaction,
    setLoading,
    setError,
    reset,
  } = useWalletStore();

  // Fetch initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
      fetchConnectedWallets();
    }
  }, [isAuthenticated, fetchBalance, fetchConnectedWallets]);

  // Transfer handler
  const handleTransfer = useCallback(
    async (data: TransferData) => {
      try {
        const result = await transfer(data);
        return { success: true, transaction: result };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transfer failed';
        setError(message);
        return { success: false, error: message };
      }
    },
    [transfer, setError]
  );

  // Stake handler
  const handleStake = useCallback(
    async (data: StakeData) => {
      try {
        const result = await stake(data);
        return { success: true, stake: result };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Staking failed';
        setError(message);
        return { success: false, error: message };
      }
    },
    [stake, setError]
  );

  // Unstake handler
  const handleUnstake = useCallback(
    async (data: UnstakeData) => {
      try {
        const result = await unstake(data);
        return { success: true, transaction: result };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unstaking failed';
        setError(message);
        return { success: false, error: message };
      }
    },
    [unstake, setError]
  );

  // Connect wallet handler
  const handleConnectWallet = useCallback(
    async (data: ConnectWalletData) => {
      try {
        const result = await connectWallet(data);
        return { success: true, wallet: result };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to connect wallet';
        setError(message);
        return { success: false, error: message };
      }
    },
    [connectWallet, setError]
  );

  // Disconnect wallet handler
  const handleDisconnectWallet = useCallback(
    async (walletId: string) => {
      try {
        await disconnectWallet(walletId);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to disconnect wallet';
        setError(message);
        return { success: false, error: message };
      }
    },
    [disconnectWallet, setError]
  );

  // Load more transactions
  const loadMoreTransactions = useCallback(
    async (type?: string) => {
      if (!pagination || pagination.page >= pagination.totalPages) return;
      await fetchTransactions(pagination.page + 1, pagination.limit, type);
    },
    [pagination, fetchTransactions]
  );

  // Format balance for display
  const formattedBalance = balance
    ? {
        coins: balance.coins.toLocaleString(),
        staked: balance.staked.toLocaleString(),
        pendingRewards: balance.pendingRewards.toLocaleString(),
        totalEarned: balance.totalEarned.toLocaleString(),
      }
    : null;

  return {
    balance,
    formattedBalance,
    transactions,
    connectedWallets,
    stakes,
    isLoading,
    isTransferring,
    isStaking,
    error,
    pagination,
    fetchBalance,
    fetchTransactions,
    fetchConnectedWallets,
    transfer: handleTransfer,
    stake: handleStake,
    unstake: handleUnstake,
    connectWallet: handleConnectWallet,
    disconnectWallet: handleDisconnectWallet,
    updateBalance,
    addTransaction,
    loadMoreTransactions,
    setLoading,
    setError,
    reset,
  };
}

export default useWallet;