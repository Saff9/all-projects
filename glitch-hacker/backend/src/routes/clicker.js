/**
 * Clicker Routes
 * Handles clicker game mechanics (clicking, energy, passive income)
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { clickRateLimiter } = require('../middleware/rateLimiter');
const { asyncHandler, ApiError, InsufficientEnergyError } = require('../middleware/errorHandler');
const { ERROR_CODES, ENERGY } = require('../constants/game');
const {
  calculateCurrentEnergy,
  getTimeUntilNextEnergy,
  calculateCollectibleIncome,
  calculatePassiveIncome
} = require('../services/gameLogic');

/**
 * POST /api/clicker/click
 * Handle click (earn $BITZ, -1 energy)
 */
router.post('/click', authenticate, clickRateLimiter, asyncHandler(async (req, res) => {
  const user = req.user;
  const { timestamp, energyCost = 1 } = req.body;
  
  // Calculate current energy
  const currentEnergy = user.calculateCurrentEnergy();
  user.energy = currentEnergy;
  
  // Check if user has enough energy
  if (user.energy < energyCost) {
    throw new InsufficientEnergyError('Not enough energy to click');
  }
  
  // Calculate earnings
  const earned = user.clickPower * energyCost;
  
  // Update user
  user.energy -= energyCost;
  user.lastEnergyRefill = new Date().toISOString();
  user.bitz += earned;
  user.totalEarned += earned;
  user.totalClicks += 1;
  user.updatedAt = new Date().toISOString();
  
  // Save user
  const updatedUser = user.save();
  
  res.json({
    success: true,
    earned,
    newBalance: updatedUser.bitz,
    energyRemaining: updatedUser.energy,
    maxEnergy: updatedUser.maxEnergy,
    clickPower: updatedUser.clickPower,
    totalClicks: updatedUser.totalClicks
  });
}));

/**
 * POST /api/clicker/collect
 * Collect passive income from botnets
 */
router.post('/collect', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Calculate collectible income
  const collectible = user.calculateCollectibleIncome();
  
  if (collectible <= 0) {
    res.json({
      success: true,
      collected: 0,
      newBalance: user.bitz,
      nextCollection: new Date().toISOString(),
      message: 'No income to collect yet'
    });
    return;
  }
  
  // Update botnet collection times
  const now = new Date().toISOString();
  if (user.botnets && user.botnets.length > 0) {
    user.botnets = user.botnets.map(botnet => ({
      ...botnet,
      lastCollection: now
    }));
  }
  
  // Update user
  user.bitz += collectible;
  user.totalEarned += collectible;
  user.updatedAt = now;
  
  // Save user
  const updatedUser = user.save();
  
  res.json({
    success: true,
    collected: collectible,
    newBalance: updatedUser.bitz,
    nextCollection: now,
    botnets: updatedUser.botnets
  });
}));

/**
 * GET /api/clicker/status
 * Get current energy and passive income status
 */
router.get('/status', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Calculate current energy with refill
  const currentEnergy = user.calculateCurrentEnergy();
  const maxEnergy = user.maxEnergy;
  const timeUntilNext = getTimeUntilNextEnergy(user.lastEnergyRefill);
  
  // Calculate passive income
  const passiveIncome = user.calculatePassiveIncome();
  const collectibleIncome = user.calculateCollectibleIncome();
  
  // Calculate time to full energy
  const energyNeeded = maxEnergy - currentEnergy;
  const secondsToFull = energyNeeded > 0 ? Math.ceil(energyNeeded / ENERGY.REFILL_RATE) : 0;
  
  res.json({
    energy: {
      current: currentEnergy,
      max: maxEnergy,
      refillRate: ENERGY.REFILL_RATE,
      refillInterval: ENERGY.REFILL_INTERVAL,
      timeUntilNext: timeUntilNext,
      secondsToFull: secondsToFull
    },
    passiveIncome: {
      perSecond: passiveIncome,
      collectible: collectibleIncome,
      botnets: user.botnets.length
    },
    click: {
      power: user.clickPower,
      totalClicks: user.totalClicks
    }
  });
}));

/**
 * GET /api/clicker/energy
 * Get detailed energy status
 */
router.get('/energy', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  
  const currentEnergy = user.calculateCurrentEnergy();
  const timeUntilNext = getTimeUntilNextEnergy(user.lastEnergyRefill);
  const energyNeeded = user.maxEnergy - currentEnergy;
  const secondsToFull = energyNeeded > 0 ? Math.ceil(energyNeeded / ENERGY.REFILL_RATE) : 0;
  
  res.json({
    current: currentEnergy,
    max: user.maxEnergy,
    refillRate: ENERGY.REFILL_RATE,
    refillInterval: ENERGY.REFILL_INTERVAL,
    timeUntilNext,
    secondsToFull,
    lastRefill: user.lastEnergyRefill
  });
}));

module.exports = router;