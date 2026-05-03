/**
 * Authentication Middleware
 * Verifies Telegram authentication and attaches user to request
 */

const User = require('../models/User');
const { verifyAuthToken, validateTelegramData, parseInitDataDev } = require('../services/telegramAuth');
const config = require('../config');
const { ERROR_CODES } = require('../constants/game');

/**
 * Extract token from request headers
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in query params (for WebSocket compatibility)
  if (req.query && req.query.token) {
    return req.query.token;
  }
  
  return null;
}

/**
 * Main authentication middleware
 * Verifies the user is authenticated via Telegram
 */
async function authenticate(req, res, next) {
  try {
    // Check for Telegram initData in header (primary auth method)
    const initData = req.headers['x-telegram-init-data'];
    
    if (initData) {
      // Validate Telegram initData
      let validation;
      
      if (config.NODE_ENV === 'development' && !config.BOT_TOKEN) {
        validation = parseInitDataDev(initData);
      } else {
        validation = validateTelegramData(initData);
      }
      
      if (!validation.valid) {
        return res.status(401).json({
          status: 401,
          code: ERROR_CODES.INVALID_AUTH,
          message: validation.error || 'Invalid authentication'
        });
      }
      
      const telegramUser = validation.user;
      
      // Find or create user in database
      let user = User.findByTelegramId(telegramUser.id.toString());
      
      if (!user) {
        // Create new user
        user = User.create({
          id: telegramUser.id,
          username: telegramUser.username || `user_${telegramUser.id}`,
          first_name: telegramUser.first_name,
          last_name: telegramUser.last_name,
          photo_url: telegramUser.photo_url
        });
      } else {
        // Update last active
        user.lastActive = new Date().toISOString();
        user.save();
      }
      
      // Attach user to request
      req.user = user;
      req.telegramUser = telegramUser;
      
      return next();
    }
    
    // Fallback to token-based auth
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        status: 401,
        code: ERROR_CODES.INVALID_AUTH,
        message: 'No authentication provided'
      });
    }
    
    // Verify token
    const payload = verifyAuthToken(token);
    
    if (!payload) {
      return res.status(401).json({
        status: 401,
        code: ERROR_CODES.TOKEN_EXPIRED,
        message: 'Invalid or expired token'
      });
    }
    
    // Find user
    const user = User.findByTelegramId(payload.id.toString());
    
    if (!user) {
      return res.status(401).json({
        status: 401,
        code: ERROR_CODES.USER_NOT_FOUND,
        message: 'User not found'
      });
    }
    
    // Update last active
    user.lastActive = new Date().toISOString();
    user.save();
    
    // Attach user to request
    req.user = user;
    
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      status: 500,
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Authentication error'
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if authenticated, but doesn't require it
 */
async function optionalAuth(req, res, next) {
  try {
    const initData = req.headers['x-telegram-init-data'];
    const token = extractToken(req);
    
    if (initData) {
      let validation;
      
      if (config.NODE_ENV === 'development' && !config.BOT_TOKEN) {
        validation = parseInitDataDev(initData);
      } else {
        validation = validateTelegramData(initData);
      }
      
      if (validation.valid) {
        const telegramUser = validation.user;
        let user = User.findByTelegramId(telegramUser.id.toString());
        
        if (!user) {
          user = User.create({
            id: telegramUser.id,
            username: telegramUser.username || `user_${telegramUser.id}`,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            photo_url: telegramUser.photo_url
          });
        }
        
        req.user = user;
        req.telegramUser = telegramUser;
      }
    } else if (token) {
      const payload = verifyAuthToken(token);
      
      if (payload) {
        const user = User.findByTelegramId(payload.id.toString());
        if (user) {
          req.user = user;
        }
      }
    }
    
    next();
    
  } catch (error) {
    // Continue without user on error
    next();
  }
}

/**
 * Development authentication bypass
 * Only use in development mode
 */
async function devAuth(req, res, next) {
  if (config.NODE_ENV !== 'development') {
    return res.status(403).json({
      status: 403,
      code: ERROR_CODES.INVALID_AUTH,
      message: 'Development auth only available in development mode'
    });
  }
  
  // Create or get a test user
  const testUserId = req.headers['x-test-user-id'] || '123456789';
  let user = User.findByTelegramId(testUserId);
  
  if (!user) {
    user = User.create({
      id: testUserId,
      username: 'test_user',
      first_name: 'Test',
      last_name: 'User',
      photo_url: ''
    });
  }
  
  req.user = user;
  next();
}

module.exports = {
  authenticate,
  optionalAuth,
  devAuth,
  extractToken
};