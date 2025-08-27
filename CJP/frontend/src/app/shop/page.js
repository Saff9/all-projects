'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

export default function Shop() {
  const {
    coins,
    upgrades,
    passiveIncomeRate,
    maxEnergy,
    upgradeCardsMetadata,
    buyUpgradeCard,
    loading,
    user,
    telegramUser,
    getMascotForUser,
    tapValue,
  } = useApp();

  const [buyingId, setBuyingId] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  const getUpgradeLevel = (cardId) => {
    if (!upgrades) return 0;
    const upgrade = upgrades.find((u) => u.cardId === cardId);
    return upgrade ? upgrade.level : 0;
  };

  const triggerFeedback = (text, type) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 3000);
  };

  const handleUpgrade = async (cardId, cost) => {
    if (coins < cost) {
      triggerFeedback('Insufficient CJP balance!', 'error');
      return;
    }
    setBuyingId(cardId);
    setFeedback({ text: '', type: '' });
    try {
      const res = await buyUpgradeCard(cardId);
      if (res.success) {
        triggerFeedback(res.message || 'Upgraded!', 'success');
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } else {
        triggerFeedback(res.message || 'Upgrade failed', 'error');
      }
    } catch (err) {
      triggerFeedback('Network error.', 'error');
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-on-surface">
        <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: 42 }}>progress_activity</span>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10, fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Syncing upgrades...</p>
      </div>
    );
  }

  const defaultMetadata = {
    cockroach_army: { id: 'cockroach_army', name: 'Cockroach Army', description: 'Train cockroaches to mine for you. +100 CJP/hr per level.', baseCost: 1000, type: 'passive_income', icon: 'groups', emoji: '🪲' },
    gold_chain: { id: 'gold_chain', name: 'Gold Chain', description: 'Increase tap value multiplier. +1x per level.', baseCost: 1500, type: 'tap_multiplier', icon: 'workspace_premium', emoji: '⛓️' },
    crown_upgrade: { id: 'crown_upgrade', name: 'Crown Upgrade', description: 'Expand your energy capacity. +500 max energy per level.', baseCost: 2000, type: 'max_energy', icon: 'military_tech', emoji: '👑' },
    political_rally: { id: 'political_rally', name: 'Political Rally', description: 'Boost referral rewards. +1,000 CJP per referral per level.', baseCost: 3000, type: 'referral_bonus', icon: 'campaign', emoji: '📢' },
  };

  const cardColors = {
    passive_income: { accent: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', glow: 'rgba(34,197,94,0.3)' },
    tap_multiplier: { accent: '#ffbf00', bg: 'rgba(255,191,0,0.08)', border: 'rgba(255,191,0,0.2)', glow: 'rgba(255,191,0,0.3)' },
    max_energy: { accent: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', glow: 'rgba(96,165,250,0.3)' },
    referral_bonus: { accent: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', glow: 'rgba(167,139,250,0.3)' },
  };

  const cardsMetadata = upgradeCardsMetadata || defaultMetadata;

  const getEffectText = (cardId, level) => {
    if (cardId === 'cockroach_army') return { current: `+${level * 100} CJP/hr`, next: `+${(level + 1) * 100} CJP/hr` };
    if (cardId === 'gold_chain') return { current: level > 0 ? `+${level}x tap` : 'No boost', next: `+${level + 1}x tap` };
    if (cardId === 'crown_upgrade') return { current: `+${level * 500} energy`, next: `+${(level + 1) * 500} energy` };
    if (cardId === 'political_rally') return { current: `+${level * 1000} CJP/ref`, next: `+${(level + 1) * 1000} CJP/ref` };
    return { current: 'Active', next: 'Next' };
  };

  return (
    <div className="bg-black text-on-surface font-body-md min-h-screen pb-28 overflow-x-hidden select-none">

      {/* Toast */}
      {feedback.text && (
        <div
          className="fixed top-16 left-4 right-4 z-[200] rounded-2xl px-4 py-3 flex items-center gap-2 animate-fade-in"
          style={{
            background: feedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: feedback.type === 'success' ? '#22c55e' : '#ef4444', fontVariationSettings: "'FILL' 1" }}>
            {feedback.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: feedback.type === 'success' ? '#22c55e' : '#ef4444' }}>{feedback.text}</span>
        </div>
      )}

      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-14"
        style={{ background: 'rgba(4,4,4,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,191,0,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: '1.5px solid rgba(255,191,0,0.4)' }}>
            <img alt="Avatar" className="w-full h-full object-cover" src={getMascotForUser(user?.telegram_id || telegramUser?.id)} />
          </div>
          <h1 style={{ fontSize: 17, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)', letterSpacing: '-0.02em' }}>Upgrade Shop</h1>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,191,0,0.1)', border: '1px solid rgba(255,191,0,0.25)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ffbf00', fontFamily: 'var(--font-label-mono)' }}>
            {coins >= 1_000_000 ? (coins / 1_000_000).toFixed(2) + 'M' : coins >= 1_000 ? (coins / 1_000).toFixed(1) + 'K' : coins.toLocaleString('en-US')}
          </span>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto">

        {/* Stats summary */}
        <section
          className="rounded-2xl p-4 mb-5 grid grid-cols-3 gap-4 text-center"
          style={{ background: 'rgba(14,14,14,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 3 }}>Passive</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#22c55e', fontFamily: 'var(--font-price-display)' }}>+{(passiveIncomeRate || 0).toLocaleString()}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: 1, fontFamily: 'var(--font-label-mono)' }}>CJP/hr</span>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 3 }}>Tap Rate</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)' }}>×{tapValue || 1}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: 1, fontFamily: 'var(--font-label-mono)' }}>multiplier</span>
          </div>
          <div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 3 }}>Energy</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-price-display)' }}>{(maxEnergy || 1000).toLocaleString()}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', display: 'block', marginTop: 1, fontFamily: 'var(--font-label-mono)' }}>max cap</span>
          </div>
        </section>

        <h2 style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12, paddingLeft: 2 }}>
          Mascot Upgrades
        </h2>

        {/* Upgrade Cards */}
        <div className="space-y-3 pb-4">
          {Object.keys(cardsMetadata).map((key) => {
            const card = cardsMetadata[key];
            const meta = defaultMetadata[card.id] || {};
            const level = getUpgradeLevel(card.id);
            const maxed = level >= 10;
            const cost = card.baseCost * Math.pow(2, level);
            const canAfford = coins >= cost;
            const colors = cardColors[card.type] || cardColors.tap_multiplier;
            const effect = getEffectText(card.id, level);

            return (
              <div
                key={card.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: maxed ? 'rgba(14,14,14,0.6)' : colors.bg,
                  border: `1px solid ${maxed ? 'rgba(255,255,255,0.05)' : colors.border}`,
                  opacity: maxed ? 0.7 : 1,
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {/* Icon + Info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl"
                        style={{ background: `rgba(${maxed ? '255,255,255' : '0,0,0'},0.1)`, border: `1px solid ${maxed ? 'rgba(255,255,255,0.05)' : colors.border}` }}
                      >
                        {meta.emoji || '⚡'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{card.name}</h3>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 1.4 }}>{card.description}</p>
                      </div>
                    </div>

                    {/* Level badge */}
                    <div
                      className="shrink-0 flex flex-col items-center px-2.5 py-1.5 rounded-xl"
                      style={{ background: maxed ? 'rgba(255,255,255,0.05)' : `rgba(${maxed ? '255,255,255' : '0,0,0'},0.15)`, border: `1px solid ${maxed ? 'rgba(255,255,255,0.08)' : colors.border}` }}
                    >
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase' }}>Level</span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: maxed ? 'rgba(255,255,255,0.3)' : colors.accent, fontFamily: 'var(--font-price-display)', lineHeight: 1 }}>
                        {level}
                      </span>
                      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-label-mono)' }}>/ 10</span>
                    </div>
                  </div>

                  {/* Level dots */}
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full"
                        style={{
                          background: i < level
                            ? colors.accent
                            : 'rgba(255,255,255,0.08)',
                          boxShadow: i < level ? `0 0 4px ${colors.glow}` : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    ))}
                  </div>

                  {/* Effect comparison */}
                  {!maxed && (
                    <div
                      className="flex items-center justify-between rounded-xl px-3 py-2 mb-3"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)' }}>Now: <span style={{ color: 'rgba(255,255,255,0.6)' }}>{effect.current}</span></span>
                      <span className="material-symbols-outlined" style={{ fontSize: 14, color: colors.accent }}>arrow_forward</span>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-label-mono)', fontWeight: 700, color: colors.accent }}>Next: {effect.next}</span>
                    </div>
                  )}

                  {/* Buy Button */}
                  <button
                    disabled={maxed || !canAfford || buyingId !== null}
                    onClick={() => handleUpgrade(card.id, cost)}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-97 transition-all"
                    style={{
                      background: maxed
                        ? 'rgba(255,255,255,0.04)'
                        : !canAfford
                        ? 'rgba(255,255,255,0.04)'
                        : buyingId === card.id
                        ? `${colors.bg}`
                        : colors.accent,
                      color: maxed || !canAfford
                        ? 'rgba(255,255,255,0.2)'
                        : buyingId === card.id
                        ? colors.accent
                        : '#000',
                      border: maxed || !canAfford
                        ? '1px solid rgba(255,255,255,0.06)'
                        : buyingId === card.id
                        ? `1px solid ${colors.border}`
                        : 'none',
                      cursor: maxed || !canAfford || buyingId !== null ? 'not-allowed' : 'pointer',
                      boxShadow: !maxed && canAfford && buyingId === null ? `0 4px 16px ${colors.glow}` : 'none',
                    }}
                  >
                    {maxed ? (
                      '✓ Max Level'
                    ) : buyingId === card.id ? (
                      <>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                        Upgrading...
                      </>
                    ) : !canAfford ? (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
                        {cost.toLocaleString('en-US')} CJP needed
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upgrade</span>
                        Upgrade — {cost >= 1_000_000 ? (cost / 1_000_000).toFixed(1) + 'M' : cost >= 1_000 ? (cost / 1_000).toFixed(0) + 'K' : cost.toLocaleString('en-US')} CJP
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
