const { usersDB } = require('./db');
const config = require('../config');

/**
 * User Model
 * Represents a player in The Glitch Hacker game
 */

class User {
  constructor(data) {
    // Telegram Identity
    this.id = data.id;
    this.username = data.username || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.photoUrl = data.photoUrl || '';
    
    // Core Economy
    this.bitz = data.bitz ?? 0;
    this.totalEarned = data.totalEarned ?? 0;
    this.totalSpent = data.totalSpent ?? 0;
    
    // Clicker Stats
    this.clickPower = data.clickPower ?? config.GAME.BASE_CLICK_POWER;
    this.totalClicks = data.totalClicks ?? 0;
    
    // Energy System
    this.energy = data.energy ?? config.GAME.MAX_ENERGY;
    this.maxEnergy = data.maxEnergy ?? config.GAME.MAX_ENERGY;
    this.lastEnergyRefill = data.lastEnergyRefill || new Date().toISOString();
    
    // Botnets (Auto-clickers)
    this.botnets = data.botnets || [];
    
    // Defense System
    this.firewall = data.firewall || {
      level: 1,
      virusStrength: 1,
      lastUpgrade: new Date().toISOString()
    };
    
    // PVP Stats
    this.pvp = data.pvp || {
      hacksAttempted: 0,
      hacksSuccessful: 0,
      hacksDefended: 0,
      bitzStolen: 0,
      bitzLost: 0,
      lastHackAttempt: null
    };
    
    // Timestamps
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.lastActive = data.lastActive || new Date().toISOString();
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      photoUrl: this.photoUrl,
      bitz: this.bitz,
      totalEarned: this.totalEarned,
      totalSpent: this.totalSpent,
      clickPower: this.clickPower,
      totalClicks: this.totalClicks,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      lastEnergyRefill: this.lastEnergyRefill,
      botnets: this.botnets,
      firewall: this.firewall,
      pvp: this.pvp,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastActive: this.lastActive
    };
  }

  /**
   * Get public profile (limited data for other players)
   */
  toPublicProfile() {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      photoUrl: this.photoUrl,
      firewall: this.firewall,
      pvp: {
        hacksSuccessful: this.pvp.hacksSuccessful,
        hacksDefended: this.pvp.hacksDefended
      }
    };
  }

  /**
   * Calculate current energy with refill
   */
  calculateCurrentEnergy() {
    const now = new Date();
    const lastRefill = new Date(this.lastEnergyRefill);
    const secondsElapsed = Math.floor((now - lastRefill) / 1000);
    const energyToAdd = secondsElapsed * config.GAME.ENERGY_REFILL_RATE;
    
    return Math.min(this.maxEnergy, this.energy + energyToAdd);
  }

  /**
   * Calculate passive income from botnets
   */
  calculatePassiveIncome() {
    const SHOP_ITEMS = require('../constants/game').SHOP_ITEMS;
    
    let totalIncome = 0;
    for (const botnet of this.botnets) {
      const item = SHOP_ITEMS.find(i => i.id === botnet.id);
      if (item) {
        const incomeEffect = item.effects.find(e => e.type === 'passive_income');
        if (incomeEffect) {
          const levelMultiplier = 1 + (botnet.level - 1) * incomeEffect.scaling;
          totalIncome += incomeEffect.value * levelMultiplier * botnet.quantity;
        }
      }
    }
    
    return totalIncome;
  }

  /**
   * Calculate collected passive income since last collection
   */
  calculateCollectibleIncome() {
    if (this.botnets.length === 0) return 0;
    
    const now = new Date();
    let totalCollected = 0;
    
    for (const botnet of this.botnets) {
      const lastCollection = new Date(botnet.lastCollection || this.createdAt);
      const secondsElapsed = Math.floor((now - lastCollection) / 1000);
      
      const SHOP_ITEMS = require('../constants/game').SHOP_ITEMS;
      const item = SHOP_ITEMS.find(i => i.id === botnet.id);
      
      if (item) {
        const incomeEffect = item.effects.find(e => e.type === 'passive_income');
        if (incomeEffect) {
          const levelMultiplier = 1 + (botnet.level - 1) * incomeEffect.scaling;
          const incomePerSecond = incomeEffect.value * levelMultiplier * botnet.quantity;
          totalCollected += incomePerSecond * secondsElapsed;
        }
      }
    }
    
    return Math.floor(totalCollected);
  }

  /**
   * Check if user can afford something
   */
  canAfford(amount) {
    return this.bitz >= amount;
  }

  /**
   * Deduct $BITZ from balance
   */
  spend(amount) {
    if (!this.canAfford(amount)) {
      throw new Error('Insufficient funds');
    }
    this.bitz -= amount;
    this.totalSpent += amount;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Add $BITZ to balance
   */
  earn(amount) {
    this.bitz += amount;
    this.totalEarned += amount;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Consume energy
   */
  consumeEnergy(amount = 1) {
    // Recalculate energy first
    this.energy = this.calculateCurrentEnergy();
    
    if (this.energy < amount) {
      throw new Error('Insufficient energy');
    }
    
    this.energy -= amount;
    this.lastEnergyRefill = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Check PVP hack cooldown
   */
  getHackCooldownRemaining() {
    if (!this.pvp.lastHackAttempt) return 0;
    
    const lastHack = new Date(this.pvp.lastHackAttempt);
    const now = new Date();
    const secondsElapsed = Math.floor((now - lastHack) / 1000);
    const cooldownRemaining = config.GAME.HACK_COOLDOWN - secondsElapsed;
    
    return Math.max(0, cooldownRemaining);
  }

  /**
   * Check if user can hack
   */
  canHack() {
    return this.getHackCooldownRemaining() === 0;
  }

  // Static methods for database operations

  /**
   * Find user by Telegram ID
   */
  static findByTelegramId(id) {
    const data = usersDB.findById(id);
    return data ? new User(data) : null;
  }

  /**
   * Find user by username
   */
  static findByUsername(username) {
    const data = usersDB.findByUsername(username);
    return data ? new User(data) : null;
  }

  /**
   * Get all users
   */
  static getAll() {
    const users = usersDB.getAll();
    return users.map(u => new User(u));
  }

  /**
   * Create new user from Telegram data
   */
  static create(telegramData) {
    const userData = {
      id: telegramData.id.toString(),
      username: telegramData.username || '',
      firstName: telegramData.first_name || '',
      lastName: telegramData.last_name || '',
      photoUrl: telegramData.photo_url || '',
      bitz: 0,
      totalEarned: 0,
      totalSpent: 0,
      clickPower: config.GAME.BASE_CLICK_POWER,
      totalClicks: 0,
      energy: config.GAME.MAX_ENERGY,
      maxEnergy: config.GAME.MAX_ENERGY,
      lastEnergyRefill: new Date().toISOString(),
      botnets: [],
      firewall: {
        level: 1,
        virusStrength: 1,
        lastUpgrade: new Date().toISOString()
      },
      pvp: {
        hacksAttempted: 0,
        hacksSuccessful: 0,
        hacksDefended: 0,
        bitzStolen: 0,
        bitzLost: 0,
        lastHackAttempt: null
      }
    };

    const created = usersDB.create(userData);
    return new User(created);
  }

  /**
   * Update user
   */
  static update(id, updates) {
    const updated = usersDB.update(id, updates);
    return new User(updated);
  }

  /**
   * Save user instance to database
   */
  save() {
    const data = this.toJSON();
    const updated = usersDB.update(this.id, data);
    return new User(updated);
  }

  /**
   * Get leaderboard
   */
  static getLeaderboard(limit = 10, offset = 0) {
    return usersDB.getLeaderboard(limit, offset);
  }

  /**
   * Find random target for PVP (excluding self)
   */
  static findRandomTarget(excludeId) {
    const users = usersDB.getAll().filter(u => u.id !== excludeId);
    if (users.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * users.length);
    return new User(users[randomIndex]);
  }

  /**
   * Get multiple random targets for scanning
   */
  static findRandomTargets(excludeId, count = 3) {
    const users = usersDB.getAll().filter(u => u.id !== excludeId);
    if (users.length === 0) return [];
    
    // Shuffle and take first 'count'
    const shuffled = users.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length)).map(u => new User(u));
  }
}

module.exports = User;