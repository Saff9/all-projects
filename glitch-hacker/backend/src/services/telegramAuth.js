/**
 * Telegram WebApp Authentication Service
 * Validates Telegram Mini App initData
 */

const crypto = require('crypto');
const config = require('../config');

/**
 * Parse Telegram initData query string
 * @param {string} initData - Raw initData string from Telegram
 * @returns {Object} Parsed data object
 */
function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const data = {};
  
  for (const [key, value] of params) {
    try {
      // Try to parse JSON values
      data[key] = JSON.parse(value);
    } catch {
      // Keep as string if not valid JSON
      data[key] = value;
    }
  }
  
  return data;
}

/**
 * Validate Telegram WebApp initData
 * @param {string} initData - Raw initData string from Telegram
 * @returns {Object} Validation result with user data if valid
 */
function validateTelegramData(initData) {
  try {
    // Parse the initData
    const data = parseInitData(initData);
    
    // Check for required fields
    if (!data.hash) {
      return { valid: false, error: 'Missing hash parameter' };
    }
    
    // Extract hash
    const { hash, ...dataToCheck } = data;
    
    // Create data check string (sorted alphabetically)
    const dataCheckString = Object.keys(dataToCheck)
      .sort()
      .map(key => `${key}=${dataToCheck[key]}`)
      .join('\n');
    
    // Create secret key from bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.BOT_TOKEN)
      .digest();
    
    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Compare hashes
    if (calculatedHash !== hash) {
      return { valid: false, error: 'Invalid hash signature' };
    }
    
    // Check auth_date expiration (optional, 24 hours)
    if (data.auth_date) {
      const authDate = parseInt(data.auth_date, 10) * 1000;
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now - authDate > oneDay) {
        return { valid: false, error: 'Authentication expired' };
      }
    }
    
    // Return user data if valid
    return {
      valid: true,
      user: data.user,
      authDate: data.auth_date,
      queryId: data.query_id
    };
    
  } catch (error) {
    console.error('Telegram auth validation error:', error);
    return { valid: false, error: 'Validation error: ' + error.message };
  }
}

/**
 * Validate initData without strict hash check (for development)
 * @param {string} initData - Raw initData string
 * @returns {Object} Parsed data
 */
function parseInitDataDev(initData) {
  try {
    const data = parseInitData(initData);
    
    return {
      valid: true,
      user: data.user,
      authDate: data.auth_date,
      queryId: data.query_id
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Extract user from initData
 * @param {string} initData - Raw initData string
 * @returns {Object|null} User object or null
 */
function extractUser(initData) {
  const data = parseInitData(initData);
  return data.user || null;
}

/**
 * Create a simple auth token for the user
 * @param {Object} user - User object
 * @returns {string} Auth token
 */
function createAuthToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    iat: Date.now(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  // Simple base64 encoding (in production, use JWT)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Verify auth token
 * @param {string} token - Auth token
 * @returns {Object|null} Decoded payload or null
 */
function verifyAuthToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * Main authentication function
 * @param {string} initData - Telegram initData
 * @returns {Object} Authentication result
 */
async function authenticate(initData) {
  if (!initData) {
    return { success: false, error: 'No initData provided' };
  }
  
  // In development, allow parsing without strict validation
  let validation;
  if (config.NODE_ENV === 'development' && !config.BOT_TOKEN) {
    console.warn('Development mode: Skipping strict Telegram validation');
    validation = parseInitDataDev(initData);
  } else {
    validation = validateTelegramData(initData);
  }
  
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  const telegramUser = validation.user;
  
  if (!telegramUser) {
    return { success: false, error: 'No user data in initData' };
  }
  
  // Create auth token
  const token = createAuthToken(telegramUser);
  
  return {
    success: true,
    user: telegramUser,
    token
  };
}

module.exports = {
  authenticate,
  validateTelegramData,
  parseInitData,
  extractUser,
  createAuthToken,
  verifyAuthToken
};