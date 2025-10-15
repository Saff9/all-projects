'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout, PageHeader } from '../../components/layout';
import { Card, Tabs } from '../../components/common';
import { AchievementGrid, AchievementProgress } from '../../components/features';
import { useToast } from '../../hooks';
import { Achievement } from '../../components/features/AchievementCard';

export default function AchievementsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        name: 'First Tap',
        description: 'Make your first tap',
        type: 'taps',
        tier: 'bronze',
        icon: '👆',
        requirement: 1,
        progress: 1,
        reward: 100,
        isCompleted: true,
        isClaimed: true,
      },
      {
        id: '2',
        name: 'Tap Master',
        description: 'Tap 1,000 times',
        type: 'taps',
        tier: 'silver',
        icon: '✋',
        requirement: 1000,
        progress: 450,
        reward: 500,
        isCompleted: false,
        isClaimed: false,
      },
      {
        id: '3',
        name: 'Tap Legend',
        description: 'Tap 10,000 times',
        type: 'taps',
        tier: 'gold',
        icon: '🏆',
        requirement: 10000,
        progress: 450,
        reward: 2000,
        isCompleted: false,
        isClaimed: false,
      },
      {
        id: '4',
        name: 'Level Up',
        description: 'Reach level 10',
        type: 'level',
        tier: 'bronze',
        icon: '⬆️',
        requirement: 10,
        progress: 5,
        reward: 300,
        isCompleted: false,
        isClaimed: false,
      },
      {
        id: '5',
        name: 'Collector',
        description: 'Own 5 characters',
        type: 'characters',
        tier: 'silver',
        icon: '🦸',
        requirement: 5,
        progress: 3,
        reward: 400,
        isCompleted: false,
        isClaimed: false,
      },
      {
        id: '6',
        name: 'Social Butterfly',
        description: 'Invite 10 friends',
        type: 'referrals',
        tier: 'gold',
        icon: '👥',
        requirement: 10,
        progress: 10,
        reward: 1000,
        isCompleted: true,
        isClaimed: false,
      },
    ];
    setAchievements(mockAchievements);
  }, []);

  const handleClaim = async (achievement: Achievement) => {
    setClaimingId(achievement.id);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAchievements((prev) =>
        prev.map((a) =>
          a.id === achievement.id ? { ...a, isClaimed: true } : a
        )
      );
      success(`Claimed ${achievement.reward} tokens!`);
    } catch (err) {
      error('Failed to claim achievement');
    } finally {
      setClaimingId(null);
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'unclaimed', label: 'Unclaimed' },
  ];

  const filteredAchievements = achievements.filter((a) => {
    if (activeTab === 'completed') return a.isCompleted;
    if (activeTab === 'unclaimed') return a.isCompleted && !a.isClaimed;
    return true;
  });

  const total = achievements.length;
  const completed = achievements.filter((a) => a.isCompleted).length;
  const claimed = achievements.filter((a) => a.isClaimed).length;

  return (
    <MainLayout>
      <div className="px-4 py-4">
        <PageHeader title="Achievements" subtitle="Track your progress and earn rewards" />

        {/* Progress Summary */}
        <AchievementProgress
          total={total}
          completed={completed}
          claimed={claimed}
          className="mb-6"
        />

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* Achievements Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AchievementGrid
            achievements={filteredAchievements}
            onClaim={handleClaim}
            claimingId={claimingId}
          />
        </motion.div>
      </div>
    </MainLayout>
  );
}