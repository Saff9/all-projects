'use client';

import React, { useState, useEffect } from 'react';
import { useApp, CJP_CHANNEL, CJP_GROUP } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

export default function Tasks() {
  const {
    coins,
    setCoins,
    user,
    setUser,
    backendUrl,
    initData,
    telegramUser,
    getMascotForUser,
    weeklyMissionProgress,
    achievements,
  } = useApp();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimingId, setClaimingId] = useState(null);
  const [mainSection, setMainSection] = useState('tasks');
  const [activeTab, setActiveTab] = useState('daily');

  const taskCategoryTabs = [
    { id: 'daily', label: 'Daily', icon: 'today' },
    { id: 'one-time', label: 'One-Time', icon: 'check_circle' },
    { id: 'social', label: 'Social', icon: 'group' },
    { id: 'boost', label: 'Boosts', icon: 'bolt' },
    { id: 'special', label: 'Special', icon: 'stars' },
    { id: 'partner', label: 'Partner', icon: 'handshake' },
  ];

  const [verifyTask, setVerifyTask] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adTaskId, setAdTaskId] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [toast, setToast] = useState({ text: '', type: '' });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 3000);
  };

  const fetchTasks = async () => {
    if (!backendUrl) return;
    try {
      setLoading(true);
      setError('');
      const headers = { 'Content-Type': 'application/json' };
      if (initData) {
        headers['Authorization'] = `Bearer ${initData}`;
      } else if (telegramUser) {
        headers['x-mock-init-data'] = `user=${encodeURIComponent(JSON.stringify(telegramUser))}`;
      }
      const res = await fetch(`${backendUrl}/api/tasks`, { method: 'GET', headers });
      if (res.ok) {
        setTasks(await res.json());
      } else {
        setError('Could not load tasks. Please try again.');
      }
    } catch {
      setError('Network error. Check server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [backendUrl, initData, telegramUser]);

  const handleTaskClick = (task) => {
    if (claimingId || task.completed) return;
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    if (task.id.startsWith('daily_ad_')) {
      triggerAdNetwork(task.id);
    } else if (task.type === 'social' || task.type === 'partner' || task.id === 'ot_tg_username' || task.id === 'ot_tg_photo' || task.id === 'ot_connect_ton' || task.id.startsWith('ot_refer_')) {
      setVerifyInput('');
      setVerificationFeedback('');
      setVerifyTask(task);
    } else {
      claimTask(task.id);
    }
  };

  const triggerAdNetwork = (taskId) => {
    if (typeof window !== 'undefined' && typeof window.show_11037745 === 'function') {
      window.show_11037745('pop')
        .then(() => claimTask(taskId))
        .catch(() => fallbackToAdSgram(taskId));
    } else {
      fallbackToAdSgram(taskId);
    }
  };

  const fallbackToAdSgram = (taskId) => {
    if (typeof window !== 'undefined' && window.Adsgram) {
      const AdController = window.Adsgram.init({ blockId: process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID || '3365' });
      AdController.show()
        .then(() => claimTask(taskId))
        .catch(() => startAdSimulation(taskId));
    } else {
      startAdSimulation(taskId);
    }
  };

  const startAdSimulation = (taskId) => {
    setAdTaskId(taskId);
    setAdCountdown(5);
    setShowAdModal(true);
  };

  useEffect(() => {
    if (!showAdModal) return;
    if (adCountdown === 0) {
      setShowAdModal(false);
      if (adTaskId) claimTask(adTaskId);
      return;
    }
    const timer = setTimeout(() => setAdCountdown((p) => p - 1), 1000);
    return () => clearTimeout(timer);
  }, [showAdModal, adCountdown, adTaskId]);

  const executeVerification = async () => {
    if (!verifyTask || verifying) return;
    setVerifying(true);
    setVerificationFeedback('Checking verification...');
    const msgs = ['Establishing API link...', 'Validating Telegram...', 'Checking records...', 'Verifying data...'];
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < msgs.length) setVerificationFeedback(msgs[idx++]);
    }, 800);

    setTimeout(async () => {
      clearInterval(interval);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (initData) headers['Authorization'] = `Bearer ${initData}`;
        else if (telegramUser) headers['x-mock-init-data'] = `user=${encodeURIComponent(JSON.stringify(telegramUser))}`;
        const res = await fetch(`${backendUrl}/api/verify-task`, {
          method: 'POST', headers,
          body: JSON.stringify({ taskId: verifyTask.id }),
        });
        const data = await res.json();
        if (res.ok) {
          setCoins(data.coins);
          if (user) setUser((p) => ({ ...p, coins: data.coins, completed_tasks: data.completed_tasks }));
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
          setVerifyTask(null);
          showToast(`+${verifyTask.reward?.toLocaleString('en-US')} CJP claimed!`, 'success');
          fetchTasks();
        } else {
          setVerificationFeedback(data.message || 'Verification failed. Try again.');
        }
      } catch {
        setVerificationFeedback('API error. Try again.');
      } finally {
        setVerifying(false);
      }
    }, 3200);
  };

  const claimTask = async (taskId) => {
    if (!backendUrl) return;
    setClaimingId(taskId);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (initData) headers['Authorization'] = `Bearer ${initData}`;
      else if (telegramUser) headers['x-mock-init-data'] = `user=${encodeURIComponent(JSON.stringify(telegramUser))}`;
      const res = await fetch(`${backendUrl}/api/claim-task`, { method: 'POST', headers, body: JSON.stringify({ taskId }) });
      if (res.ok) {
        const data = await res.json();
        setCoins(data.coins);
        if (user) setUser((p) => ({ ...p, coins: data.coins, completed_tasks: data.completed_tasks }));
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
        const claimed = tasks.find((t) => t.id === taskId);
        showToast(`+${claimed?.reward?.toLocaleString('en-US') || '?'} CJP earned!`, 'success');
        fetchTasks();
      } else {
        const err = await res.text();
        showToast(err || 'Failed to claim', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length || 108;
  const progressPercent = Math.min(100, Math.floor((completedCount / totalCount) * 100));
  const filteredTasks = tasks.filter((t) => t.type === activeTab);

  const weeklyProgress = weeklyMissionProgress || { taps: 0, refers: 0, ads: 0, checkins: 0, quizzes: 0, completed_at: null };
  const isWeeklyCompleted = !!weeklyProgress.completed_at;

  const weeklyMilestones = [
    { id: 'taps', label: 'Mining Target', description: 'Tap the mascot 2,000 times', current: weeklyProgress.taps || 0, target: 2000, icon: 'touch_app', color: '#ffbf00' },
    { id: 'refers', label: 'Referral Nudge', description: 'Invite 1 new user to CJP', current: weeklyProgress.refers || 0, target: 1, icon: 'person_add', color: '#60a5fa' },
    { id: 'ads', label: 'Sponsored Videos', description: 'Watch 3 rewarded ads', current: weeklyProgress.ads || 0, target: 3, icon: 'smart_display', color: '#a78bfa' },
    { id: 'checkins', label: 'Active Check-ins', description: 'Open the app 5 days this week', current: weeklyProgress.checkins || 0, target: 5, icon: 'calendar_today', color: '#22c55e' },
    { id: 'quizzes', label: 'Trivia Brain', description: 'Solve 1 daily trivia quiz', current: weeklyProgress.quizzes || 0, target: 1, icon: 'psychology', color: '#f97316' },
  ];

  const completedMilestonesCount = weeklyMilestones.filter((m) => m.current >= m.target).length;

  const LOCAL_ACHIEVEMENTS = [
    { id: 'first_blood', name: 'First Blood', description: 'Perform your first tap.', reward: 100, icon: 'touch_app' },
    { id: 'night_owl', name: 'Night Owl', description: 'Tap between 12AM–4AM.', reward: 200, icon: 'bedtime' },
    { id: 'speed_demon', name: 'Speed Demon', description: '300+ taps in one sync.', reward: 300, icon: 'speed' },
    { id: 'social_king', name: 'Social King', description: 'Refer 5 friends.', reward: 1000, icon: 'group' },
    { id: 'diamond_hands', name: 'Diamond Hands', description: '30-day login streak.', reward: 5000, icon: 'lock' },
    { id: 'first_spin', name: 'Wheel Spinner', description: 'Spin the wheel of fortune.', reward: 150, icon: 'refresh' },
    { id: 'first_flip', name: 'Card Trickster', description: 'Flip your first mystery card.', reward: 150, icon: 'layers' },
    { id: 'quiz_novice', name: 'Brainiac', description: 'Answer quiz correctly.', reward: 200, icon: 'psychology' },
    { id: 'pvp_first_wager', name: 'Gladiator', description: 'Join your first PvP battle.', reward: 250, icon: 'sports_mma' },
    { id: 'first_upgrade', name: 'Industrialist', description: 'Purchase first card upgrade.', reward: 200, icon: 'construction' },
    { id: 'hoarder_10k', name: 'CJP Collector', description: 'Amass 10,000 CJP.', reward: 300, icon: 'savings' },
    { id: 'halfway_there', name: 'Task Runner', description: 'Complete 20 tasks.', reward: 500, icon: 'check_circle' },
    { id: 'completionist', name: 'Legendary', description: 'Complete 50 tasks.', reward: 2000, icon: 'stars' },
    { id: 'military_colonel', name: 'Swarm Commander', description: 'Refer 10 friends.', reward: 2500, icon: 'military_tech' },
    { id: 'roach_tycoon', name: 'Roach Tycoon', description: '500 CJP/hr passive rate.', reward: 1000, icon: 'monetization_on' },
    { id: 'max_energy_1500', name: 'Nuclear Reactor', description: 'Max energy ≥ 1,500.', reward: 500, icon: 'bolt' },
    { id: 'roach_king_evolution', name: 'Royal Swarm', description: 'Evolve into Roach King.', reward: 1500, icon: 'crown' },
    { id: 'politician_evolution', name: 'Supreme Politician', description: 'Evolve into Supreme Roach.', reward: 3000, icon: 'gavel' },
    { id: 'ad_viewer_1', name: 'Ad Cadet', description: 'Watch a sponsored ad.', reward: 100, icon: 'play_circle' },
    { id: 'ad_enthusiast_10', name: 'Screen Addict', description: 'Watch 10 sponsored ads.', reward: 500, icon: 'tv' },
    { id: 'streak_3', name: 'Daily Habit', description: '3-day login streak.', reward: 200, icon: 'calendar_today' },
    { id: 'streak_7', name: 'Unstoppable', description: '7-day login streak.', reward: 1000, icon: 'calendar_month' },
    { id: 'pvp_winner_5', name: 'Duellist', description: 'Win 5 PvP matches.', reward: 1000, icon: 'sports_mma' },
    { id: 'pvp_champion_20', name: 'Arena Champion', description: 'Win 20 PvP matches.', reward: 5000, icon: 'emoji_events' },
    { id: 'cjp_millionaire', name: 'CJP Millionaire', description: '1,000,000 CJP balance.', reward: 5000, icon: 'payments' },
    { id: 'weekly_mission_clear_1', name: 'Mission Done', description: 'Complete a weekly mission.', reward: 2000, icon: 'map' },
    { id: 'flash_raider_1', name: 'Raid Commando', description: 'Complete a flash raid.', reward: 1000, icon: 'flash_on' },
    { id: 'jackpot_winner', name: 'Lucky Bug', description: 'Hit jackpot on the wheel.', reward: 5000, icon: 'casino' },
    { id: 'double_bomb_active', name: 'Roach Bomb', description: 'Flip a Cockroach Bomb card.', reward: 1000, icon: 'dangerous' },
    { id: 'elite_supporter', name: 'Web3 Citizen', description: 'Connect your TON wallet.', reward: 500, icon: 'account_balance_wallet' },
  ];

  const unlockedList = achievements || [];
  const unlockedCount = LOCAL_ACHIEVEMENTS.filter((a) => unlockedList.includes(a.id)).length;

  const SECTION_TABS = [
    { id: 'tasks', label: '108 Tasks', icon: 'task_alt' },
    { id: 'weekly_mission', label: 'Weekly', icon: 'map' },
    { id: 'achievements', label: 'Badges', icon: 'emoji_events' },
  ];

  return (
    <div className="bg-black text-on-surface font-body-md min-h-screen pb-28 overflow-x-hidden select-none">

      {/* Toast */}
      {toast.text && (
        <div
          className="fixed top-16 left-4 right-4 z-[200] rounded-2xl px-4 py-3 flex items-center gap-2 animate-fade-in"
          style={{
            background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: toast.type === 'success' ? '#22c55e' : '#ef4444', fontVariationSettings: "'FILL' 1" }}>
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: toast.type === 'success' ? '#22c55e' : '#ef4444' }}>{toast.text}</span>
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
          <h1 style={{ fontSize: 17, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)', letterSpacing: '-0.02em' }}>Tasks</h1>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,191,0,0.1)', border: '1px solid rgba(255,191,0,0.25)' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ffbf00', fontFamily: 'var(--font-label-mono)' }}>
            {coins >= 1_000_000 ? (coins / 1_000_000).toFixed(2) + 'M' : coins >= 1_000 ? (coins / 1_000).toFixed(1) + 'K' : coins.toLocaleString()}
          </span>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto">

        {/* Section selector */}
        <div
          className="flex gap-1 mb-5 p-1 rounded-2xl"
          style={{ background: 'rgba(14,14,14,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMainSection(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all active:scale-95"
              style={{
                background: mainSection === tab.id ? 'linear-gradient(135deg, #ffbf00, #ff8c00)' : 'transparent',
                color: mainSection === tab.id ? '#000' : 'rgba(255,255,255,0.4)',
                fontSize: 11,
                fontWeight: mainSection === tab.id ? 800 : 600,
                boxShadow: mainSection === tab.id ? '0 4px 12px rgba(255,191,0,0.3)' : 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: mainSection === tab.id ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ SECTION 1: TASKS ═══ */}
        {mainSection === 'tasks' && (
          <div className="space-y-4">
            {/* Progress HUD */}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(14,14,14,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Progress
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ffbf00', fontFamily: 'var(--font-label-mono)' }}>
                  {completedCount} / {totalCount} done
                </span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', padding: '2px' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #ffbf00)',
                    boxShadow: '0 0 8px rgba(255,191,0,0.5)',
                  }}
                />
              </div>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 6, textAlign: 'center', fontFamily: 'var(--font-label-mono)' }}>
                Complete all tasks to maximize CJP earnings
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {taskCategoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap active:scale-95 transition-all shrink-0"
                  style={{
                    background: activeTab === tab.id ? 'rgba(255,191,0,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${activeTab === tab.id ? 'rgba(255,191,0,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    color: activeTab === tab.id ? '#ffbf00' : 'rgba(255,255,255,0.4)',
                    fontSize: 11,
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    boxShadow: activeTab === tab.id ? '0 0 10px rgba(255,191,0,0.15)' : 'none',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13, fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 12, color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* Task list */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 36, color: '#ffbf00' }}>progress_activity</span>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 10, fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Syncing tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'rgba(255,255,255,0.15)' }}>inbox</span>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>No tasks in this category</p>
              </div>
            ) : (
              <div className="space-y-2.5 pb-4">
                {filteredTasks.map((task) => {
                  const isClaimed = task.completed;
                  const isProcessing = claimingId === task.id;

                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl p-4 flex items-center gap-3 transition-all"
                      style={{
                        background: isClaimed ? 'rgba(255,255,255,0.02)' : 'rgba(14,14,14,0.85)',
                        border: isClaimed ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.08)',
                        opacity: isClaimed ? 0.55 : 1,
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: isClaimed ? 'rgba(255,255,255,0.04)' : 'rgba(255,191,0,0.1)',
                          border: `1px solid ${isClaimed ? 'rgba(255,255,255,0.06)' : 'rgba(255,191,0,0.2)'}`,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: 22, color: isClaimed ? 'rgba(255,255,255,0.3)' : '#ffbf00', fontVariationSettings: isClaimed ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          {isClaimed ? 'check_circle' : (task.icon || 'star')}
                        </span>
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="truncate"
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: isClaimed ? 'rgba(255,255,255,0.35)' : '#fff',
                            textDecoration: isClaimed ? 'line-through' : 'none',
                            lineHeight: 1.2,
                          }}
                        >
                          {task.title}
                        </h3>
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                          {task.description}
                        </p>
                        {!isClaimed && (
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#ffbf00',
                              fontFamily: 'var(--font-label-mono)',
                              background: 'rgba(255,191,0,0.1)',
                              borderRadius: 4,
                              padding: '1px 6px',
                            }}
                          >
                            +{task.reward?.toLocaleString('en-US')} CJP
                          </span>
                        )}
                      </div>

                      {/* Button */}
                      <button
                        disabled={isClaimed || isProcessing}
                        onClick={() => handleTaskClick(task)}
                        className="shrink-0 active:scale-90 transition-all"
                        style={{
                          padding: '8px 14px',
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 700,
                          background: isClaimed
                            ? 'rgba(255,255,255,0.05)'
                            : isProcessing
                            ? 'rgba(255,191,0,0.2)'
                            : 'linear-gradient(135deg, #ffbf00, #ff8c00)',
                          color: isClaimed ? 'rgba(255,255,255,0.2)' : isProcessing ? '#ffbf00' : '#000',
                          border: isClaimed ? '1px solid rgba(255,255,255,0.06)' : 'none',
                          cursor: isClaimed ? 'not-allowed' : 'pointer',
                          boxShadow: !isClaimed && !isProcessing ? '0 4px 10px rgba(255,191,0,0.25)' : 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isClaimed ? '✓ Done' : isProcessing ? '...' : 'Start'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ SECTION 2: WEEKLY MISSION ═══ */}
        {mainSection === 'weekly_mission' && (
          <div className="space-y-4 animate-slide-up">
            {/* Bounty card */}
            <div
              className="rounded-3xl p-5 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,191,0,0.12), rgba(255,140,0,0.06))',
                border: '1px solid rgba(255,191,0,0.25)',
              }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,191,0,0.15), transparent)', filter: 'blur(20px)' }} />
              <span style={{ fontSize: 9, color: 'rgba(255,191,0,0.7)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>
                Weekly Expedition
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginTop: 4, fontFamily: 'var(--font-price-display)' }}>Mission Map</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 6, lineHeight: 1.6, maxWidth: 240, margin: '6px auto 0' }}>
                Complete all 5 objectives to claim the legendary 10,000 CJP bounty.
              </p>

              <div
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,191,0,0.12)', border: '1px solid rgba(255,191,0,0.25)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#ffbf00', fontFamily: 'var(--font-price-display)' }}>10,000 CJP Bounty</span>
              </div>

              <div
                className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: isWeeklyCompleted ? 'rgba(34,197,94,0.15)' : 'rgba(255,191,0,0.1)',
                  border: `1px solid ${isWeeklyCompleted ? 'rgba(34,197,94,0.3)' : 'rgba(255,191,0,0.2)'}`,
                  color: isWeeklyCompleted ? '#22c55e' : '#ffbf00',
                  fontFamily: 'var(--font-label-mono)',
                  fontSize: 10,
                }}
              >
                {isWeeklyCompleted ? '✓ CLAIMED' : `${completedMilestonesCount}/5 DONE`}
              </div>
            </div>

            {/* Milestones */}
            <div className="space-y-3">
              {weeklyMilestones.map((m) => {
                const done = m.current >= m.target;
                const pct = Math.min(100, Math.floor((m.current / m.target) * 100));
                return (
                  <div
                    key={m.id}
                    className="rounded-2xl p-4 flex items-start gap-3"
                    style={{
                      background: done ? 'rgba(34,197,94,0.06)' : 'rgba(14,14,14,0.8)',
                      border: done ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: done ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 20, color: done ? '#22c55e' : m.color, fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {done ? 'check_circle' : m.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-2">
                        <h4 style={{ fontSize: 12, fontWeight: 700, color: done ? '#22c55e' : '#fff' }}>{m.label}</h4>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-label-mono)', fontWeight: 600 }}>
                          {m.current} / {m.target}
                        </span>
                      </div>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, lineHeight: 1.4 }}>{m.description}</p>
                      <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: done ? '#22c55e' : m.color,
                            boxShadow: `0 0 6px ${m.color}66`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ SECTION 3: ACHIEVEMENTS ═══ */}
        {mainSection === 'achievements' && (
          <div className="space-y-4 animate-slide-up">
            {/* Header card */}
            <div
              className="rounded-3xl p-5 text-center relative overflow-hidden"
              style={{ background: 'rgba(14,14,14,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span style={{ fontSize: 9, color: 'rgba(255,191,0,0.7)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700 }}>Janta Hall of Fame</span>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginTop: 4, fontFamily: 'var(--font-price-display)' }}>Achievement Badges</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6, lineHeight: 1.5 }}>Unlock by tapping, referring, upgrading, and conquering PvP duels.</p>
              <div
                className="inline-block mt-4 px-4 py-1.5 rounded-full"
                style={{ background: 'rgba(255,191,0,0.1)', border: '1px solid rgba(255,191,0,0.2)' }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ffbf00', fontFamily: 'var(--font-label-mono)' }}>
                  {unlockedCount} / 30 Unlocked
                </span>
              </div>

              {/* Progress ring-like bar */}
              <div className="mt-3 mx-auto max-w-[180px] h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((unlockedCount / 30) * 100)}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #ffbf00)',
                    boxShadow: '0 0 6px rgba(255,191,0,0.5)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            {/* Badge grid */}
            <div className="grid grid-cols-3 gap-3 pb-4">
              {LOCAL_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = unlockedList.includes(ach.id);
                return (
                  <button
                    key={ach.id}
                    onClick={() => setSelectedAchievement(ach)}
                    className="rounded-2xl p-3 flex flex-col items-center text-center active:scale-95 transition-all"
                    style={{
                      background: isUnlocked ? 'rgba(255,191,0,0.08)' : 'rgba(14,14,14,0.6)',
                      border: isUnlocked ? '1px solid rgba(255,191,0,0.25)' : '1px solid rgba(255,255,255,0.05)',
                      opacity: isUnlocked ? 1 : 0.5,
                      boxShadow: isUnlocked ? '0 0 12px rgba(255,191,0,0.08)' : 'none',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                      style={{
                        background: isUnlocked ? 'rgba(255,191,0,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isUnlocked ? 'rgba(255,191,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 22, color: isUnlocked ? '#ffbf00' : 'rgba(255,255,255,0.3)', fontVariationSettings: isUnlocked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {ach.icon}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: isUnlocked ? 700 : 500, color: isUnlocked ? '#fff' : 'rgba(255,255,255,0.4)', lineHeight: 1.3, textAlign: 'center' }}>
                      {ach.name}
                    </span>
                    {isUnlocked && (
                      <span style={{ fontSize: 8, color: '#ffbf00', fontFamily: 'var(--font-label-mono)', marginTop: 3, fontWeight: 700 }}>
                        +{ach.reward.toLocaleString()} CJP
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ═══ MODALS ═══ */}

      {/* Verify Task Drawer */}
      {verifyTask && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => e.target === e.currentTarget && setVerifyTask(null)}
        >
          <div
            className="max-w-sm w-full rounded-t-3xl flex flex-col animate-slide-up"
            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="px-5 pb-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Verify Task</h3>
                <button onClick={() => setVerifyTask(null)} style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
                </button>
              </div>

              <div className="rounded-xl p-3" style={{ background: 'rgba(255,191,0,0.06)', border: '1px solid rgba(255,191,0,0.15)' }}>
                <div style={{ fontSize: 9, color: '#ffbf00', fontFamily: 'var(--font-label-mono)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 }}>
                  Reward: +{verifyTask.reward?.toLocaleString('en-US')} CJP
                </div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{verifyTask.title}</h4>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3, lineHeight: 1.5 }}>{verifyTask.description}</p>
              </div>

              <a
                href={
                  verifyTask.id === 'ot_join_tg_channel' ? CJP_CHANNEL :
                  verifyTask.id === 'ot_join_tg_group' ? CJP_GROUP :
                  verifyTask.id === 'ot_follow_x' ? 'https://x.com/cjp_swarm' :
                  CJP_CHANNEL
                }
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12 }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
                Complete Task Action
              </a>

              {(verifyTask.type === 'social' || verifyTask.type === 'partner') &&
                verifyTask.id !== 'ot_connect_ton' && !verifyTask.id.startsWith('ot_refer_') && (
                <div>
                  <label style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-label-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                    Verification handle / link
                  </label>
                  <input
                    type="text"
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    placeholder={verifyTask.id.includes('x') ? '@yourhandle' : 'Enter handle or link'}
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#fff',
                      outline: 'none', fontFamily: 'var(--font-body-md)',
                    }}
                  />
                </div>
              )}

              {verificationFeedback && (
                <div className="text-center rounded-xl py-2.5" style={{ background: 'rgba(255,191,0,0.06)', border: '1px solid rgba(255,191,0,0.15)', fontSize: 11, color: '#ffbf00' }}>
                  {verificationFeedback}
                </div>
              )}

              <button
                onClick={executeVerification}
                disabled={verifying}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 active:scale-97 transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #ffbf00, #ff8c00)', color: '#000', boxShadow: '0 4px 20px rgba(255,191,0,0.3)' }}
              >
                {verifying ? (
                  <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>Verifying...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>Claim Reward</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Simulation Modal */}
      {showAdModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)' }}>
          <div
            className="max-w-sm w-full p-8 rounded-3xl flex flex-col items-center text-center gap-5"
            style={{ background: 'rgba(12,12,12,0.98)', border: '1px solid rgba(255,191,0,0.2)' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,191,0,0.1)', border: '1px solid rgba(255,191,0,0.3)' }}>
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: 34, color: '#ffbf00' }}>smart_display</span>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Sponsor Network</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6, lineHeight: 1.6 }}>Streaming ad. Do not close — reward pending.</p>
            </div>
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="rgba(255,191,0,0.1)" strokeWidth="5" fill="transparent" />
                <circle cx="40" cy="40" r="34" stroke="#ffbf00" strokeWidth="5" fill="transparent"
                  strokeDasharray={213.6}
                  strokeDashoffset={213.6 - (213.6 * (5 - adCountdown)) / 5}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute" style={{ fontSize: 20, fontWeight: 900, color: '#ffbf00', fontFamily: 'var(--font-price-display)' }}>{adCountdown}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Detail */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => e.target === e.currentTarget && setSelectedAchievement(null)}
        >
          <div
            className="max-w-sm w-full rounded-t-3xl flex flex-col animate-slide-up"
            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="px-5 pb-8 flex flex-col items-center text-center gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: unlockedList.includes(selectedAchievement.id) ? 'rgba(255,191,0,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${unlockedList.includes(selectedAchievement.id) ? 'rgba(255,191,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: unlockedList.includes(selectedAchievement.id) ? '0 0 24px rgba(255,191,0,0.2)' : 'none',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 36, color: unlockedList.includes(selectedAchievement.id) ? '#ffbf00' : 'rgba(255,255,255,0.3)', fontVariationSettings: unlockedList.includes(selectedAchievement.id) ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {selectedAchievement.icon}
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'var(--font-price-display)' }}>{selectedAchievement.name}</h4>
                <span
                  style={{
                    display: 'inline-block', marginTop: 6, fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-label-mono)',
                    padding: '3px 10px', borderRadius: 999,
                    background: unlockedList.includes(selectedAchievement.id) ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${unlockedList.includes(selectedAchievement.id) ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    color: unlockedList.includes(selectedAchievement.id) ? '#22c55e' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {unlockedList.includes(selectedAchievement.id) ? '✓ UNLOCKED' : '🔒 LOCKED'}
                </span>
              </div>

              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 250 }}>{selectedAchievement.description}</p>

              <div
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,191,0,0.08)', border: '1px solid rgba(255,191,0,0.2)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ffbf00', fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)' }}>+{selectedAchievement.reward.toLocaleString()} CJP</span>
              </div>

              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm active:scale-97 transition-all"
                style={{ background: 'linear-gradient(135deg, #ffbf00, #ff8c00)', color: '#000', boxShadow: '0 4px 16px rgba(255,191,0,0.25)' }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
