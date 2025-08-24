require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const verifyTelegramAuth = require('./middleware/auth');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// CORS — lock to FRONTEND_URL in production, allow all in dev
const corsOrigin = IS_PRODUCTION
  ? (process.env.FRONTEND_URL || 'https://yourdomain.com')
  : '*';

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-mock-init-data']
}));

// Trust proxy (needed when behind Nginx)
app.set('trust proxy', 1);

app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas / Database'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.warn('WARNING: Express server running without a database connection. Ensure MongoDB is running.');
  });

// Load tasks from config
const TASKS = require('./config/tasks.json');

// Economy Constants
const TOTAL_SUPPLY = 10000000000; // 10 Billion CJP
const LAUNCH_DATE = new Date("2026-05-01T00:00:00Z");

// Helpers for Halving Economy
function getCurrentTapValue() {
  const now = new Date();
  const elapsedMs = now - LAUNCH_DATE;
  const daysElapsed = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
  const halvingCycles = Math.floor(daysElapsed / 30);
  // Base tap value starts at 1.0, halves every 30 days
  return Math.max(0.0001, 1.0 / Math.pow(2, halvingCycles));
}

function getDaysUntilNextHalving() {
  const now = new Date();
  const elapsedMs = now - LAUNCH_DATE;
  const daysElapsed = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
  const daysInCurrentCycle = daysElapsed % 30;
  return 30 - daysInCurrentCycle;
}

// Helper to convert date to IST (UTC+5:30) date string YYYY-MM-DD
function getISTDateString(date) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utcMs + 5.5 * 3600000);
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// IST Midnight Reset Handler
async function checkAndApplyDailyReset(user) {
  const now = new Date();
  const lastResetStr = getISTDateString(new Date(user.last_daily_reset || user.createdAt || now));
  const currentStr = getISTDateString(now);

  if (lastResetStr !== currentStr) {
    user.daily_taps = 0;
    user.daily_ads_watched = 0;
    user.last_daily_reset = now;

    // Filter out daily tasks from completed list so they can be re-earned
    const dailyTaskIds = TASKS.filter(t => t.type === 'daily').map(t => t.id);
    user.completed_tasks = user.completed_tasks.filter(taskId => !dailyTaskIds.includes(taskId));
  }
  return user;
}

