'use client';

import React, { useState, useEffect } from 'react';
import { useApp, CJP_BOT_NAME } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

export default function Wallet() {
  const {
    coins,
    user,
    telegramUser,
    backendUrl,
    initData,
    tonWallet,
    connectTonWallet,
    claimedCoins,
    claimMinedCoins,
    getMascotForUser,
    streakDays,
    pvpWins,
  } = useApp();

  const [userRank, setUserRank] = useState(null);
  const [percentile, setPercentile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  const userId = user?.telegram_id || telegramUser?.id || '12345678';
  const referralLink = `https://t.me/${CJP_BOT_NAME}/app?startapp=ref_${userId}`;
  const displayReferralLink = `t.me/${CJP_BOT_NAME}/app?startapp=ref_${userId}`;

  // Fetch rank
  useEffect(() => {
    if (!backendUrl) return;
    const fetchRank = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (initData) {
          headers['Authorization'] = `Bearer ${initData}`;
        } else if (telegramUser) {
          headers['x-mock-init-data'] = `user=${encodeURIComponent(JSON.stringify(telegramUser))}`;
        }
        const res = await fetch(`${backendUrl}/api/leaderboard`, { method: 'GET', headers });
        if (res.ok) {
          const data = await res.json();
          if (data.userRank) setUserRank(data.userRank);
          if (data.percentile) setPercentile(data.percentile);
        }
      } catch (err) {}
    };
    fetchRank();
  }, [backendUrl, initData, telegramUser]);

  const showFeedback = (msg, type = 'success') => {
    setFeedbackMsg(msg);
    setFeedbackType(type);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = () => {
    const text = 'Join the CockRoach Janta Party ($CJP)! Tap to earn crypto and claim prestige rewards.';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      const tg = window.Telegram?.WebApp;
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(shareUrl);
      } else {
        window.open(shareUrl, '_blank');
      }
    }
  };

  const handleConnectWallet = async () => {
    if (connecting) return;
    setConnecting(true);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    setTimeout(async () => {
      const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const mockAddress = `EQA_${randomHex}_cjpRoach`;
      const success = await connectTonWallet(mockAddress);
      setConnecting(false);
      if (success) {
        showFeedback('TON Wallet connected! +1,000 CJP bonus credited.', 'success');
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      } else {
        showFeedback('Failed to connect wallet. Try again.', 'error');
      }
    }, 1800);
  };

  const handleDisconnectWallet = async () => {
    await connectTonWallet('');
    showFeedback('Wallet disconnected.', 'neutral');
  };

  const handleClaimCoins = async () => {
    if (claiming) return;
    setClaiming(true);
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
    const res = await claimMinedCoins();
    setClaiming(false);
    if (res.success) {
      showFeedback(res.message, 'success');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } else {
      showFeedback(res.message, 'error');
    }
  };

  const totalMined = coins + (claimedCoins || 0);
  const claimable = coins >= 10000 && !!tonWallet;

  const statCards = [
    { label: 'Rank', value: userRank ? `#${userRank}` : '—', icon: 'emoji_events', color: '#ffbf00' },
    { label: 'Percentile', value: percentile || 'Top ?%', icon: 'leaderboard', color: '#22c55e' },
    { label: 'Referrals', value: user?.referrals?.length || 0, icon: 'group_add', color: '#60a5fa' },
    { label: 'Streak', value: `${streakDays || 1}d`, icon: 'local_fire_department', color: '#f97316' },
    { label: 'PvP Wins', value: pvpWins || 0, icon: 'sports_mma', color: '#a78bfa' },
    { label: 'Claimed', value: `${(claimedCoins || 0) >= 1000 ? ((claimedCoins || 0) / 1000).toFixed(1) + 'K' : (claimedCoins || 0)}`, icon: 'redeem', color: '#2dd4bf' },
  ];

  return (
    <div className="bg-black text-on-surface font-body-md min-h-screen pb-28 overflow-x-hidden select-none">

      {/* Toast feedback */}
      {feedbackMsg && (
        <div
          className="fixed top-16 left-4 right-4 z-[200] rounded-2xl px-4 py-3 flex items-center gap-2 animate-fade-in"
          style={{
            background: feedbackType === 'success' ? 'rgba(34,197,94,0.15)' : feedbackType === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)',
            border: `1px solid ${feedbackType === 'success' ? 'rgba(34,197,94,0.3)' : feedbackType === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: feedbackType === 'success' ? '#22c55e' : feedbackType === 'error' ? '#ef4444' : '#fff', fontVariationSettings: "'FILL' 1" }}>
            {feedbackType === 'success' ? 'check_circle' : feedbackType === 'error' ? 'error' : 'info'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: feedbackType === 'success' ? '#22c55e' : feedbackType === 'error' ? '#ef4444' : 'rgba(255,255,255,0.7)' }}>
            {feedbackMsg}
          </span>
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
          <h1 style={{ fontSize: 17, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)', letterSpacing: '-0.02em' }}>CJP Wallet</h1>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: tonWallet ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.06)', border: `1px solid ${tonWallet ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}` }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: tonWallet ? '#22c55e' : '#555', boxShadow: tonWallet ? '0 0 6px rgba(34,197,94,0.8)' : 'none' }} />
          <span style={{ fontSize: 11, fontFamily: 'var(--font-label-mono)', fontWeight: 700, color: tonWallet ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
            {tonWallet ? 'TON Active' : 'No Wallet'}
          </span>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-md mx-auto space-y-4">

        {/* Profile hero */}
        <section className="flex flex-col items-center py-5">
          <div className="relative mb-3">
            <div
              className="w-20 h-20 rounded-full overflow-hidden"
              style={{ border: '2px solid rgba(255,191,0,0.4)', boxShadow: '0 0 20px rgba(255,191,0,0.2)' }}
            >
              <img alt="Profile" className="w-full h-full object-cover" src={getMascotForUser(user?.telegram_id || telegramUser?.id)} />
            </div>
            {tonWallet && (
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: '#22c55e', border: '2px solid #000' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#fff', fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            )}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-headline-md)' }}>
            {user?.first_name || telegramUser?.first_name || user?.username || 'DegenKing'}
          </h2>
          <div
            className="flex items-center gap-1.5 mt-1.5 px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,191,0,0.1)', border: '1px solid rgba(255,191,0,0.2)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            <span style={{ fontSize: 10, color: '#ffbf00', fontFamily: 'var(--font-label-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Cockroach General
            </span>
          </div>
        </section>

        {/* Balance hero card */}
        <section
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,191,0,0.12), rgba(255,140,0,0.06))',
            border: '1px solid rgba(255,191,0,0.2)',
          }}
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,191,0,0.15), transparent)', filter: 'blur(20px)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Total Portfolio Value
          </span>
          <div className="flex items-end gap-2 mt-2">
            <span style={{ fontSize: 34, fontWeight: 900, color: '#ffbf00', fontFamily: 'var(--font-price-display)', lineHeight: 1 }}>
              {totalMined >= 1_000_000
                ? (totalMined / 1_000_000).toFixed(2) + 'M'
                : totalMined.toLocaleString('en-US')}
            </span>
            <span style={{ fontSize: 14, color: '#ffbf00', opacity: 0.7, marginBottom: 3, fontFamily: 'var(--font-label-mono)', fontWeight: 700 }}>$CJP</span>
          </div>
          <div className="flex gap-4 mt-4">
            <div>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase' }}>Mined (Unclaimed)</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ffbf00', marginTop: 2, fontFamily: 'var(--font-price-display)' }}>
                {coins.toLocaleString('en-US')} CJP
              </div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
            <div>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase' }}>Claimed Jettons</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#c8c6c5', marginTop: 2, fontFamily: 'var(--font-price-display)' }}>
                {(claimedCoins || 0).toLocaleString('en-US')} CJP
              </div>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section className="grid grid-cols-3 gap-2">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3 flex flex-col items-center gap-1.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-price-display)', lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
          ))}
        </section>

        {/* TON Connect */}
        <section
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: 'rgba(14,14,14,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#60a5fa' }}>link</span>
            TON Wallet
          </h3>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 14 }}>
            Connect your TON wallet to claim mined CJP as Jettons when the token launches.
          </p>

          {tonWallet ? (
            <div className="space-y-3">
              <div
                className="rounded-xl px-3 py-3 flex justify-between items-center"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <div>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase' }}>Connected</span>
                  <div style={{ fontSize: 12, color: '#22c55e', fontFamily: 'var(--font-label-mono)', marginTop: 2, fontWeight: 600 }}>
                    {tonWallet.slice(0, 10)}...{tonWallet.slice(-8)}
                  </div>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>link_off</span>
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={connecting}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 active:scale-97 transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #ffbf00, #ff8c00)', color: '#000', boxShadow: '0 4px 20px rgba(255,191,0,0.25)' }}
            >
              {connecting ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>
                  Connecting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                  Connect TON Wallet
                </>
              )}
            </button>
          )}
        </section>

        {/* Claim Portal */}
        <section
          className="rounded-3xl p-5"
          style={{ background: 'rgba(14,14,14,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#a78bfa' }}>redeem</span>
            Claim Jettons
          </h3>

          <div className="flex items-center gap-2 mb-3" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ffbf00', flexShrink: 0 }}>info</span>
            Minimum 10,000 CJP required. Requires a connected TON wallet.
          </div>

          {/* Progress to minimum */}
          <div className="mb-4">
            <div className="flex justify-between mb-1" style={{ fontSize: 10, fontFamily: 'var(--font-label-mono)', color: 'rgba(255,255,255,0.4)' }}>
              <span>Progress to min. claim</span>
              <span style={{ color: coins >= 10000 ? '#22c55e' : '#ffbf00' }}>{Math.min(100, Math.floor((coins / 10000) * 100))}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', padding: '1px' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.floor((coins / 10000) * 100))}%`,
                  background: coins >= 10000 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #f59e0b, #ffbf00)',
                  boxShadow: `0 0 6px ${coins >= 10000 ? 'rgba(34,197,94,0.5)' : 'rgba(255,191,0,0.5)'}`,
                }}
              />
            </div>
          </div>

          <button
            onClick={handleClaimCoins}
            disabled={!claimable || claiming}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-97 transition-all"
            style={{
              background: claimable
                ? 'rgba(167,139,250,0.15)'
                : 'rgba(255,255,255,0.04)',
              border: claimable
                ? '1px solid rgba(167,139,250,0.3)'
                : '1px solid rgba(255,255,255,0.06)',
              color: claimable ? '#a78bfa' : 'rgba(255,255,255,0.2)',
              cursor: claimable ? 'pointer' : 'not-allowed',
            }}
          >
            {claiming ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>sync</span>
                Minting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified</span>
                Claim {coins >= 10000 ? `${coins.toLocaleString('en-US')} CJP` : 'Jettons'}
              </>
            )}
          </button>
        </section>

        {/* Referral */}
        <section
          className="rounded-3xl p-5"
          style={{ background: 'rgba(14,14,14,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#60a5fa' }}>group_add</span>
            Referral
            <span
              className="ml-auto"
              style={{ fontSize: 10, color: '#22c55e', fontFamily: 'var(--font-label-mono)', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}
            >
              +5,000 CJP / referral
            </span>
          </h3>

          <div
            className="flex items-center rounded-xl overflow-hidden mb-3"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex-1 px-3 py-3" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-label-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayReferralLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-3 flex items-center gap-1.5 active:scale-90 transition-all"
              style={{
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,191,0,0.1)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
                color: copied ? '#22c55e' : '#ffbf00',
                fontSize: 12,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                {copied ? 'check_circle' : 'content_copy'}
              </span>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <button
            onClick={handleShareLink}
            className="w-full py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 active:scale-97 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(255,191,0,0.2), rgba(255,140,0,0.15))',
              border: '1px solid rgba(255,191,0,0.3)',
              color: '#ffbf00',
              boxShadow: '0 0 20px rgba(255,191,0,0.1)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>share</span>
            Invite Friends — Earn +5,000 CJP
          </button>
        </section>

      </main>
      <BottomNav />
    </div>
  );
}
