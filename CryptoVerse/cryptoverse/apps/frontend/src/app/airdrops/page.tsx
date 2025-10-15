'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout, PageHeader } from '../../components/layout';
import { AirdropList, AirdropSummary } from '../../components/features';
import { useToast } from '../../hooks';
import { Airdrop } from '../../components/features/AirdropComponents';

export default function AirdropsPage() {
  const { success, error } = useToast();
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const now = new Date();
    const mockAirdrops: Airdrop[] = [
      {
        id: '1',
        name: 'CryptoVerse Token Launch',
        description: 'Early adopter airdrop for CryptoVerse Token launch participants.',
        tokenName: 'CryptoVerse Token',
        tokenSymbol: 'CVT',
        totalSupply: 1000000000,
        allocatedAmount: 10000000,
        claimedAmount: 3500000,
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        eligibility: {
          isEligible: true,
          allocatedTokens: 1000,
          claimedTokens: 0,
        },
      },
      {
        id: '2',
        name: 'Community Rewards',
        description: 'Special airdrop for active community members.',
        tokenName: 'Community Token',
        tokenSymbol: 'COMM',
        totalSupply: 500000000,
        allocatedAmount: 5000000,
        claimedAmount: 5000000,
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: 'ended',
        eligibility: {
          isEligible: true,
          allocatedTokens: 500,
          claimedTokens: 500,
        },
      },
      {
        id: '3',
        name: 'New Year Special',
        description: 'Celebrate the new year with special token rewards!',
        tokenName: 'New Year Token',
        tokenSymbol: 'NYT',
        totalSupply: 100000000,
        allocatedAmount: 1000000,
        claimedAmount: 0,
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
      },
    ];
    setAirdrops(mockAirdrops);
  }, []);

  const handleClaim = async (airdrop: Airdrop) => {
    setClaimingId(airdrop.id);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setAirdrops((prev) =>
        prev.map((a) =>
          a.id === airdrop.id && a.eligibility
            ? {
                ...a,
                eligibility: {
                  ...a.eligibility,
                  claimedTokens: a.eligibility.allocatedTokens,
                },
              }
            : a
        )
      );
      success(`Claimed ${airdrop.eligibility?.allocatedTokens} ${airdrop.tokenSymbol}!`);
    } catch (err) {
      error('Failed to claim airdrop');
    } finally {
      setClaimingId(null);
    }
  };

  const handleCheckEligibility = async (airdrop: Airdrop) => {
    // API call would go here
    success('Checking eligibility...');
  };

  const activeAirdrops = airdrops.filter((a) => a.status === 'active').length;
  const totalClaimed = airdrops.reduce(
    (sum, a) => sum + (a.eligibility?.claimedTokens || 0),
    0
  );
  const totalPending = airdrops.reduce((sum, a) => {
    if (a.eligibility && a.eligibility.isEligible) {
      return sum + (a.eligibility.allocatedTokens - a.eligibility.claimedTokens);
    }
    return sum;
  }, 0);

  return (
    <MainLayout>
      <div className="px-4 py-4">
        <PageHeader title="Airdrops" subtitle="Claim your token rewards" />

        {/* Summary */}
        <AirdropSummary
          totalAirdrops={airdrops.length}
          activeAirdrops={activeAirdrops}
          totalClaimed={totalClaimed}
          totalPending={totalPending}
          className="mb-6"
        />

        {/* Airdrops List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AirdropList
            airdrops={airdrops}
            onClaim={handleClaim}
            onCheckEligibility={handleCheckEligibility}
            claimingId={claimingId}
          />
        </motion.div>
      </div>
    </MainLayout>
  );
}