// Mock In-Memory Database for local offline testing
class MockUser {
  constructor(data = {}) {
    this.telegram_id = data.telegram_id || '';
    this.username = data.username || '';
    this.first_name = data.first_name || '';
    this.coins = data.coins || 0;
    this.energy = data.energy !== undefined ? data.energy : 1000;
    this.max_energy = data.max_energy || 1000;
    this.referred_by = data.referred_by || null;
    this.referrals = data.referrals || [];
    this.completed_tasks = data.completed_tasks || [];
    this.last_energy_regen = data.last_energy_regen || new Date();
    this.ton_wallet = data.ton_wallet || null;
    this.claimed_coins = data.claimed_coins || 0;
    this.last_tap_sync = data.last_tap_sync || new Date();
    this.last_daily_reset = data.last_daily_reset || new Date();
    this.daily_taps = data.daily_taps || 0;
    this.daily_ads_watched = data.daily_ads_watched || 0;
    this.lifetime_taps = data.lifetime_taps || 0;
    this.streak_days = data.streak_days || 1;
    this.last_checkin = data.last_checkin || null;
    this.last_spin_time = data.last_spin_time || null;
    this.last_card_flip_time = data.last_card_flip_time || null;
    this.last_quiz_time = data.last_quiz_time || null;
    this.upgrades = data.upgrades || [];
    this.passive_income_rate = data.passive_income_rate || 0;
    this.last_passive_income_collect = data.last_passive_income_collect || new Date();
    this.achievements = data.achievements || [];
    this.weekly_mission_progress = data.weekly_mission_progress || { taps: 0, refers: 0, ads: 0, checkins: 0, quizzes: 0, completed_at: null };
    this.pvp_wins = data.pvp_wins || 0;
    this.pvp_losses = data.pvp_losses || 0;
    this.pvp_earnings = data.pvp_earnings || 0;
    this.flash_raid_taps = data.flash_raid_taps || 0;
    this.last_flash_raid_completed = data.last_flash_raid_completed || null;
    this.watched_videos = data.watched_videos || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save() {
    this.updatedAt = new Date();
    MOCK_DB.users.set(this.telegram_id, this);
    return this;
  }
}

const MOCK_DB = {
  users: new Map()
};

// Seed initial mock players for leaderboard
const initialMockPlayers = [
  { telegram_id: 'mock_1', username: 'ShadowWhale', first_name: 'ShadowWhale', coins: 1584000, referrals: ['1', '2'] },
  { telegram_id: 'mock_2', username: 'NeonReaper', first_name: 'NeonReaper', coins: 1421000 },
  { telegram_id: 'mock_3', username: 'CryptoRex', first_name: 'CryptoRex', coins: 1295000 },
  { telegram_id: 'mock_4', username: 'LunarLord', first_name: 'LunarLord', coins: 982000 },
  { telegram_id: 'mock_5', username: 'SolanaSlayer', first_name: 'SolanaSlayer', coins: 857000 },
  { telegram_id: 'mock_6', username: 'GigaChad', first_name: 'GigaChad', coins: 770000 },
  { telegram_id: 'mock_7', username: 'VoidWalker', first_name: 'VoidWalker', coins: 691000 },
  { telegram_id: 'mock_8', username: 'BullRun', first_name: 'BullRun', coins: 543000 },
  { telegram_id: 'mock_9', username: 'DiamondHands', first_name: 'DiamondHands', coins: 429000 }
];

initialMockPlayers.forEach(p => {
  MOCK_DB.users.set(p.telegram_id, new MockUser(p));
});

// Database Abstraction Helpers
async function findUserById(telegram_id) {
  if (mongoose.connection.readyState === 1) {
    try {
      return await User.findOne({ telegram_id });
    } catch (err) {
      console.error('Error finding user in MongoDB, falling back to memory:', err);
    }
  }
  const mock = MOCK_DB.users.get(telegram_id);
  return mock ? new MockUser(mock) : null;
}

async function createUser(data) {
  if (mongoose.connection.readyState === 1) {
    try {
      const newUser = new User(data);
      return await newUser.save();
    } catch (err) {
      console.error('Error creating user in MongoDB, falling back to memory:', err);
    }
  }
  const mockUser = new MockUser(data);
  await mockUser.save();
  return mockUser;
}

async function calculateTotalMined() {
  if (mongoose.connection.readyState === 1) {
    try {
      const result = await User.aggregate([
        { $group: { _id: null, total: { $sum: { $add: ["$coins", "$claimed_coins"] } } } }
      ]);
      return result[0]?.total || 0;
    } catch (err) {
      console.error('Error calculating total mined in Mongo:', err);
    }
  }
  return Array.from(MOCK_DB.users.values()).reduce((sum, u) => sum + u.coins + (u.claimed_coins || 0), 0);
}

// Helper to regenerate energy on the fly based on elapsed time (1 energy per 3 seconds)
function regenerateUserEnergy(user) {
  const now = new Date();
  const lastRegen = new Date(user.last_energy_regen || user.updatedAt || now);
  const elapsedMs = now - lastRegen;
  
  if (elapsedMs >= 3000) {
    const energyToAdd = Math.floor(elapsedMs / 3000);
    if (energyToAdd > 0) {
      user.energy = Math.min(user.max_energy, user.energy + energyToAdd);
      user.last_energy_regen = now;
    }
  }
  return user;
}

// Automatic milestone triggers for Taps & Coins
function checkTapMilestones(user) {
  // Daily tap goals
  if (user.daily_taps >= 500 && !user.completed_tasks.includes('daily_tap_500')) {
    user.completed_tasks.push('daily_tap_500');
    user.coins += 250;
  }
  if (user.daily_taps >= 1000 && !user.completed_tasks.includes('daily_tap_1000')) {
    user.completed_tasks.push('daily_tap_1000');
    user.coins += 600;
  }
  
  // Lifetime tap goals
  if (user.lifetime_taps >= 1 && !user.completed_tasks.includes('ot_first_tap')) {
    user.completed_tasks.push('ot_first_tap');
    user.coins += 500;
  }
  if (user.lifetime_taps >= 10000 && !user.completed_tasks.includes('ot_tap_lifetime_10k')) {
    user.completed_tasks.push('ot_tap_lifetime_10k');
    user.coins += 1000;
  }
  if (user.lifetime_taps >= 100000 && !user.completed_tasks.includes('ot_tap_lifetime_100k')) {
    user.completed_tasks.push('ot_tap_lifetime_100k');
    user.coins += 5000;
  }
  if (user.lifetime_taps >= 1000000 && !user.completed_tasks.includes('ot_tap_lifetime_1m')) {
    user.completed_tasks.push('ot_tap_lifetime_1m');
    user.coins += 20000;
  }

  // Coin milestones
  checkCoinMilestones(user);
}

function checkCoinMilestones(user) {
  const milestones = [
    { id: 'ot_reach_10k', threshold: 10000, reward: 500 },
    { id: 'ot_reach_100k', threshold: 100000, reward: 2000 },
    { id: 'ot_reach_500k', threshold: 500000, reward: 5000 },
    { id: 'ot_reach_1m', threshold: 1000000, reward: 10000 },
    { id: 'ot_reach_5m', threshold: 5000000, reward: 25000 },
    { id: 'ot_reach_10m', threshold: 10000000, reward: 50000 }
  ];
  milestones.forEach(m => {
    if (user.coins >= m.threshold && !user.completed_tasks.includes(m.id)) {
      user.completed_tasks.push(m.id);
      user.coins += m.reward;
    }
  });
}

function checkAllDailyTasksComplete(user) {
  const requirements = ['daily_ad_1', 'daily_ad_2', 'daily_ad_3', 'daily_tap_500', 'daily_checkin'];
  const allMet = requirements.every(reqId => user.completed_tasks.includes(reqId));
  if (allMet && !user.completed_tasks.includes('daily_all_completed')) {
    user.completed_tasks.push('daily_all_completed');
    user.coins += 1000;
  }
}

// Gamification Constants & Dictionaries
const UPGRADE_CARDS = {
  cockroach_army: {
    id: 'cockroach_army',
    name: 'Cockroach Army',
    description: 'Train cockroaches to mine for you. Increases passive income rate by +100 CJP/hr per level.',
    baseCost: 1000,
    effectPerLevel: 100, // passive income/hr
    type: 'passive_income',
    icon: 'groups'
  },
  gold_chain: {
    id: 'gold_chain',
    name: 'Gold Chain',
    description: 'Drape your cockroach in gold. Increases tap value multiplier by +1 per level.',
    baseCost: 1500,
    effectPerLevel: 1, // tap multiplier
    type: 'tap_multiplier',
    icon: 'workspace_premium'
  },
  crown_upgrade: {
    id: 'crown_upgrade',
    name: 'Crown Upgrade',
    description: 'Crown your cockroach as royalty. Increases max energy by +500 per level.',
    baseCost: 2000,
    effectPerLevel: 500, // max energy
    type: 'max_energy',
    icon: 'military_tech'
  },
  political_rally: {
    id: 'political_rally',
    name: 'Political Rally',
    description: 'Host rallies to recruit followers. Increases referral bonus by +1000 CJP per level.',
    baseCost: 3000,
    effectPerLevel: 1000, // referral bonus boost
    type: 'referral_bonus',
    icon: 'campaign'
  }
};

const QUIZ_QUESTIONS = [
  { question: "How many zeros in 1 crore?", options: ["5", "6", "7", "8"], answer: "7" },
  { question: "What year was Bitcoin created?", options: ["2007", "2008", "2009", "2010"], answer: "2009" },
  { question: "Who is the pseudonymous creator of Bitcoin?", options: ["Satoshi Nakamoto", "Vitalik Buterin", "Hal Finney", "Nick Szabo"], answer: "Satoshi Nakamoto" },
  { question: "What is the maximum supply of Bitcoin?", options: ["21 Million", "100 Million", "10 Billion", "Infinite"], answer: "21 Million" },
  { question: "Which blockchain uses the TON network?", options: ["Solana", "Ethereum", "Telegram Open Network", "Binance Chain"], answer: "Telegram Open Network" }
];

const ACHIEVEMENT_DEFINITIONS = {
  first_blood: { id: 'first_blood', name: 'First Blood', description: 'Perform your first tap.', reward: 100, icon: 'touch_app' },
  night_owl: { id: 'night_owl', name: 'Night Owl', description: 'Tap between 12 AM and 4 AM IST.', reward: 200, icon: 'bedtime' },
  speed_demon: { id: 'speed_demon', name: 'Speed Demon', description: 'Perform 300+ taps in a single sync.', reward: 300, icon: 'speed' },
  social_king: { id: 'social_king', name: 'Social King', description: 'Refer at least 5 friends.', reward: 1000, icon: 'group' },
  diamond_hands: { id: 'diamond_hands', name: 'Diamond Hands', description: 'Keep a 30-day login streak.', reward: 5000, icon: 'lock' },
  first_spin: { id: 'first_spin', name: 'Wheel Spinner', description: 'Spin the wheel of fortune.', reward: 150, icon: 'refresh' },
  first_flip: { id: 'first_flip', name: 'Card Trickster', description: 'Flip your first mystery card.', reward: 150, icon: 'layers' },
  quiz_novice: { id: 'quiz_novice', name: 'Brainiac', description: 'Answer today\'s quiz correctly.', reward: 200, icon: 'psychology' },
  pvp_first_wager: { id: 'pvp_first_wager', name: 'Gladiator', description: 'Participate in your first PvP battle.', reward: 250, icon: 'sports_mma' },
  first_upgrade: { id: 'first_upgrade', name: 'Industrialist', description: 'Purchase your first card upgrade.', reward: 200, icon: 'construction' },
  hoarder_10k: { id: 'hoarder_10k', name: 'CJP Collector', description: 'Amass 10,000 CJP coins.', reward: 300, icon: 'savings' },
  halfway_there: { id: 'halfway_there', name: 'Task Runner', description: 'Complete 20 tasks.', reward: 500, icon: 'check_circle' },
  completionist: { id: 'completionist', name: 'Legendary Finisher', description: 'Complete 50 tasks.', reward: 2000, icon: 'stars' },
  military_colonel: { id: 'military_colonel', name: 'Swarm Commander', description: 'Refer 10 friends.', reward: 2500, icon: 'military_tech' },
  roach_tycoon: { id: 'roach_tycoon', name: 'Roach Tycoon', description: 'Achieve 500 CJP/hr passive income rate.', reward: 1000, icon: 'monetization_on' },
  max_energy_1500: { id: 'max_energy_1500', name: 'Nuclear Reactor', description: 'Upgrade max energy to 1,500 or more.', reward: 500, icon: 'bolt' },
  roach_king_evolution: { id: 'roach_king_evolution', name: 'Royal Swarm', description: 'Evolve into Roach King.', reward: 1500, icon: 'crown' },
  politician_evolution: { id: 'politician_evolution', name: 'Supreme Politician', description: 'Evolve into Supreme Roach in suit.', reward: 3000, icon: 'gavel' },
  ad_viewer_1: { id: 'ad_viewer_1', name: 'Ad Cadet', description: 'Watch a sponsored ad.', reward: 100, icon: 'play_circle' },
  ad_enthusiast_10: { id: 'ad_enthusiast_10', name: 'Screen Addict', description: 'Watch 10 sponsored ads.', reward: 500, icon: 'tv' },
  streak_3: { id: 'streak_3', name: 'Daily Habit', description: 'Reach a 3-day login streak.', reward: 200, icon: 'calendar_today' },
  streak_7: { id: 'streak_7', name: 'Unstoppable', description: 'Reach a 7-day login streak.', reward: 1000, icon: 'calendar_month' },
  pvp_winner_5: { id: 'pvp_winner_5', name: 'Duellist', description: 'Win 5 PvP matches.', reward: 1000, icon: 'swords' },
  pvp_champion_20: { id: 'pvp_champion_20', name: 'Arena Champion', description: 'Win 20 PvP matches.', reward: 5000, icon: 'trophy' },
  cjp_millionaire: { id: 'cjp_millionaire', name: 'CJP Millionaire', description: 'Have 1,000,000 CJP coins in balance.', reward: 5000, icon: 'payments' },
  weekly_mission_clear_1: { id: 'weekly_mission_clear_1', name: 'Mission Accomplished', description: 'Complete a weekly mission map.', reward: 2000, icon: 'map' },
  flash_raider_1: { id: 'flash_raider_1', name: 'Raid Commando', description: 'Complete a flash raid event.', reward: 1000, icon: 'flash_on' },
  jackpot_winner: { id: 'jackpot_winner', name: 'Lucky Bug', description: 'Hit the Jackpot (50,000) on the Wheel.', reward: 5000, icon: 'casino' },
  double_bomb_active: { id: 'double_bomb_active', name: 'Roach Bomb', description: 'Flip a card and receive the Cockroach Bomb.', reward: 1000, icon: 'dangerous' },
  elite_supporter: { id: 'elite_supporter', name: 'Web3 Citizen', description: 'Connect your TON wallet.', reward: 500, icon: 'account_balance_wallet' }
};

// Gamification Helpers
function getUpgradeLevel(user, cardId) {
  if (!user.upgrades) return 0;
  const upgrade = user.upgrades.find(u => u.cardId === cardId);
  return upgrade ? upgrade.level : 0;
}

function recalculateUserStats(user) {
  const armyLvl = getUpgradeLevel(user, 'cockroach_army');
  const crownLvl = getUpgradeLevel(user, 'crown_upgrade');
  
  user.passive_income_rate = armyLvl * 100;
  user.max_energy = 1000 + crownLvl * 500;
  return user;
}

function applyPassiveIncome(user) {
  const now = new Date();
  const lastCollect = new Date(user.last_passive_income_collect || user.updatedAt || now);
  const elapsedMs = now - lastCollect;
  const ratePerHour = user.passive_income_rate || 0;
  
  if (ratePerHour > 0 && elapsedMs > 0) {
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    const earned = Math.floor(elapsedHours * ratePerHour);
    if (earned > 0) {
      user.coins += earned;
      user.last_passive_income_collect = now;
    }
  } else {
    user.last_passive_income_collect = now;
  }
  return user;
}

function getEvolutionDetails(coins) {
  if (coins < 50000) {
    return { level: 1, name: "Baby Roach", image: "/mascot.jpg" };
  } else if (coins < 250000) {
    return { level: 2, name: "Street Roach", image: "/roach_miner.png" };
  } else if (coins < 1000000) {
    return { level: 3, name: "Roach with Glasses", image: "/roach_miner.png" };
  } else if (coins < 5000000) {
    return { level: 4, name: "Roach with Gold Chain", image: "/roach_gangster.png" };
  } else if (coins < 20000000) {
    return { level: 5, name: "Roach with Crown", image: "/roach_king.png" };
  } else {
    return { level: 6, name: "Supreme Roach in Suit", image: "/roach_politician.png" };
  }
}

function checkAchievementsAndUnlock(user) {
  if (!user.achievements) user.achievements = [];
  const toUnlock = [];

  // 1. first_blood
  if (user.lifetime_taps >= 1) toUnlock.push('first_blood');

  // 2. night_owl
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utcMs + 5.5 * 3600000);
  const istHour = istDate.getHours();
  if (user.lifetime_taps > 0 && istHour >= 0 && istHour < 4) {
    toUnlock.push('night_owl');
  }

