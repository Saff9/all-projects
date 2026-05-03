/**
 * Authentication Routes
 * Handles Telegram Mini App authentication
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../services/telegramAuth');
const User = require('../models/User');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const { ERROR_CODES } = require('../constants/game');

/**
 * POST /api/auth/telegram
 * Authenticate user via Telegram initData
 */
router.post('/telegram', asyncHandler(async (req, res) => {
  const { initData } = req.body;
  
  if (!initData) {
    throw new ApiError(400, ERROR_CODES.INVALID_INPUT, 'initData is required');
  }
  
  // Authenticate with Telegram
  const authResult = await authenticate(initData);
  
  if (!authResult.success) {
    throw new ApiError(401, ERROR_CODES.INVALID_AUTH, authResult.error);
  }
  
  const telegramUser = authResult.user;
  const userId = telegramUser.id.toString();
  
  // Find or create user
  let user = User.findByTelegramId(userId);
  let isNewUser = false;
  
  if (!user) {
    // Create new user
    user = User.create({
      id: telegramUser.id,
      username: telegramUser.username || `hacker_${telegramUser.id}`,
      first_name: telegramUser.first_name || 'Anonymous',
      last_name: telegramUser.last_name || '',
      photo_url: telegramUser.photo_url || ''
    });
    isNewUser = true;
  } else {
    // Update user info from Telegram
    user.username = telegramUser.username || user.username;
    user.firstName = telegramUser.first_name || user.firstName;
    user.lastName = telegramUser.last_name || user.lastName;
    user.photoUrl = telegramUser.photo_url || user.photoUrl;
    user.lastActive = new Date().toISOString();
    user = user.save();
  }
  
  // Calculate current energy
  const currentEnergy = user.calculateCurrentEnergy();
  
  res.json({
    success: true,
    isNewUser,
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
      botnets: user.botnets,
      firewall: user.firewall,
      pvp: user.pvp,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    },
    token: authResult.token
  });
}));

/**
 * POST /api/auth/refresh
 * Refresh authentication token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { initData } = req.body;
  
  if (!initData) {
    throw new ApiError(400, ERROR_CODES.INVALID_INPUT, 'initData is required');
  }
  
  const authResult = await authenticate(initData);
  
  if (!authResult.success) {
    throw new ApiError(401, ERROR_CODES.INVALID_AUTH, authResult.error);
  }
  
  res.json({
    success: true,
    token: authResult.token
  });
}));

/**
 * GET /api/auth/verify
 * Verify current token is valid
 */
router.get('/verify', asyncHandler(async (req, res) => {
  // User is attached by auth middleware
  if (!req.user) {
    throw new ApiError(401, ERROR_CODES.INVALID_AUTH, 'Not authenticated');
  }
  
  const currentEnergy = req.user.calculateCurrentEnergy();
  
  res.json({
    valid: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      firstName: req.user.firstName,
      energy: currentEnergy,
      maxEnergy: req.user.maxEnergy
    }
  });
}));

module.exports = router;