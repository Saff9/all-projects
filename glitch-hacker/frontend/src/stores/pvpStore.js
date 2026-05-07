import { makeAutoObservable, runInAction } from 'mobx';
import api from '../services/api';
import { useAuthStore } from './authStore';

class PvpStore {
  // State
  target = null;
  cooldownEndTime = null;
  hackHistory = [];
  pvpStats = null;
  isScanning = false;
  isHacking = false;
  error = null;
  hackResult = null;

  // Computed cache
  _cooldownInterval = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // ==================== COMPUTED ====================

  get canHack() {
    if (!this.cooldownEndTime) return true;
    return new Date() >= new Date(this.cooldownEndTime);
  }

  get cooldownRemaining() {
    if (!this.cooldownEndTime || this.canHack) return null;
    const now = new Date();
    const end = new Date(this.cooldownEndTime);
    const diff = end - now;

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      hours,
      minutes,
      seconds,
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      totalSeconds: Math.floor(diff / 1000)
    };
  }

  get hasTarget() {
    return this.target !== null && this.target !== undefined;
  }

  get successRate() {
    if (!this.target) return 0;

    const user = useAuthStore().user;
    if (!user) return 0;

    // Get user's virus level
    const virusLevel = user.upgrades?.virus?.level || 0;
    const firewallLevel = this.target.firewallLevel || 0;

    // Calculate success rate: 50% base + 10% per level difference
    // Clamp between 5% and 95%
    const diff = virusLevel - firewallLevel;
    let rate = 50 + (diff * 15);
    rate = Math.max(5, Math.min(95, rate));

    return Math.round(rate);
  }

  // ==================== ACTIONS ====================

  async scanForTarget() {
    this.isScanning = true;
    this.error = null;

    try {
      const response = await api.post('/pvp/scan');

      runInAction(() => {
        this.target = response.data.target;
        this.isScanning = false;
        this.error = null;
      });

      // Refresh user data to reflect the 50 $BITZ deduction
      useAuthStore().fetchUser();

      return this.target;
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data?.error || 'Scan failed. Try again.';
        this.isScanning = false;
      });
      throw err;
    }
  }

  async hackTarget() {
    if (!this.hasTarget) {
      this.error = 'No target selected';
      return null;
    }

    this.isHacking = true;
    this.error = null;
    this.hackResult = null;

    try {
      const response = await api.post('/pvp/hack', {
        targetId: this.target.id
      });

      runInAction(() => {
        this.hackResult = response.data;
        this.target = null; // Clear target after hack
        this.isHacking = false;
      });

      // Set cooldown end time
      if (response.data.nextHackTime) {
        this.cooldownEndTime = response.data.nextHackTime;
        this.startCooldownTimer();
      }

      // Refresh user data and history
      await Promise.all([
        useAuthStore().fetchUser(),
        this.fetchHackHistory(),
        this.fetchPvpStats()
      ]);

      return this.hackResult;
    } catch (err) {
      runInAction(() => {
        this.error = err.response?.data?.error || 'Hack failed. Try again.';
        this.isHacking = false;
      });
      throw err;
    }
  }

  async fetchCooldown() {
    try {
      const response = await api.get('/pvp/cooldown');
      runInAction(() => {
        this.cooldownEndTime = response.data.cooldownEndTime;
        if (this.cooldownEndTime && !this.canHack) {
          this.startCooldownTimer();
        }
      });
      return this.cooldownEndTime;
    } catch (err) {
      console.error('Failed to fetch cooldown:', err);
      return null;
    }
  }

  async fetchHackHistory() {
    try {
      const response = await api.get('/pvp/history');
      runInAction(() => {
        this.hackHistory = response.data.history || [];
      });
      return this.hackHistory;
    } catch (err) {
      console.error('Failed to fetch hack history:', err);
      return this.hackHistory;
    }
  }

  async fetchPvpStats() {
    try {
      const response = await api.get('/pvp/stats');
      runInAction(() => {
        this.pvpStats = response.data;
      });
      return this.pvpStats;
    } catch (err) {
      console.error('Failed to fetch PVP stats:', err);
      return null;
    }
  }

  clearTarget() {
    this.target = null;
    this.error = null;
  }

  clearHackResult() {
    this.hackResult = null;
  }

  clearError() {
    this.error = null;
  }

  // ==================== COOLDOWN TIMER ====================

  startCooldownTimer() {
    // Clear existing interval
    if (this._cooldownInterval) {
      clearInterval(this._cooldownInterval);
    }

    // Set new interval to update cooldown every second
    this._cooldownInterval = setInterval(() => {
      if (this.canHack) {
        clearInterval(this._cooldownInterval);
        this._cooldownInterval = null;
      }
      // MobX will recompute `cooldownRemaining` automatically
    }, 1000);
  }

  dispose() {
    if (this._cooldownInterval) {
      clearInterval(this._cooldownInterval);
      this._cooldownInterval = null;
    }
  }

  // Initialize - load all PVP data
  async initialize() {
    await Promise.all([
      this.fetchCooldown(),
      this.fetchHackHistory(),
      this.fetchPvpStats()
    ]);
  }
}

// Create singleton instance
const pvpStore = new PvpStore();

// React hook for accessing store
export const usePvpStore = () => pvpStore;

export default pvpStore;
