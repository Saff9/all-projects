'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// ── Official CJP Community Links (single source of truth) ──
export const CJP_BOT       = 'https://t.me/cjpcoin_bot';
export const CJP_CHANNEL   = 'https://t.me/CockroachJantaPartyCJ';
export const CJP_GROUP     = 'https://t.me/+oYny5ONmzbhhMDQ1';
export const CJP_BOT_NAME  = 'cjpcoin_bot';

export const AppProvider = ({ children }) => {
  const [telegramUser, setTelegramUser] = useState(null);
  const [initData, setInitData] = useState('');
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const [maxEnergy, setMaxEnergy] = useState(1000);
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState('');

  // Economy Metrics states
  const [tonWallet, setTonWallet] = useState(null);
  const [claimedCoins, setClaimedCoins] = useState(0);
  const [tapValue, setTapValue] = useState(1.0);
  const [daysUntilNextHalving, setDaysUntilNextHalving] = useState(30);
  const [remainingPool, setRemainingPool] = useState(10000000000);

  // Gamification states
  const [upgrades, setUpgrades] = useState([]);
  const [passiveIncomeRate, setPassiveIncomeRate] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [weeklyMissionProgress, setWeeklyMissionProgress] = useState(null);
  const [pvpWins, setPvpWins] = useState(0);
  const [pvpLosses, setPvpLosses] = useState(0);
  const [pvpEarnings, setPvpEarnings] = useState(0);
  const [streakDays, setStreakDays] = useState(1);
  const [lastCheckin, setLastCheckin] = useState(null);
  const [lastSpinTime, setLastSpinTime] = useState(null);
  const [lastCardFlipTime, setLastCardFlipTime] = useState(null);
  const [lastQuizTime, setLastQuizTime] = useState(null);
  const [upgradeCardsMetadata, setUpgradeCardsMetadata] = useState(null);
  const [achievementsMetadata, setAchievementsMetadata] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [streakMultiplier, setStreakMultiplier] = useState(1);

  const syncTimeoutRef = useRef(null);
  const coinsRef = useRef(0);
  const energyRef = useRef(1000);

  // Sync refs with state so the sync function always has latest values
  useEffect(() => {
    coinsRef.current = coins;
    energyRef.current = energy;
  }, [coins, energy]);

  useEffect(() => {
    // Determine Backend URL
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    setBackendUrl(url);

    // Initialize Telegram WebApp
    if (typeof window !== 'undefined') {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        // Intercept CloudStorage version issues (supported in version 6.2+)
        try {
          const isCloudStorageSupported = (version) => {
            if (!version) return false;
            const parts = version.split('.');
            const major = parseInt(parts[0], 10);
            const minor = parseInt(parts[1], 10);
            return major > 6 || (major === 6 && minor >= 2);
          };
          
          const supported = isCloudStorageSupported(tg.version);
          let needsMock = !supported;
          if (supported) {
            try {
              if (!tg.CloudStorage) {
                needsMock = true;
              }
            } catch (e) {
              needsMock = true;
            }
          }
          
          if (needsMock) {
            console.log("Mocking CloudStorage on Telegram WebApp (falling back to localStorage)");
            const mockCloudStorage = {
              setItem: function(key, value, callback) {
                try {
                  localStorage.setItem('tg_cloud_' + key, value);
                  if (typeof callback === 'function') callback(null, true);
                } catch (e) {
                  if (typeof callback === 'function') callback(e, false);
                }
              },
              getItem: function(key, callback) {
                try {
                  const val = localStorage.getItem('tg_cloud_' + key);
                  if (typeof callback === 'function') callback(null, val);
                } catch (e) {
                  if (typeof callback === 'function') callback(e, null);
                }
              },
              getItems: function(keys, callback) {
                try {
                  const results = {};
                  keys.forEach(k => {
                    results[k] = localStorage.getItem('tg_cloud_' + k);
                  });
                  if (typeof callback === 'function') callback(null, results);
                } catch (e) {
                  if (typeof callback === 'function') callback(e, null);
                }
              },
              removeItem: function(key, callback) {
                try {
                  localStorage.removeItem('tg_cloud_' + key);
                  if (typeof callback === 'function') callback(null, true);
                } catch (e) {
                  if (typeof callback === 'function') callback(e, false);
                }
              },
              removeItems: function(keys, callback) {
                try {
                  keys.forEach(k => {
                    localStorage.removeItem('tg_cloud_' + k);
                  });
                  if (typeof callback === 'function') callback(null, true);
                } catch (e) {
                  if (typeof callback === 'function') callback(e, false);
                }
              },
              getKeys: function(callback) {
                try {
                  const keys = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('tg_cloud_')) {
                      keys.push(k.substring(9));
                    }
                  }
                  if (typeof callback === 'function') callback(null, keys);
                } catch (e) {
                  if (typeof callback === 'function') callback(e, null);
                }
              }
            };
            Object.defineProperty(tg, 'CloudStorage', {
              value: mockCloudStorage,
              writable: true,
              configurable: true,
              enumerable: true
            });
          }
        } catch (storageErr) {
          console.error("Failed to inject CloudStorage fallback:", storageErr);
        }

        tg.ready();
        tg.expand();
        
        const rawData = tg.initData || '';
        setInitData(rawData);
        
        if (tg.initDataUnsafe?.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        } else {
          // Fallback mock user for desktop browser testing if not inside Telegram
          console.warn("Running outside Telegram. Loading mock credentials.");
          setTelegramUser({
            id: '12345678',
            username: 'degenking',
            first_name: 'DegenKing'
          });
        }
      } else {
        // Fallback mock user if script is missing
        setTelegramUser({
          id: '12345678',
          username: 'degenking',
          first_name: 'DegenKing'
        });
      }
    }

    // Initialize Libtl inApp interstitial ads after a short delay
    if (typeof window !== 'undefined') {
      const checkAndInitLibtl = () => {
        if (typeof window.show_11037745 === 'function') {
          try {
            window.show_11037745({
              type: 'inApp',
              inAppSettings: {
                frequency: 2,
                capping: 0.1,
                interval: 30,
                timeout: 5,
                everyPage: false
              }
            });
            console.log("Libtl inApp interstitial initialized in AppContext.");
          } catch (e) {
            console.error("Failed to initialize Libtl inApp interstitial:", e);
          }
        } else {
          setTimeout(checkAndInitLibtl, 1000);
        }
      };
      setTimeout(checkAndInitLibtl, 1500);
    }
  }, []);

  const updateStateFromUserData = (data) => {
    setUser(data);
    setCoins(data.coins);
    setEnergy(data.energy);
    setMaxEnergy(data.max_energy);
    setTonWallet(data.ton_wallet);
    setClaimedCoins(data.claimed_coins || 0);
    setTapValue(data.tapValue || 1.0);
    setDaysUntilNextHalving(data.daysUntilNextHalving !== undefined ? data.daysUntilNextHalving : 30);
    setRemainingPool(data.remainingPool !== undefined ? data.remainingPool : 10000000000);
    setUpgrades(data.upgrades || []);
    setPassiveIncomeRate(data.passive_income_rate || 0);
    setAchievements(data.achievements || []);
    setWeeklyMissionProgress(data.weekly_mission_progress || null);
    setPvpWins(data.pvp_wins || 0);
    setPvpLosses(data.pvp_losses || 0);
    setPvpEarnings(data.pvp_earnings || 0);
    setStreakDays(data.streak_days || 1);
    setLastCheckin(data.last_checkin || null);
    setLastSpinTime(data.last_spin_time || null);
    setLastCardFlipTime(data.last_card_flip_time || null);
    setLastQuizTime(data.last_quiz_time || null);
    setStreakMultiplier(data.streakMultiplier || 1);
    if (data.evolution) setEvolution(data.evolution);
    if (data.upgradeCardsMetadata) setUpgradeCardsMetadata(data.upgradeCardsMetadata);
    if (data.achievementsMetadata) setAchievementsMetadata(data.achievementsMetadata);
  };

  // Fetch or create user from backend once telegramUser is loaded
  // useCallback so it's stable across renders and can be called externally
  const fetchUserProfile = useCallback(async () => {
    if (!telegramUser || !backendUrl) return;
    try {
      setLoading(true);
      // Extract start_param for referral tracking if present
      let referredBy = null;
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.start_param) {
        referredBy = window.Telegram.WebApp.initDataUnsafe.start_param;
      }

      const headers = { 'Content-Type': 'application/json' };

      // Real Telegram auth
      if (initData) {
        headers['Authorization'] = `Bearer ${initData}`;
      } else {
        // Dev mock fallback
        headers['x-mock-init-data'] = `user=${encodeURIComponent(JSON.stringify(telegramUser))}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${backendUrl}/api/user`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ referred_by: referredBy }),
        signal: controller.signal,
        keepalive: true,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        updateStateFromUserData(await res.json());
      } else {
        console.error('Failed to load user profile:', res.status);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error loading user profile:', err);
      }
    } finally {
      setLoading(false);
    }
  // Only depend on stable values — initData changes AFTER telegramUser, so we
  // guard with a separate effect to avoid double-fetch on first load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramUser, backendUrl]);

  // Fetch profile when telegramUser first appears
  useEffect(() => {
    if (telegramUser && backendUrl) {
      fetchUserProfile();
    }
  // initData deliberately excluded: it arrives later and should NOT re-trigger
  // the profile fetch — the auth header is read fresh inside fetchUserProfile.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramUser, backendUrl]);

  // Local energy regeneration (1 energy per 3 seconds)
  useEffect(() => {
    if (loading || !user) return;

    const regenInterval = setInterval(() => {
      setEnergy((prevEnergy) => {
        if (prevEnergy < maxEnergy) {
          return prevEnergy + 1;
        }
        return prevEnergy;
      });
    }, 3000);

    return () => clearInterval(regenInterval);
  }, [loading, user, maxEnergy]);

  // Build auth headers (memoized helper — avoids repeated inline code)
  const buildHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (initData) {
      headers['Authorization'] = `Bearer ${initData}`;
    } else if (telegramUser) {
      headers['x-mock-init-data'] = `user=${encodeURIComponent(JSON.stringify(telegramUser))}`;
    }
    return headers;
  }, [initData, telegramUser]);

  // Debounced tap sync — batches taps every 1.5s of inactivity
  const syncTapsWithBackend = useCallback(() => {
    if (!backendUrl || !user) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${backendUrl}/api/tap`, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify({
            coins: coinsRef.current,
            energy: energyRef.current,
          }),
          keepalive: true,
        });

        if (res.ok) {
          updateStateFromUserData(await res.json());
        } else if (res.status === 400) {
          const data = await res.json();
          if (data.error === 'CheatDetected') {
            updateStateFromUserData(data);
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
            window.Telegram?.WebApp?.showAlert(data.message || 'Anti-cheat: suspicious taps discarded.');
          }
        }
      } catch (err) {
        // Silently fail — taps are local-first, sync is best-effort
      }
    }, 1500);
  }, [backendUrl, user, buildHeaders]);

  const handleTap = (amount = 1) => {
    if (energy > 0) {
      setCoins((prev) => prev + amount);
      setEnergy((prev) => Math.max(0, prev - 1));
      syncTapsWithBackend();
      return true;
    }
    return false;
  };


  // ── API helper: shared fetch wrapper ──────────────────────────────
  const apiFetch = useCallback(async (path, { method = 'POST', body } = {}) => {
    if (!backendUrl) return null;
    try {
      const opts = {
        method,
        headers: buildHeaders(),
        keepalive: true,
      };
      if (body !== undefined) opts.body = JSON.stringify(body);
      const res = await fetch(`${backendUrl}${path}`, opts);
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return null;
    }
  }, [backendUrl, buildHeaders]);

  // Connect TON Wallet
  const connectTonWallet = useCallback(async (address) => {
    const r = await apiFetch('/api/wallet/connect', { body: { address } });
    if (!r || !r.ok) return false;
    setTonWallet(r.data.ton_wallet);
    setCoins(r.data.coins);
    setUser(prev => ({ ...prev, ton_wallet: r.data.ton_wallet, coins: r.data.coins, completed_tasks: r.data.completed_tasks }));
    return true;
  }, [apiFetch]);

  // Claim Mined Coins as Jettons
  const claimMinedCoins = useCallback(async () => {
    const r = await apiFetch('/api/wallet/claim');
    if (!r) return { success: false, message: 'Network error' };
    if (r.ok) {
      setCoins(r.data.coins);
      setClaimedCoins(r.data.claimed_coins);
      setUser(prev => ({ ...prev, coins: r.data.coins, claimed_coins: r.data.claimed_coins }));
      return { success: true, message: r.data.message };
    }
    return { success: false, message: r.data.message || 'Failed to claim' };
  }, [apiFetch]);

  // Buy card upgrade
  const buyUpgradeCard = useCallback(async (cardId) => {
    const r = await apiFetch('/api/shop/buy', { body: { cardId } });
    if (!r) return { success: false, message: 'Network error' };
    if (r.ok) {
      setCoins(r.data.coins);
      setUpgrades(r.data.upgrades);
      setMaxEnergy(r.data.max_energy);
      setPassiveIncomeRate(r.data.passive_income_rate);
      if (r.data.evolution) setEvolution(r.data.evolution);
      setUser(prev => ({ ...prev, coins: r.data.coins, upgrades: r.data.upgrades, max_energy: r.data.max_energy, passive_income_rate: r.data.passive_income_rate, evolution: r.data.evolution }));
      return { success: true, message: r.data.message };
    }
    return { success: false, message: r.data.message || 'Failed to upgrade' };
  }, [apiFetch]);

  // Spin Wheel of Fortune
  const spinWheel = useCallback(async () => {
    const r = await apiFetch('/api/games/spin');
    if (!r) return { success: false, message: 'Network error' };
    if (r.ok) {
      setCoins(r.data.coins);
      setLastSpinTime(r.data.last_spin_time);
      setAchievements(r.data.achievements || []);
      setUser(prev => ({ ...prev, coins: r.data.coins, last_spin_time: r.data.last_spin_time, achievements: r.data.achievements }));
      return { success: true, reward: r.data.reward, isFree: r.data.isFree };
    }
    return { success: false, message: r.data.message || 'Spin failed' };
  }, [apiFetch]);

  // Mystery Card Flip
  const flipMysteryCard = useCallback(async () => {
    const r = await apiFetch('/api/games/card-flip');
    if (!r) return { success: false, message: 'Network error' };
    if (r.ok) {
      setCoins(r.data.coins);
      setLastCardFlipTime(r.data.last_card_flip_time);
      setAchievements(r.data.achievements || []);
      setUser(prev => ({ ...prev, coins: r.data.coins, last_card_flip_time: r.data.last_card_flip_time, achievements: r.data.achievements }));
      return { success: true, rewardType: r.data.rewardType, rewardValue: r.data.rewardValue, rewardLabel: r.data.rewardLabel, isFree: r.data.isFree };
    }
    return { success: false, message: r.data.message || 'Card flip failed' };
  }, [apiFetch]);

  // Get Quiz Question
  const getQuizQuestion = useCallback(async () => {
    const r = await apiFetch('/api/games/quiz');
    return (r && r.ok) ? r.data : null;
  }, [apiFetch]);

  // Submit Quiz Answer
  const submitQuizAnswer = useCallback(async (answer) => {
    const r = await apiFetch('/api/games/quiz/submit', { body: { answer } });
    if (!r) return { success: false, message: 'Network error' };
    if (r.ok) {
      if (r.data.correct) {
        setCoins(r.data.coins);
        setUser(prev => ({ ...prev, coins: r.data.coins }));
      }
      return { success: true, correct: r.data.correct, message: r.data.message };
    }
    return { success: false, message: r.data.message || 'Submission failed' };
  }, [apiFetch]);

  // PvP Battle Start
  const startPvP = useCallback(async (wager) => {
    const r = await apiFetch('/api/pvp/battle', { body: { wager } });
    if (!r) return { success: false, message: 'Network error' };
    if (r.ok) return { success: true, opponentName: r.data.opponentName, opponentMin: r.data.opponentMin, opponentMax: r.data.opponentMax, wager: r.data.wager };
    return { success: false, message: r.data.message || 'Wager match failed' };
  }, [apiFetch]);

  // PvP Battle Resolve
  const resolvePvP = useCallback(async (wager, userTaps, opponentMin, opponentMax) => {
    const r = await apiFetch('/api/pvp/battle/resolve', { body: { wager, userTaps, opponentMin, opponentMax } });
    if (!r) return { success: false, message: 'Network error' };
    if (r.ok) {
      setCoins(r.data.coins);
      setPvpWins(r.data.pvp_wins);
      setPvpLosses(r.data.pvp_losses);
      setPvpEarnings(r.data.pvp_earnings);
      setUser(prev => ({ ...prev, coins: r.data.coins, pvp_wins: r.data.pvp_wins, pvp_losses: r.data.pvp_losses, pvp_earnings: r.data.pvp_earnings }));
      return { success: true, win: r.data.win, userTaps: r.data.userTaps, opponentTaps: r.data.opponentTaps, coins: r.data.coins, pvpWins: r.data.pvp_wins, pvpLosses: r.data.pvp_losses, pvpEarnings: r.data.pvp_earnings };
    }
    return { success: false, message: r.data.message || 'PvP resolution failed' };
  }, [apiFetch]);

  // Flash Raid Trigger
  const triggerFlashRaid = useCallback(async () => {
    const r = await apiFetch('/api/games/flash-raid/trigger');
    return (r && r.ok) ? r.data : null;
  }, [apiFetch]);

  // Flash Raid Sync
  const syncFlashRaidTaps = useCallback(async (taps) => {
    const r = await apiFetch('/api/games/flash-raid/sync', { body: { taps } });
    if (!r || !r.ok) return { success: false };
    if (r.data.completed) {
      setCoins(r.data.coins);
      setUser(prev => ({ ...prev, coins: r.data.coins }));
    }
    return { success: true, completed: r.data.completed, taps: r.data.taps, coins: r.data.coins };
  }, [apiFetch]);

  // Tournament countdown
  const getTournamentCountdown = useCallback(async () => {
    const r = await apiFetch('/api/games/tournament', { method: 'GET' });
    return (r && r.ok) ? r.data : null;
  }, [apiFetch]);

  // Claim video completed reward
  const claimVideoReward = useCallback(async (videoId) => {
    const r = await apiFetch('/api/games/video-claim', { body: { videoId } });
    if (!r) return { success: false, message: 'Network error' };
    if (r.ok) {
      setCoins(r.data.coins);
      setUser(prev => prev ? { ...prev, coins: r.data.coins, watched_videos: r.data.watched_videos || prev.watched_videos } : null);
      return { success: true, message: r.data.message };
    }
    return { success: false, message: r.data.message || 'Failed to claim video reward.' };
  }, [apiFetch]);

  // Get a stable randomized mascot image for a user based on their ID/seed
  const getMascotForUser = useCallback((userId) => {
    const images = ['/mascot.jpg', '/roach_gangster.png', '/roach_politician.png', '/roach_miner.png', '/roach_king.png'];
    if (!userId) return images[0];
    let hash = 0;
    const str = userId.toString();
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return images[Math.abs(hash) % images.length];
  }, []);

  const value = {
    telegramUser,
    initData,
    user,
    setUser,
    coins,
    setCoins,
    energy,
    setEnergy,
    maxEnergy,
    loading,
    backendUrl,
    handleTap,
    tonWallet,
    setTonWallet,
    claimedCoins,
    setClaimedCoins,
    tapValue,
    setTapValue,
    daysUntilNextHalving,
    setDaysUntilNextHalving,
    remainingPool,
    setRemainingPool,
    connectTonWallet,
    claimMinedCoins,
    fetchUserProfile,
    getMascotForUser,

    // Gamification state & operations
    upgrades,
    passiveIncomeRate,
    achievements,
    weeklyMissionProgress,
    pvpWins,
    pvpLosses,
    pvpEarnings,
    streakDays,
    lastCheckin,
    lastSpinTime,
    lastCardFlipTime,
    lastQuizTime,
    upgradeCardsMetadata,
    achievementsMetadata,
    evolution,
    streakMultiplier,

    buyUpgradeCard,
    spinWheel,
    flipMysteryCard,
    getQuizQuestion,
    submitQuizAnswer,
    startPvP,
    resolvePvP,
    triggerFlashRaid,
    syncFlashRaidTaps,
    getTournamentCountdown,
    claimVideoReward,
  };


  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
