/**
 * Game Constants
 * Core configuration for The Glitch Hacker game mechanics
 */

// Energy Settings
const ENERGY = {
  MAX: 1000,                    // Maximum energy capacity
  REFILL_RATE: 10,              // Energy refilled per second
  CLICK_COST: 1,                // Energy cost per click
  REFILL_INTERVAL: 1000         // Refill interval in milliseconds
};

// Clicker Settings
const CLICKER = {
  BASE_CLICK_POWER: 1,          // Base $BITZ earned per click
  CLICK_POWER_INCREMENT: 0.5    // Increment per upgrade level
};

// Shop Items
const SHOP_ITEMS = [
  {
    id: 'script_kiddie',
    type: 'botnet',
    name: 'Script Kiddie',
    description: 'Basic botnet for beginners. Generates small passive income.',
    icon: 'botnet_basic',
    tier: 'common',
    basePrice: 100,
    priceMultiplier: 1.15,
    effects: [
      {
        type: 'passive_income',
        value: 0.1,               // $BITZ per second
        scaling: 0.1              // 10% increase per level
      }
    ],
    maxLevel: 50
  },
  {
    id: 'server_farm',
    type: 'botnet',
    name: 'Server Farm',
    description: 'A network of compromised servers. Moderate passive income.',
    icon: 'botnet_server',
    tier: 'rare',
    basePrice: 1000,
    priceMultiplier: 1.2,
    effects: [
      {
        type: 'passive_income',
        value: 1.0,
        scaling: 0.15
      }
    ],
    maxLevel: 50,
    requires: ['script_kiddie']
  },
  {
    id: 'quantum_cpu',
    type: 'botnet',
    name: 'Quantum CPU',
    description: 'Quantum computing power for maximum mining efficiency.',
    icon: 'botnet_quantum',
    tier: 'epic',
    basePrice: 10000,
    priceMultiplier: 1.25,
    effects: [
      {
        type: 'passive_income',
        value: 10.0,
        scaling: 0.2
      }
    ],
    maxLevel: 50,
    requires: ['server_farm']
  },
  {
    id: 'click_upgrade',
    type: 'click_power',
    name: 'Overclocked Mouse',
    description: 'Upgrade your clicking power for more $BITZ per click.',
    icon: 'click_upgrade',
    tier: 'common',
    basePrice: 500,
    priceMultiplier: 1.3,
    effects: [
      {
        type: 'click_power',
        value: 1,                 // Additional $BITZ per click
        scaling: 0.5
      }
    ],
    maxLevel: 100
  },
  {
    id: 'energy_boost',
    type: 'energy',
    name: 'Energy Cell',
    description: 'Increase maximum energy capacity.',
    icon: 'energy_cell',
    tier: 'rare',
    basePrice: 2000,
    priceMultiplier: 1.4,
    effects: [
      {
        type: 'energy',
        value: 100,               // Additional max energy
        scaling: 1
      }
    ],
    maxLevel: 20
  }
];

// Firewall Upgrade Settings
const FIREWALL = {
  BASE_PRICE: 500,              // Starting price for firewall upgrade
  PRICE_MULTIPLIER: 1.25,       // 25% price increase per level
  MAX_LEVEL: 100,               // Maximum firewall level
  DEFENSE_PER_LEVEL: 10,        // Defense points per level
  BASE_DEFENSE: 100             // Starting defense
};

// Virus Upgrade Settings
const VIRUS = {
  BASE_PRICE: 750,              // Starting price for virus upgrade
  PRICE_MULTIPLIER: 1.3,        // 30% price increase per level
  MAX_LEVEL: 100,               // Maximum virus level
  ATTACK_PER_LEVEL: 5           // Attack power per level
};

// PVP Settings
const PVP = {
  SCAN_COST: 50,                // $BITZ cost to scan for targets
  HACK_COOLDOWN: 3600,          // Cooldown in seconds (1 hour)
  STEAL_PERCENTAGE: 0.10,       // 10% of target's balance
  MAX_STEAL_AMOUNT: 10000,      // Maximum $BITZ that can be stolen
  MIN_STEAL_AMOUNT: 10,         // Minimum $BITZ that can be stolen
  BASE_SUCCESS_RATE: 0.5,       // 50% base success rate
  SUCCESS_RATE_MODIFIER: 0.01,  // 1% per level difference
  DEFENSE_REDUCTION: 0.25       // Defense reduces theft by 25%
};

// Achievement Thresholds
const ACHIEVEMENTS = {
  CLICKS: [100, 1000, 10000, 100000, 1000000],
  EARNED: [1000, 10000, 100000, 1000000, 10000000],
  HACKS: [1, 10, 50, 100, 500],
  DEFENSES: [1, 10, 25, 50, 100]
};

// Error Codes
const ERROR_CODES = {
  // 400 Bad Request
  INVALID_INPUT: 'INVALID_INPUT',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INSUFFICIENT_ENERGY: 'INSUFFICIENT_ENERGY',
  MAX_LEVEL_REACHED: 'MAX_LEVEL_REACHED',
  
  // 401 Unauthorized
  INVALID_AUTH: 'INVALID_AUTH',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // 403 Forbidden
  COOLDOWN_ACTIVE: 'COOLDOWN_ACTIVE',
  SELF_HACK: 'SELF_HACK',
  
  // 404 Not Found
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
  
  // 429 Too Many Requests
  RATE_LIMITED: 'RATE_LIMITED',
  CLICK_RATE_LIMIT: 'CLICK_RATE_LIMIT',
  
  // 500 Internal Server Error
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// Rate Limiting Settings
const RATE_LIMITS = {
  CLICKS: {
    windowMs: 1000,             // 1 second
    maxRequests: 20             // Max 20 clicks per second
  },
  HACKS: {
    windowMs: 300000,           // 5 minutes
    maxRequests: 1              // 1 hack attempt per 5 minutes
  },
  API: {
    windowMs: 900000,           // 15 minutes
    maxRequests: 100            // 100 requests per 15 minutes
  }
};

module.exports = {
  ENERGY,
  CLICKER,
  SHOP_ITEMS,
  FIREWALL,
  VIRUS,
  PVP,
  ACHIEVEMENTS,
  ERROR_CODES,
  RATE_LIMITS
};