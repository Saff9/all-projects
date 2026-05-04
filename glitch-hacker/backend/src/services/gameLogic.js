/**
 * Game Logic Service
 * Core game calculations and business logic
 */

const { ENERGY, CLICKER, SHOP_ITEMS, FIREWALL, VIRUS, PVP } = require('../constants/game');

/**
 * Calculate current energy with time-based refill
 * @param {number} currentEnergy - Current energy value
 * @param {string} lastRefillTime - ISO timestamp of last refill
 * @param {number} maxEnergy - Maximum energy capacity
 * @returns {number} Current energy after refill calculation
 */
function calculateCurrentEnergy(currentEnergy, lastRefillTime, maxEnergy) {
  const now = new Date();
  const lastRefill = new Date(lastRefillTime);
  const secondsElapsed = Math.floor((now - lastRefill) / 1000);
  const energyToAdd = secondsElapsed * ENERGY.REFILL_RATE;
  
  return Math.min(maxEnergy, currentEnergy + energyToAdd);
}

/**
 * Calculate time until next energy point
 * @param {string} lastRefillTime - ISO timestamp of last refill
 * @returns {number} Milliseconds until next energy point
 */
function getTimeUntilNextEnergy(lastRefillTime) {
  const now = new Date();
  const lastRefill = new Date(lastRefillTime);
  const msElapsed = now - lastRefill;
  const msPerEnergy = 1000 / ENERGY.REFILL_RATE;
  const msUntilNext = msPerEnergy - (msElapsed % msPerEnergy);
  
  return Math.max(0, Math.ceil(msUntilNext));
}

/**
 * Calculate passive income from botnets
 * @param {Array} botnets - User's botnet inventory
 * @returns {number} Income per second
 */
