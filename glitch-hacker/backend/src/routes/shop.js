/**
 * Shop Routes
 * Handles shop items and purchases
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, ApiError, InsufficientFundsError } = require('../middleware/errorHandler');
const { ERROR_CODES, SHOP_ITEMS, FIREWALL, VIRUS } = require('../constants/game');
const {
  calculateItemPrice,
  calculateFirewallPrice,
  calculateVirusPrice,
  validatePurchase
} = require('../services/gameLogic');

/**
 * GET /api/shop/items
 * Get all shop items
 */
router.get('/items', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Calculate current prices for user
  const itemsWithPrices = SHOP_ITEMS.map(item => {
    // Find user's current level for this item
    let currentLevel = 0;
    if (item.type === 'botnet' || item.type === 'click_power' || item.type === 'energy') {
      const owned = user.botnets?.find(b => b.id === item.id);
      currentLevel = owned ? owned.level : 0;
    }
    
    const currentPrice = calculateItemPrice(item, currentLevel);
    const nextPrice = calculateItemPrice(item, currentLevel + 1);
    
    return {
      ...item,
      currentPrice,
      nextPrice,
      owned: currentLevel,
      canAfford: user.bitz >= currentPrice,
      maxed: item.maxLevel ? currentLevel >= item.maxLevel : false
    };
  });
  
  // Add firewall upgrade info
  const firewallPrice = calculateFirewallPrice(user.firewall?.level || 1);
  const firewallMaxed = (user.firewall?.level || 1) >= FIREWALL.MAX_LEVEL;
  
  // Add virus upgrade info
  const virusPrice = calculateVirusPrice(user.firewall?.virusStrength || 1);
  
  res.json({
    items: itemsWithPrices,
    upgrades: {
      firewall: {
        currentLevel: user.firewall?.level || 1,
        price: firewallPrice,
        canAfford: user.bitz >= firewallPrice,
        maxed: firewallMaxed,
        maxLevel: FIREWALL.MAX_LEVEL
      },
      virus: {
        currentLevel: user.firewall?.virusStrength || 1,
        price: virusPrice,
        canAfford: user.bitz >= virusPrice,
        maxed: (user.firewall?.virusStrength || 1) >= VIRUS.MAX_LEVEL,
        maxLevel: VIRUS.MAX_LEVEL
      }
    },
    balance: user.bitz
  });
}));

/**
 * POST /api/shop/buy
 * Buy an item (botnet or upgrade)
 */
router.post('/buy', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  const { itemId, quantity = 1 } = req.body;
  
  if (!itemId) {
    throw new ApiError(400, ERROR_CODES.INVALID_INPUT, 'itemId is required');
  }
  
  if (quantity < 1 || quantity > 100) {
    throw new ApiError(400, ERROR_CODES.INVALID_INPUT, 'Quantity must be between 1 and 100');
  }
  
  // Handle special upgrade types
  if (itemId === 'firewall_upgrade') {
    return buyFirewallUpgrade(user, res);
  }
  
  if (itemId === 'virus_upgrade') {
    return buyVirusUpgrade(user, res);
  }
  
  // Find shop item
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  
  if (!item) {
    throw new ApiError(404, ERROR_CODES.ITEM_NOT_FOUND, 'Item not found');
  }
  
  // Validate purchase
  const validation = validatePurchase(user, item, quantity);
  
  if (!validation.valid) {
    if (validation.error === 'Insufficient funds') {
      throw new InsufficientFundsError('Not enough $BITZ to purchase this item');
    }
    throw new ApiError(400, ERROR_CODES.INVALID_INPUT, validation.error);
  }
  
  // Deduct cost
  user.bitz -= validation.totalPrice;
  user.totalSpent += validation.totalPrice;
  
  // Add/update item in user's inventory
  const existingIndex = user.botnets?.findIndex(b => b.id === itemId);
  
  if (existingIndex >= 0) {
    // Update existing
    user.botnets[existingIndex].level = validation.newLevel;
    user.botnets[existingIndex].quantity += quantity;
  } else {
    // Add new
    if (!user.botnets) user.botnets = [];
    user.botnets.push({
      id: itemId,
      level: validation.newLevel,
      quantity: quantity,
      lastCollection: new Date().toISOString(),
      purchasedAt: new Date().toISOString()
    });
  }
  
  // Apply immediate effects
  if (item.type === 'click_power') {
    const powerEffect = item.effects.find(e => e.type === 'click_power');
    if (powerEffect) {
      user.clickPower += powerEffect.value * quantity;
    }
  } else if (item.type === 'energy') {
    const energyEffect = item.effects.find(e => e.type === 'energy');
    if (energyEffect) {
      user.maxEnergy += energyEffect.value * quantity;
    }
  }
  
  user.updatedAt = new Date().toISOString();
  const updatedUser = user.save();
  
  res.json({
    success: true,
    newBalance: updatedUser.bitz,
    item: {
      id: item.id,
      name: item.name,
      type: item.type
    },
    userItem: updatedUser.botnets.find(b => b.id === itemId),
    spent: validation.totalPrice
  });
}));

