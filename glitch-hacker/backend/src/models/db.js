const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');

/**
 * File-Based Database System
 * Provides CRUD operations with atomic writes and proper error handling
 */

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(config.DATA_DIR)) {
    fs.mkdirSync(config.DATA_DIR, { recursive: true });
  }
}

// Initialize database files if they don't exist
function initDatabase() {
  ensureDataDir();

  const files = {
    [config.USERS_DB]: { users: [] },
    [config.HACKLOGS_DB]: { logs: [] }
  };

  for (const [filePath, defaultData] of Object.entries(files)) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
    }
  }
}

// Atomic write operation using temp file and rename
function atomicWrite(filePath, data) {
  const tempPath = `${filePath}.tmp.${Date.now()}.${crypto.randomBytes(4).toString('hex')}`;
  
  try {
    // Write to temp file
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    
    // Atomic rename
    fs.renameSync(tempPath, filePath);
    
    return true;
  } catch (error) {
    // Clean up temp file on error
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

// Read JSON file with error handling
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    throw new Error(`Database read error: ${error.message}`);
  }
}

// Write JSON file with atomic operation
function writeJSON(filePath, data) {
  try {
    ensureDataDir();
    return atomicWrite(filePath, data);
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    throw new Error(`Database write error: ${error.message}`);
  }
}

/**
 * Users Database Operations
 */
const usersDB = {
  // Get all users
  getAll() {
    const data = readJSON(config.USERS_DB);
    return data ? data.users : [];
  },

  // Find user by Telegram ID
  findById(id) {
    const users = this.getAll();
    return users.find(user => user.id === id) || null;
  },

  // Find user by username
  findByUsername(username) {
    const users = this.getAll();
    return users.find(user => user.username === username) || null;
  },

  // Create new user
  create(userData) {
    const data = readJSON(config.USERS_DB) || { users: [] };
    
    // Check if user already exists
    if (data.users.find(u => u.id === userData.id)) {
      throw new Error('User already exists');
    }

    const newUser = {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.users.push(newUser);
    writeJSON(config.USERS_DB, data);
    
    return newUser;
  },

  // Update user
  update(id, updates) {
    const data = readJSON(config.USERS_DB);
    if (!data) throw new Error('Database not found');

    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    data.users[index] = {
      ...data.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    writeJSON(config.USERS_DB, data);
    return data.users[index];
  },

  // Delete user
  delete(id) {
    const data = readJSON(config.USERS_DB);
    if (!data) throw new Error('Database not found');

    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    const deleted = data.users.splice(index, 1)[0];
    writeJSON(config.USERS_DB, data);
    
    return deleted;
  },

  // Get leaderboard (top users by totalHacked)
  getLeaderboard(limit = 10, offset = 0) {
    const users = this.getAll();
    
    const sorted = users
      .map(user => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        totalHacked: user.pvp?.hacksSuccessful || 0,
        bitz: user.bitz,
        totalEarned: user.totalEarned
      }))
      .sort((a, b) => b.totalHacked - a.totalHacked)
      .slice(offset, offset + limit);

    return {
      users: sorted,
      total: users.length
    };
  }
};

/**
 * Hack Logs Database Operations
 */
const hackLogsDB = {
  // Get all logs
  getAll() {
    const data = readJSON(config.HACKLOGS_DB);
    return data ? data.logs : [];
  },

  // Get logs by attacker ID
  getByAttacker(attackerId, limit = 20, offset = 0) {
    const logs = this.getAll();
    const filtered = logs
      .filter(log => log.attackerId === attackerId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + limit);
    
    return {
      logs: filtered,
      total: logs.filter(log => log.attackerId === attackerId).length
    };
  },

  // Get logs by defender ID
  getByDefender(defenderId, limit = 20, offset = 0) {
    const logs = this.getAll();
    const filtered = logs
      .filter(log => log.defenderId === defenderId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + limit);
    
    return {
      logs: filtered,
      total: logs.filter(log => log.defenderId === defenderId).length
    };
  },

  // Get logs for a user (both attacker and defender)
  getByUser(userId, type = 'all', limit = 20, offset = 0) {
    const logs = this.getAll();
    let filtered = logs;

    if (type === 'incoming') {
      filtered = logs.filter(log => log.defenderId === userId);
    } else if (type === 'outgoing') {
      filtered = logs.filter(log => log.attackerId === userId);
    } else {
      filtered = logs.filter(log => log.attackerId === userId || log.defenderId === userId);
    }

    const sorted = filtered
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + limit);

    return {
      logs: sorted,
      total: filtered.length
    };
  },

  // Create new hack log
  create(logData) {
    const data = readJSON(config.HACKLOGS_DB) || { logs: [] };
    
    const newLog = {
      id: `hack_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      ...logData,
      serverTimestamp: new Date().toISOString()
    };

    data.logs.push(newLog);
    writeJSON(config.HACKLOGS_DB, data);
    
    return newLog;
  },

  // Get recent logs (for admin/debugging)
  getRecent(limit = 50) {
    const logs = this.getAll();
    return logs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
};

// Initialize database on module load
initDatabase();

module.exports = {
  usersDB,
  hackLogsDB,
  initDatabase,
  readJSON,
  writeJSON
};