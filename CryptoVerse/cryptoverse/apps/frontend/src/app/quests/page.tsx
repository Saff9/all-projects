'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout, PageHeader } from '../../components/layout';
import { Card, Tabs } from '../../components/common';
import { QuestList, DailyQuests, QuestProgress } from '../../components/features';
import { useToast } from '../../hooks';
import { Quest } from '../../components/features/QuestCard';

export default function QuestsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('daily');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockQuests: Quest[] = [
      {
        id: '1',
        name: 'Daily Tapper',
        description: 'Tap 100 times today',
        type: 'daily',
        status: 'in_progress',
        requirement: 100,
        progress: 45,
        rewards: { tokens: 500, xp: 50 },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        name: 'Combo Master',
        description: 'Achieve a 10x combo',
        type: 'daily',
        status: 'available',
        requirement: 1,
        progress: 0,
        rewards: { tokens: 300, xp: 30 },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        name: 'Weekly Grinder',
        description: 'Earn 10,000 tokens this week',
        type: 'weekly',
        status: 'in_progress',
        requirement: 10000,
        progress: 3500,
        rewards: { tokens: 2000, xp: 200 },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ];
    setQuests(mockQuests);
  }, []);

  const handleStartQuest = async (quest: Quest) => {
    setProcessingId(quest.id);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id ? { ...q, status: 'in_progress' } : q
        )
      );
      success(`Started quest: ${quest.name}`);
    } catch (err) {
      error('Failed to start quest');
    } finally {
      setProcessingId(null);
    }
  };

  const handleClaimQuest = async (quest: Quest) => {
    setProcessingId(quest.id);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setQuests((prev) =>
        prev.map((q) =>
          q.id === quest.id ? { ...q, status: 'claimed' } : q
        )
      );
      success(`Claimed ${quest.rewards.tokens} tokens!`);
    } catch (err) {
      error('Failed to claim reward');
    } finally {
      setProcessingId(null);
    }
  };

  const tabs = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'special', label: 'Special' },
  ];

  const dailyQuests = quests.filter((q) => q.type === 'daily');
  const weeklyQuests = quests.filter((q) => q.type === 'weekly');
  const specialQuests = quests.filter((q) => q.type === 'special');

  const filteredQuests =
    activeTab === 'daily'
      ? dailyQuests
      : activeTab === 'weekly'
      ? weeklyQuests
      : specialQuests;

  const dailyCompleted = dailyQuests.filter((q) => q.status === 'claimed').length;
  const weeklyCompleted = weeklyQuests.filter((q) => q.status === 'claimed').length;

  return (
    <MainLayout>
      <div className="px-4 py-4">
        <PageHeader title="Quests" subtitle="Complete quests to earn rewards" />

        {/* Progress Summary */}
        <QuestProgress
          daily={{ completed: dailyCompleted, total: dailyQuests.length }}
          weekly={{ completed: weeklyCompleted, total: weeklyQuests.length }}
          className="mb-6"
        />

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* Quest List */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'daily' ? (
            <DailyQuests
              quests={dailyQuests}
              onStart={handleStartQuest}
              onClaim={handleClaimQuest}
              processingId={processingId}
            />
          ) : (
            <QuestList
              quests={filteredQuests}
              onStart={handleStartQuest}
              onClaim={handleClaimQuest}
              processingId={processingId}
            />
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}