function calculatePassiveIncome(botnets) {
  let totalIncome = 0;
  
  for (const botnet of botnets) {
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
 * Calculate collectible passive income since last collection
 * @param {Array} botnets - User's botnet inventory
 * @returns {number} Collectible $BITZ amount
 */
function calculateCollectibleIncome(botnets) {
  if (!botnets || botnets.length === 0) return 0;
  
  const now = new Date();
  let totalCollected = 0;
  
  for (const botnet of botnets) {
    const lastCollection = new Date(botnet.lastCollection || botnet.purchasedAt || now);
    const secondsElapsed = Math.floor((now - lastCollection) / 1000);
    
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
 * Calculate click power based on upgrades
 * @param {number} basePower - Base click power
 * @param {Array} upgrades - Click power upgrades
 * @returns {number} Total click power
 */
function calculateClickPower(basePower, upgrades = []) {
  let totalPower = basePower;
  
  for (const upgrade of upgrades) {
    const item = SHOP_ITEMS.find(i => i.id === upgrade.id);
    if (item && item.type === 'click_power') {
      const powerEffect = item.effects.find(e => e.type === 'click_power');
      if (powerEffect) {
        const levelMultiplier = 1 + (upgrade.level - 1) * powerEffect.scaling;
        totalPower += powerEffect.value * levelMultiplier * upgrade.quantity;
      }
    }
  }
  
  return totalPower;
}

/**
 * Calculate shop item price with multiplier
 * @param {Object} item - Shop item
 * @param {number} currentLevel - Current level/quantity owned
 * @returns {number} Current price
 */
function calculateItemPrice(item, currentLevel = 0) {
  return Math.floor(item.basePrice * Math.pow(item.priceMultiplier, currentLevel));
}

/**
 * Calculate firewall upgrade price
 * @param {number} currentLevel - Current firewall level
 * @returns {number} Upgrade price
 */
function calculateFirewallPrice(currentLevel) {
  return Math.floor(FIREWALL.BASE_PRICE * Math.pow(FIREWALL.PRICE_MULTIPLIER, currentLevel - 1));
}

/**
 * Calculate virus upgrade price
 * @param {number} currentLevel - Current virus level
 * @returns {number} Upgrade price
 */
function calculateVirusPrice(currentLevel) {
  return Math.floor(VIRUS.BASE_PRICE * Math.pow(VIRUS.PRICE_MULTIPLIER, currentLevel - 1));
}

/**
 * Calculate hack success probability
 * @param {number} attackerVirus - Attacker's virus level
 * @param {number} defenderFirewall - Defender's firewall level
 * @returns {number} Success probability (0-1)
 */
function calculateHackSuccessRate(attackerVirus, defenderFirewall) {
  const levelDiff = attackerVirus - defenderFirewall;
  const successRate = PVP.BASE_SUCCESS_RATE + (levelDiff * PVP.SUCCESS_RATE_MODIFIER);
  
  // Clamp between 10% and 90%
  return Math.max(0.1, Math.min(0.9, successRate));
}

/**
 * Calculate amount to steal from target
 * @param {number} targetBalance - Target's $BITZ balance
 * @param {number} attackerVirus - Attacker's virus level
 * @param {number} defenderFirewall - Defender's firewall level
 * @returns {number} Amount to steal
 */
function calculateStealAmount(targetBalance, attackerVirus, defenderFirewall) {
  let stealAmount = Math.floor(targetBalance * PVP.STEAL_PERCENTAGE);
  
  // Apply max/min limits
  stealAmount = Math.min(stealAmount, PVP.MAX_STEAL_AMOUNT);
  stealAmount = Math.max(stealAmount, PVP.MIN_STEAL_AMOUNT);
  
  // Defense reduces theft
  if (defenderFirewall > attackerVirus) {
    const defenseBonus = (defenderFirewall - attackerVirus) * PVP.DEFENSE_REDUCTION;
    stealAmount = Math.floor(stealAmount * (1 - defenseBonus));
  }
  
  return Math.max(0, stealAmount);
}

/**
 * Calculate remaining cooldown time
 * @param {string} lastAttemptTime - ISO timestamp of last hack attempt
 * @returns {number} Seconds remaining (0 if ready)
 */
function calculateCooldownRemaining(lastAttemptTime) {
  if (!lastAttemptTime) return 0;
  
  const lastAttempt = new Date(lastAttemptTime);
  const now = new Date();
  const secondsElapsed = Math.floor((now - lastAttempt) / 1000);
  const remaining = PVP.HACK_COOLDOWN - secondsElapsed;
  
  return Math.max(0, remaining);
}

/**
 * Check if user can perform action based on cooldown
 * @param {string} lastAttemptTime - ISO timestamp of last attempt
 * @returns {boolean} True if action is allowed
 */
function isCooldownExpired(lastAttemptTime) {
  return calculateCooldownRemaining(lastAttemptTime) === 0;
}

/**
 * Calculate max energy with upgrades
 * @param {number} baseMax - Base max energy
 * @param {Array} energyUpgrades - Energy upgrades owned
 * @returns {number} Total max energy
 */
function calculateMaxEnergy(baseMax, energyUpgrades = []) {
  let totalMax = baseMax;
  
  for (const upgrade of energyUpgrades) {
    const item = SHOP_ITEMS.find(i => i.id === upgrade.id);
    if (item && item.type === 'energy') {
      const energyEffect = item.effects.find(e => e.type === 'energy');
      if (energyEffect) {
        const levelMultiplier = 1 + (upgrade.level - 1) * energyEffect.scaling;
        totalMax += energyEffect.value * levelMultiplier * upgrade.quantity;
      }
    }
  }
  
  return totalMax;
}

/**
 * Calculate defense power
 * @param {number} firewallLevel - Firewall level
 * @returns {number} Defense power
 */
function calculateDefensePower(firewallLevel) {
  return FIREWALL.BASE_DEFENSE + (firewallLevel - 1) * FIREWALL.DEFENSE_PER_LEVEL;
}

/**
 * Calculate attack power
 * @param {number} virusLevel - Virus level
 * @returns {number} Attack power
 */
function calculateAttackPower(virusLevel) {
  return virusLevel * VIRUS.ATTACK_PER_LEVEL;
}

/**
 * Generate random targets for PVP scanning
 * @param {Array} users - All users
 * @param {string} excludeId - User ID to exclude
 * @param {number} count - Number of targets to return
 * @returns {Array} Random targets
 */
function generateScanTargets(users, excludeId, count = 3) {
  const eligibleUsers = users.filter(u => u.id !== excludeId && u.bitz > 0);
  
  if (eligibleUsers.length === 0) return [];
  
  // Shuffle and select
  const shuffled = [...eligibleUsers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Validate purchase request
 * @param {Object} user - User object
 * @param {Object} item - Shop item
 * @param {number} quantity - Quantity to buy
 * @returns {Object} Validation result
 */
function validatePurchase(user, item, quantity = 1) {
  const errors = [];
  
  // Check if item exists
  if (!item) {
    return { valid: false, error: 'Item not found' };
  }
  
  // Find current level/quantity
  let currentLevel = 0;
  if (item.type === 'botnet' || item.type === 'click_power' || item.type === 'energy') {
    const owned = user.botnets?.find(b => b.id === item.id);
    currentLevel = owned ? owned.level : 0;
  } else if (item.type === 'firewall') {
    currentLevel = user.firewall?.level || 1;
  }
  
  // Check max level
  if (item.maxLevel && currentLevel + quantity > item.maxLevel) {
    return { valid: false, error: 'Maximum level reached' };
  }
  
  // Check prerequisites
  if (item.requires && item.requires.length > 0) {
    for (const reqId of item.requires) {
      const hasPrereq = user.botnets?.some(b => b.id === reqId);
      if (!hasPrereq) {
        return { valid: false, error: `Requires: ${reqId}` };
      }
    }
  }
  
  // Calculate total price
  let totalPrice = 0;
  for (let i = 0; i < quantity; i++) {
    totalPrice += calculateItemPrice(item, currentLevel + i);
  }
  
  // Check funds
  if (user.bitz < totalPrice) {
    return { valid: false, error: 'Insufficient funds' };
  }
  
  return { valid: true, totalPrice, newLevel: currentLevel + quantity };
}

module.exports = {
  // Energy
  calculateCurrentEnergy,
  getTimeUntilNextEnergy,
  
  // Income
  calculatePassiveIncome,
  calculateCollectibleIncome,
  calculateClickPower,
  
  // Shop
  calculateItemPrice,
  calculateFirewallPrice,
  calculateVirusPrice,
  validatePurchase,
  
  // PVP
  calculateHackSuccessRate,
  calculateStealAmount,
  calculateCooldownRemaining,
  isCooldownExpired,
  generateScanTargets,
  
  // Stats
  calculateMaxEnergy,
  calculateDefensePower,
  calculateAttackPower
};