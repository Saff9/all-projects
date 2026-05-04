/**
 * PVP Routes
 * Handles player vs player hacking mechanics
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { hackLogsDB } = require('../models/db');
const { authenticate } = require('../middleware/auth');
const { hackRateLimiter } = require('../middleware/rateLimiter');
const { asyncHandler, ApiError, InsufficientFundsError, CooldownError } = require('../middleware/errorHandler');
const { ERROR_CODES, PVP } = require('../constants/game');
const {
  calculateHackSuccessRate,
  calculateStealAmount,
  calculateCooldownRemaining,
  isCooldownExpired,
  generateScanTargets
} = require('../services/gameLogic');

/**
 * POST /api/pvp/scan
 * Pay 50 $BITZ to find random targets
 */
router.post('/scan', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Check if user can afford scan
  if (user.bitz < PVP.SCAN_COST) {
    throw new InsufficientFundsError(`Scanning costs ${PVP.SCAN_COST} $BITZ`);
  }
  
  // Deduct scan cost
  user.bitz -= PVP.SCAN_COST;
  user.totalSpent += PVP.SCAN_COST;
  
  // Find random targets
  const allUsers = User.getAll();
  const targets = generateScanTargets(allUsers, user.id, 3);
  
  // Format targets for response
  const formattedTargets = targets.map(target => ({
    id: target.id,
    username: target.username,
    firstName: target.firstName,
    photoUrl: target.photoUrl,
    firewall: target.firewall,
    estimatedLoot: Math.floor(target.bitz * PVP.STEAL_PERCENTAGE)
  }));
  
  user.updatedAt = new Date().toISOString();
  user.save();
  
  res.json({
    success: true,
    cost: PVP.SCAN_COST,
    newBalance: user.bitz,
    targets: formattedTargets,
    cooldownRemaining: calculateCooldownRemaining(user.pvp?.lastHackAttempt)
  });
}));

/**
 * POST /api/pvp/hack
 * Attempt to hack a target
 */
router.post('/hack', authenticate, hackRateLimiter, asyncHandler(async (req, res) => {
  const user = req.user;
  const { targetId } = req.body;
  
  if (!targetId) {
    throw new ApiError(400, ERROR_CODES.INVALID_INPUT, 'targetId is required');
  }
  
  // Prevent self-hacking
  if (targetId === user.id) {
    throw new ApiError(403, ERROR_CODES.SELF_HACK, 'Cannot hack yourself');
  }
  
  // Check cooldown
  if (!isCooldownExpired(user.pvp?.lastHackAttempt)) {
    const remaining = calculateCooldownRemaining(user.pvp?.lastHackAttempt);
    throw new CooldownError(remaining, 'Hack is on cooldown');
  }
  
  // Find target
  const target = User.findByTelegramId(targetId);
  
  if (!target) {
    throw new ApiError(404, ERROR_CODES.USER_NOT_FOUND, 'Target not found');
  }
  
  // Check if target has any bitz to steal
  if (target.bitz <= 0) {
    throw new ApiError(400, ERROR_CODES.INVALID_INPUT, 'Target has no $BITZ to steal');
  }
  
  // Calculate hack success
  const attackerVirus = user.firewall?.virusStrength || 1;
  const defenderFirewall = target.firewall?.level || 1;
  const successRate = calculateHackSuccessRate(attackerVirus, defenderFirewall);
  const success = Math.random() < successRate;
  
  // Calculate steal amount
  let bitzStolen = 0;
  if (success) {
    bitzStolen = calculateStealAmount(target.bitz, attackerVirus, defenderFirewall);
  }
  
  // Update attacker
  user.pvp.hacksAttempted = (user.pvp.hacksAttempted || 0) + 1;
  user.pvp.lastHackAttempt = new Date().toISOString();
  
  if (success) {
    user.pvp.hacksSuccessful = (user.pvp.hacksSuccessful || 0) + 1;
    user.pvp.bitzStolen = (user.pvp.bitzStolen || 0) + bitzStolen;
    user.bitz += bitzStolen;
    user.totalEarned += bitzStolen;
  }
  
  user.updatedAt = new Date().toISOString();
  
  // Update defender
  if (success) {
    target.pvp.bitzLost = (target.pvp.bitzLost || 0) + bitzStolen;
    target.bitz -= bitzStolen;
  } else {
    target.pvp.hacksDefended = (target.pvp.hacksDefended || 0) + 1;
  }
  
  target.updatedAt = new Date().toISOString();
  
  // Save both users
  user.save();
  target.save();
  
  // Create hack log
  const hackLog = hackLogsDB.create({
    attackerId: user.id,
    attackerUsername: user.username,
    defenderId: target.id,
    defenderUsername: target.username,
    timestamp: new Date().toISOString(),
    success,
    attackerVirus,
    defenderFirewall,
    bitzStolen,
    defenseTriggered: !success && defenderFirewall > attackerVirus,
    clientTimestamp: req.body.timestamp || new Date().toISOString(),
    ipAddress: req.ip
  });
  
  // Calculate cooldown end time
  const cooldownEnds = new Date(Date.now() + PVP.HACK_COOLDOWN * 1000).toISOString();
  
  res.json({
    success,
    bitzStolen,
    attackerBalance: user.bitz,
    defenderBalance: target.bitz,
    defenderFirewall,
    attackerVirus,
    successRate: Math.round(successRate * 100),
    cooldownEnds,
    message: success 
      ? `Successfully hacked ${target.username} and stole ${bitzStolen} $BITZ!`
      : `Hack failed! ${target.username}'s firewall blocked your attack.`
  });
}));