  // 4. social_king
  if (user.referrals && user.referrals.length >= 5) toUnlock.push('social_king');

  // 5. diamond_hands
  if (user.streak_days >= 30) toUnlock.push('diamond_hands');

  // 10. first_upgrade
  if (user.upgrades && user.upgrades.length > 0) toUnlock.push('first_upgrade');

  // 11. hoarder_10k
  if (user.coins >= 10000) toUnlock.push('hoarder_10k');

  // 12. halfway_there
  if (user.completed_tasks && user.completed_tasks.length >= 20) toUnlock.push('halfway_there');

  // 13. completionist
  if (user.completed_tasks && user.completed_tasks.length >= 50) toUnlock.push('completionist');

  // 14. military_colonel
  if (user.referrals && user.referrals.length >= 10) toUnlock.push('military_colonel');

  // 15. roach_tycoon
  if (user.passive_income_rate >= 500) toUnlock.push('roach_tycoon');

  // 16. max_energy_1500
  const maxEnergyBoost = (user.upgrades || []).reduce((acc, u) => {
    if (u.cardId === 'crown_upgrade') return acc + u.level * 500;
    return acc;
  }, 0);
  if (1000 + maxEnergyBoost >= 1500) toUnlock.push('max_energy_1500');

  // 17. roach_king_evolution
  if (user.coins >= 5000000) toUnlock.push('roach_king_evolution');

