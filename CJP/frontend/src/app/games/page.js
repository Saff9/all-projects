'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp, CJP_BOT_NAME } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

export default function Games() {
  const { 
    coins, 
    setCoins,
    spinWheel, 
    flipMysteryCard, 
    getQuizQuestion, 
    submitQuizAnswer, 
    startPvP, 
    resolvePvP,
    loading, 
    user, 
    telegramUser, 
    getMascotForUser,
    lastSpinTime,
    lastCardFlipTime,
    pvpWins,
    pvpLosses,
    pvpEarnings,
    claimVideoReward
  } = useApp();

  const [activeTab, setActiveTab] = useState('spin-flip');
  const [clipsLayout, setClipsLayout] = useState('feed');
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ----------------------------------------------------
  // SPIN THE WHEEL STATES & LOGIC
  // ----------------------------------------------------
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinCooldown, setSpinCooldown] = useState('');
  
  // Segments on the wheel
  const wheelSegments = [
    { value: 50, color: '#f59e0b', text: '50 CJP' },
    { value: 100, color: '#3b82f6', text: '100 CJP' },
    { value: 500, color: '#10b981', text: '500 CJP' },
    { value: 1000, color: '#8b5cf6', text: '1k CJP' },
    { value: 5000, color: '#ec4899', text: '5k CJP' },
    { value: 50000, color: '#ef4444', text: 'JACKPOT' }
  ];

  // Calculate segment angle
  const segmentAngle = 360 / wheelSegments.length;

  const checkSpinCooldown = () => {
    if (!lastSpinTime) return true;
    const elapsed = Date.now() - new Date(lastSpinTime).getTime();
    const cooldown = 24 * 60 * 60 * 1000;
    if (elapsed < cooldown) {
      const remaining = cooldown - elapsed;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setSpinCooldown(`${hours}h ${minutes}m`);
      return false;
    }
    setSpinCooldown('');
    return true;
  };

  useEffect(() => {
    checkSpinCooldown();
    const interval = setInterval(checkSpinCooldown, 60000);
    return () => clearInterval(interval);
  }, [lastSpinTime]);

  const handleSpinWheel = async () => {
    if (spinning) return;
    const isFree = checkSpinCooldown();
    if (!isFree && coins < 500) {
      triggerFeedback('Need 500 CJP for an extra spin!', 'error');
      return;
    }

    setSpinning(true);
    setFeedback({ text: '', type: '' });

    try {
      const res = await spinWheel();
      if (res.success) {
        // Find segment index
        const rewardIndex = wheelSegments.findIndex(seg => seg.value === res.reward);
        // Calculate target rotation (clockwise)
        // Segments are ordered counter-clockwise or clockwise. Let's compute segment mid angle.
        // We want target segment to point to top (270 degrees in standard coordinate or 0 index is at top if aligned)
        const targetAngle = 360 - (rewardIndex * segmentAngle);
        // Add multiple spins for visual effect
        const totalSpins = 5; 
        const rotationDegrees = wheelRotation + (360 * totalSpins) + targetAngle - (wheelRotation % 360);
        
        setWheelRotation(rotationDegrees);

        setTimeout(() => {
          setSpinning(false);
          if (res.reward === 50000) {
            triggerFeedback('🎰 JACKPOT! You won 50,000 CJP!', 'success');
          } else {
            triggerFeedback(`Won +${res.reward} CJP!`, 'success');
          }
          if (typeof window !== 'undefined') {
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
          }
        }, 3200);
      } else {
        triggerFeedback(res.message || 'Spin failed', 'error');
        setSpinning(false);
      }
    } catch (err) {
      console.error(err);
      triggerFeedback('Network error.', 'error');
      setSpinning(false);
    }
  };

  // ----------------------------------------------------
  // CARD FLIP STATES & LOGIC
  // ----------------------------------------------------
  const [flippingCardIndex, setFlippingCardIndex] = useState(null);
  const [flippedCards, setFlippedCards] = useState([null, null, null]);
  const [flipCooldown, setFlipCooldown] = useState('');

  const checkFlipCooldown = () => {
    if (!lastCardFlipTime) return true;
    const elapsed = Date.now() - new Date(lastCardFlipTime).getTime();
    const cooldown = 24 * 60 * 60 * 1000;
    if (elapsed < cooldown) {
      const remaining = cooldown - elapsed;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setFlipCooldown(`${hours}h ${minutes}m`);
      return false;
    }
    setFlipCooldown('');
    return true;
  };

  useEffect(() => {
    checkFlipCooldown();
    const interval = setInterval(checkFlipCooldown, 60000);
    return () => clearInterval(interval);
  }, [lastCardFlipTime]);

  const handleCardFlip = async (index) => {
    if (flippingCardIndex !== null || flippedCards[index] !== null) return;
    const isFree = checkFlipCooldown();
    if (!isFree && coins < 500) {
      triggerFeedback('Need 500 CJP for an extra flip!', 'error');
      return;
    }

    setFlippingCardIndex(index);
    setFeedback({ text: '', type: '' });

    try {
      const res = await flipMysteryCard();
      if (res.success) {
        const newFlips = [...flippedCards];
        newFlips[index] = {
          type: res.rewardType,
          label: res.rewardLabel,
          val: res.rewardValue
        };
        setFlippedCards(newFlips);

        // Auto reveal others after 1s
        setTimeout(() => {
          const fakeRewards = [
            { type: 'coins', label: '100 CJP Coins' },
            { type: 'energy_refill', label: 'Energy Refill' },
            { type: 'coins', label: '200 CJP Coins' },
            { type: 'cockroach_bomb', label: 'Roach Bomb (2x)' }
          ].filter(f => f.label !== res.rewardLabel);

          const finalFlips = newFlips.map((c, i) => {
            if (i === index) return c;
            return fakeRewards[i % fakeRewards.length];
          });
          setFlippedCards(finalFlips);
          
          triggerFeedback(`Flipped: ${res.rewardLabel}!`, 'success');
          if (typeof window !== 'undefined') {
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
          }
          setFlippingCardIndex(null);
        }, 1200);
      } else {
        triggerFeedback(res.message || 'Flip failed', 'error');
        setFlippingCardIndex(null);
      }
    } catch (err) {
      console.error(err);
      triggerFeedback('Network error.', 'error');
      setFlippingCardIndex(null);
    }
  };

  const resetCards = () => {
    setFlippedCards([null, null, null]);
  };

  // ----------------------------------------------------
  // DAILY QUIZ STATES & LOGIC
  // ----------------------------------------------------
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);

  const loadQuiz = async () => {
    setQuizLoading(true);
    setQuizFeedback('');
    try {
      const res = await getQuizQuestion();
      if (res) {
        setQuiz(res);
        setQuizCompleted(res.alreadyAnswered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'quiz') {
      loadQuiz();
    }
  }, [activeTab]);

  const handleQuizSubmit = async () => {
    if (!selectedAnswer) return;
    setQuizFeedback('Checking answer...');
    try {
      const res = await submitQuizAnswer(selectedAnswer);
      if (res.success) {
        setQuizCompleted(true);
        if (res.correct) {
          setQuizFeedback('🎉 CORRECT! +500 CJP credited.');
          if (typeof window !== 'undefined') {
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
          }
        } else {
          setQuizFeedback('❌ INCORRECT. Better luck tomorrow!');
          if (typeof window !== 'undefined') {
            window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
          }
        }
      } else {
        setQuizFeedback(res.message || 'Failed to submit quiz.');
      }
    } catch (err) {
      console.error(err);
      setQuizFeedback('Network error.');
    }
  };

  // ----------------------------------------------------
  // PVP BATTLE STATES & LOGIC
  // ----------------------------------------------------
  const [pvpState, setPvpState] = useState('idle'); // idle, matching, count, fighting, resolved
  const [wager, setWager] = useState(100);
  const [opponent, setOpponent] = useState(null);
  const [battleCountdown, setBattleCountdown] = useState(3);
  const [fightTimer, setFightTimer] = useState(10);
  const [userBattleTaps, setUserBattleTaps] = useState(0);
  const [oppTapsIncrement, setOppTapsIncrement] = useState(0);
  const [battleResult, setBattleResult] = useState(null);
  const fightTimerIntervalRef = useRef(null);

  const handleStartMatchmaking = async () => {
    if (coins < wager) {
      triggerFeedback('Insufficient CJP balance for this wager!', 'error');
      return;
    }
    setPvpState('matching');
    try {
      const res = await startPvP(wager);
      if (res.success) {
        setOpponent({
          name: res.opponentName,
          min: res.opponentMin,
          max: res.opponentMax
        });
        
        // Wait 2s in matchmaking loader
        setTimeout(() => {
          setPvpState('count');
          setBattleCountdown(3);
        }, 2000);
      } else {
        triggerFeedback(res.message || 'Matchmaking failed', 'error');
        setPvpState('idle');
      }
    } catch (err) {
      console.error(err);
      triggerFeedback('Network error.', 'error');
      setPvpState('idle');
    }
  };

  // PvP countdown
  useEffect(() => {
    if (pvpState !== 'count') return;
    if (battleCountdown === 0) {
      setPvpState('fighting');
      setFightTimer(10);
      setUserBattleTaps(0);
      setOppTapsIncrement(0);
      return;
    }
    const timer = setTimeout(() => {
      setBattleCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pvpState, battleCountdown]);

  // PvP fight timer (10 seconds tap fight)
  useEffect(() => {
    if (pvpState !== 'fighting') return;
    
    // Simulate opponent taps rising incrementally
    const avgOppTaps = opponent ? (opponent.min + opponent.max) / 2 : 250;
    const tickRate = avgOppTaps / 100; // 100 ticks of 100ms in 10s
    
    const oppInterval = setInterval(() => {
      setOppTapsIncrement(prev => prev + tickRate * (0.8 + Math.random() * 0.4));
    }, 100);

    fightTimerIntervalRef.current = setInterval(() => {
      setFightTimer(prev => {
        if (prev <= 1) {
          clearInterval(fightTimerIntervalRef.current);
          clearInterval(oppInterval);
          resolveBattle();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(fightTimerIntervalRef.current);
      clearInterval(oppInterval);
    };
  }, [pvpState]);

  const handleBattleTap = () => {
    if (pvpState !== 'fighting') return;
    setUserBattleTaps(prev => prev + 1);
    if (typeof window !== 'undefined') {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    }
  };

  const resolveBattle = async () => {
    setPvpState('resolving');
    // Calculate final taps
    // Wager is resolved on server authoritatively
    try {
      const res = await resolvePvP(wager, userBattleTaps, opponent.min, opponent.max);
      if (res.success) {
        setBattleResult({
          win: res.win,
          userTaps: res.userTaps,
          opponentTaps: res.opponentTaps,
          earnings: res.win ? Math.floor(wager * 0.6) : -Math.floor(wager * 0.6)
        });
        setPvpState('resolved');
      } else {
        triggerFeedback('Resolution failed: ' + res.message, 'error');
        setPvpState('idle');
      }
    } catch (err) {
      console.error(err);
      triggerFeedback('Connection lost during resolution!', 'error');
      setPvpState('idle');
    }
  };

  // ----------------------------------------------------
  // ROACH CLIPS SHOWCASE
  // ----------------------------------------------------
  const simulatedVideos = [
    { 
      id: 1, 
      slug: 'rap',
      title: 'Roach Gangster Rap', 
      views: '2.5M', 
      initialLikes: 450000, 
      desc: 'Gangster Roach spitting raw Web3 bars with golden chains glowing.', 
      poster: '/clip_gangster_rap.png',
      mascotSrc: '/roach_gangster.png',
      subtitles: [
        { start: 0, end: 20, text: "🎵 Yo! CockRoach Janta Party is in the house! 🎵" },
        { start: 20, end: 40, text: "🎵 Ten Billion fixed supply, we ain't printing more! 🎵" },
        { start: 40, end: 60, text: "🎵 Tap that screen, stack it up, watch the balance soar! 🎵" },
        { start: 60, end: 80, text: "🎵 Early miners getting rich, halving's at the door! 🎵" },
        { start: 80, end: 100, text: "🎵 CJP to the moon, TON blockchain galore! 🎵" }
      ],
      commentsList: [
        { user: "DegenLord", time: "2m ago", text: "This rap is an absolute banger! 🔥" },
        { user: "TonWhale", time: "10m ago", text: "10B fixed supply is actually bullish. CJP to the moon!" },
        { user: "DesiRoach", time: "1h ago", text: "Swarm commander reported for duty! 🫡" }
      ]
    },
    { 
      id: 2, 
      slug: 'rally',
      title: 'Cockroach Political Rally', 
      views: '5.1M', 
      initialLikes: 920000, 
      desc: 'Politician Roach giving a dramatic speech on national CJP distribution.', 
      poster: '/clip_political_rally.png',
      mascotSrc: '/roach_politician.png',
      subtitles: [
        { start: 0, end: 20, text: "My dear citizens, today marks a new era for cockroaches..." },
        { start: 20, end: 40, text: "We pledge a fixed supply of 10 Billion CJP. No corruption!" },
        { start: 40, end: 60, text: "Every tap represents a vote for economic freedom!" },
        { start: 60, end: 80, text: "We will list on TON and claim our right in the crypto space!" },
        { start: 80, end: 100, text: "Jai CJP! Long live the CockRoach Janta Party!" }
      ],
      commentsList: [
        { user: "JantaPower", time: "5m ago", text: "Finally, a politician we can trust! 🗳️" },
        { user: "DilliRoach", time: "15m ago", text: "Cockroach Janta Party zindabad!" },
        { user: "CryptoBug", time: "2h ago", text: "TON integration is key." }
      ]
    },
    { 
      id: 3, 
      slug: 'miner',
      title: 'Miner Roach Gold Dance', 
      views: '1.2M', 
      initialLikes: 210000, 
      desc: 'Happy roach doing a spin after mining the legendary 50k jackpot.', 
      poster: '/clip_gold_dance.png',
      mascotSrc: '/roach_miner.png',
      subtitles: [
        { start: 0, end: 25, text: "Digging deep, hitting the blockchain veins!" },
        { start: 25, end: 50, text: "Aha! Look at that gold shine, CJP jackpot incoming!" },
        { start: 50, end: 75, text: "Whoa! Just mined a legendary 50k gold cluster!" },
        { start: 75, end: 100, text: "Keep the picks swinging! Tappers' work pays off!" }
      ],
      commentsList: [
        { user: "GoldDigger", time: "1m ago", text: "Miner roach dance is literally me after 50k spin jackpot." },
        { user: "LuckyRoach", time: "30m ago", text: "I need to hit that jackpot next!" },
        { user: "SatoshiRoach", time: "3h ago", text: "Mining blocks is hard work but totally worth it." }
      ]
    },
    { 
      id: 4, 
      slug: 'coronation',
      title: 'Coronation Ceremony', 
      views: '3.4M', 
      initialLikes: 680000, 
      desc: 'King Roach ascending to the throne of 10B CJP coins in style.', 
      poster: '/clip_coronation.png',
      mascotSrc: '/roach_king.png',
      subtitles: [
        { start: 0, end: 25, text: "By the power vested in 10 Billion fixed CJP tokens..." },
        { start: 25, end: 50, text: "I hereby crown the Supreme Emperor of Tappers!" },
        { start: 50, end: 75, text: "Let the halving cycle commence, reward the loyal subjects!" },
        { start: 75, end: 100, text: "Behold the golden age of the CockRoach Janta Party!" }
      ],
      commentsList: [
        { user: "KingRoachFan", time: "8m ago", text: "Bow down to the supreme leader! 👑" },
        { user: "DegenRoyalty", time: "1h ago", text: "Long live the King of CJP!" },
        { user: "TonHodler", time: "4h ago", text: "All power to the tappers!" }
      ]
    },
    { 
      id: 5, 
      slug: 'crawl',
      title: 'First Crawl milestone', 
      views: '800k', 
      initialLikes: 150000, 
      desc: 'Baby Roach take its first steps towards mining the fixed pools.', 
      poster: '/clip_first_crawl.png',
      mascotSrc: '/roach_miner.png',
      subtitles: [
        { start: 0, end: 25, text: "Look! Baby Roach is taking its very first steps..." },
        { start: 25, end: 50, text: "Crawling on the mobile screen, registering its first tap..." },
        { start: 50, end: 75, text: "Leaving glowing green footstep footprints on-chain..." },
        { start: 75, end: 100, text: "A future whale is growing! A new hodler is born!" }
      ],
      commentsList: [
        { user: "BabyWhale", time: "12m ago", text: "A new whale is born! 🍼" },
        { user: "RoachMother", time: "45m ago", text: "So cute! First tap recorded!" },
        { user: "SmartContracter", time: "5h ago", text: "The next generation of HODLers." }
      ]
    }
  ];

  const [playingVideoId, setPlayingVideoId] = useState(null);
  const feedContainerRef = useRef(null);

  // Auto-play the snapped video in Immersive Feed mode
  useEffect(() => {
    if (activeTab !== 'clips' || clipsLayout !== 'feed') return;
    const container = feedContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop;
      const height = container.clientHeight;
      const activeIdx = Math.round(scrollPos / (height || 1));
      if (activeIdx >= 0 && activeIdx < simulatedVideos.length) {
        const activeVid = simulatedVideos[activeIdx];
        if (playingVideoId !== activeVid.id) {
          setPlayingVideoId(activeVid.id);
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize active playing video on tab load
    setTimeout(handleScroll, 150);

    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeTab, clipsLayout, simulatedVideos.length, playingVideoId]);

  const triggerFeedback = (text, type) => {
    setFeedback({ text, type });
    setTimeout(() => {
      setFeedback({ text: '', type: '' });
    }, 3000);
  };

  return (
    <div className="font-body-md text-body-md bg-black text-on-surface min-h-screen pb-32 overflow-x-hidden select-none">
      
      {/* TopAppBar */}
      <header
        className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-14"
        style={{ background: 'rgba(4,4,4,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,191,0,0.1)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0" style={{ border: '1.5px solid rgba(255,191,0,0.4)' }}>
            <img
              alt="User Mascot avatar"
              className="w-full h-full object-cover"
              src={getMascotForUser(user?.telegram_id || telegramUser?.id)}
            />
          </div>
          <h1 style={{ fontSize: 17, fontWeight: 800, color: '#ffbf00', fontFamily: 'var(--font-price-display)', letterSpacing: '-0.02em' }}>Games Arena</h1>
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

      {/* Main Container */}
      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-4">

        {feedback.text && (
          <div
            className="fixed top-16 left-4 right-4 z-[100] rounded-2xl px-4 py-3 flex items-center gap-2 animate-fade-in"
            style={{
              background: feedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${feedback.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: feedback.type === 'success' ? '#22c55e' : '#ef4444', fontVariationSettings: "'FILL' 1" }}>
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: feedback.type === 'success' ? '#22c55e' : '#ef4444' }}>{feedback.text}</span>
          </div>
        )}

        {/* Tab selection */}
        <div
          className="flex gap-1 p-1 rounded-2xl"
          style={{ background: 'rgba(14,14,14,0.85)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { id: 'spin-flip', label: 'Spin & Flip', icon: 'casino' },
            { id: 'pvp', label: 'PvP', icon: 'sports_mma' },
            { id: 'quiz', label: 'Quiz', icon: 'psychology' },
            { id: 'clips', label: 'Clips', icon: 'play_circle' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl transition-all active:scale-95"
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #ffbf00, #ff8c00)' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'rgba(255,255,255,0.4)',
                fontSize: 10,
                fontWeight: activeTab === tab.id ? 800 : 600,
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(255,191,0,0.3)' : 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13, fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SPIN THE WHEEL & MYSTERY CARD FLIP */}
        {activeTab === 'spin-flip' && (
          <div className="space-y-8 pb-10">
            {/* SPIN WHEEL PORTION */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-surface-container-low/40 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[50px] rounded-full"></div>
              
              <h2 className="font-extrabold text-lg text-white">Wheel of Fortune</h2>
              <p className="text-[11px] text-on-surface-variant mt-1">Spin daily for free. Extra spins cost 500 CJP.</p>

              {/* SVG Wheel Visual Segment */}
              <div className="flex justify-center my-6 relative">
                {/* Pointer indicator */}
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-30 text-primary animate-pulse">
                  <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    arrow_drop_down
                  </span>
                </div>

                <div 
                  className="w-56 h-56 rounded-full border-4 border-primary/20 shadow-2xl relative transition-transform duration-[3000ms] ease-out"
                  style={{ 
                    transform: `rotate(${wheelRotation}deg)`,
                    transitionProperty: spinning ? 'transform' : 'none'
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {isMounted && wheelSegments.map((seg, i) => {
                      const angle = segmentAngle * i;
                      const rad = (angle - 90) * (Math.PI / 180);
                      const radNext = (angle + segmentAngle - 90) * (Math.PI / 180);
                      
                      const x1 = (50 + 50 * Math.cos(rad)).toFixed(4);
                      const y1 = (50 + 50 * Math.sin(rad)).toFixed(4);
                      const x2 = (50 + 50 * Math.cos(radNext)).toFixed(4);
                      const y2 = (50 + 50 * Math.sin(radNext)).toFixed(4);

                      // Text positioning
                      const midRad = (angle + segmentAngle / 2 - 90) * (Math.PI / 180);
                      const tx = (50 + 35 * Math.cos(midRad)).toFixed(4);
                      const ty = (50 + 35 * Math.sin(midRad)).toFixed(4);
                      const rotateAngle = (angle + segmentAngle / 2).toFixed(2);

                      return (
                        <g key={i}>
                          <path 
                            d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
                            fill={seg.color} 
                            opacity="0.85"
                            stroke="#000"
                            strokeWidth="0.5"
                          />
                          <text 
                            x={tx} 
                            y={ty} 
                            fill="#000" 
                            fontSize="4.5" 
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            transform={`rotate(${rotateAngle}, ${tx}, ${ty})`}
                          >
                            {seg.text}
                          </text>
                        </g>
                      );
                    })}
                    {/* Center Core */}
                    <circle cx="50" cy="50" r="10" fill="#000" stroke="#ffbf00" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {spinCooldown && (
                <div className="mb-3 inline-block bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-[10px] font-bold font-label-mono">
                  Next Free Spin in: {spinCooldown}
                </div>
              )}

              <button
                disabled={spinning}
                onClick={handleSpinWheel}
                className="w-full bg-primary text-black font-extrabold py-3.5 rounded-xl text-xs active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {spinning ? 'Spinning Wheel...' : spinCooldown ? 'Pay 500 CJP & Spin' : 'Spin for FREE'}
              </button>
            </div>

            {/* MYSTERY CARD FLIP PORTION */}
            <div className="glass-card p-6 rounded-2xl border border-white/5 bg-surface-container-low/40 text-center relative overflow-hidden">
              <h2 className="font-extrabold text-lg text-white">Mystery Card Flip</h2>
              <p className="text-[11px] text-on-surface-variant mt-1">Pick card for prizes: Refills, boosts, CJP, or Cockroach Bombs!</p>

              {/* Cards Grid */}
              <div className="grid grid-cols-3 gap-3 my-6 justify-center">
                {[0, 1, 2].map((idx) => {
                  const card = flippedCards[idx];
                  const isFlipped = card !== null;

                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleCardFlip(idx)}
                      className="h-32 rounded-xl border border-primary/20 cursor-pointer relative overflow-hidden transition-all duration-500 transform active:scale-95"
                      style={{ 
                        perspective: '1000px',
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'none'
                      }}
                    >
                      {/* CARD BACK */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-yellow-500 flex flex-col items-center justify-center p-2 z-10 [backface-visibility:hidden]">
                        <span className="material-symbols-outlined text-[36px] text-black">question_mark</span>
                        <span className="text-[8px] text-black font-bold uppercase tracking-widest mt-1">CJP</span>
                      </div>

                      {/* CARD FRONT */}
                      <div 
                        className="absolute inset-0 bg-surface-container flex flex-col items-center justify-center p-2 [backface-visibility:hidden]"
                        style={{ transform: 'rotateY(180deg)' }}
                      >
                        <span className="material-symbols-outlined text-[32px] text-primary mb-1">
                          {card?.type === 'coins' ? 'monetization_on' :
                           card?.type === 'energy_refill' ? 'bolt' :
                           card?.type === 'multiplier_boost' ? 'speed' :
                           card?.type === 'cockroach_bomb' ? 'dangerous' :
                           'stars'}
                        </span>
                        <span className="text-[9px] text-white font-extrabold text-center leading-tight">
                          {card?.label || 'Mystery'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {flipCooldown && (
                <div className="mb-3 inline-block bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-[10px] font-bold font-label-mono">
                  Next Free Flip in: {flipCooldown}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={resetCards}
                  disabled={flippedCards.every(c => c === null) || flippingCardIndex !== null}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl text-xs active:scale-95 transition-all disabled:opacity-30"
                >
                  Reset Cards
                </button>
                <button
                  disabled={flippingCardIndex !== null || flippedCards.some(c => c !== null)}
                  onClick={() => handleCardFlip(Math.floor(Math.random() * 3))}
                  className="flex-1 bg-primary text-black font-extrabold py-3 rounded-xl text-xs active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {flipCooldown ? 'Flip for 500 CJP' : 'Flip Card'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PVP BATTLE ARENA */}
        {activeTab === 'pvp' && (
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-surface-container-low/40 text-center space-y-6 pb-10">
            <div>
              <h2 className="font-extrabold text-lg text-white">PvP Wager Gladiator Arena</h2>
              <p className="text-[11px] text-on-surface-variant mt-1">Challenge simulated cockroach duelists. Win 80% of pot, lose splits to 20%.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                <span className="text-[10px] text-on-surface-variant block uppercase font-label-mono">Arena Wins</span>
                <span className="text-primary text-base font-bold font-headline-md">{pvpWins}</span>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                <span className="text-[10px] text-on-surface-variant block uppercase font-label-mono">Net Earnings</span>
                <span className={`text-base font-bold font-headline-md ${pvpEarnings >= 0 ? 'text-green-500' : 'text-error'}`}>
                  {pvpEarnings >= 0 ? '+' : ''}{pvpEarnings} CJP
                </span>
              </div>
            </div>

            {/* PVP FIGHT LOGIC HUD */}
            {pvpState === 'idle' && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-xs text-white font-bold block uppercase tracking-wider">Select Your Wager</label>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setWager(val)}
                      className={`py-2 rounded-lg font-bold text-xs font-label-mono transition-all ${
                        wager === val ? 'bg-primary text-black shadow-lg shadow-amber-500/20' : 'bg-surface-container text-on-surface-variant hover:text-white border border-white/5'
                      }`}
                    >
                      {val} CJP
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleStartMatchmaking}
                  className="w-full mt-4 bg-primary text-black font-extrabold py-4 rounded-xl text-xs active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                >
                  Enter PvP Arena (Wager: {wager} CJP)
                </button>
              </div>
            )}

            {pvpState === 'matching' && (
              <div className="py-10 flex flex-col items-center justify-center space-y-4">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin">rotate_left</span>
                <p className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest animate-pulse">Matching Opponents...</p>
              </div>
            )}

            {pvpState === 'count' && (
              <div className="py-10 flex flex-col items-center justify-center space-y-4">
                <h3 className="font-extrabold text-white text-base">Opponent Found: <span className="text-primary">{opponent?.name}</span></h3>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="font-price-display text-3xl font-extrabold animate-ping">{battleCountdown}</span>
                </div>
              </div>
            )}

            {pvpState === 'fighting' && (
              <div className="space-y-6 py-4">
                <div className="flex justify-between items-center px-2">
                  <div className="text-left">
                    <span className="text-[10px] text-on-surface-variant block">YOU</span>
                    <span className="font-headline-md text-primary font-bold text-lg">{userBattleTaps} Taps</span>
                  </div>
                  <div className="bg-error/10 text-error border border-error/20 rounded-full px-3 py-1 text-xs font-bold font-label-mono animate-pulse">
                    Fight: {fightTimer}s Left
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-on-surface-variant block">{opponent?.name}</span>
                    <span className="font-headline-md text-white/70 font-bold text-lg">{Math.floor(oppTapsIncrement)} Taps</span>
                  </div>
                </div>

                {/* Progress bar comparison */}
                <div className="h-4 w-full bg-black/60 rounded-full overflow-hidden flex border border-white/5 p-0.5">
                  <div 
                    className="h-full bg-primary transition-all duration-100 rounded-l-full"
                    style={{ width: `${(userBattleTaps / (userBattleTaps + oppTapsIncrement || 1)) * 100}%` }}
                  ></div>
                  <div 
                    className="h-full bg-white/30 transition-all duration-100 rounded-r-full"
                    style={{ width: `${(oppTapsIncrement / (userBattleTaps + oppTapsIncrement || 1)) * 100}%` }}
                  ></div>
                </div>

                {/* Large clicking button */}
                <button
                  onPointerDown={handleBattleTap}
                  className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-500 active:scale-90 border-8 border-red-800 text-white font-extrabold text-xl shadow-2xl flex items-center justify-center mx-auto select-none transition-transform"
                >
                  TAP FAST!
                </button>
              </div>
            )}

            {pvpState === 'resolving' && (
              <div className="py-10 flex flex-col items-center justify-center space-y-4">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin">refresh</span>
                <p className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">Resolving Battle results...</p>
              </div>
            )}

            {pvpState === 'resolved' && (
              <div className="py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary border border-primary-container/30 mx-auto">
                  <span className="material-symbols-outlined text-[36px]">
                    {battleResult?.win ? 'workspace_premium' : 'heart_broken'}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-xl text-white">
                    {battleResult?.win ? '🏆 YOU WON!' : '💀 YOU LOST!'}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                    You made <span className="text-white font-bold">{battleResult?.userTaps} taps</span>. 
                    {opponent?.name} made <span className="text-white font-bold">{battleResult?.opponentTaps} taps</span>.
                  </p>
                  <span className={`text-base font-extrabold font-headline-md block mt-3 ${battleResult?.win ? 'text-primary' : 'text-error'}`}>
                    {battleResult?.win ? `+${battleResult?.earnings}` : `${battleResult?.earnings}`} CJP Coins
                  </span>
                </div>

                <button
                  onClick={() => setPvpState('idle')}
                  className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl text-xs active:scale-95 transition-all"
                >
                  Return to Duel Lobby
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DAILY QUIZ */}
        {activeTab === 'quiz' && (
          <div className="glass-card p-6 rounded-2xl border border-white/5 bg-surface-container-low/40 text-center space-y-6 pb-10">
            <div>
              <h2 className="font-extrabold text-lg text-white">Daily Desi GK & Crypto Quiz</h2>
              <p className="text-[11px] text-on-surface-variant mt-1">Answer today\'s trivia correctly to claim +500 CJP reward.</p>
            </div>

            {quizLoading ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-4">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin">psychology</span>
                <p className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">Loading Quiz Question...</p>
              </div>
            ) : quizCompleted ? (
              <div className="py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center text-primary border border-primary-container/30 mx-auto">
                  <span className="material-symbols-outlined text-[36px]">verified</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Quiz Already Completed!</h3>
                  <p className="text-xs text-on-surface-variant mt-2 max-w-xs mx-auto leading-relaxed">
                    You have answered today\'s trivia question. Check back tomorrow for the next challenge!
                  </p>
                </div>
                {quizFeedback && (
                  <div className="bg-primary/10 text-primary border border-primary/20 rounded-xl p-3 text-xs font-semibold max-w-xs mx-auto">
                    {quizFeedback}
                  </div>
                )}
              </div>
            ) : quiz ? (
              <div className="space-y-6 text-left">
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <span className="text-[9px] uppercase font-label-mono text-primary font-bold">Question</span>
                  <h3 className="font-semibold text-sm text-white mt-1 leading-relaxed">
                    {quiz.question}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {quiz.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAnswer(opt)}
                      className={`p-3.5 rounded-xl text-xs text-left font-semibold border transition-all ${
                        selectedAnswer === opt
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-black/40 border-white/5 text-on-surface-variant hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {quizFeedback && (
                  <div className="bg-white/5 text-white border border-white/10 rounded-xl p-3 text-xs text-center font-semibold">
                    {quizFeedback}
                  </div>
                )}

                <button
                  disabled={!selectedAnswer}
                  onClick={handleQuizSubmit}
                  className="w-full bg-primary text-black font-extrabold py-3.5 rounded-xl text-xs active:scale-95 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <div className="py-10 text-on-surface-variant text-sm">
                No quiz question available today.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ROACH CLIPS MEDIA SHOWCASE */}
        {activeTab === 'clips' && (
          <div className="space-y-4 pb-10 flex flex-col h-[calc(100vh-14rem)]">
            <div className="flex justify-between items-center bg-surface-container-low/40 p-3 rounded-2xl border border-white/5 flex-shrink-0">
              <div className="text-left">
                <h2 className="font-extrabold text-base text-white">Roach Clips</h2>
                <p className="text-[10px] text-on-surface-variant">Watch mascot video loops and claim +100 CJP daily.</p>
              </div>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => {
                    setClipsLayout('feed');
                    setPlayingVideoId(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    clipsLayout === 'feed' ? 'bg-primary text-black' : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  Immersive Feed
                </button>
                <button 
                  onClick={() => {
                    setClipsLayout('list');
                    setPlayingVideoId(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    clipsLayout === 'list' ? 'bg-primary text-black' : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  Card List
                </button>
              </div>
            </div>

            {clipsLayout === 'feed' ? (
              <div 
                ref={feedContainerRef}
                className="w-full flex-grow overflow-y-scroll snap-y snap-mandatory scrollbar-none rounded-2xl bg-black relative border border-white/5"
              >
                {simulatedVideos.map((vid) => (
                  <div key={vid.id} className="w-full h-full snap-start relative">
                    <CockroachVideoPlayer 
                      vid={vid}
                      isPlaying={playingVideoId === vid.id}
                      onPlayToggle={() => setPlayingVideoId(playingVideoId === vid.id ? null : vid.id)}
                      claimVideoReward={claimVideoReward}
                      userWatchedVideos={user?.watched_videos || []}
                      layoutMode="feed"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-1">
                {simulatedVideos.map((vid) => (
                  <CockroachVideoPlayer 
                    key={vid.id}
                    vid={vid}
                    isPlaying={playingVideoId === vid.id}
                    onPlayToggle={() => setPlayingVideoId(playingVideoId === vid.id ? null : vid.id)}
                    claimVideoReward={claimVideoReward}
                    userWatchedVideos={user?.watched_videos || []}
                    layoutMode="list"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

// ==========================================
// COCKROACH VIDEO PLAYER COMPONENT
// ==========================================
function CockroachVideoPlayer({ vid, isPlaying, onPlayToggle, claimVideoReward, userWatchedVideos, layoutMode = 'list' }) {
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [likes, setLikes] = useState(vid.initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [claimedPopup, setClaimedPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Interactive feed states
  const [hearts, setHearts] = useState([]); // { id, x, y }
  const [notesList, setNotesList] = useState([]); // { id, char, x, y }
  const [activeComment, setActiveComment] = useState(null);
  const lastClickTimeRef = useRef(0);

  // Refs
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const synthIntervalRef = useRef(null);
  const masterGainRef = useRef(null);
  const droneOscillatorsRef = useRef(null);
  const crowdNoiseRef = useRef(null);
  const animationFrameRef = useRef(null);
  const currentTimeRef = useRef(0);
  const duration = 20; // 20 seconds mock video duration

  const triggerFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 2000);
  };

  // Check if reward already claimed today
  const isClaimedToday = () => {
    const record = userWatchedVideos.find(v => v.videoId === vid.slug);
    if (!record) return false;
    const date = new Date(record.lastClaimedAt);
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const istDate = new Date(utcMs + 5.5 * 3600000);
    const yyyy = istDate.getFullYear();
    const mm = String(istDate.getMonth() + 1).padStart(2, '0');
    const dd = String(istDate.getDate()).padStart(2, '0');
    const recordStr = `${yyyy}-${mm}-${dd}`;
    
    const now = new Date();
    const nowUtcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const nowIstDate = new Date(nowUtcMs + 5.5 * 3600000);
    const nowStr = `${nowIstDate.getFullYear()}-${String(nowIstDate.getMonth() + 1).padStart(2, '0')}-${String(nowIstDate.getDate()).padStart(2, '0')}`;
    
    return recordStr === nowStr;
  };

  // Claim video completed reward
  const handleClaimVideoReward = async () => {
    if (isClaimedToday()) {
      console.log("Already claimed reward for this video today.");
      return;
    }
    try {
      const res = await claimVideoReward(vid.slug);
      if (res.success) {
        setClaimedPopup(true);
        if (typeof window !== 'undefined') {
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
        }
      }
    } catch (err) {
      console.error("Failed to claim reward:", err);
    }
  };

  // Playback timer & progress tracking
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      const t = currentTimeRef.current;
      const percent = (t / duration) * 100;
      setProgress(percent);
      
      // Check completion
      if (percent >= 99 && !rewardClaimed) {
        setRewardClaimed(true);
        handleClaimVideoReward();
      }
    }, 200);

    return () => clearInterval(timer);
  }, [isPlaying, rewardClaimed]);

  // Comments live ticker in feed mode
  useEffect(() => {
    if (!isPlaying || layoutMode !== 'feed') return;
    let idx = 0;
    setActiveComment(vid.commentsList[0]);
    const commentTimer = setInterval(() => {
      idx = (idx + 1) % vid.commentsList.length;
      setActiveComment(vid.commentsList[idx]);
    }, 4000);
    return () => clearInterval(commentTimer);
  }, [isPlaying, vid.commentsList, layoutMode]);

  // Floating music notes generator
  useEffect(() => {
    if (!isPlaying || muted || layoutMode !== 'feed') return;
    const noteTimer = setInterval(() => {
      const newNote = {
        id: Date.now() + Math.random(),
        char: Math.random() > 0.5 ? '🎵' : '🎶',
        x: -15 + Math.random() * 30,
        y: -15
      };
      setNotesList(prev => [...prev, newNote]);
      setTimeout(() => {
        setNotesList(prev => prev.filter(n => n.id !== newNote.id));
      }, 2500);
    }, 1200);
    return () => clearInterval(noteTimer);
  }, [isPlaying, muted, layoutMode]);

  // Audio synths initialization
  const startSynth = () => {
    stopSynth(); // Clear any running synth loops
    
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    if (vid.slug === 'rap') {
      // 120 BPM: 1 beat every 0.5s
      let beatCount = 0;
      const playRapBeat = () => {
        const t = ctx.currentTime;
        // Kick
        if (beatCount % 2 === 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(masterGain);
          
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.3);
          
          gain.gain.setValueAtTime(1, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
          
          osc.start(t);
          osc.stop(t + 0.3);

          // Sub Bass
          const bass = ctx.createOscillator();
          const bassGain = ctx.createGain();
          const bassFilter = ctx.createBiquadFilter();
          bassFilter.type = 'lowpass';
          bassFilter.frequency.value = 100;

          bass.type = 'sawtooth';
          bass.frequency.setValueAtTime(beatCount % 4 === 0 ? 55 : 65.4, t); // A1 or C2 note
          
          bass.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(masterGain);

          bassGain.gain.setValueAtTime(0.6, t);
          bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

          bass.start(t);
          bass.stop(t + 0.4);
        } else {
          // Snare
          const bufferSize = ctx.sampleRate * 0.15;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 1200;
          
          const gain = ctx.createGain();
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);
          
          gain.gain.setValueAtTime(0.6, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
          
          noise.start(t);
          noise.stop(t + 0.15);
        }
        beatCount++;
      };

      synthIntervalRef.current = setInterval(playRapBeat, 500);

    } else if (vid.slug === 'rally') {
      // Crowd rumble (white noise low-passed)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const crowdNoise = ctx.createBufferSource();
      crowdNoise.buffer = buffer;
      crowdNoise.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 220;

      const crowdGain = ctx.createGain();
      crowdGain.gain.setValueAtTime(0.08, ctx.currentTime);

      crowdNoise.connect(lowpass);
      lowpass.connect(crowdGain);
      crowdGain.connect(masterGain);
      crowdNoise.start(0);
      crowdNoiseRef.current = crowdNoise;

      // Random crowd cheers
      const cheerInterval = setInterval(() => {
        const t = ctx.currentTime;
        crowdGain.gain.setValueAtTime(0.08, t);
        crowdGain.gain.exponentialRampToValueAtTime(0.25, t + 0.6);
        crowdGain.gain.exponentialRampToValueAtTime(0.08, t + 2.2);
      }, 4000);

      // Gavel Block clicks
      const playGavel = () => {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(masterGain);

        osc.frequency.setValueAtTime(550, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

        osc.start(t);
        osc.stop(t + 0.08);
      };

      const gavelInterval = setInterval(playGavel, 1500);

      // Combine intervals into a single cleanup handler
      synthIntervalRef.current = {
        close: () => {
          clearInterval(cheerInterval);
          clearInterval(gavelInterval);
        }
      };

    } else if (vid.slug === 'miner') {
      // Retro chiptune coin melody arpeggiator
      const notes = [659.25, 830.61, 987.77, 1318.51, 0, 987.77, 1318.51, 0]; // E5, G#5, B5, E6, Rest, B5, E6, Rest
      let noteIdx = 0;

      const playCoin = () => {
        const freq = notes[noteIdx % notes.length];
        if (freq > 0) {
          const t = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.connect(gain);
          gain.connect(masterGain);

          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

          osc.start(t);
          osc.stop(t + 0.12);
        }
        noteIdx++;
      };

      synthIntervalRef.current = setInterval(playCoin, 200);

    } else if (vid.slug === 'coronation') {
      // Majestic chord drone (C3, G3, C4, E4)
      const chord = [130.81, 196.00, 261.63, 329.63];
      const oscillators = [];

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = freq + (idx * 0.4 - 0.8); // slight detune

        filter.type = 'lowpass';
        filter.frequency.value = 350;

        gain.gain.value = 0.08;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start(0);

        oscillators.push({ osc, filter });
      });
      droneOscillatorsRef.current = oscillators;

      // Filter modulation LFO simulation
      let angle = 0;
      const lfoTimer = setInterval(() => {
        angle += 0.04;
        oscillators.forEach((o, i) => {
          o.filter.frequency.value = 350 + Math.sin(angle + i) * 120;
        });
      }, 50);

      synthIntervalRef.current = lfoTimer;

    } else if (vid.slug === 'crawl') {
      // Music box lullaby (Frere Jacques)
      const lullaby = [
        261.63, 293.66, 329.63, 261.63, 261.63, 293.66, 329.63, 261.63,
        329.63, 349.23, 392.00, 0, 329.63, 349.23, 392.00, 0
      ];
      let noteIdx = 0;

      const playBox = () => {
        const freq = lullaby[noteIdx % lullaby.length];
        if (freq > 0) {
          const t = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.connect(gain);
          gain.connect(masterGain);

          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

          osc.start(t);
          osc.stop(t + 0.4);
        }
        noteIdx++;
      };

      synthIntervalRef.current = setInterval(playBox, 400);
    }
  };

  const stopSynth = () => {
    if (synthIntervalRef.current) {
      if (typeof synthIntervalRef.current.close === 'function') {
        synthIntervalRef.current.close();
      } else {
        clearInterval(synthIntervalRef.current);
      }
      synthIntervalRef.current = null;
    }
    if (droneOscillatorsRef.current) {
      droneOscillatorsRef.current.forEach(o => {
        try { o.osc.stop(); } catch(e) {}
      });
      droneOscillatorsRef.current = null;
    }
    if (crowdNoiseRef.current) {
      try { crowdNoiseRef.current.stop(); } catch(e) {}
      crowdNoiseRef.current = null;
    }
  };

  // Sync volume state with AudioNode
  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(muted ? 0 : 0.2, audioContextRef.current.currentTime);
    }
  }, [muted]);

  // Audio start/stop on playing state changes
  useEffect(() => {
    if (isPlaying) {
      if (!muted) {
        startSynth();
      }
    } else {
      stopSynth();
    }
    return () => {
      stopSynth();
    };
  }, [isPlaying, muted]);

  // Canvas Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Create preloaded images
    const bgImg = new Image();
    bgImg.src = vid.poster;
    const mascotImg = new Image();
    mascotImg.src = vid.mascotSrc;

    canvas.width = 480;
    canvas.height = 270;

    const particles = [];
    const bubbleParticles = [];
    const footprints = [];
    const sparks = []; // miner hit sparks

    // Seed particles
    if (vid.slug === 'rap') {
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vy: 1 + Math.random() * 2,
          size: 10 + Math.random() * 15,
          type: Math.random() > 0.4 ? 'coin' : 'dollar',
          angle: Math.random() * Math.PI * 2,
          vAngle: 0.02 + Math.random() * 0.04
        });
      }
      // Add smoke columns particles
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: canvas.width / 4 + (Math.random() - 0.5) * 40,
          y: canvas.height + Math.random() * 80,
          vy: -(0.5 + Math.random() * 0.7),
          vx: (Math.random() - 0.5) * 0.3,
          size: 15 + Math.random() * 15,
          type: 'smoke',
          alpha: 0.3 + Math.random() * 0.4
        });
        particles.push({
          x: (3 * canvas.width) / 4 + (Math.random() - 0.5) * 40,
          y: canvas.height + Math.random() * 80,
          vy: -(0.5 + Math.random() * 0.7),
          vx: (Math.random() - 0.5) * 0.3,
          size: 15 + Math.random() * 15,
          type: 'smoke',
          alpha: 0.3 + Math.random() * 0.4
        });
      }
    } else if (vid.slug === 'miner') {
      for (let i = 0; i < 25; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          vy: 2 + Math.random() * 3,
          size: 8 + Math.random() * 12,
          angle: Math.random() * Math.PI * 2,
          vAngle: 0.05 + Math.random() * 0.08
        });
      }
      for (let i = 0; i < 4; i++) {
        bubbleParticles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 100,
          vy: 0.8 + Math.random() * 1.2,
          size: 18 + Math.random() * 14,
          text: Math.random() > 0.5 ? '+50k CJP!' : 'JACKPOT!',
          alpha: 1
        });
      }
    } else if (vid.slug === 'coronation') {
      // sparks
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 50,
          vy: 0.6 + Math.random() * 1.2,
          vx: (Math.random() - 0.5) * 0.4,
          size: 1.5 + Math.random() * 2.5,
          color: `rgba(251, 191, 36, ${0.4 + Math.random() * 0.5})`,
          type: 'sparkle'
        });
      }
      // falling rose petals
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          vy: 0.7 + Math.random() * 0.9,
          vx: (Math.random() - 0.5) * 0.5,
          size: 4 + Math.random() * 5,
          angle: Math.random() * Math.PI,
          vAngle: 0.02 + Math.random() * 0.03,
          type: 'petal'
        });
      }
    } else if (vid.slug === 'crawl') {
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          vy: 1.2 + Math.random() * 1.5,
          size: 15 + Math.random() * 6,
          type: Math.random() > 0.5 ? 'bottle' : 'pacifier',
          angle: Math.random() * Math.PI * 2,
          vAngle: 0.02 + Math.random() * 0.03
        });
      }
    }

    let lastTime = 0;
    const render = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background draw
      if (bgImg.complete) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Handle time update
      if (isPlaying) {
        currentTimeRef.current += delta;
        if (currentTimeRef.current >= duration) {
          currentTimeRef.current = 0;
        }
      }
      const t = currentTimeRef.current;

      // Draw custom overlays & characters
      if (vid.slug === 'rap') {
        const beat = Math.abs(Math.sin(t * Math.PI * 2)) * 0.08 + 0.95;

        // Draw Stage Spotlights
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        const spot1 = canvas.width / 4 + Math.sin(t * 2) * 80;
        const g1 = ctx.createLinearGradient(0, 0, spot1, canvas.height);
        g1.addColorStop(0, 'rgba(251, 191, 36, 0.25)');
        g1.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(spot1 - 40, canvas.height);
        ctx.lineTo(spot1 + 40, canvas.height);
        ctx.closePath();
        ctx.fill();

        const spot2 = (3 * canvas.width) / 4 + Math.cos(t * 2) * 80;
        const g2 = ctx.createLinearGradient(canvas.width, 0, spot2, canvas.height);
        g2.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
        g2.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.moveTo(canvas.width, 0);
        ctx.lineTo(spot2 - 40, canvas.height);
        ctx.lineTo(spot2 + 40, canvas.height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw rapping mascot sprite
        if (mascotImg.complete) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2 + 10);
          ctx.scale(beat, beat);
          ctx.drawImage(mascotImg, -55, -75, 110, 150);
          ctx.restore();
        }

        // Gold microphone stand and mic (bobbing)
        ctx.save();
        const micY = canvas.height / 2 + 55 + Math.sin(t * 12) * 4;
        ctx.translate(canvas.width / 2, micY);
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 45);
        ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Draw amber glow equalizer
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#fbbf24';
        const bars = 22;
        const bWidth = 8;
        const gap = 3;
        const startX = (canvas.width - (bars * (bWidth + gap))) / 2;
        for (let i = 0; i < bars; i++) {
          const freq = 4 + Math.sin(i * 0.4) * 2;
          const h = Math.abs(Math.sin(t * freq + i)) * 35 + 5;
          ctx.fillStyle = `rgba(251, 191, 36, ${0.45 + h/65})`;
          ctx.fillRect(startX + i * (bWidth + gap), canvas.height - h - 15, bWidth, h);
        }
        ctx.restore();

        // Dollars & coins & smoke drifting
        particles.forEach(p => {
          if (p.type === 'smoke') {
            p.y += p.vy;
            p.x += p.vx;
            p.alpha -= 0.003;
            if (p.y < 50 || p.alpha <= 0) {
              p.y = canvas.height + Math.random() * 30;
              p.x = (Math.random() > 0.5 ? canvas.width / 4 : (3 * canvas.width) / 4) + (Math.random() - 0.5) * 45;
              p.alpha = 0.3 + Math.random() * 0.4;
            }
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = 'rgba(120, 120, 120, 0.4)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            p.y += p.vy;
            p.angle += p.vAngle;
            if (p.y > canvas.height) {
              p.y = -p.size;
              p.x = Math.random() * canvas.width;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            if (p.type === 'coin') {
              ctx.beginPath();
              ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
              ctx.fillStyle = '#fbbf24';
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = 1;
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#000';
              ctx.font = `bold ${p.size * 0.45}px monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('C', 0, 0);
            } else {
              ctx.fillStyle = '#10b981';
              ctx.font = `${p.size}px Arial`;
              ctx.fillText('$', -p.size/3, p.size/3);
            }
            ctx.restore();
          }
        });

      } else if (vid.slug === 'rally') {
        // Paparazzi spotlights
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        
        const spot1 = canvas.width / 4 + Math.sin(t * 1.6) * 120;
        const g1 = ctx.createRadialGradient(spot1, 20, 5, spot1, canvas.height, 160);
        g1.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        g1.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.moveTo(spot1 - 15, 0);
        ctx.lineTo(spot1 - 90, canvas.height);
        ctx.lineTo(spot1 + 90, canvas.height);
        ctx.lineTo(spot1 + 15, 0);
        ctx.closePath();
        ctx.fill();

        const spot2 = (3 * canvas.width) / 4 + Math.cos(t * 1.6) * 120;
        const g2 = ctx.createRadialGradient(spot2, 20, 5, spot2, canvas.height, 160);
        g2.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
        g2.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.moveTo(spot2 - 15, 0);
        ctx.lineTo(spot2 - 90, canvas.height);
        ctx.lineTo(spot2 + 90, canvas.height);
        ctx.lineTo(spot2 + 15, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Left Flag
        ctx.save();
        ctx.translate(50, canvas.height - 85);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 75);
        ctx.stroke();
        const waveL = Math.sin(t * 6 + 50 * 0.08) * 3;
        ctx.fillStyle = '#f97316'; // Saffron
        ctx.fillRect(0, waveL, 30, 6);
        ctx.fillStyle = '#ffffff'; // White
        ctx.fillRect(0, waveL + 6, 30, 6);
        ctx.fillStyle = '#22c55e'; // Green
        ctx.fillRect(0, waveL + 12, 30, 6);
        ctx.restore();

        // Right Flag
        ctx.save();
        ctx.translate(canvas.width - 80, canvas.height - 85);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 75);
        ctx.stroke();
        const waveR = Math.sin(t * 6 + (canvas.width - 80) * 0.08) * 3;
        ctx.fillStyle = '#f97316';
        ctx.fillRect(0, waveR, 30, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, waveR + 6, 30, 6);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(0, waveR + 12, 30, 6);
        ctx.restore();

        // Speaker politician bobbing
        if (mascotImg.complete) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2 + 12);
          ctx.rotate(Math.sin(t * 6) * 0.04);
          ctx.drawImage(mascotImg, -48, -68, 96, 136);
          ctx.restore();
        }

        // Slogan Speech Bubble popping out
        const sloganIdx = Math.floor(t / 3.5) % 4;
        const slogans = ["VOTE CJP!", "FIXED SUPPLY 10B!", "TAP TO MINE!", "CJP TO THE MOON!"];
        const currentSlogan = slogans[sloganIdx];
        const scaleBubble = Math.max(0, Math.min(1, (t % 3.5) * 6));
        if (scaleBubble > 0 && (t % 3.5) < 3.0) {
          ctx.save();
          ctx.translate(canvas.width / 2 + 55, canvas.height / 2 - 45);
          ctx.scale(scaleBubble, scaleBubble);
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(-8, -4, -12, -18);
          ctx.quadraticCurveTo(-65, -18, -65, -45);
          ctx.quadraticCurveTo(-65, -70, 0, -70);
          ctx.quadraticCurveTo(65, -70, 65, -45);
          ctx.quadraticCurveTo(65, -18, 12, -18);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 8.5px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(currentSlogan, 0, -42);
          ctx.restore();
        }

        // Podium front plate
        ctx.fillStyle = '#1e1e1e';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 22, canvas.height - 45);
        ctx.lineTo(canvas.width / 2 + 22, canvas.height - 45);
        ctx.lineTo(canvas.width / 2 + 14, canvas.height - 15);
        ctx.lineTo(canvas.width / 2 - 14, canvas.height - 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Paparazzi camera flashes
        if (Math.random() < 0.14) {
          ctx.save();
          const fx = Math.random() * canvas.width;
          const fy = Math.random() * (canvas.height - 70);
          const fSize = 25 + Math.random() * 35;
          const fGrad = ctx.createRadialGradient(fx, fy, 1, fx, fy, fSize);
          fGrad.addColorStop(0, '#ffffff');
          fGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
          fGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.arc(fx, fy, fSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Cheering crowd
        ctx.fillStyle = '#070707';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 18) {
          const crowdBob = Math.sin(t * 7 + x * 0.08) * 5;
          ctx.lineTo(x, canvas.height - 20 + crowdBob);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#070707';
        ctx.lineWidth = 1;
        for (let x = 12; x < canvas.width; x += 36) {
          const crowdBob = Math.sin(t * 7 + x * 0.08) * 5;
          const cy = canvas.height - 20 + crowdBob;
          ctx.beginPath();
          ctx.moveTo(x, cy);
          ctx.quadraticCurveTo(x - 4, cy - 10, x - 8, cy - 7);
          ctx.moveTo(x, cy);
          ctx.quadraticCurveTo(x + 4, cy - 10, x + 8, cy - 7);
          ctx.stroke();
        }

      } else if (vid.slug === 'miner') {
        const jump = Math.abs(Math.sin(t * 4.5)) * 35;
        const spin = t * 3.5;

        // Draw Gold Block
        ctx.save();
        ctx.translate(canvas.width / 2 - 60, canvas.height / 2 + 45);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-15, -15, 30, 30);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-12, -12, 24, 24);
        ctx.fillStyle = '#fef3c7'; // Gold glint
        ctx.fillRect(-12, -12, 8, 8);
        ctx.restore();

        // Miner sprite jumping
        if (mascotImg.complete) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2 + 25 - jump);
          ctx.rotate(Math.sin(spin) * 0.25);
          ctx.drawImage(mascotImg, -45, -65, 90, 130);
          ctx.restore();
        }

        // Sweeping pickaxe swing
        const swingAngle = Math.sin(t * 9) * 0.6 - 0.2;
        ctx.save();
        ctx.translate(canvas.width / 2 - 35, canvas.height / 2 + 10 - jump);
        ctx.rotate(swingAngle);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 15);
        ctx.lineTo(0, -25);
        ctx.stroke();
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.arc(-8, -25, 12, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
        ctx.restore();

        // Strike sparks trigger
        if (Math.abs(Math.sin(t * 9) - 0.3) < 0.05 && Math.random() < 0.35) {
          for (let i = 0; i < 6; i++) {
            sparks.push({
              x: canvas.width / 2 - 55,
              y: canvas.height / 2 + 35,
              vx: (Math.random() - 0.5) * 3 - 2,
              vy: (Math.random() - 1) * 3 - 1.5,
              size: 1.5 + Math.random() * 2,
              life: 1.0,
              decay: 0.04 + Math.random() * 0.05
            });
          }
        }

        // Draw and update sparks
        sparks.forEach((sp, idx) => {
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.life -= sp.decay;
          if (sp.life <= 0) {
            sparks.splice(idx, 1);
            return;
          }
          ctx.save();
          ctx.globalAlpha = sp.life;
          ctx.fillStyle = '#ffe2ab';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#fbbf24';
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Gold coin shower
        particles.forEach(p => {
          p.y += p.vy;
          p.angle += p.vAngle;
          if (p.y > canvas.height) {
            p.y = -p.size - Math.random() * 40;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size / 2, (p.size / 2) * Math.abs(Math.cos(p.angle * 1.5)), 0, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        });

        // Floating jackpot bubbles
        bubbleParticles.forEach(b => {
          b.y -= b.vy;
          if (b.y < -35) {
            b.y = canvas.height + Math.random() * 40;
            b.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(b.x - b.size/3, b.y - b.size/3, b.size/5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fill();

          ctx.fillStyle = '#fff';
          ctx.font = `bold ${b.size * 0.33}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.text, b.x, b.y);
          ctx.restore();
        });

      } else if (vid.slug === 'coronation') {
        // Rotating crown light rays
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(t * 0.12);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.05)';
        for (let i = 0; i < 12; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, canvas.width * 1.6, (i * Math.PI * 2) / 12, (i * Math.PI * 2) / 12 + Math.PI / 12);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Royal King sprite sitting
        if (mascotImg.complete) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2 + 15);
          ctx.drawImage(mascotImg, -48, -68, 96, 126);
          ctx.restore();
        }

        // Bobbing golden crown
        const crownY = canvas.height / 2 - 70 + Math.sin(t * 3) * 5;
        ctx.save();
        ctx.translate(canvas.width / 2, crownY);
        
        const crownGrad = ctx.createLinearGradient(-18, 0, 18, 0);
        crownGrad.addColorStop(0, '#f59e0b');
        crownGrad.addColorStop(0.5, '#fef3c7');
        crownGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = crownGrad;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        
        ctx.beginPath();
        ctx.moveTo(-22, 8);
        ctx.lineTo(22, 8);
        ctx.lineTo(18, -4);
        ctx.lineTo(9, 2);
        ctx.lineTo(0, -10);
        ctx.lineTo(-9, 2);
        ctx.lineTo(-18, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Gems
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -10, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(-18, -4, 1.5, 0, Math.PI * 2);
        ctx.arc(18, -4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Twinkling crown sparkles
        if (Math.random() < 0.18) {
          ctx.save();
          ctx.translate(canvas.width / 2 + (Math.random() - 0.5) * 36, crownY + (Math.random() - 0.5) * 12);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#fff';
          const size = 3 + Math.random() * 4;
          ctx.beginPath();
          ctx.moveTo(-size, 0);
          ctx.lineTo(0, -size);
          ctx.lineTo(size, 0);
          ctx.lineTo(0, size);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Royal golden sparkle rise & Falling Rose Petals
        particles.forEach(p => {
          if (p.type === 'petal') {
            p.y += p.vy;
            p.x += p.vx + Math.sin(t * 2.5 + p.y * 0.06) * 0.35;
            p.angle += p.vAngle;
            if (p.y > canvas.height) {
              p.y = -p.size - Math.random() * 20;
              p.x = Math.random() * canvas.width;
            }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = '#f87171'; // rose petal red
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            p.y -= p.vy;
            p.x += p.vx;
            if (p.y < 20) {
              p.y = canvas.height + Math.random() * 20;
              p.x = Math.random() * canvas.width;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
          }
        });

      } else if (vid.slug === 'crawl') {
        const crawlX = (t * 35) % (canvas.width + 80) - 40;
        const babyY = canvas.height / 2 + 25;

        // Footprint trails
        if (Math.random() < 0.25) {
          footprints.push({
            x: crawlX,
            y: babyY + 8 + (Math.random() - 0.5) * 4,
            alpha: 1
          });
        }

        footprints.forEach((f, idx) => {
          f.alpha -= delta * 0.75;
          if (f.alpha <= 0) {
            footprints.splice(idx, 1);
            return;
          }
          ctx.save();
          ctx.globalAlpha = f.alpha;
          ctx.fillStyle = '#34d399';
          ctx.shadowBlur = 5;
          ctx.shadowColor = '#10b981';
          ctx.beginPath();
          ctx.arc(f.x, f.y, 1.8, 0, Math.PI * 2);
          ctx.arc(f.x + 3, f.y - 1.5, 0.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Small baby roach sprite with blinking green eyes
        if (mascotImg.complete) {
          ctx.save();
          ctx.translate(crawlX, babyY);
          ctx.rotate(Math.sin(t * 12) * 0.12 + Math.PI / 2);
          ctx.drawImage(mascotImg, -18, -25, 36, 50);
          
          // Twinkling neon-green eyes
          const blink = Math.sin(t * 7) > 0.82;
          if (!blink) {
            ctx.fillStyle = '#10b981';
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#10b981';
            ctx.beginPath();
            ctx.arc(-3, -10, 1.2, 0, Math.PI * 2);
            ctx.arc(3, -10, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Bottles pacifiers floating
        particles.forEach(p => {
          p.y += p.vy;
          p.angle += p.vAngle;
          if (p.y > canvas.height) {
            p.y = -p.size - Math.random() * 40;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          if (p.type === 'bottle') {
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(-4, -8, 8, 16);
            ctx.fillStyle = '#f87171';
            ctx.fillRect(-2.5, -11, 5, 3);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(-1, -14, 2, 3);
          } else {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 4, 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(0, -2, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      // Draw Subtitle text at bottom
      const currentPercent = (t / duration) * 100;
      const sub = vid.subtitles.find(s => currentPercent >= s.start && currentPercent < s.end);
      if (sub) {
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#000000';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        
        const txt = sub.text;
        ctx.font = 'bold 12px sans-serif';
        const tw = ctx.measureText(txt).width;
        
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect((canvas.width - tw - 18) / 2, canvas.height - 38, tw + 18, 22, 5);
        } else {
          ctx.fillRect((canvas.width - tw - 18) / 2, canvas.height - 38, tw + 18, 22);
        }
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText(txt, canvas.width / 2, canvas.height - 23);
        ctx.restore();
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(render);
    } else {
      requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, vid, muted]);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercent = (clickX / width) * 100;
    const newTime = (newPercent / 100) * duration;
    currentTimeRef.current = newTime;
    setProgress(newPercent);
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (nextMuted) {
      stopSynth();
    } else {
      startSynth();
    }
  };

  const handleLike = (e) => {
    if (e) e.stopPropagation();
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
      triggerFeedback('Added to favorites!', 'success');
      if (typeof window !== 'undefined') {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
      }
    }
  };

  const handleShare = (e) => {
    if (e) e.stopPropagation();
    const referralLink = `https://t.me/${CJP_BOT_NAME}/app?startapp=vid_${vid.slug}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    triggerFeedback('Referral link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(`Watch the funny CJP ${vid.title} video loop and mine free coins!`)}`;
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    }
  };

  const handleCanvasClick = (e) => {
    const now = Date.now();
    const gap = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    if (gap < 300) {
      // Double tap detected!
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newHeart = {
        id: Date.now() + Math.random(),
        x,
        y
      };
      setHearts(prev => [...prev, newHeart]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 800);

      // Trigger like
      if (!hasLiked) {
        setLikes(likes + 1);
        setHasLiked(true);
        triggerFeedback('Added to favorites!', 'success');
      }

      // Haptic double-tap
      if (typeof window !== 'undefined') {
        const tg = window.Telegram?.WebApp;
        tg?.HapticFeedback?.notificationOccurred('success');
      }
    } else {
      // Single tap (toggle play/pause after delay)
      setTimeout(() => {
        if (Date.now() - lastClickTimeRef.current >= 300) {
          onPlayToggle();
        }
      }, 300);
    }
  };

  if (layoutMode === 'feed') {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden select-none flex flex-col justify-between">
        {feedback.text && (
          <div 
            className={`absolute top-16 left-1/2 -translate-x-1/2 z-[80] px-4 py-2 rounded-lg border text-[10px] font-bold shadow-lg backdrop-blur-md animate-fade-in ${
              feedback.type === 'success' 
                ? 'bg-primary/20 border-primary text-primary' 
                : 'bg-error-container/20 border-error text-error'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Top/Bottom shadows */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

        {/* Canvas player full view */}
        <div className="absolute inset-0 w-full h-full z-0 bg-black">
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick} 
            className="w-full h-full cursor-pointer object-cover"
          />
        </div>

        {/* Double-tap scaling hearts Pop */}
        {hearts.map(h => (
          <span 
            key={h.id} 
            className="absolute text-red-500 text-3xl pointer-events-none select-none z-30 animate-heart-pop"
            style={{ left: h.x, top: h.y }}
          >
            ❤️
          </span>
        ))}

        {/* Top title and rewards badge */}
        <div className="relative z-20 flex justify-between items-center p-4">
          <div className="text-left">
            <h3 className="font-extrabold text-sm text-white shadow-sm">{vid.title}</h3>
            <p className="text-[9px] text-white/70">{vid.views} views</p>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center gap-1 border ${
            isClaimedToday() || rewardClaimed
              ? 'bg-green-500/20 border-green-500/25 text-green-400' 
              : 'bg-primary/25 border-primary/25 text-primary'
          }`}>
            <span className="material-symbols-outlined text-[10.5px]">monetization_on</span>
            {isClaimedToday() || rewardClaimed ? 'Claimed +100' : 'Watch +100'}
          </div>
        </div>

        {/* Bottom details & active scrolling comment ticker */}
        <div className="relative z-20 p-4 pb-12 flex flex-col space-y-3 mt-auto w-[calc(100%-3.5rem)]">
          <p className="text-[10px] text-white/80 text-left leading-relaxed font-semibold drop-shadow">{vid.desc}</p>
          
          {/* Comments live ticker */}
          {activeComment && (
            <div className="bg-black/55 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-left max-w-[90%] animate-fade-in space-y-0.5 shadow-md">
              <span className="text-[9.5px] font-extrabold text-primary">{activeComment.user}</span>
              <p className="text-[10px] text-white/95 leading-snug">{activeComment.text}</p>
            </div>
          )}

          {/* Simple progress bar */}
          <div className="w-full h-[3px] bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Right side floating buttons */}
        <div className="absolute right-3 bottom-14 z-20 flex flex-col items-center space-y-4">
          {/* Avatar Profile Creator */}
          <div className="w-9 h-9 rounded-full border border-primary/40 overflow-hidden shadow-lg bg-surface flex items-center justify-center">
            <img src={vid.mascotSrc} alt="avatar" className="w-full h-full object-cover" />
          </div>

          {/* Like */}
          <div className="flex flex-col items-center">
            <button 
              onClick={handleLike}
              className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-75 ${
                hasLiked 
                  ? 'bg-red-500/20 border-red-500 text-red-500' 
                  : 'bg-black/55 border-white/10 text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]" style={hasLiked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                favorite
              </span>
            </button>
            <span className="text-[8.5px] text-white/80 font-bold mt-1 drop-shadow">{likes.toLocaleString()}</span>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => setShowComments(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/55 border border-white/10 text-white hover:text-primary transition-all active:scale-75"
            >
              <span className="material-symbols-outlined text-[18px]">
                chat
              </span>
            </button>
            <span className="text-[8.5px] text-white/80 font-bold mt-1 drop-shadow">{vid.commentsList.length}</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center">
            <button 
              onClick={handleShare}
              className={`w-9 h-9 rounded-full flex items-center justify-center bg-black/55 border text-white transition-all active:scale-75 ${
                copied ? 'border-green-500 text-green-400' : 'border-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {copied ? 'done' : 'share'}
              </span>
            </button>
            <span className="text-[8.5px] text-white/80 font-bold mt-1 drop-shadow">Share</span>
          </div>

          {/* Mute */}
          <div className="flex flex-col items-center">
            <button 
              onClick={handleMuteToggle} 
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/55 border border-white/10 text-white hover:text-primary transition-all active:scale-75"
            >
              <span className="material-symbols-outlined text-[18px]">
                {muted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
            <span className="text-[8.5px] text-white/80 font-bold mt-1 drop-shadow">{muted ? 'Muted' : 'Sound'}</span>
          </div>

          {/* Spinning Vinyl Disc visualizer */}
          <div className="relative mt-1">
            <div className={`w-9 h-9 rounded-full bg-black/80 border border-white/20 overflow-hidden flex items-center justify-center shadow-lg ${isPlaying && !muted ? 'animate-spin-slow' : ''}`}>
              <img src={vid.mascotSrc} alt="Vinyl" className="w-5.5 h-5.5 rounded-full object-cover" />
            </div>
            {/* Music notes emitter */}
            {notesList.map(note => (
              <span 
                key={note.id}
                className="absolute text-primary text-xs animate-float-note pointer-events-none"
                style={{ 
                  left: `${note.x}px`, 
                  top: `${note.y}px` 
                }}
              >
                {note.char}
              </span>
            ))}
          </div>
        </div>

        {/* Comments Drawer */}
        {showComments && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center transition-all animate-fade-in">
            <div className="bg-surface border-t border-outline-variant/30 rounded-t-3xl w-full max-w-md p-6 space-y-4 max-h-[60vh] flex flex-col justify-between shadow-2xl animate-slide-up">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="text-left">
                  <h3 className="font-extrabold text-sm text-white">Discussions</h3>
                  <p className="text-[9.5px] text-on-surface-variant">{vid.commentsList.length} comments</p>
                </div>
                <button 
                  onClick={() => setShowComments(false)}
                  className="text-on-surface-variant hover:text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-3 pr-1 my-2 text-left">
                {vid.commentsList.map((c, i) => (
                  <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[10.5px] text-primary">{c.user}</span>
                      <span className="text-[8.5px] text-on-surface-variant font-label-mono">{c.time}</span>
                    </div>
                    <p className="text-xs text-white/90 leading-normal">{c.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-2 border-t border-white/5">
                <input 
                  type="text" 
                  placeholder="Write a message..."
                  className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      vid.commentsList.unshift({
                        user: "You",
                        time: "Just now",
                        text: e.currentTarget.value
                      });
                      e.currentTarget.value = '';
                      triggerFeedback('Comment posted!', 'success');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Claimed Popup modal */}
        {claimedPopup && (
          <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-6 animate-fade-in">
            <div className="glass-card bg-surface-container-high/90 border border-primary/20 rounded-3xl p-6 max-w-sm text-center space-y-4 shadow-2xl relative overflow-hidden animate-zoom-in">
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 blur-xl rounded-full"></div>
              
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mx-auto">
                <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  monetization_on
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-white">CJP Coins Earned!</h3>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  Congratulations! You completed watching <span className="text-white font-bold">{vid.title}</span>. 
                  We have credited <span className="text-primary font-bold">+100 CJP Coins</span> to your account balance.
                </p>
              </div>

              <button
                onClick={() => setClaimedPopup(false)}
                className="w-full bg-primary text-black font-bold py-3 rounded-xl text-xs active:scale-95 transition-all shadow-lg"
              >
                Amaze! Keep Watching
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback 'list' card layout
  return (
    <div className="relative glass-card p-4 rounded-2xl border border-white/5 bg-surface-container-low/40 overflow-hidden flex flex-col space-y-3">
      {feedback.text && (
        <div 
          className={`absolute top-4 left-1/2 -translate-x-1/2 z-[80] px-4 py-2 rounded-lg border text-[10px] font-bold shadow-lg backdrop-blur-md animate-fade-in ${
            feedback.type === 'success' 
              ? 'bg-primary/20 border-primary text-primary' 
              : 'bg-error-container/20 border-error text-error'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-left">
          <h3 className="font-extrabold text-sm text-white">{vid.title}</h3>
          <p className="text-[10px] text-on-surface-variant">{vid.views} views • {likes.toLocaleString()} likes</p>
        </div>
        {/* Earn badge */}
        <div className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold flex items-center gap-1 border ${
          isClaimedToday() || rewardClaimed
            ? 'bg-green-500/10 border-green-500/25 text-green-400' 
            : 'bg-primary/25 border-primary/20 text-primary animate-pulse'
        }`}>
          <span className="material-symbols-outlined text-[10.5px]">monetization_on</span>
          {isClaimedToday() || rewardClaimed ? 'Claimed +100' : 'Watch & Earn +100'}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 group">
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick} 
          className="w-full h-full cursor-pointer object-cover"
        />

        {/* Double-tap scaling hearts Pop */}
        {hearts.map(h => (
          <span 
            key={h.id} 
            className="absolute text-red-500 text-3xl pointer-events-none select-none z-30 animate-heart-pop"
            style={{ left: h.x, top: h.y }}
          >
            ❤️
          </span>
        ))}

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div 
            onClick={onPlayToggle}
            className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer transition-all hover:bg-black/20"
          >
            <div className="w-14 h-14 rounded-full bg-primary text-black flex items-center justify-center shadow-lg shadow-amber-500/30 transform active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </div>
        )}

        {/* Bottom Floating controls overlay inside the video */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-auto bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-white/5 z-20">
          <button 
            onClick={onPlayToggle} 
            className="text-white hover:text-primary transition-all flex items-center"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          {/* Seeker track */}
          <div 
            onClick={handleSeek}
            className="flex-grow mx-3 h-1 bg-white/20 rounded-full cursor-pointer relative"
          >
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-primary rounded-full shadow transition-all pointer-events-none"
              style={{ left: `calc(${progress}% - 5px)` }}
            />
          </div>

          <button 
            onClick={handleMuteToggle} 
            className="text-white hover:text-primary transition-all flex items-center"
          >
            <span className="material-symbols-outlined text-[18px]">
              {muted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
        </div>
        
        {/* Floating action buttons */}
        <div className="absolute right-3 top-4 flex flex-col space-y-3 z-20">
          <button 
            onClick={handleLike}
            className={`w-8.5 h-8.5 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-75 ${
              hasLiked 
                ? 'bg-red-500/20 border-red-500 text-red-500' 
                : 'bg-black/55 border-white/10 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" style={hasLiked ? { fontVariationSettings: "'FILL' 1" } : {}}>
              favorite
            </span>
          </button>

          <button 
            onClick={() => setShowComments(true)}
            className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-black/55 border border-white/10 text-white hover:text-primary transition-all active:scale-75"
          >
            <span className="material-symbols-outlined text-[18px]">
              chat
            </span>
          </button>

          <button 
            onClick={handleShare}
            className={`w-8.5 h-8.5 rounded-full flex items-center justify-center bg-black/55 border text-white transition-all active:scale-75 ${
              copied ? 'border-green-500 text-green-400' : 'border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? 'done' : 'share'}
            </span>
          </button>
        </div>
      </div>

      {/* Video Description */}
      <div className="px-1 text-left">
        <p className="text-[10.5px] text-on-surface-variant leading-relaxed">{vid.desc}</p>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center transition-all animate-fade-in">
          <div className="bg-surface border-t border-outline-variant/30 rounded-t-3xl w-full max-w-md p-6 space-y-4 max-h-[60vh] flex flex-col justify-between shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="text-left">
                <h3 className="font-extrabold text-sm text-white">Discussions</h3>
                <p className="text-[9.5px] text-on-surface-variant">{vid.commentsList.length} comments</p>
              </div>
              <button 
                onClick={() => setShowComments(false)}
                className="text-on-surface-variant hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 pr-1 my-2 text-left">
              {vid.commentsList.map((c, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[10.5px] text-primary">{c.user}</span>
                    <span className="text-[8.5px] text-on-surface-variant font-label-mono">{c.time}</span>
                  </div>
                  <p className="text-xs text-white/90 leading-normal">{c.text}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-white/5">
              <input 
                type="text" 
                placeholder="Write a message..."
                className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    vid.commentsList.unshift({
                      user: "You",
                      time: "Just now",
                      text: e.currentTarget.value
                    });
                    e.currentTarget.value = '';
                    triggerFeedback('Comment posted!', 'success');
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Claimed Popup modal */}
      {claimedPopup && (
        <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-6 animate-fade-in">
          <div className="glass-card bg-surface-container-high/90 border border-primary/20 rounded-3xl p-6 max-w-sm text-center space-y-4 shadow-2xl relative overflow-hidden animate-zoom-in">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 blur-xl rounded-full"></div>
            
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mx-auto">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                monetization_on
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-white">CJP Coins Earned!</h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Congratulations! You completed watching <span className="text-white font-bold">{vid.title}</span>. 
                We have credited <span className="text-primary font-bold">+100 CJP Coins</span> to your account balance.
              </p>
            </div>

            <button
              onClick={() => setClaimedPopup(false)}
              className="w-full bg-primary text-black font-bold py-3 rounded-xl text-xs active:scale-95 transition-all shadow-lg"
            >
              Amaze! Keep Watching
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

