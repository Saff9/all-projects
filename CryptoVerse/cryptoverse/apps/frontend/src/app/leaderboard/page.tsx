'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout, PageHeader } from '../../components/layout';
import { Card, Tabs } from '../../components/common';
import { LeaderboardList, LeaderboardTabs, LeaderboardHeader, TopThree } from '../../components/features';
import { LeaderboardEntry } from '../../components/features/LeaderboardComponents';

export default function LeaderboardPage() {
  const [activeType, setActiveType] = useState('global');
  const [activeTimeframe, setActiveTimeframe] = useState('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockEntries: LeaderboardEntry[] = Array.from({ length: 50 }, (_, i) => ({
        rank: i + 1,
        userId: `user_${i + 1}`,
        username: `Player${i + 1}`,
        photoUrl: undefined,
        score: Math.floor(Math.random() * 1000000) + 10000,
        level: Math.floor(Math.random() * 50) + 1,
        country: ['US', 'UK', 'JP', 'KR', 'DE', 'FR', 'BR', 'IN'][Math.floor(Math.random() * 8)],
        isCurrentUser: i === 10,
      }));
      
      setEntries(mockEntries);
      setIsLoading(false);
    }, 1000);
  }, [activeType, activeTimeframe]);

  const typeTabs = [
    { id: 'global', label: 'Global' },
    { id: 'friends', label: 'Friends' },
    { id: 'country', label: 'Country' },
  ];

  const timeframeTabs = [
    { id: 'all_time', label: 'All Time' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'daily', label: 'Daily' },
  ];

  const topThree = entries.slice(0, 3) as [LeaderboardEntry?, LeaderboardEntry?, LeaderboardEntry?];
  const restEntries = entries.slice(3);
  const currentUser = entries.find((e) => e.isCurrentUser);

  return (
    <MainLayout>
      <div className="px-4 py-4">
        <PageHeader title="Leaderboard" subtitle="Compete with players worldwide" />

        {/* Type Tabs */}
        <LeaderboardTabs
          tabs={typeTabs}
          activeTab={activeType}
          onTabChange={setActiveType}
          className="mb-4"
        />

        {/* Timeframe Tabs */}
        <Tabs
          tabs={timeframeTabs}
          activeTab={activeTimeframe}
          onChange={setActiveTimeframe}
          variant="pills"
          size="sm"
          className="mb-6"
        />

        {/* User's Rank */}
        {currentUser && (
          <LeaderboardHeader
            title="Your Position"
            timeframe={activeTimeframe.replace('_', ' ')}
            userRank={currentUser.rank}
            userScore={currentUser.score}
            className="mb-6"
          />
        )}

        {/* Top 3 Podium */}
        {!isLoading && entries.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <TopThree entries={topThree} />
          </motion.div>
        )}

        {/* Rest of Leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LeaderboardList
            entries={restEntries}
            currentUserId="user_11"
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </MainLayout>
  );
}