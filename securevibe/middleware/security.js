const crypto = require('crypto');
const User = require('../models/User');
const { ErrorFactory } = require('../utils/errorHandler');

// Request signing verification (optional advanced security)
const verifyRequestSignature = (req, res, next) => {
  const signature = req.headers['x-request-signature'];
  const timestamp = req.headers['x-timestamp'];
  const apiKey = req.headers['x-api-key'];

  if (!signature || !timestamp || !apiKey) {
    // Optional: can be made required for enterprise clients
    return next();
  }

  // Verify timestamp (prevent replay attacks - 5 minute window)
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    return res.status(401).json({
      success: false,
      message: 'Request timestamp expired',
      poweredBy: 'SecureVibe'
    });
  }

  // Find user by API key
  User.findOne({ apiKey }).then(user => {
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key',
        poweredBy: 'SecureVibe'
      });
    }

    // Create signature: HMAC-SHA256 of (timestamp + request body + secret)
    const payload = timestamp + JSON.stringify(req.body || {});
    const expectedSignature = crypto
      .createHmac('sha256', user.apiKey) // Using API key as secret for simplicity
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      // Log suspicious activity
      user.securityLogs.push({
        action: 'INVALID_SIGNATURE',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: 'Request signature verification failed'
      });
      user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid request signature',
        poweredBy: 'SecureVibe'
      });
    }

    req.verifiedUser = user;
    next();
  }).catch(next);
};

// Suspicious activity detection
const detectSuspiciousActivity = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || '';
  const path = req.path;

  // Check for common attack patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /eval\(/i,  // Code injection
    /base64/i,  // Encoded attacks
  ];

  const isSuspicious = suspiciousPatterns.some(pattern =>
    pattern.test(req.url) ||
    pattern.test(JSON.stringify(req.body || {})) ||
    pattern.test(JSON.stringify(req.query || {}))
  );

  if (isSuspicious) {
    console.warn(`🚨 Suspicious activity detected: ${ip} - ${userAgent} - ${path}`);

    // Could implement IP blocking here
    // For now, just log and continue with enhanced monitoring
    req.suspiciousActivity = true;
  }

  // Track rapid requests from same IP (basic DoS protection)
  if (!global.requestTracker) {
    global.requestTracker = new Map();
  }

  const key = `${ip}-${path}`;
  const now = Date.now();
  const window = 60 * 1000; // 1 minute window
  const limit = 30; // 30 requests per minute per endpoint

  if (!global.requestTracker.has(key)) {
    global.requestTracker.set(key, { count: 1, firstRequest: now });
  } else {
    const data = global.requestTracker.get(key);
    if (now - data.firstRequest > window) {
      // Reset window
      data.count = 1;
      data.firstRequest = now;
    } else {
      data.count++;
      if (data.count > limit) {
        console.warn(`🚨 Rate limit exceeded: ${ip} - ${path}`);
        const error = ErrorFactory.rateLimitExceeded({ ip, path });
        return res.status(error.code).json(error.toResponse());
      }
    }
  }

  next();
};

// Advanced rate limiting per user
const userRateLimit = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return next(); // Skip if no API key (public endpoints)
  }

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      return next();
    }

    // Different limits based on subscription
    const limits = {
      free: { requests: 100, windowMs: 15 * 60 * 1000 }, // 100 per 15min
      paid: { requests: 1000, windowMs: 15 * 60 * 1000 }  // 1000 per 15min
    };

    const userLimit = user.isPaid ? limits.paid : limits.free;

    if (!global.userRequestTracker) {
      global.userRequestTracker = new Map();
    }

    const key = `user_${user._id}`;
    const now = Date.now();

    if (!global.userRequestTracker.has(key)) {
      global.userRequestTracker.set(key, {
        count: 1,
        firstRequest: now,
        limit: userLimit.requests,
        windowMs: userLimit.windowMs
      });
    } else {
      const data = global.userRequestTracker.get(key);

      if (now - data.firstRequest > data.windowMs) {
        // Reset window
        data.count = 1;
        data.firstRequest = now;
      } else {
        data.count++;
        if (data.count > data.limit) {
          const error = user.isPaid
            ? ErrorFactory.usageLimitExceeded({ userId: user._id })
            : ErrorFactory.subscriptionRequired({ userId: user._id });
          return res.status(error.code).json(error.toResponse());
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Performance monitoring
const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const path = req.path;
    const status = res.statusCode;

    // Log slow requests (>1 second)
    if (duration > 1000) {
      console.warn(`🐌 Slow request: ${method} ${path} - ${duration}ms - Status: ${status}`);
    }

    // Log error responses
    if (status >= 400) {
      console.error(`❌ Error response: ${method} ${path} - Status: ${status} - ${duration}ms`);
    }
  });

  next();
};

module.exports = {
  verifyRequestSignature,
  detectSuspiciousActivity,
  userRateLimit,
  performanceMonitor
};
