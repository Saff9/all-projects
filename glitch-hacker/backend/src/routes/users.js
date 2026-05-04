/**
 * User Routes
 * Handles user profile and leaderboard operations
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { ERROR_CODES } = require('../constants/game');

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = req.user;
  const currentEnergy = user.calculateCurrentEnergy();
  const passiveIncome = user.calculatePassiveIncome();
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      bitz: user.bitz,
      totalEarned: user.totalEarned,
      totalSpent: user.totalSpent,
      clickPower: user.clickPower,
      totalClicks: user.totalClicks,
      energy: currentEnergy,
      maxEnergy: user.maxEnergy,
      lastEnergyRefill: user.lastEnergyRefill,
      botnets: user.botnets,
      firewall: user.firewall,
      pvp: user.pvp,
      passiveIncome,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastActive: user.lastActive
    }
  });
}));

/**
 * GET /api/users/leaderboard
 * Get top hackers by totalHacked
 */
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = parseInt(req.query.offset) || 0;
  
  const result = User.getLeaderboard(limit, offset);
  
  res.json({
    users: result.users,
    total: result.total,
    limit,
    offset
  });
}));

/**
 * GET /api/users/:id
 * Get user by ID (limited public data)
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = User.findByTelegramId(id);
  
  if (!user) {
    throw new ApiError(404, ERROR_CODES.USER_NOT_FOUND, 'User not found');
  }
  
  // Return public profile
  res.json({
    user: user.toPublicProfile()
  });
}));

/**
 * GET /api/users/search/:username
 * Search users by username
 */
router.get('/search/:username', authenticate, asyncHandler(async (req, res) => {
  const { username } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  
  if (!username || username.length < 2) {
    throw new ApiError(400, ERROR_CODES.INVALID_INPUT, 'Username must be at least 2 characters');
  }
  
  const allUsers = User.getAll();
  const matchingUsers = allUsers
    .filter(u => 
      u.username.toLowerCase().includes(username.toLowerCase()) ||
      u.firstName.toLowerCase().includes(username.toLowerCase())
    )
    .slice(0, limit)
    .map(u => u.toPublicProfile());
  
  res.json({
    users: matchingUsers,
    total: matchingUsers.length
  });
}));

module.exports = router;