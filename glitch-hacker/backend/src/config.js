const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  DATA_DIR: path.join(__dirname, '../data'),
  USERS_DB: path.join(__dirname, '../data/users.json'),
  SHOP_DB: path.join(__dirname, '../data/shop.json'),
  HACKLOGS_DB: path.join(__dirname, '../data/hacklogs.json'),
  
  // Telegram Bot Configuration
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  WEBAPP_URL: process.env.WEBAPP_URL || '',
  
  // Game Configuration
  GAME: {
    // Clicker Settings
    BASE_CLICK_POWER: 1,
    BASE_ENERGY: 1000,
    ENERGY_REFILL_RATE: 1, // Energy per second
    
    // Botnet Settings
    BOTNET_BASE_PRICE: 100,
    BOTNET_PRICE_MULTIPLIER: 1.15,
    BOTNET_BASE_INCOME: 0.1, // $BITZ per second
    
    // Firewall Settings
    FIREWALL_BASE_PRICE: 500,
    FIREWALL_PRICE_MULTIPLIER: 1.2,
    BASE_DEFENSE: 100,
    
    // PVP Settings
    HACK_COOLDOWN: 3600, // 1 hour in seconds
    HACK_SUCCESS_RATE_BASE: 0.5,
    MAX_STEAL_PERCENTAGE: 0.1, // 10% of target's balance
    
    // Energy Settings
    MAX_ENERGY: 1000,
    ENERGY_REFILL_INTERVAL: 1000, // 1 second
  },
  
  // Security Configuration
  SECURITY: {
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: 100, // requests per window
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    JWT_EXPIRES_IN: '7d',
  }
};

// Validate required environment variables in production
if (config.NODE_ENV === 'production') {
  const required = ['BOT_TOKEN', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}

module.exports = config;
