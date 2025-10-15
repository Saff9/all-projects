'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout, PageHeader } from '../../components/layout';
import { Card, Button, Avatar } from '../../components/common';
import { useUser, useTelegram, useToast } from '../../hooks';
import { formatNumber } from '../../utils/format';
import { APP_CONFIG } from '../../utils/constants';

export default function FriendsPage() {
  const { referralStats } = useUser();
  const { haptic, shareReferralLink } = useTelegram();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const referralLink = `https://t.me/${APP_CONFIG.BOT_USERNAME}?start=${referralStats?.referralCode || 'ABC123'}`;

  const handleCopyLink = () => {
    haptic?.impact('medium');
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    haptic?.impact('medium');
    shareReferralLink?.(APP_CONFIG.BOT_USERNAME, referralStats?.referralCode || 'ABC123');
  };

  // Mock invited friends
  const invitedFriends = [
    { id: '1', name: 'Alice', photoUrl: undefined, earned: 500, joinedAt: new Date() },
    { id: '2', name: 'Bob', photoUrl: undefined, earned: 300, joinedAt: new Date() },
    { id: '3', name: 'Charlie', photoUrl: undefined, earned: 200, joinedAt: new Date() },
  ];

  return (
    <MainLayout>
      <div className="px-4 py-4">
        <PageHeader title="Friends" subtitle="Invite friends and earn rewards" />

        {/* Referral Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {referralStats?.totalReferrals || invitedFriends.length}
            </p>
            <p className="text-xs text-gray-400">Invited</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {formatNumber(referralStats?.totalEarned || 1000)}
            </p>
            <p className="text-xs text-gray-400">Earned</p>
          </Card>
          <Card variant="glass" className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {referralStats?.pendingRewards || 200}
            </p>
            <p className="text-xs text-gray-400">Pending</p>
          </Card>
        </div>

        {/* Referral Link */}
        <Card variant="glass" className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Your Referral Link</h3>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 bg-slate-800/50 rounded-lg text-sm text-gray-300 border border-white/10"
            />
            <Button
              variant={copied ? 'success' : 'secondary'}
              onClick={handleCopyLink}
            >
              {copied ? '✓' : 'Copy'}
            </Button>
          </div>
          <Button variant="primary" fullWidth onClick={handleShare}>
            Share to Telegram
          </Button>
        </Card>

        {/* Rewards Info */}
        <Card variant="glass" className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Rewards</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <div className="flex-1">
                <p className="font-medium">Invite a friend</p>
                <p className="text-sm text-gray-400">Get 500 💎 for each friend</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⭐</span>
              <div className="flex-1">
                <p className="font-medium">Active friend bonus</p>
                <p className="text-sm text-gray-400">10% of their earnings forever</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div className="flex-1">
                <p className="font-medium">Top inviter rewards</p>
                <p className="text-sm text-gray-400">Extra bonuses for top inviters</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Invited Friends */}
        <Card variant="glass" className="p-4">
          <h3 className="font-semibold mb-3">Invited Friends ({invitedFriends.length})</h3>
          
          {invitedFriends.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-2 block">👥</span>
              <p className="text-gray-400">No friends invited yet</p>
              <p className="text-sm text-gray-500">Share your link to start earning!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitedFriends.map((friend) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30"
                >
                  <Avatar src={friend.photoUrl} name={friend.name} size="md" />
                  <div className="flex-1">
                    <p className="font-medium">{friend.name}</p>
                    <p className="text-xs text-gray-400">Joined recently</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">+{friend.earned}</p>
                    <p className="text-xs text-gray-400">earned</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}