  // 18. politician_evolution
  if (user.coins >= 20000000) toUnlock.push('politician_evolution');

  // 20. ad_enthusiast_10
  if (user.daily_ads_watched >= 10 || user.completed_tasks.filter(t => t.startsWith('daily_ad_')).length >= 10) {
    toUnlock.push('ad_enthusiast_10');
  }

  // 21. streak_3
  if (user.streak_days >= 3) toUnlock.push('streak_3');

  // 22. streak_7
  if (user.streak_days >= 7) toUnlock.push('streak_7');

  // 23. pvp_winner_5
  if (user.pvp_wins >= 5) toUnlock.push('pvp_winner_5');

  // 24. pvp_champion_20
  if (user.pvp_wins >= 20) toUnlock.push('pvp_champion_20');

  // 25. cjp_millionaire
  if (user.coins >= 1000000) toUnlock.push('cjp_millionaire');

  // 30. elite_supporter
  if (user.ton_wallet) toUnlock.push('elite_supporter');

  toUnlock.forEach(achId => {
    if (!user.achievements.includes(achId)) {
      user.achievements.push(achId);
      const def = ACHIEVEMENT_DEFINITIONS[achId];
      if (def) {
        user.coins += def.reward;
      }
    }
  });
}

function updateWeeklyMission(user, field, amount = 1) {
  if (!user.weekly_mission_progress) {
    user.weekly_mission_progress = { taps: 0, refers: 0, ads: 0, checkins: 0, quizzes: 0, completed_at: null };
  }
  
  if (user.weekly_mission_progress.completed_at) return; // already done this week
  
  user.weekly_mission_progress[field] = (user.weekly_mission_progress[field] || 0) + amount;
  
  // Check if all steps met
  const isTapsMet = user.weekly_mission_progress.taps >= 2000;
  const isRefersMet = user.weekly_mission_progress.refers >= 1;
  const isAdsMet = user.weekly_mission_progress.ads >= 3;
  const isCheckinsMet = user.weekly_mission_progress.checkins >= 5;
  const isQuizzesMet = user.weekly_mission_progress.quizzes >= 1;
  
  if (isTapsMet && isRefersMet && isAdsMet && isCheckinsMet && isQuizzesMet) {
    user.weekly_mission_progress.completed_at = new Date();
    user.coins += 10000; // award 10,000 CJP reward
    if (user.achievements && !user.achievements.includes('weekly_mission_clear_1')) {
      user.achievements.push('weekly_mission_clear_1');
      user.coins += ACHIEVEMENT_DEFINITIONS.weekly_mission_clear_1.reward;
    }
  }
}

function getStreakMultiplier(days) {
  if (days >= 30) return 5;
  if (days >= 15) return 3;
  if (days >= 7) return 2;
  if (days >= 3) return 1.5;
  return 1;
}

function handleStreakCheckIn(user) {
  const now = new Date();
  if (!user.last_checkin) {
    user.streak_days = 1;
    user.last_checkin = now;
    updateWeeklyMission(user, 'checkins', 1);
    return user;
  }
  
  const lastCheckInStr = getISTDateString(new Date(user.last_checkin));
  const todayStr = getISTDateString(now);
  
  if (lastCheckInStr !== todayStr) {
    const lastCheckInDate = new Date(user.last_checkin);
    const date1 = new Date(lastCheckInDate.getFullYear(), lastCheckInDate.getMonth(), lastCheckInDate.getDate());
    const date2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      user.streak_days = Math.min(30, (user.streak_days || 0) + 1);
    } else if (diffDays > 1) {
      user.streak_days = 1;
    }
    user.last_checkin = now;
    updateWeeklyMission(user, 'checkins', 1);
  }
  return user;
}

// Telegram Authorization Middleware
const token = process.env.TELEGRAM_BOT_TOKEN;
const authMiddleware = verifyTelegramAuth(token);

