const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        poweredBy: 'SecureVibe'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
      poweredBy: 'SecureVibe'
    });
  }
};

// Check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized as an admin',
      poweredBy: 'SecureVibe'
    });
  }
};

// Check API key for external requests
const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required',
      poweredBy: 'SecureVibe'
    });
  }

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
        poweredBy: 'SecureVibe'
      });
    }

    // Check if user is paid or within free limit
    // For now, allow all
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      poweredBy: 'SecureVibe'
    });
  }
};

module.exports = { protect, admin, apiKeyAuth };
