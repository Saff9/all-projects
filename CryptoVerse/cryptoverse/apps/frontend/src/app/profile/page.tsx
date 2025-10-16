'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MainLayout, PageHeader } from '../../components/layout';
import { Card, Button, Avatar, Badge } from '../../components/common';
import { useUser, useAuth, useTelegram } from '../../hooks';
import { formatNumber, formatWithCommas, calculateLevelProgress } from '../../utils/format';

export default function ProfilePage() {
  const { profile, stats, isLoading } = useUser();
  const { logout } = useAuth();
  const { haptic } = useTelegram();

  const levelProgress = stats ? calculateLevelProgress(stats.totalXp || 0, stats.level || 1) : null;

  const handleLogout = () => {
    haptic?.impact('medium');
    logout();
  };

  return (
    <MainLayout>
      <div className="px-4 py-4">
        <PageHeader title="Profile" subtitle="Your account information" />

        {/* Profile Card */}
        <Card variant="glass" className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar
              src={profile?.photoUrl}
              name={profile?.firstName || 'User'}
              size="xl"
              showLevel
              level={stats?.level}
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {profile?.firstName} {profile?.lastName}
              </h2>
              {profile?.username && (
                <p className="text-gray-400">@{profile.username}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="default">Level {stats?.level || 1}</Badge>
                {profile?.isPremium && <Badge variant="premium">Premium</Badge>}
              </div>
            </div>
          </div>

          {/* Level Progress */}
          {levelProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Level Progress</span>
                <span className="text-gray-400">
                  {formatNumber(levelProgress.current)} / {formatNumber(levelProgress.needed)} XP
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress.percentage}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {formatWithCommas(stats?.totalTokens || 0)}
            </p>
            <p className="text-sm text-gray-400">Total Mined</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {formatNumber(stats?.totalTaps || 0)}
            </p>
            <p className="text-sm text-gray-400">Total Taps</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {stats?.charactersOwned || 0}
            </p>
            <p className="text-sm text-gray-400">Characters</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {stats?.referrals || 0}
            </p>
            <p className="text-sm text-gray-400">Referrals</p>
          </Card>
        </div>

        {/* Menu Items */}
        <Card variant="glass" className="overflow-hidden">
          <Link href="/settings">
            <motion.div
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="flex items-center justify-between p-4 cursor-pointer border-b border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⚙️</span>
                <span>Settings</span>
              </div>
              <span className="text-gray-400">→</span>
            </motion.div>
          </Link>

          <Link href="/friends">
            <motion.div
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="flex items-center justify-between p-4 cursor-pointer border-b border-white/5"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">👥</span>
                <span>Friends</span>
              </div>
              <span className="text-gray-400">→</span>
            </motion.div>
          </Link>

          <motion.div
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            className="flex items-center justify-between p-4 cursor-pointer border-b border-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span>Statistics</span>
            </div>
            <span className="text-gray-400">→</span>
          </motion.div>

          <motion.div
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            className="flex items-center justify-between p-4 cursor-pointer border-b border-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">❓</span>
              <span>Help & Support</span>
            </div>
            <span className="text-gray-400">→</span>
          </motion.div>

          <motion.div
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            onClick={handleLogout}
            className="flex items-center justify-between p-4 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🚪</span>
              <span className="text-red-400">Logout</span>
            </div>
          </motion.div>
        </Card>
      </div>
    </MainLayout>
  );
}