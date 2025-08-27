'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

const FALLBACK_PLAYERS = [
  { rank: 1, name: 'ShadowWhale', bal: '158.4M', seed: 'Shadow' },
  { rank: 2, name: 'NeonReaper', bal: '142.1M', seed: 'Reaper' },
  { rank: 3, name: 'CryptoRex', bal: '129.5M', seed: 'Rex' },
  { rank: 4, name: 'LunarLord', bal: '98.2M', seed: 'Lunar' },
  { rank: 5, name: 'SolanaSlayer', bal: '85.7M', seed: 'Slayer' },
  { rank: 6, name: 'GigaChad', bal: '77.0M', seed: 'Chad' },
  { rank: 7, name: 'VoidWalker', bal: '69.1M', seed: 'Void' },
  { rank: 8, name: 'BullRun', bal: '54.3M', seed: 'Bull' },
  { rank: 9, name: 'DiamondHands', bal: '42.9M', seed: 'Diamond' },
  { rank: 10, name: 'RoachKing99', bal: '38.1M', seed: 'Roach' },
];

const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const RANK_COLOR = {
  1: { accent: '#FFD700', bg: 'rgba(255,215,0,0.1)', border: 'rgba(255,215,0,0.3)', glow: 'rgba(255,215,0,0.25)' },
  2: { accent: '#C0C0C0', bg: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.2)', glow: 'rgba(192,192,192,0.15)' },
  3: { accent: '#CD7F32', bg: 'rgba(205,127,50,0.08)', border: 'rgba(205,127,50,0.2)', glow: 'rgba(205,127,50,0.15)' },
};