/**
 * Buy firewall upgrade
 */
async function buyFirewallUpgrade(user, res) {
  const currentLevel = user.firewall?.level || 1;
  
  if (currentLevel >= FIREWALL.MAX_LEVEL) {
    throw new ApiError(400, ERROR_CODES.MAX_LEVEL_REACHED, 'Firewall is already at maximum level');
  }
  
  const price = calculateFirewallPrice(currentLevel);
  
  if (user.bitz < price) {
    throw new InsufficientFundsError('Not enough $BITZ to upgrade firewall');
  }
  
  // Deduct cost
  user.bitz -= price;
  user.totalSpent += price;
  
  // Upgrade firewall
  if (!user.firewall) {
    user.firewall = { level: 1, virusStrength: 1, lastUpgrade: new Date().toISOString() };
  }
  
  user.firewall.level += 1;
  user.firewall.lastUpgrade = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  const updatedUser = user.save();
  
  res.json({
    success: true,
    newBalance: updatedUser.bitz,
    item: {
      id: 'firewall_upgrade',
      name: 'Firewall Upgrade',
      type: 'firewall'
    },
    userItem: updatedUser.firewall,
    spent: price
  });
}

/**
 * Buy virus upgrade
 */
async function buyVirusUpgrade(user, res) {
  const currentLevel = user.firewall?.virusStrength || 1;
  
  if (currentLevel >= VIRUS.MAX_LEVEL) {
    throw new ApiError(400, ERROR_CODES.MAX_LEVEL_REACHED, 'Virus is already at maximum level');
  }
  
  const price = calculateVirusPrice(currentLevel);
  
  if (user.bitz < price) {
    throw new InsufficientFundsError('Not enough $BITZ to upgrade virus');
  }
  
  // Deduct cost
  user.bitz -= price;
  user.totalSpent += price;
  
  // Upgrade virus
  if (!user.firewall) {
    user.firewall = { level: 1, virusStrength: 1, lastUpgrade: new Date().toISOString() };
  }
  
  user.firewall.virusStrength += 1;
  user.firewall.lastUpgrade = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  
  const updatedUser = user.save();
  
  res.json({
    success: true,
    newBalance: updatedUser.bitz,
    item: {
      id: 'virus_upgrade',
      name: 'Virus Upgrade',
      type: 'virus'
    },
    userItem: {
      virusStrength: updatedUser.firewall.virusStrength
    },
    spent: price
  });
}

/**
 * GET /api/shop/prices
 * Get current prices for all items
 */
router.get('/prices', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  
  const prices = SHOP_ITEMS.map(item => {
    let currentLevel = 0;
    if (item.type === 'botnet' || item.type === 'click_power' || item.type === 'energy') {
      const owned = user.botnets?.find(b => b.id === item.id);
      currentLevel = owned ? owned.level : 0;
    }
    
    return {
      itemId: item.id,
      name: item.name,
      currentPrice: calculateItemPrice(item, currentLevel),
      nextPrice: calculateItemPrice(item, currentLevel + 1),
      owned: currentLevel,
      maxLevel: item.maxLevel
    };
  });
  
  // Add upgrade prices
  prices.push({
    itemId: 'firewall_upgrade',
    name: 'Firewall Upgrade',
    currentPrice: calculateFirewallPrice(user.firewall?.level || 1),
    nextPrice: calculateFirewallPrice((user.firewall?.level || 1) + 1),
    owned: user.firewall?.level || 1,
    maxLevel: FIREWALL.MAX_LEVEL
  });
  
  prices.push({
    itemId: 'virus_upgrade',
    name: 'Virus Upgrade',
    currentPrice: calculateVirusPrice(user.firewall?.virusStrength || 1),
    nextPrice: calculateVirusPrice((user.firewall?.virusStrength || 1) + 1),
    owned: user.firewall?.virusStrength || 1,
    maxLevel: VIRUS.MAX_LEVEL
  });
  
  res.json({ items: prices });
}));

module.exports = router;