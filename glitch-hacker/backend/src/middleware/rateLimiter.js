/**
 * Rate Limiting Middleware
 * Prevents abuse of API endpoints
 */

const { RATE_LIMITS, ERROR_CODES } = require('../constants/game');

// In-memory store for rate limiting
// In production, use Redis or similar
const rateLimitStore = new Map();

/**
 * Clean up old entries from rate limit store
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Check if request is within rate limit
 * @param {string} key - Unique identifier (user ID + endpoint)
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum requests allowed
 * @returns {Object} Rate limit status
 */
function checkRateLimit(key, windowMs, maxRequests) {
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  const data = rateLimitStore.get(key);
  
  // Reset if window has passed
  if (now > data.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  // Check if limit exceeded
  if (data.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((data.resetTime - now) / 1000)
    };
  }
  
  // Increment counter
  data.count++;
  return { allowed: true, remaining: maxRequests - data.count };
}

/**
 * Create rate limiter middleware
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = RATE_LIMITS.API.windowMs,
    maxRequests = RATE_LIMITS.API.maxRequests,
    keyGenerator = (req) => req.user ? req.user.id : req.ip,
    skipSuccessfulRequests = false
  } = options;
  
  return (req, res, next) => {
    const key = `${keyGenerator(req)}:${req.path}`;
    const result = checkRateLimit(key, windowMs, maxRequests);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining));
    
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        status: 429,
        code: ERROR_CODES.RATE_LIMITED,
        message: 'Too many requests',
        retryAfter: result.retryAfter
      });
    }
    
    // If skipping successful requests, decrement on success
    if (skipSuccessfulRequests) {
      const originalJson = res.json;
      res.json = function(body) {
        if (res.statusCode < 400) {
          const data = rateLimitStore.get(key);
          if (data) {
            data.count = Math.max(0, data.count - 1);
          }
        }
        return originalJson.call(this, body);
      };
    }
    
    next();
  };
}

/**
 * Click rate limiter
 * Limits clicks per second to prevent autoclickers
 */
const clickRateLimiter = createRateLimiter({
  windowMs: RATE_LIMITS.CLICKS.windowMs,
  maxRequests: RATE_LIMITS.CLICKS.maxRequests,
  keyGenerator: (req) => req.user ? req.user.id : req.ip
});

/**
 * Hack rate limiter
 * Limits hack attempts (1 per 5 minutes)
 */
const hackRateLimiter = createRateLimiter({
  windowMs: RATE_LIMITS.HACKS.windowMs,
  maxRequests: RATE_LIMITS.HACKS.maxRequests,
  keyGenerator: (req) => req.user ? req.user.id : req.ip
});

/**
 * API rate limiter
 * General API rate limiting
 */
const apiRateLimiter = createRateLimiter({
  windowMs: RATE_LIMITS.API.windowMs,
  maxRequests: RATE_LIMITS.API.maxRequests,
  keyGenerator: (req) => req.user ? req.user.id : req.ip
});

/**
 * Specific endpoint rate limiter
 * For custom limits on specific routes
 */
function specificRateLimiter(windowMs, maxRequests) {
  return createRateLimiter({ windowMs, maxRequests });
}

module.exports = {
  createRateLimiter,
  clickRateLimiter,
  hackRateLimiter,
  apiRateLimiter,
  specificRateLimiter,
  checkRateLimit
};