export default function Ranks() {
  const { coins, initData, backendUrl, user, telegramUser, getMascotForUser } = useApp();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [percentile, setPercentile] = useState('');
  const [countdown, setCountdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const formatBal = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toLocaleString('en-US');
  };

  useEffect(() => {
    if (!backendUrl) return;
    const fetchLeaderboard = async () => {
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
          setCurrentUserRank(data.userRank || null);
          setPercentile(data.percentile || '');
          const backendList = data.leaderboard || [];
          if (backendList.length > 0) {
            setLeaderboard(
              backendList.map((p, i) => ({
                rank: i + 1,
                name: p.username || p.first_name || `Miner #${i + 1}`,
                bal: formatBal(p.coins || 0),
                coins: p.coins || 0,
                seed: p.telegram_id || `seed-${i}`,
              }))
            );
          } else {
            setLeaderboard(FALLBACK_PLAYERS);
          }
        } else {
          setLeaderboard(FALLBACK_PLAYERS);
        }
      } catch {
        setLeaderboard(FALLBACK_PLAYERS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [backendUrl, initData, telegramUser, coins]);

  // 15-minute rolling countdown
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(now);
      next.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
      const diff = Math.max(0, Math.floor((next - now) / 1000));
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setCountdown(`${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const topThree = leaderboard.filter((p) => p.rank <= 3);
  const restPlayers = leaderboard.filter((p) => p.rank > 3);

  const formatCoins = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString('en-US');
  };

  return (
    <div className="bg-black text-on-surface font-body-md min-h-screen pb-28 select-none overflow-x-hidden">

      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-14"
        style={{ background: 'rgba(4,4,4,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,191,0,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: '1.5px solid rgba(255,191,0,0.4)' }}>
            <img alt="Avatar" className="w-full h-full object-cover" src={getMascotForUser(user?.telegram_id || telegramUser?.id)} />
          </div>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)', letterSpacing: '-0.02em', lineHeight: 1 }}>Top Miners</h1>
            <span style={{ fontSize: 9, color: 'rgba(255,191,0,0.5)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CJP Leaderboard</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Countdown */}
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>refresh</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-label-mono)', fontWeight: 600 }}>{countdown}</span>
          </div>

          {/* Coin balance */}
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
            style={{ background: 'rgba(255,191,0,0.1)', border: '1px solid rgba(255,191,0,0.25)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ffbf00', fontFamily: 'var(--font-label-mono)' }}>{formatCoins(coins)}</span>
          </div>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-md mx-auto">

        {/* Page intro */}
        <div className="mb-5 mt-1">
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            Competing for the nocturnal treasury of $CJP. Top miners ranked by lifetime earnings.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: 36, color: '#ffbf00' }}>progress_activity</span>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10, fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading ranks...</p>
          </div>
        ) : (
          <>
            {/* ── Podium Top 3 ── */}
            {topThree.length > 0 && (
              <section className="mb-4">
                {/* Rank 1 */}
                {topThree[0] && (() => {
                  const c = RANK_COLOR[1];
                  return (
                    <div
                      className="rounded-2xl p-4 mb-3 flex items-center gap-3 relative overflow-hidden"
                      style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 20px ${c.glow}` }}
                    >
                      <div className="absolute -right-4 -top-4 opacity-[0.07]" style={{ fontSize: 100 }}>🥇</div>
                      <div className="relative shrink-0">
                        <div
                          className="w-14 h-14 rounded-full overflow-hidden"
                          style={{ border: `2px solid ${c.accent}`, boxShadow: `0 0 14px ${c.glow}` }}
                        >
                          <img alt={topThree[0].name} src={getMascotForUser(topThree[0].seed)} className="w-full h-full object-cover" />
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: c.accent, fontSize: 12, fontWeight: 900 }}
                        >
                          1
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{topThree[0].name}</span>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: c.accent, fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: c.accent, fontFamily: 'var(--font-price-display)', marginTop: 2 }}>
                          {topThree[0].bal} <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>CJP</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 28 }}>👑</span>
                    </div>
                  );
                })()}

                {/* Rank 2 & 3 side by side */}
                <div className="grid grid-cols-2 gap-3">
                  {topThree.slice(1).map((player) => {
                    const c = RANK_COLOR[player.rank];
                    return (
                      <div
                        key={player.rank}
                        className="rounded-2xl p-3.5 flex flex-col items-center text-center"
                        style={{ background: c.bg, border: `1px solid ${c.border}` }}
                      >
                        <div className="relative mb-2">
                          <div
                            className="w-12 h-12 rounded-full overflow-hidden"
                            style={{ border: `1.5px solid ${c.accent}` }}
                          >
                            <img alt={player.name} src={getMascotForUser(player.seed)} className="w-full h-full object-cover" />
                          </div>
                          <div
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: c.accent, fontSize: 10, fontWeight: 900, color: '#000' }}
                          >
                            {player.rank}
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {player.name}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: c.accent, fontFamily: 'var(--font-price-display)', marginTop: 2 }}>
                          {player.bal}
                        </span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)' }}>CJP</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── User's own rank card ── */}
            {user && (
              <section className="mb-4">
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
                  Your Position
                </div>
                <div
                  className="rounded-2xl p-3.5 flex items-center gap-3"
                  style={{
                    background: 'rgba(255,191,0,0.08)',
                    border: '1px solid rgba(255,191,0,0.3)',
                    boxShadow: '0 0 18px rgba(255,191,0,0.12)',
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)', minWidth: 28, textAlign: 'center' }}>
                    #{currentUserRank ?? '—'}
                  </span>
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ border: '1.5px solid rgba(255,191,0,0.4)' }}>
                    <img alt="You" src={getMascotForUser(user?.telegram_id || telegramUser?.id)} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.username || telegramUser?.username || 'You'}
                      </span>
                      <span style={{ fontSize: 8, color: '#ffbf00', background: 'rgba(255,191,0,0.15)', borderRadius: 4, padding: '1px 5px', fontFamily: 'var(--font-label-mono)', fontWeight: 700 }}>YOU</span>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)' }}>{percentile || 'Calculating...'}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)' }}>{formatCoins(coins)}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)' }}>CJP</div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Rest of leaderboard ── */}
            {restPlayers.length > 0 && (
              <section className="space-y-2 pb-4">
                <div className="flex justify-between px-1" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                  <span>Rank & Player</span>
                  <span>Balance</span>
                </div>

                {restPlayers.map((player, idx) => (
                  <div
                    key={player.rank}
                    className="rounded-xl p-3.5 flex items-center gap-3 transition-all duration-150 active:scale-[0.98]"
                    style={{
                      background: 'rgba(14,14,14,0.7)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      animationDelay: `${idx * 40}ms`,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-label-mono)', minWidth: 24, textAlign: 'center' }}>
                      {player.rank}
                    </span>
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <img alt={player.name} src={getMascotForUser(player.seed)} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {player.name}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-price-display)' }}>
                        {player.bal}
                      </span>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-label-mono)' }}>CJP</div>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