// 1. GET or CREATE user profile
app.post('/api/user', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());

    if (!user) {
      // Handle referral parameter if present
      const referredBy = req.body.referred_by;
      let referrerValid = false;
      
      if (referredBy && referredBy !== tgUser.id.toString()) {
        const referrer = await findUserById(referredBy);
        if (referrer) {
          referrerValid = true;
          // Award referral bonus to referrer
          referrer.coins += 5000;
          referrer.referrals.push(tgUser.id.toString());
          updateWeeklyMission(referrer, 'refers', 1);
          await referrer.save();
        }
      }

      user = await createUser({
        telegram_id: tgUser.id.toString(),
        username: tgUser.username || '',
        first_name: tgUser.first_name || '',
        coins: referrerValid ? 1000 : 0, // Bonus for being referred
        referred_by: referrerValid ? referredBy : null,
        energy: 1000,
        max_energy: 1000,
        last_energy_regen: new Date(),
        last_tap_sync: new Date(),
        last_daily_reset: new Date()
      });
      user = recalculateUserStats(user);
      user = handleStreakCheckIn(user);
      checkAchievementsAndUnlock(user);
      await user.save();
      console.log(`Created new user: ${user.username} (${user.telegram_id})`);
    } else {
      // Apply Daily Resets
      user = await checkAndApplyDailyReset(user);
      // Recalculate and apply statistics
      user = recalculateUserStats(user);
      user = applyPassiveIncome(user);
      user = handleStreakCheckIn(user);
      user = regenerateUserEnergy(user);
      checkAchievementsAndUnlock(user);
      await user.save();
    }

    const totalMined = await calculateTotalMined();
    const remainingPool = Math.max(0, TOTAL_SUPPLY - totalMined);
    const userJson = JSON.parse(JSON.stringify(user));
    const evolution = getEvolutionDetails(user.coins);
    const streakMultiplier = getStreakMultiplier(user.streak_days);

    res.json({
      ...userJson,
      totalMined,
      remainingPool,
      tapValue: getCurrentTapValue() * (1 + getUpgradeLevel(user, 'gold_chain')),
      daysUntilNextHalving: getDaysUntilNextHalving(),
      evolution,
      streakMultiplier,
      upgradeCardsMetadata: UPGRADE_CARDS,
      achievementsMetadata: ACHIEVEMENT_DEFINITIONS
    });
  } catch (err) {
    console.error('Error in /api/user:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 2. POST /tap API: Anti-Cheat Engine (saves coin count & energy authoritatively)
app.post('/api/tap', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    const { coins, energy } = req.body;

    if (coins === undefined || energy === undefined) {
      return res.status(400).json({ message: 'Bad Request: Missing coins or energy fields' });
    }

    let user = await findUserById(tgUser.id.toString());
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Dynamic verification parameters
    const now = new Date();
    const lastSync = new Date(user.last_tap_sync || user.updatedAt || now);
    const elapsedMs = now - lastSync;
    const elapsedSeconds = elapsedMs / 1000;

    // Calculate energy regenerated since last sync (1 energy per 3 seconds)
    const lastRegen = new Date(user.last_energy_regen || user.updatedAt || now);
    const elapsedRegenMs = now - lastRegen;
    const regeneratedEnergy = Math.floor(elapsedRegenMs / 3000);
    const maxPossibleEnergy = Math.min(user.max_energy, user.energy + regeneratedEnergy);

    const claimedCoins = Number(coins);
    const coinsDiff = claimedCoins - user.coins;

    const tapValue = getCurrentTapValue() * (1 + getUpgradeLevel(user, 'gold_chain'));

    if (coinsDiff > 0) {
      const tapsClaimed = Math.round(coinsDiff / tapValue);

      // Verify Tapping Speed (capping at max 10 taps/sec, with 15 taps minimum tolerance buffer)
      const maxAllowedTapsBySpeed = Math.max(15, Math.ceil(elapsedSeconds * 10));
      // Verify Energy consumption
      const maxAllowedTapsByEnergy = maxPossibleEnergy;

      let isCheating = false;
      let cheatReason = "";

      if (tapsClaimed > maxAllowedTapsBySpeed) {
        isCheating = true;
        cheatReason = `Tapping speed exceeds limit: claimed ${tapsClaimed} in ${elapsedSeconds.toFixed(1)}s (Max: ${maxAllowedTapsBySpeed})`;
      } else if (tapsClaimed > maxAllowedTapsByEnergy) {
        isCheating = true;
        cheatReason = `Energy consumption exceeds limit: claimed ${tapsClaimed} taps, but max possible was ${maxAllowedTapsByEnergy}`;
      }

      if (isCheating) {
        console.warn(`[ANTI-CHEAT TRIGGERED] User ${user.username || user.telegram_id}: ${cheatReason}. Discarding request.`);
        // Authoritative rollback
        user.energy = maxPossibleEnergy;
        user.last_energy_regen = now;
        user.last_tap_sync = now;
        await user.save();

        const totalMined = await calculateTotalMined();
        const remainingPool = Math.max(0, TOTAL_SUPPLY - totalMined);
        const evolution = getEvolutionDetails(user.coins);
        const streakMultiplier = getStreakMultiplier(user.streak_days);

        return res.status(400).json({
          error: "CheatDetected",
          message: "Suspicious clicking activity detected. Sync rollback performed.",
          coins: user.coins,
          energy: user.energy,
          tapValue,
          remainingPool,
          evolution,
          streakMultiplier
        });
      }

      // Valid sync: deduct energy and award coins
      user.coins += tapsClaimed * tapValue;
      user.energy = maxPossibleEnergy - tapsClaimed;
      user.daily_taps += tapsClaimed;
      user.lifetime_taps += tapsClaimed;

      // Unlocks speed demon if tapping 300+ in single sync
      if (tapsClaimed >= 300 && !user.achievements.includes('speed_demon')) {
        user.achievements.push('speed_demon');
        user.coins += ACHIEVEMENT_DEFINITIONS.speed_demon.reward;
      }

      // Update weekly mission taps
      updateWeeklyMission(user, 'taps', tapsClaimed);

      // Update milestone claims
      checkTapMilestones(user);
    } else {
      // Just apply energy regeneration
      user.energy = maxPossibleEnergy;
    }

    user.last_energy_regen = now;
    user.last_tap_sync = now;
    checkAchievementsAndUnlock(user);
    await user.save();

    const totalMined = await calculateTotalMined();
    const remainingPool = Math.max(0, TOTAL_SUPPLY - totalMined);
    const userJson = JSON.parse(JSON.stringify(user));
    const evolution = getEvolutionDetails(user.coins);
    const streakMultiplier = getStreakMultiplier(user.streak_days);

    res.json({
      ...userJson,
      tapValue,
      remainingPool,
      evolution,
      streakMultiplier
    });
  } catch (err) {
    console.error('Error in /api/tap:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 3. GET /leaderboard API
app.get('/api/leaderboard', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let topUsers;
    let allUsersSorted;

    if (mongoose.connection.readyState === 1) {
        topUsers = await User.find({})
          .sort({ coins: -1 })
          .limit(100)
          .select('username first_name coins telegram_id');
        allUsersSorted = await User.find({})
          .sort({ coins: -1 })
          .select('telegram_id');
    }

    // Memory Fallback
    if (!topUsers || !allUsersSorted) {
      const allMock = Array.from(MOCK_DB.users.values())
        .sort((a, b) => b.coins - a.coins);
      topUsers = allMock.slice(0, 100).map(u => ({
        telegram_id: u.telegram_id,
        username: u.username,
        first_name: u.first_name,
        coins: u.coins
      }));
      allUsersSorted = allMock.map(u => ({
        telegram_id: u.telegram_id
      }));
    }

    const userIndex = allUsersSorted.findIndex(u => u.telegram_id === tgUser.id.toString());
    const userRank = userIndex !== -1 ? userIndex + 1 : null;
    const totalUsers = allUsersSorted.length;
    
    // Percentile calculation
    const percentile = userRank ? ((userRank / totalUsers) * 100).toFixed(1) : '100';

    res.json({
      leaderboard: topUsers,
      userRank,
      percentile: parseFloat(percentile) <= 0.1 ? 'Top 0.1%' : `Top ${percentile}%`,
      totalUsers
    });
  } catch (err) {
    console.error('Error in /api/leaderboard:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 4. GET /tasks API
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    const user = await findUserById(tgUser.id.toString());
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Apply any pending daily resets
    const updatedUser = await checkAndApplyDailyReset(user);
    await updatedUser.save();

    // Map tasks to include user completion state
    const tasksWithStatus = TASKS.map(task => {
      const isCompleted = updatedUser.completed_tasks.includes(task.id);
      
      // Determine if task is ready to claim (if not verified already)
      let claimable = !isCompleted;
      
      // Referral milestones checks
      if (task.id.startsWith('ot_refer_')) {
        const threshold = parseInt(task.id.split('_')[2]);
        claimable = !isCompleted && updatedUser.referrals.length >= threshold;
      }
      // Username check
      if (task.id === 'ot_tg_username') {
        claimable = !isCompleted && !!updatedUser.username;
      }
      // Wallet check
      if (task.id === 'ot_connect_ton') {
        claimable = !isCompleted && !!updatedUser.ton_wallet;
      }
      // Profile setup check
      if (task.id === 'ot_profile_setup') {
        claimable = !isCompleted && !!updatedUser.username && !!updatedUser.ton_wallet;
      }
      
      return {
        ...task,
        completed: isCompleted,
        claimable
      };
    });

    res.json(tasksWithStatus);
  } catch (err) {
    console.error('Error in /api/tasks:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 5. POST /claim-task API
app.post('/api/claim-task', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: 'Bad Request: Missing taskId' });
    }

    const task = TASKS.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let user = await findUserById(tgUser.id.toString());
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.completed_tasks.includes(taskId)) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    // Daily ad slots limit checks
    if (taskId.startsWith('daily_ad_')) {
      if (user.daily_ads_watched >= 3) {
        return res.status(400).json({ message: 'Daily reward ad limit (3) exceeded.' });
      }
      user.daily_ads_watched += 1;
      updateWeeklyMission(user, 'ads', 1);
    }

    // Mark task completed and add reward
    user.completed_tasks.push(taskId);
    user.coins += task.reward;

    // Check daily bundles
    if (taskId !== 'daily_all_completed') {
      checkAllDailyTasksComplete(user);
    }

    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      completed_tasks: user.completed_tasks,
      message: `Successfully claimed +${task.reward} $CJP`
    });
  } catch (err) {
    console.error('Error in /api/claim-task:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 6. POST /verify-task API
app.post('/api/verify-task', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: 'Missing taskId' });
    }

    const task = TASKS.find(t => t.id === taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let user = await findUserById(tgUser.id.toString());
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.completed_tasks.includes(taskId)) {
      return res.status(400).json({ message: 'Task already completed' });
    }

    // Execute verification rules
    let valid = true;
    let reason = "";

    if (taskId === 'ot_tg_username') {
      if (!user.username) {
        valid = false;
        reason = "You must set a public @username in Telegram settings first.";
      }
    } else if (taskId === 'ot_connect_ton') {
      if (!user.ton_wallet) {
        valid = false;
        reason = "You must connect your TON wallet first.";
      }
    } else if (taskId.startsWith('ot_refer_')) {
      const threshold = parseInt(taskId.split('_')[2]);
      if (user.referrals.length < threshold) {
        valid = false;
        reason = `You have referred ${user.referrals.length} friends, but need ${threshold}.`;
      }
    } else if (taskId === 'ot_profile_setup') {
      const hasUsername = !!user.username;
      const hasWallet = !!user.ton_wallet;
      if (!hasUsername || !hasWallet) {
        valid = false;
        reason = "You must set a username and connect your TON wallet to complete profile setup.";
      }
    } else if (taskId === 'special_tasks_100') {
      if (user.completed_tasks.length < 100) {
        valid = false;
        reason = `You have completed ${user.completed_tasks.length} tasks, but need 100.`;
      }
    }

    if (!valid) {
      return res.status(400).json({ success: false, message: reason });
    }

    // Award rewards
    user.completed_tasks.push(taskId);
    user.coins += task.reward;
    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      completed_tasks: user.completed_tasks,
      message: `Successfully verified and claimed +${task.reward} $CJP!`
    });
  } catch (err) {
    console.error('Error in /api/verify-task:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 7. TON Connect: Bind Address
app.post('/api/wallet/connect', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Missing wallet address' });
    }

    let user = await findUserById(tgUser.id.toString());
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.ton_wallet = address;

    // Complete wallet task
    if (!user.completed_tasks.includes('ot_connect_ton')) {
      user.completed_tasks.push('ot_connect_ton');
      user.coins += 1000;
    }

    await user.save();
    res.json({
      success: true,
      ton_wallet: user.ton_wallet,
      coins: user.coins,
      completed_tasks: user.completed_tasks
    });
  } catch (err) {
    console.error('Error in /api/wallet/connect:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 8. Claim mined CJP as Jettons
app.post('/api/wallet/claim', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.ton_wallet) {
      return res.status(400).json({ message: 'Please connect a TON Wallet first.' });
    }

    const claimable = user.coins;
    if (claimable < 10000) {
      return res.status(400).json({ message: 'Minimum claim threshold is 10,000 $CJP.' });
    }

    // Move coins to claimed_coins
    user.claimed_coins += claimable;
    user.coins = 0;
    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      claimed_coins: user.claimed_coins,
      message: `Withdrawal request for ${claimable.toLocaleString()} CJP Jettons submitted!`
    });
  } catch (err) {
    console.error('Error in /api/wallet/claim:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ==========================================
// GAMIFICATION SUITE ENDPOINTS
// ==========================================

// 9. Spin the Wheel
app.post('/api/games/spin', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours
    const isFree = !user.last_spin_time || (now - new Date(user.last_spin_time) >= cooldown);

    if (!isFree) {
      if (user.coins < 500) {
        return res.status(400).json({ message: 'Insufficient coins for extra spin. Cost is 500 CJP.' });
      }
      user.coins -= 500;
    } else {
      user.last_spin_time = now;
    }

    // Determine random weighted CJP reward: 50 / 100 / 500 / 1000 / 5000 / 50000 (Jackpot)
    const rand = Math.random();
    let reward = 50;
    if (rand < 0.40) reward = 50;
    else if (rand < 0.70) reward = 100;
    else if (rand < 0.90) reward = 500;
    else if (rand < 0.97) reward = 1000;
    else if (rand < 0.999) reward = 5000;
    else reward = 50000;

    user.coins += reward;

    // Check achievement: first_spin
    if (!user.achievements.includes('first_spin')) {
      user.achievements.push('first_spin');
      user.coins += ACHIEVEMENT_DEFINITIONS.first_spin.reward;
    }

    // Check jackpot achievement
    if (reward === 50000 && !user.achievements.includes('jackpot_winner')) {
      user.achievements.push('jackpot_winner');
      user.coins += ACHIEVEMENT_DEFINITIONS.jackpot_winner.reward;
    }

    await user.save();

    res.json({
      success: true,
      reward,
      coins: user.coins,
      isFree,
      last_spin_time: user.last_spin_time,
      achievements: user.achievements
    });
  } catch (err) {
    console.error('Error in /api/games/spin:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 10. Mystery Card Flip
app.post('/api/games/card-flip', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const cooldown = 24 * 60 * 60 * 1000;
    const isFree = !user.last_card_flip_time || (now - new Date(user.last_card_flip_time) >= cooldown);

    if (!isFree) {
      if (user.coins < 500) {
        return res.status(400).json({ message: 'Insufficient coins for extra flip. Cost is 500 CJP.' });
      }
      user.coins -= 500;
    } else {
      user.last_card_flip_time = now;
    }

    // Pick card reward: coins / energy refill / multiplier boost / cockroach bomb
    const rand = Math.random();
    let rewardType = 'coins';
    let rewardValue = 200;
    let rewardLabel = '200 Coins';

    if (rand < 0.40) {
      rewardType = 'coins';
      rewardValue = 200;
      rewardLabel = '200 CJP Coins';
      user.coins += 200;
    } else if (rand < 0.70) {
      rewardType = 'coins';
      rewardValue = 500;
      rewardLabel = '500 CJP Coins';
      user.coins += 500;
    } else if (rand < 0.85) {
      rewardType = 'coins';
      rewardValue = 1000;
      rewardLabel = '1,000 CJP Coins';
      user.coins += 1000;
    } else if (rand < 0.93) {
      rewardType = 'energy_refill';
      rewardValue = user.max_energy;
      rewardLabel = 'Energy Refill';
      user.energy = user.max_energy;
    } else if (rand < 0.97) {
      rewardType = 'multiplier_boost';
      rewardValue = 2; // 2x tap multiplier
      rewardLabel = '2x Tap Multiplier (1 Hour)';
    } else {
      rewardType = 'cockroach_bomb';
      rewardValue = 2; // 2x cockroach bomb
      rewardLabel = '2x Cockroach Bomb (1 Hour)';
      if (!user.achievements.includes('double_bomb_active')) {
        user.achievements.push('double_bomb_active');
        user.coins += ACHIEVEMENT_DEFINITIONS.double_bomb_active.reward;
      }
    }

    // Check achievement: first_flip
    if (!user.achievements.includes('first_flip')) {
      user.achievements.push('first_flip');
      user.coins += ACHIEVEMENT_DEFINITIONS.first_flip.reward;
    }

    await user.save();

    res.json({
      success: true,
      rewardType,
      rewardValue,
      rewardLabel,
      coins: user.coins,
      isFree,
      last_card_flip_time: user.last_card_flip_time,
      achievements: user.achievements
    });
  } catch (err) {
    console.error('Error in /api/games/card-flip:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 11. Daily Quiz - Fetch Question
app.post('/api/games/quiz', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    const user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const day = now.getDate();
    const questionIndex = day % QUIZ_QUESTIONS.length;
    const question = QUIZ_QUESTIONS[questionIndex];

    const lastQuiz = user.last_quiz_time ? new Date(user.last_quiz_time) : null;
    const alreadyAnswered = lastQuiz && getISTDateString(lastQuiz) === getISTDateString(now);

    res.json({
      question: question.question,
      options: question.options,
      alreadyAnswered
    });
  } catch (err) {
    console.error('Error in GET /api/games/quiz:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 12. Daily Quiz - Submit Answer
app.post('/api/games/quiz/submit', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const lastQuiz = user.last_quiz_time ? new Date(user.last_quiz_time) : null;
    const alreadyAnswered = lastQuiz && getISTDateString(lastQuiz) === getISTDateString(now);

    if (alreadyAnswered) {
      return res.status(400).json({ message: "You have already completed today's quiz. Come back tomorrow!" });
    }

    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ message: 'Missing answer parameter' });
    }

    const day = now.getDate();
    const questionIndex = day % QUIZ_QUESTIONS.length;
    const question = QUIZ_QUESTIONS[questionIndex];

    const isCorrect = answer.trim().toLowerCase() === question.answer.trim().toLowerCase();

    user.last_quiz_time = now;

    if (isCorrect) {
      user.coins += 500;
      updateWeeklyMission(user, 'quizzes', 1);

      // Unlock quiz novice achievement
      if (!user.achievements.includes('quiz_novice')) {
        user.achievements.push('quiz_novice');
        user.coins += ACHIEVEMENT_DEFINITIONS.quiz_novice.reward;
      }
      
      await user.save();
      return res.json({
        correct: true,
        coins: user.coins,
        message: 'Correct answer! You earned +500 CJP.'
      });
    } else {
      await user.save();
      return res.json({
        correct: false,
        message: 'Incorrect answer. Try again tomorrow!'
      });
    }
  } catch (err) {
    console.error('Error in /api/games/quiz/submit:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 13. Upgrade Card Shop - Purchase
app.post('/api/shop/buy', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { cardId } = req.body;
    if (!cardId || !UPGRADE_CARDS[cardId]) {
      return res.status(400).json({ message: 'Invalid or missing cardId' });
    }

    const card = UPGRADE_CARDS[cardId];
    const currentLevel = getUpgradeLevel(user, cardId);

    if (currentLevel >= 10) {
      return res.status(400).json({ message: 'Card upgrade already maxed out (Level 10).' });
    }

    const cost = card.baseCost * Math.pow(2, currentLevel);

    if (user.coins < cost) {
      return res.status(400).json({ message: `Insufficient coins. Upgrade costs ${cost} CJP.` });
    }

    // Deduct coins & apply level up
    user.coins -= cost;
    
    // Find or add upgrade record
    const index = user.upgrades.findIndex(u => u.cardId === cardId);
    if (index !== -1) {
      user.upgrades[index].level += 1;
    } else {
      user.upgrades.push({ cardId, level: 1 });
    }

    user = recalculateUserStats(user);
    checkAchievementsAndUnlock(user);
    
    // Check auto-unlock tasks
    // First upgrade task
    if (!user.completed_tasks.includes('ot_buy_first_upgrade')) {
      user.completed_tasks.push('ot_buy_first_upgrade');
      user.coins += 500;
    }
    // Max upgrade task
    const hasMaxed = user.upgrades.some(u => u.level >= 10);
    if (hasMaxed && !user.completed_tasks.includes('ot_max_any_upgrade')) {
      user.completed_tasks.push('ot_max_any_upgrade');
      user.coins += 2000;
    }
    // Own 5 upgrade types task (we have 4 cards in config, let's complete if they have all 4)
    const uniqueUpgrades = user.upgrades.filter(u => u.level > 0).length;
    if (uniqueUpgrades >= 4 && !user.completed_tasks.includes('ot_own_5_upgrades')) {
      user.completed_tasks.push('ot_own_5_upgrades');
      user.coins += 3000;
    }

    await user.save();

    const evolution = getEvolutionDetails(user.coins);

    res.json({
      success: true,
      coins: user.coins,
      upgrades: user.upgrades,
      max_energy: user.max_energy,
      passive_income_rate: user.passive_income_rate,
      evolution,
      message: `Successfully upgraded ${card.name} to Level ${currentLevel + 1}!`
    });
  } catch (err) {
    console.error('Error in /api/shop/buy:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 14. PvP Arena - Matchmaking & Resolution
app.post('/api/pvp/battle', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { wager } = req.body;
    if (!wager || isNaN(wager) || wager < 100) {
      return res.status(400).json({ message: 'Minimum bet is 100 CJP.' });
    }

    if (user.coins < wager) {
      return res.status(400).json({ message: 'Insufficient coins to wage this battle.' });
    }

    // Select a random simulated bot opponent
    const bots = [
      { name: 'DesiRoach99', minTaps: 220, maxTaps: 290 },
      { name: 'SwarmGladiator', minTaps: 260, maxTaps: 330 },
      { name: 'BitcoinBug', minTaps: 300, maxTaps: 380 }
    ];
    const opponent = bots[Math.floor(Math.random() * bots.length)];

    res.json({
      success: true,
      opponentName: opponent.name,
      opponentMin: opponent.minTaps,
      opponentMax: opponent.maxTaps,
      wager
    });
  } catch (err) {
    console.error('Error in /api/pvp/battle:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/pvp/battle/resolve', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { wager, userTaps, opponentMin, opponentMax } = req.body;
    if (wager === undefined || userTaps === undefined || !opponentMin || !opponentMax) {
      return res.status(400).json({ message: 'Missing battle resolution parameters.' });
    }

    if (user.coins < wager) {
      return res.status(400).json({ message: 'Insufficient coins to resolve battle.' });
    }

    // Simulate opponent taps
    const opponentTaps = Math.floor(opponentMin + Math.random() * (opponentMax - opponentMin));
    const win = userTaps >= opponentTaps;

    if (win) {
      // Winner gets 80% of pot. Pot is 2 * wager. Award is 1.6 * wager.
      // Since wager is deducted, net profit is +0.6 * wager.
      const winProfit = Math.floor(wager * 0.6);
      user.coins += winProfit;
      user.pvp_wins += 1;
      user.pvp_earnings += winProfit;
    } else {
      // Loser gets 20% of pot. Pot is 2 * wager. Award is 0.4 * wager.
      // Net loss is -0.6 * wager.
      const lossCost = Math.floor(wager * 0.6);
      user.coins -= lossCost;
      user.pvp_losses += 1;
      user.pvp_earnings -= lossCost;
    }

    // Unlock Gladiator achievement
    if (!user.achievements.includes('pvp_first_wager')) {
      user.achievements.push('pvp_first_wager');
      user.coins += ACHIEVEMENT_DEFINITIONS.pvp_first_wager.reward;
    }

    checkAchievementsAndUnlock(user);
    await user.save();

    res.json({
      success: true,
      win,
      userTaps,
      opponentTaps,
      coins: user.coins,
      pvp_wins: user.pvp_wins,
      pvp_losses: user.pvp_losses,
      pvp_earnings: user.pvp_earnings
    });
  } catch (err) {
    console.error('Error in /api/pvp/battle/resolve:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 15. Flash Raid Event triggers & syncs
app.post('/api/games/flash-raid/trigger', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Set raid as active for 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    user.flash_raid_taps = 0;
    
    // Create a temporary flash raid active property if needed, but saving taps is enough
    await user.save();

    res.json({
      success: true,
      active: true,
      expiresAt,
      taps: 0
    });
  } catch (err) {
    console.error('Error in /api/games/flash-raid/trigger:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/games/flash-raid/sync', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { taps } = req.body;
    if (taps === undefined) {
      return res.status(400).json({ message: 'Missing taps parameters' });
    }

    user.flash_raid_taps = (user.flash_raid_taps || 0) + Number(taps);
    let completed = false;

    if (user.flash_raid_taps >= 1000) {
      // Complete flash raid, reward 5000 CJP
      user.coins += 5000;
      user.flash_raid_taps = 0; // reset
      completed = true;
      user.last_flash_raid_completed = new Date();

      if (!user.achievements.includes('flash_raider_1')) {
        user.achievements.push('flash_raider_1');
        user.coins += ACHIEVEMENT_DEFINITIONS.flash_raider_1.reward;
      }
      
      // Auto complete special task for flash event
      if (!user.completed_tasks.includes('special_flash_event')) {
        user.completed_tasks.push('special_flash_event');
        user.coins += 3000;
      }
    }

    checkAchievementsAndUnlock(user);
    await user.save();

    res.json({
      success: true,
      completed,
      taps: user.flash_raid_taps,
      coins: user.coins
    });
  } catch (err) {
    console.error('Error in /api/games/flash-raid/sync:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 16. Weekly Tournament Info
app.get('/api/games/tournament', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    // Monday reset math
    const day = now.getDay();
    const daysUntilMonday = (8 - day) % 7 || 7;
    const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    const msLeft = nextMonday - now;
    
    const hours = Math.floor(msLeft / (1000 * 60 * 60));
    const minutes = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
    const countdown = `${hours}h ${minutes}m`;

    res.json({
      success: true,
      countdown,
      nextReset: nextMonday
    });
  } catch (err) {
    console.error('Error in /api/games/tournament:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 17. Video Claim Reward
app.post('/api/games/video-claim', authMiddleware, async (req, res) => {
  try {
    const tgUser = req.user;
    let user = await findUserById(tgUser.id.toString());
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { videoId } = req.body;
    if (!videoId) {
      return res.status(400).json({ message: 'Missing videoId parameter' });
    }

    const now = new Date();
    const currentStr = getISTDateString(now);

    if (!user.watched_videos) {
      user.watched_videos = [];
    }

    const record = user.watched_videos.find(v => v.videoId === videoId);
    if (record) {
      const lastClaimedStr = getISTDateString(new Date(record.lastClaimedAt));
      if (lastClaimedStr === currentStr) {
        return res.status(400).json({ message: 'You have already claimed your CJP reward for this video today.' });
      }
      record.lastClaimedAt = now;
    } else {
      user.watched_videos.push({ videoId, lastClaimedAt: now });
    }

    // Award +100 CJP Coins
    user.coins += 100;
    
    // Check milestones
    checkCoinMilestones(user);
    checkAchievementsAndUnlock(user);
    
    await user.save();

    res.json({
      success: true,
      coins: user.coins,
      watched_videos: user.watched_videos,
      message: 'Video completion verified! +100 CJP Coins credited.'
    });
  } catch (err) {
    console.error('Error in /api/games/video-claim:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`CJP Backend listening on port ${PORT}`);
});
