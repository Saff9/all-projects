/**
 * Error Handling Middleware
 * Centralized error handling for the API
 */

const { ERROR_CODES } = require('../constants/game');
const config = require('../config');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', details = null) {
    super(404, ERROR_CODES.USER_NOT_FOUND, message, details);
  }
}

/**
 * Bad Request Error
 */
class BadRequestError extends ApiError {
  constructor(message = 'Invalid request', details = null) {
    super(400, ERROR_CODES.INVALID_INPUT, message, details);
  }
}

/**
 * Unauthorized Error
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details = null) {
    super(401, ERROR_CODES.INVALID_AUTH, message, details);
  }
}

/**
 * Forbidden Error
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details = null) {
    super(403, ERROR_CODES.COOLDOWN_ACTIVE, message, details);
  }
}

/**
 * Conflict Error
 */
class ConflictError extends ApiError {
  constructor(message = 'Conflict', details = null) {
    super(409, ERROR_CODES.SELF_HACK, message, details);
  }
}

/**
 * Insufficient Funds Error
 */
class InsufficientFundsError extends ApiError {
  constructor(message = 'Insufficient funds', details = null) {
    super(400, ERROR_CODES.INSUFFICIENT_FUNDS, message, details);
  }
}

/**
 * Insufficient Energy Error
 */
class InsufficientEnergyError extends ApiError {
  constructor(message = 'Insufficient energy', details = null) {
    super(400, ERROR_CODES.INSUFFICIENT_ENERGY, message, details);
  }
}

/**
 * Cooldown Error
 */
class CooldownError extends ApiError {
  constructor(remainingSeconds, message = 'Action on cooldown', details = null) {
    super(403, ERROR_CODES.COOLDOWN_ACTIVE, message, {
      ...details,
      remainingSeconds,
      retryAfter: remainingSeconds
    });
    this.remainingSeconds = remainingSeconds;
  }
}

/**
 * Main error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user ? req.user.id : 'anonymous'
  });

  // Handle ApiError
  if (err instanceof ApiError) {
    const response = {
      status: err.status,
      code: err.code,
      message: err.message,
      timestamp: new Date().toISOString()
    };

    if (err.details) {
      response.details = err.details;
    }

    // Add stack trace in development
    if (config.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    return res.status(err.status).json(response);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 400,
      code: ERROR_CODES.INVALID_INPUT,
      message: 'Validation error',
      details: err.errors || err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 400,
      code: ERROR_CODES.INVALID_INPUT,
      message: 'Invalid JSON in request body',
      timestamp: new Date().toISOString()
    });
  }

  // Handle database errors
  if (err.message && err.message.includes('Database')) {
    return res.status(500).json({
      status: 500,
      code: ERROR_CODES.DATABASE_ERROR,
      message: 'Database error occurred',
      timestamp: new Date().toISOString()
    });
  }

  // Default error response
  const status = err.status || 500;
  const response = {
    status,
    code: ERROR_CODES.INTERNAL_ERROR,
    message: config.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  };

  // Add stack trace in development
  if (config.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    status: 404,
    code: ERROR_CODES.USER_NOT_FOUND,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
}

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Request logger middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const user = req.user ? req.user.id : 'anonymous';
    
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path} | ${res.statusCode} | ${duration}ms | User: ${user}`);
  });
  
  next();
}

module.exports = {
  ApiError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  InsufficientFundsError,
  InsufficientEnergyError,
  CooldownError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  requestLogger
};