/**
 * GET /api/pvp/cooldown
 * Check hack cooldown status
 */
router.get('/cooldown', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  
  const remaining = calculateCooldownRemaining(user.pvp?.lastHackAttempt);
  const canHack = remaining === 0;
  
  let nextHackTime = null;
  if (!canHack && user.pvp?.lastHackAttempt) {
    nextHackTime = new Date(new Date(user.pvp.lastHackAttempt).getTime() + PVP.HACK_COOLDOWN * 1000).toISOString();
  }
  
  res.json({
    canHack,
    remainingSeconds: remaining,
    nextHackTime,
    cooldownDuration: PVP.HACK_COOLDOWN
  });
}));

/**
 * GET /api/pvp/targets
 * Get potential hack targets
 */
router.get('/targets', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  const limit = Math.min(parseInt(req.query.limit) || 10, 20);
  
  const allUsers = User.getAll();
  const targets = generateScanTargets(allUsers, user.id, limit);
  
  const formattedTargets = targets.map(target => ({
    id: target.id,
    username: target.username,
    firstName: target.firstName,
    photoUrl: target.photoUrl,
    firewall: target.firewall,
    estimatedLoot: Math.floor(target.bitz * PVP.STEAL_PERCENTAGE)
  }));
  
  const remaining = calculateCooldownRemaining(user.pvp?.lastHackAttempt);
  
  res.json({
    targets: formattedTargets,
    cooldownRemaining: remaining,
    scanCost: PVP.SCAN_COST
  });
}));

/**
 * GET /api/pvp/history
 * Get hack history
 */
router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  const { type = 'all', limit = 20, offset = 0 } = req.query;
  
  const result = hackLogsDB.getByUser(user.id, type, parseInt(limit), parseInt(offset));
  
  res.json({
    logs: result.logs,
    total: result.total,
    type,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
}));

/**
 * GET /api/pvp/stats
 * Get PVP statistics
 */
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  const pvp = user.pvp || {};
  
  const hacksAttempted = pvp.hacksAttempted || 0;
  const hacksSuccessful = pvp.hacksSuccessful || 0;
  const successRate = hacksAttempted > 0 ? (hacksSuccessful / hacksAttempted * 100).toFixed(1) : 0;
  
  const bitzStolen = pvp.bitzStolen || 0;
  const bitzLost = pvp.bitzLost || 0;
  const netProfit = bitzStolen - bitzLost;
  
  res.json({
    hacksAttempted,
    hacksSuccessful,
    hacksDefended: pvp.hacksDefended || 0,
    successRate: parseFloat(successRate),
    bitzStolen,
    bitzLost,
    netProfit,
    virusStrength: user.firewall?.virusStrength || 1,
    firewallLevel: user.firewall?.level || 1
  });
}));

module.exports = router;