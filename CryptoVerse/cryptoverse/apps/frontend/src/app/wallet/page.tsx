'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout, PageHeader } from '../../components/layout';
import { Card, Tabs, Button } from '../../components/common';
import { WalletBalance, TransactionList, TransferForm, StakePanel } from '../../components/features';
import { useWallet, useToast } from '../../hooks';
import { formatNumber } from '../../utils/format';
import { TransferData } from '../../services';

export default function WalletPage() {
  const { balance, transactions, fetchBalance, fetchTransactions, transfer, isLoading } = useWallet();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  const handleTransfer = async (data: { toAddress: string; amount: number }) => {
    try {
      const transferData: TransferData = {
        recipientId: data.toAddress,
        amount: data.amount,
      };
      await transfer(transferData);
      showToast('Transfer successful!', 'success');
      fetchBalance();
      fetchTransactions();
    } catch (error) {
      showToast('Transfer failed. Please try again.', 'error');
    }
  };

  const tabs = [
    { id: 'balance', label: 'Balance' },
    { id: 'transactions', label: 'History' },
    { id: 'transfer', label: 'Transfer' },
    { id: 'stake', label: 'Stake' },
  ];

  return (
    <MainLayout>
      <div className="px-4 py-4">
        <PageHeader title="Wallet" subtitle="Manage your tokens" />

        {/* Balance Card */}
        <div className="mb-6">
          <WalletBalance balance={balance} />
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'balance' && (
            <div className="space-y-4">
              <Card variant="glass" className="p-4">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab('transfer')}
                  >
                    ↗️ Send
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab('stake')}
                  >
                    🔒 Stake
                  </Button>
                </div>
              </Card>

              <Card variant="glass" className="p-4">
                <h3 className="font-semibold mb-3">Recent Activity</h3>
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  isLoading={isLoading}
                />
              </Card>
            </div>
          )}

          {activeTab === 'transactions' && (
            <Card variant="glass" className="p-4">
              <h3 className="font-semibold mb-3">Transaction History</h3>
              <TransactionList
                transactions={transactions}
                isLoading={isLoading}
              />
            </Card>
          )}

          {activeTab === 'transfer' && (
            <Card variant="glass" className="p-4">
              <h3 className="font-semibold mb-3">Transfer Tokens</h3>
              <TransferForm
                onSubmit={handleTransfer}
                maxAmount={balance?.coins || 0}
                isLoading={isLoading}
              />
            </Card>
          )}

          {activeTab === 'stake' && (
            <StakePanel
              stakedAmount={0}
              availableBalance={balance?.coins || 0}
              apy={12.5}
              onStake={(amount) => showToast(`Staking ${formatNumber(amount)} tokens`, 'success')}
              onUnstake={(amount) => showToast(`Unstaking ${formatNumber(amount)} tokens`, 'success')}
              isLoading={isLoading}
            />
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}