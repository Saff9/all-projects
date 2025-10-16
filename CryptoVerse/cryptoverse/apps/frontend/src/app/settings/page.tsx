'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout, PageHeader } from '../../components/layout';
import { Card } from '../../components/common';
import { useGame, useTelegram, useToast } from '../../hooks';

export default function SettingsPage() {
  const { soundEnabled, hapticEnabled, particlesEnabled, toggleSound, toggleHaptic, toggleParticles } = useGame();
  const { haptic } = useTelegram();
  const { success } = useToast();

  const handleToggle = (setting: string) => {
    haptic?.selection();
    
    switch (setting) {
      case 'sound':
        toggleSound();
        break;
      case 'haptic':
        toggleHaptic();
        break;
      case 'particles':
        toggleParticles();
        break;
    }
    
    success(`${setting} ${!eval(`${setting}Enabled`) ? 'enabled' : 'disabled'}`);
  };

  const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-purple-500' : 'bg-slate-600'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
      />
    </button>
  );

  return (
    <MainLayout>
      <div className="px-4 py-4">
        <PageHeader title="Settings" subtitle="Customize your experience" />

        {/* Game Settings */}
        <Card variant="glass" className="mb-6">
          <h3 className="font-semibold p-4 border-b border-white/5">Game Settings</h3>
          
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔊</span>
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-gray-400">Enable game sounds</p>
                </div>
              </div>
              <ToggleSwitch enabled={soundEnabled} onToggle={() => handleToggle('sound')} />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">📳</span>
                <div>
                  <p className="font-medium">Haptic Feedback</p>
                  <p className="text-sm text-gray-400">Vibration on interactions</p>
                </div>
              </div>
              <ToggleSwitch enabled={hapticEnabled} onToggle={() => handleToggle('haptic')} />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">✨</span>
                <div>
                  <p className="font-medium">Particle Effects</p>
                  <p className="text-sm text-gray-400">Show tap particles</p>
                </div>
              </div>
              <ToggleSwitch enabled={particlesEnabled} onToggle={() => handleToggle('particles')} />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card variant="glass" className="mb-6">
          <h3 className="font-semibold p-4 border-b border-white/5">Notifications</h3>
          
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-400">Get notified about rewards</p>
                </div>
              </div>
              <ToggleSwitch enabled={true} onToggle={() => {}} />
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <p className="font-medium">Email Updates</p>
                  <p className="text-sm text-gray-400">News and announcements</p>
                </div>
              </div>
              <ToggleSwitch enabled={false} onToggle={() => {}} />
            </div>
          </div>
        </Card>

        {/* About */}
        <Card variant="glass" className="mb-6">
          <h3 className="font-semibold p-4 border-b border-white/5">About</h3>
          
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <span>Version</span>
              <span className="text-gray-400">1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span>Terms of Service</span>
              <span className="text-gray-400">→</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <span>Privacy Policy</span>
              <span className="text-gray-400">→</span>
            </div>
          </div>
        </Card>

        {/* Support */}
        <Card variant="glass">
          <h3 className="font-semibold p-4 border-b border-white/5">Support</h3>
          
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5">
              <span>Help Center</span>
              <span className="text-gray-400">→</span>
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5">
              <span>Contact Support</span>
              <span className="text-gray-400">→</span>
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5">
              <span>Report a Bug</span>
              <span className="text-gray-400">→</span>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}