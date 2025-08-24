const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  telegram_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    default: ''
  },
  first_name: {
    type: String,
    default: ''
  },
  coins: {
    type: Number,
    default: 0
  },
  energy: {
    type: Number,
    default: 1000
  },
  max_energy: {
    type: Number,
    default: 1000
  },
  referred_by: {
    type: String,
    default: null
  },
  referrals: {
    type: [String],
    default: []
  },
  completed_tasks: {
    type: [String],
    default: []
  },
  last_energy_regen: {
    type: Date,
    default: Date.now
  },
  ton_wallet: {
    type: String,
    default: null
  },
  claimed_coins: {
    type: Number,
    default: 0
  },
  last_tap_sync: {
    type: Date,
    default: Date.now
  },
  last_daily_reset: {
    type: Date,
    default: Date.now
  },
  daily_taps: {
    type: Number,
    default: 0
  },
  daily_ads_watched: {
    type: Number,
    default: 0
  },
  lifetime_taps: {
    type: Number,
    default: 0
  },
  streak_days: {
    type: Number,
    default: 1
  },
  last_checkin: {
    type: Date,
    default: null
  },
  last_spin_time: {
    type: Date,
    default: null
  },
  last_card_flip_time: {
    type: Date,
    default: null
  },
  last_quiz_time: {
    type: Date,
    default: null
  },
  upgrades: [{
    cardId: String,
    level: Number
  }],
  passive_income_rate: {
    type: Number,
    default: 0
  },
  last_passive_income_collect: {
    type: Date,
    default: Date.now
  },
  achievements: {
    type: [String],
    default: []
  },
  weekly_mission_progress: {
    taps: { type: Number, default: 0 },
    refers: { type: Number, default: 0 },
    ads: { type: Number, default: 0 },
    checkins: { type: Number, default: 0 },
    quizzes: { type: Number, default: 0 },
    completed_at: { type: Date, default: null }
  },
  pvp_wins: {
    type: Number,
    default: 0
  },
  pvp_losses: {
    type: Number,
    default: 0
  },
  pvp_earnings: {
    type: Number,
    default: 0
  },
  flash_raid_taps: {
    type: Number,
    default: 0
  },
  last_flash_raid_completed: {
    type: Date,
    default: null
  },
  watched_videos: [{
    videoId: { type: String },
    lastClaimedAt: { type: Date }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
