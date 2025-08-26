'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  const {
    coins,
    energy,
    maxEnergy,
    handleTap,
    loading,
    tapValue,
    daysUntilNextHalving,
    remainingPool,
    user,
    telegramUser,
    getMascotForUser,
    evolution,
    streakDays,
    streakMultiplier,
    triggerFlashRaid,
    syncFlashRaidTaps,
    passiveIncomeRate,
  } = useApp();

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [raidActive, setRaidActive] = useState(false);
  const [raidExpiresAt, setRaidExpiresAt] = useState(null);
  const [raidTimeLeft, setRaidTimeLeft] = useState(0);
  const [raidTaps, setRaidTaps] = useState(0);
  const [showRaidSuccessModal, setShowRaidSuccessModal] = useState(false);
  const [showRaidFailedModal, setShowRaidFailedModal] = useState(false);
  const [minimizeRaidOverlay, setMinimizeRaidOverlay] = useState(false);
  const [triggeringRaid, setTriggeringRaid] = useState(false);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [isTapping, setIsTapping] = useState(false);

  const raidDeltaRef = useRef(0);
  const tapTimeoutRef = useRef(null);

  // Animate coin count
  useEffect(() => {
    setDisplayCoins(coins);
  }, [coins]);

  const handlePointerDown = useCallback((e) => {
    if (loading || energy <= 0) return;

    if (typeof window !== 'undefined') {
      const tg = window.Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      } else if (window.navigator?.vibrate) {
        window.navigator.vibrate(8);
      }
    }

    const success = handleTap(tapValue);
    if (!success) return;

    // Visual tap flash
    setIsTapping(true);
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => setIsTapping(false), 120);

    if (raidActive) {
      setRaidTaps((prev) => Math.min(1000, prev + 1));
      raidDeltaRef.current += 1;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newId = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev.slice(-8), { id: newId, x, y }]);
  }, [loading, energy, handleTap, tapValue, raidActive]);

  const handleAnimationEnd = useCallback((id) => {
    setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Flash Raid sync
  useEffect(() => {
    if (!raidActive) return;
    const syncInterval = setInterval(async () => {
      if (raidDeltaRef.current > 0) {
        const delta = raidDeltaRef.current;
        raidDeltaRef.current = 0;
        try {
          const data = await syncFlashRaidTaps(delta);
          if (data?.success) {
            setRaidTaps(data.taps);
            if (data.completed) {
              setRaidActive(false);
              setShowRaidSuccessModal(true);
              window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
            }
          } else {
            raidDeltaRef.current += delta;
          }
        } catch (e) {
          raidDeltaRef.current += delta;
        }
      }
    }, 1500);
    return () => clearInterval(syncInterval);
  }, [raidActive, syncFlashRaidTaps]);

  // Raid countdown
  useEffect(() => {
    if (!raidActive || !raidExpiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(raidExpiresAt) - new Date()) / 1000));
      setRaidTimeLeft(remaining);
      if (remaining <= 0) {
        setRaidActive(false);
        setShowRaidFailedModal(true);
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [raidActive, raidExpiresAt]);

  const handleStartRaidClick = async () => {
    if (triggeringRaid) return;
    setTriggeringRaid(true);
    try {
      const data = await triggerFlashRaid();
      if (data?.success) {
        setRaidActive(true);
        setRaidExpiresAt(data.expiresAt);
        setRaidTaps(data.taps || 0);
        setRaidTimeLeft(900);
        setMinimizeRaidOverlay(false);
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      }
    } finally {
      setTriggeringRaid(false);
    }
  };

  const getEvolutionProgressPercent = () => {
    const balance = coins || 0;
    if (balance < 50000) return Math.min(100, Math.floor((balance / 50000) * 100));
    if (balance < 250000) return Math.min(100, Math.floor(((balance - 50000) / 200000) * 100));
    if (balance < 1000000) return Math.min(100, Math.floor(((balance - 250000) / 750000) * 100));
    if (balance < 5000000) return Math.min(100, Math.floor(((balance - 1000000) / 4000000) * 100));
    if (balance < 20000000) return Math.min(100, Math.floor(((balance - 5000000) / 15000000) * 100));
    return 100;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const energyPercentage = Math.min(100, (energy / maxEnergy) * 100);
  const isLowEnergy = energyPercentage < 20;
  const formattedTap = tapValue >= 1 ? tapValue.toFixed(0) : tapValue.toFixed(4).replace(/\.?0+$/, '');

  const formatCoins = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString('en-US');
  };

  const EVOLUTIONS_METADATA = [
    { level: 1, name: 'Baby Roach', threshold: 0, image: '/mascot.jpg', description: 'Freshly hatched Janta worker.' },
    { level: 2, name: 'Street Roach', threshold: 50000, image: '/roach_miner.png', description: 'Mining in the local alleyways.' },
    { level: 3, name: 'Roach w/ Glasses', threshold: 250000, image: '/roach_miner.png', description: 'Smart dapper cockroach.' },
    { level: 4, name: 'Gold Chain Roach', threshold: 1000000, image: '/roach_gangster.png', description: 'Gained influence and swagger.' },
    { level: 5, name: 'Roach King', threshold: 5000000, image: '/roach_king.png', description: 'Crowned royalty of the swarm.' },
    { level: 6, name: 'Supreme Roach', threshold: 20000000, image: '/roach_politician.png', description: 'President of CJP.' },
  ];

  const streakEmoji = streakDays >= 30 ? '🌋' : streakDays >= 15 ? '👑' : streakDays >= 7 ? '💥' : '🔥';

  return (
    <div className="flex flex-col h-screen font-body-md text-on-surface bg-black overflow-hidden select-none">
      {/* ── Top App Bar ── */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-14"
        style={{
          background: 'rgba(4, 4, 4, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,191,0,0.1)',
        }}
      >
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full overflow-hidden shrink-0"
            style={{
              border: '1.5px solid rgba(255,191,0,0.4)',
              boxShadow: '0 0 8px rgba(255,191,0,0.2)',
            }}
          >
            <img
              alt="Avatar"
              className="w-full h-full object-cover"
              src={getMascotForUser(user?.telegram_id || telegramUser?.id)}
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className="font-headline-md font-extrabold tracking-tight"
              style={{ fontSize: 15, color: '#ffbf00' }}
            >
              {user?.first_name || telegramUser?.first_name || 'DegenKing'}
            </span>
            <span
              className="font-label-mono"
              style={{ fontSize: 9, color: 'rgba(255,191,0,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}
            >
              {evolution?.name || 'Baby Roach'}
            </span>
          </div>
        </div>

        {/* Right: Coin balance */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,191,0,0.1)',
            border: '1px solid rgba(255,191,0,0.25)',
            boxShadow: '0 0 12px rgba(255,191,0,0.12)',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 15, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}
          >
            monetization_on
          </span>
          <span
            className="font-label-mono font-bold"
            style={{ fontSize: 13, color: '#ffbf00', letterSpacing: '-0.02em' }}
          >
            {formatCoins(displayCoins)}
          </span>
        </div>
      </header>

      {/* ── Main Scrollable Canvas ── */}
      <main className="flex-grow overflow-y-auto no-scrollbar pt-14 pb-20 flex flex-col items-center">

        {/* Atmospheric background glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute"
            style={{
              top: '20%', left: '50%', transform: 'translateX(-50%)',
              width: 280, height: 280,
              background: 'radial-gradient(circle, rgba(255,191,0,0.07) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: '25%', left: '20%',
              width: 150, height: 150,
              background: 'radial-gradient(circle, rgba(255,140,0,0.04) 0%, transparent 70%)',
              filter: 'blur(30px)',
            }}
          />
        </div>

        {/* ── Stats Row ── */}
        <section className="w-full max-w-md px-4 mt-3 mb-3 grid grid-cols-3 gap-2 z-10">
          {/* Streak */}
          <div
            className="rounded-2xl p-3 flex flex-col gap-1"
            style={{
              background: 'rgba(255,191,0,0.06)',
              border: '1px solid rgba(255,191,0,0.12)',
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Streak</span>
            <div className="flex items-center gap-1">
              <span style={{ fontSize: 18 }}>{streakEmoji}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-headline-md)' }}>{streakDays}d</span>
            </div>
            <span
              style={{
                fontSize: 9, fontWeight: 700, color: '#ffbf00',
                background: 'rgba(255,191,0,0.15)', borderRadius: 4,
                padding: '1px 5px', width: 'fit-content',
                fontFamily: 'var(--font-label-mono)',
              }}
            >
              {streakMultiplier}× boost
            </span>
          </div>

          {/* Evolution — clickable */}
          <button
            onClick={() => setShowEvolutionModal(true)}
            className="rounded-2xl p-3 flex flex-col gap-1 col-span-2 text-left active:scale-97 transition-transform"
            style={{
              background: 'rgba(255,191,0,0.06)',
              border: '1px solid rgba(255,191,0,0.12)',
            }}
          >
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Evolution</span>
              <span style={{ fontSize: 10, color: '#ffbf00', fontFamily: 'var(--font-label-mono)' }}>Lv.{evolution?.level || 1}/6 →</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-headline-md)', lineHeight: 1 }}>{evolution?.name || 'Baby Roach'}</span>
            <div className="w-full mt-1">
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${getEvolutionProgressPercent()}%`,
                    background: 'linear-gradient(90deg, #ff8c00, #ffbf00, #ffe082)',
                    boxShadow: '0 0 6px rgba(255,191,0,0.5)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          </button>
        </section>

        {/* ── Mining Pool Bar ── */}
        <section className="w-full max-w-md px-4 mb-3 z-10">
          <div
            className="rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(14,14,14,0.8)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex justify-between items-center text-[11px] mb-2">
              <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)' }}>FIXED POOL</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="animate-pulse-soft"
                  style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.8)', display: 'inline-block' }}
                />
                <span style={{ color: '#ffbf00', fontFamily: 'var(--font-label-mono)', fontWeight: 700 }}>
                  {remainingPool >= 1_000_000_000
                    ? (remainingPool / 1_000_000_000).toFixed(2) + 'B'
                    : (remainingPool / 1_000_000).toFixed(1) + 'M'} CJP left
                </span>
              </div>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(remainingPool / 10_000_000_000) * 100}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #ffbf00)',
                  boxShadow: '0 0 8px rgba(245,158,11,0.5)',
                  transition: 'width 1s ease',
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-label-mono)' }}>
              <span>0</span>
              <span
                style={{
                  background: 'rgba(255,191,0,0.12)',
                  color: '#ffbf00',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontWeight: 700,
                }}
              >
                Halving in {daysUntilNextHalving}d
              </span>
              <span>10B</span>
            </div>
          </div>
        </section>

        {/* ── Flash Raid minimized ── */}
        {raidActive && minimizeRaidOverlay && (
          <div className="w-full max-w-md px-4 mb-3 z-10">
            <button
              onClick={() => setMinimizeRaidOverlay(false)}
              className="w-full rounded-2xl p-3 flex items-center justify-between active:scale-97 transition-transform"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-pulse" style={{ fontSize: 16, color: '#ef4444' }}>flash_on</span>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: 12 }}>RAID ACTIVE — {raidTaps}/1,000 taps</span>
              </div>
              <span style={{ fontFamily: 'var(--font-label-mono)', fontSize: 11, color: '#ef4444', fontWeight: 700 }}>{formatTime(raidTimeLeft)}</span>
            </button>
          </div>
        )}

        {/* ── TAP ZONE ── */}
        <div
          className="relative z-10 flex items-center justify-center my-2 tap-scale cursor-pointer"
          onPointerDown={handlePointerDown}
          id="tapArea"
          style={{ width: 260, height: 260 }}
        >
          {/* Orbit ring */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: '1px dashed rgba(255,191,0,0.08)',
              animation: 'spin-slow 20s linear infinite',
            }}
          />

          {/* Outer glow */}
          <div
            className="absolute"
            style={{
              inset: -20,
              borderRadius: '50%',
              background: isTapping
                ? 'radial-gradient(circle, rgba(255,191,0,0.18) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(255,191,0,0.08) 0%, transparent 70%)',
              transition: 'all 0.15s ease',
              filter: 'blur(10px)',
              pointerEvents: 'none',
            }}
          />

          {/* Pulse ring on tap */}
          {isTapping && (
            <div
              className="absolute"
              style={{
                inset: -8,
                borderRadius: '50%',
                border: '2px solid rgba(255,191,0,0.4)',
                animation: 'pulse-amber 0.5s ease-out',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Mascot Image */}
          <img
            alt="CJP Mascot"
            src={evolution?.image || '/mascot.jpg'}
            className="relative z-20 pointer-events-none"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: `drop-shadow(0 0 ${isTapping ? 40 : 24}px rgba(255,191,0,${isTapping ? 0.55 : 0.3}))`,
              transform: isTapping ? 'scale(0.93)' : 'scale(1)',
              transition: 'transform 0.08s ease, filter 0.12s ease',
            }}
          />

          {/* Low energy overlay */}
          {energy <= 0 && (
            <div
              className="absolute inset-0 z-30 flex items-center justify-center rounded-full pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            >
              <div className="text-center">
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#ef4444' }}>battery_low</span>
                <p style={{ fontSize: 11, color: '#ef4444', fontFamily: 'var(--font-label-mono)', fontWeight: 700, marginTop: 4 }}>RECHARGING...</p>
              </div>
            </div>
          )}

          {/* Floating tap texts */}
          <div className="absolute inset-0 pointer-events-none z-40">
            {floatingTexts.map((text) => (
              <span
                key={text.id}
                className={`floating-text font-price-display ${raidActive ? 'text-red-400' : 'text-primary'}`}
                style={{
                  left: `${text.x}px`,
                  top: `${text.y}px`,
                  fontSize: 28,
                  lineHeight: 1,
                  textShadow: raidActive
                    ? '0 0 12px rgba(239,68,68,0.8)'
                    : '0 0 12px rgba(255,191,0,0.8)',
                }}
                onAnimationEnd={() => handleAnimationEnd(text.id)}
              >
                +{formattedTap}
              </span>
            ))}
          </div>
        </div>

        {/* ── Flash Raid trigger ── */}
        {!raidActive && (
          <div className="w-full max-w-md px-4 mt-1 mb-3 z-10">
            <button
              onClick={handleStartRaidClick}
              disabled={triggeringRaid}
              className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 active:scale-97 transition-all disabled:opacity-50"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                fontSize: 11,
                fontWeight: 700,
                color: '#ef4444',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <span className="material-symbols-outlined animate-pulse" style={{ fontSize: 14 }}>flash_on</span>
              {triggeringRaid ? 'Launching...' : 'Flash Raid Event'}
            </button>
          </div>
        )}

        {/* ── Energy Bar ── */}
        <section className="w-full max-w-md px-4 z-10 mt-1">
          <div className="flex justify-between items-center mb-2">
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ⚡ Energy
            </span>
            <div className="flex items-baseline gap-1">
              <span style={{ fontSize: 14, fontWeight: 800, color: isLowEnergy ? '#ef4444' : '#ffbf00', fontFamily: 'var(--font-price-display)' }}>
                {energy.toLocaleString('en-US')}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>/ {maxEnergy.toLocaleString('en-US')}</span>
            </div>
          </div>

          <div
            className="energy-bar-container h-4 rounded-full overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '2px',
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${energyPercentage}%`,
                background: isLowEnergy
                  ? 'linear-gradient(90deg, #dc2626, #ef4444)'
                  : 'linear-gradient(90deg, #f59e0b, #ffbf00, #ffe082)',
                boxShadow: `0 0 ${isLowEnergy ? 8 : 12}px rgba(${isLowEnergy ? '239,68,68' : '255,191,0'},0.5)`,
              }}
            />
          </div>

          {/* Regen indicator */}
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', marginTop: 5, textAlign: 'center', fontFamily: 'var(--font-label-mono)', letterSpacing: '0.05em' }}>
            +1 energy / 3s • 1 tap = 1 energy
          </p>
        </section>

        {/* ── Tap Rate HUD ── */}
        <section className="w-full max-w-md px-4 mt-4 z-10">
          <div
            className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{
              background: 'rgba(14,14,14,0.7)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tap Rate</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)' }}>+{formattedTap}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-label-mono)' }}>per tap</span>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex flex-col items-center gap-0.5">
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Passive Rate</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#c8c6c5', fontFamily: 'var(--font-price-display)' }}>+{(passiveIncomeRate || 0).toLocaleString()}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-label-mono)' }}>per hour</span>
            </div>
            <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex flex-col items-center gap-0.5">
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>After Halving</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#888', fontFamily: 'var(--font-price-display)' }}>
                +{tapValue / 2 >= 1 ? (tapValue / 2).toFixed(0) : (tapValue / 2).toFixed(4).replace(/\.?0+$/, '')}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-label-mono)' }}>per tap</span>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════ MODALS ═══════ */}

      {/* Flash Raid Full Overlay */}
      {raidActive && !minimizeRaidOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}>
          <div
            className="max-w-sm w-full p-6 rounded-3xl flex flex-col items-center text-center gap-5 animate-slide-up"
            style={{
              background: 'rgba(20,8,8,0.95)',
              border: '1px solid rgba(239,68,68,0.3)',
              boxShadow: '0 0 50px rgba(239,68,68,0.2)',
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 34, color: '#ef4444' }}>flash_on</span>
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-price-display)' }}>🚨 Flash Raid</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 8, lineHeight: 1.6 }}>
                Tap <span style={{ color: '#ef4444', fontWeight: 700 }}>1,000 times</span> before time runs out to claim <span style={{ color: '#ffbf00', fontWeight: 700 }}>+5,000 CJP</span>!
              </p>
            </div>
            <div className="w-full">
              <div className="flex justify-between mb-1.5" style={{ fontSize: 11, fontFamily: 'var(--font-label-mono)', fontWeight: 700 }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>TAPS</span>
                <span style={{ color: '#ffbf00' }}>{raidTaps} / 1,000</span>
              </div>
              <div className="h-3.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)', padding: '2px' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(raidTaps / 1000) * 100}%`,
                    background: 'linear-gradient(90deg, #dc2626, #f59e0b, #ffbf00)',
                    boxShadow: '0 0 10px rgba(239,68,68,0.5)',
                  }}
                />
              </div>
            </div>
            <div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Time Left</span>
              <div style={{ fontSize: 38, fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-price-display)', lineHeight: 1.1, marginTop: 4 }}>{formatTime(raidTimeLeft)}</div>
            </div>
            <button
              onClick={() => setMinimizeRaidOverlay(true)}
              className="w-full py-3 rounded-xl font-bold text-xs active:scale-95 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              Tap in Background
            </button>
          </div>
        </div>
      )}

      {/* Raid Success Modal */}
      {showRaidSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}>
          <div
            className="max-w-sm w-full p-7 rounded-3xl flex flex-col items-center text-center gap-5 animate-pop-in"
            style={{ background: 'rgba(12,12,8,0.98)', border: '1px solid rgba(255,191,0,0.3)', boxShadow: '0 0 50px rgba(255,191,0,0.25)' }}
          >
            <div style={{ fontSize: 56 }}>🏆</div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-price-display)', textTransform: 'uppercase' }}>Raid Won!</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8, lineHeight: 1.6 }}>
                Your ferocious tapping defended CJP. Bounty credited!
              </p>
            </div>
            <div
              className="flex items-center gap-2 px-6 py-3 rounded-xl"
              style={{ background: 'rgba(255,191,0,0.12)', border: '1px solid rgba(255,191,0,0.25)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#ffbf00', fontFamily: 'var(--font-price-display)' }}>+5,000 CJP</span>
            </div>
            <button
              onClick={() => setShowRaidSuccessModal(false)}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #ffbf00, #ff8c00)', color: '#000', boxShadow: '0 4px 20px rgba(255,191,0,0.3)' }}
            >
              Collect Loot
            </button>
          </div>
        </div>
      )}

      {/* Raid Failed Modal */}
      {showRaidFailedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)' }}>
          <div
            className="max-w-sm w-full p-7 rounded-3xl flex flex-col items-center text-center gap-5 animate-slide-up"
            style={{ background: 'rgba(12,4,4,0.98)', border: '1px solid rgba(239,68,68,0.25)', boxShadow: '0 0 40px rgba(239,68,68,0.2)' }}
          >
            <div style={{ fontSize: 56 }}>💀</div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-price-display)', textTransform: 'uppercase' }}>Raid Failed</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8, lineHeight: 1.6 }}>Time ran out. The sector was lost. Tap faster next time!</p>
            </div>
            <button
              onClick={() => setShowRaidFailedModal(false)}
              className="w-full py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Evolution Modal */}
      {showEvolutionModal && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => e.target === e.currentTarget && setShowEvolutionModal(false)}
        >
          <div
            className="max-w-md w-full rounded-t-3xl flex flex-col animate-slide-up"
            style={{
              background: '#0d0d0d',
              border: '1px solid rgba(255,191,0,0.15)',
              borderBottom: 'none',
              maxHeight: '82vh',
              overflow: 'hidden',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
            </div>

            <div className="flex justify-between items-center px-5 py-3">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 20 }}>🧬</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-headline-md)' }}>Evolution Tree</h3>
              </div>
              <button onClick={() => setShowEvolutionModal(false)} style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
              </button>
            </div>

            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '0 20px 12px', lineHeight: 1.6 }}>
              Evolve by accumulating more CJP coins. Each evolution unlocks a new mascot visual.
            </p>

            <div className="overflow-y-auto no-scrollbar pb-6 px-4 space-y-2.5">
              {EVOLUTIONS_METADATA.map((evo) => {
                const isActive = (evolution?.level || 1) === evo.level;
                const isUnlocked = coins >= evo.threshold;
                return (
                  <div
                    key={evo.level}
                    className="flex items-center gap-3 rounded-2xl p-3.5"
                    style={{
                      background: isActive
                        ? 'rgba(255,191,0,0.1)'
                        : isUnlocked
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(0,0,0,0.3)',
                      border: isActive
                        ? '1px solid rgba(255,191,0,0.3)'
                        : '1px solid rgba(255,255,255,0.05)',
                      opacity: isUnlocked ? 1 : 0.5,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden shrink-0"
                      style={{ border: `1px solid ${isActive ? 'rgba(255,191,0,0.4)' : 'rgba(255,255,255,0.08)'}` }}
                    >
                      <img alt={evo.name} src={evo.image} className="w-full h-full object-cover" style={{ filter: isUnlocked ? 'none' : 'grayscale(1)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{evo.name}</span>
                        <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 5px', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-label-mono)' }}>Lv.{evo.level}</span>
                      </div>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, lineHeight: 1.4 }}>{evo.description}</p>
                      {!isUnlocked && (
                        <p style={{ fontSize: 9, color: '#ffbf00', marginTop: 3, fontFamily: 'var(--font-label-mono)', fontWeight: 700 }}>
                          🔒 Requires {evo.threshold.toLocaleString('en-US')} CJP
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#ffbf00', background: 'rgba(255,191,0,0.15)', borderRadius: 6, padding: '3px 7px', fontFamily: 'var(--font-label-mono)', whiteSpace: 'nowrap' }}>ACTIVE</span>
                    )}
                    {isUnlocked && !isActive && (
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#22c55e' }}>check_circle</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
