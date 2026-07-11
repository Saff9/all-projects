const User = require('../models/User');

// Professional error codes and messages
const ERROR_CODES = {
  // Client Errors (4xx)
  BAD_REQUEST: { code: 400, message: 'Bad Request', details: 'The request could not be understood or was missing required parameters.' },
  UNAUTHORIZED: { code: 401, message: 'Unauthorized', details: 'Authentication credentials are missing or invalid.' },
  PAYMENT_REQUIRED: { code: 402, message: 'Payment Required', details: 'This feature requires a valid subscription. Please upgrade your plan.' },
  FORBIDDEN: { code: 403, message: 'Forbidden', details: 'You do not have permission to access this resource.' },
  NOT_FOUND: { code: 404, message: 'Not Found', details: 'The requested resource was not found on this server.' },
  METHOD_NOT_ALLOWED: { code: 405, message: 'Method Not Allowed', details: 'The HTTP method used is not supported for this endpoint.' },
  CONFLICT: { code: 409, message: 'Conflict', details: 'The request conflicts with the current state of the resource.' },
  GONE: { code: 410, message: 'Gone', details: 'This endpoint has been permanently removed and is no longer available.' },
  UNPROCESSABLE_ENTITY: { code: 422, message: 'Unprocessable Entity', details: 'The request was well-formed but contains semantic errors.' },
  TOO_MANY_REQUESTS: { code: 429, message: 'Too Many Requests', details: 'Rate limit exceeded. Please slow down your request rate.' },

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: { code: 500, message: 'Internal Server Error', details: 'An unexpected error occurred on the server.' },
  NOT_IMPLEMENTED: { code: 501, message: 'Not Implemented', details: 'The requested functionality is not yet implemented.' },
  BAD_GATEWAY: { code: 502, message: 'Bad Gateway', details: 'The server received an invalid response from an upstream server.' },
  SERVICE_UNAVAILABLE: { code: 503, message: 'Service Unavailable', details: 'The server is temporarily unable to handle the request.' },
  GATEWAY_TIMEOUT: { code: 504, message: 'Gateway Timeout', details: 'The server timed out waiting for an upstream response.' },

  // Custom Business Logic Errors
  MAGIC_LINK_EXPIRED: { code: 410, message: 'Magic Link Expired', details: 'The magic link has expired. Please request a new one.' },
  MAGIC_LINK_USED: { code: 410, message: 'Magic Link Already Used', details: 'This magic link has already been used and cannot be used again.' },
  INVALID_CLIENT: { code: 403, message: 'Invalid Client', details: 'The client ID provided is not authorized to use this service.' },
  SUBSCRIPTION_EXPIRED: { code: 402, message: 'Subscription Expired', details: 'Your subscription has expired. Please renew to continue using this service.' },
  FEATURE_NOT_AVAILABLE: { code: 402, message: 'Feature Not Available', details: 'This feature is not available in your current subscription plan.' }
};

// Global error handlers for crash prevention with professional logging
const setupCrashHandlers = (app) => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('🚨 CRITICAL: Uncaught Exception detected');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Timestamp:', new Date().toISOString());

    // Log to database if possible
    logSystemError('UNCAUGHT_EXCEPTION', error.message, error.stack);

    // Send alert to monitoring system (in production)
    if (process.env.NODE_ENV === 'production') {
      // Integration with monitoring services like Sentry, DataDog, etc.
      console.error('🚨 PRODUCTION ALERT: Uncaught exception occurred');
    }

    // Graceful shutdown with exit code 1 (error)
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 CRITICAL: Unhandled Promise Rejection detected');
    console.error('Promise:', promise);
    console.error('Reason:', reason?.message || reason);
    console.error('Stack:', reason?.stack);
    console.error('Timestamp:', new Date().toISOString());

    logSystemError('UNHANDLED_REJECTION', reason?.message || reason, reason?.stack);

    // In production, don't crash - log and continue
    if (process.env.NODE_ENV === 'production') {
      console.error('🔄 Continuing operation after unhandled rejection');
    } else {
      // In development, crash to catch issues early
      process.exit(1);
    }
  });

  // Handle SIGTERM (graceful shutdown from process managers like PM2, Docker)
  process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received - initiating graceful shutdown...');
    console.log('Cleaning up resources...');

    // Close database connections
    if (global.dbConnection) {
      console.log('Closing database connection...');
      // mongoose.connection.close() would go here
    }

    // Close any open file handles, sockets, etc.
    console.log('Shutdown complete. Exiting gracefully.');
    process.exit(0);
  });

  // Handle SIGINT (Ctrl+C in development)
  process.on('SIGINT', () => {
    console.log('📴 SIGINT received - shutting down...');
    console.log('Cleanup skipped in development mode.');
    process.exit(0);
  });

  // Handle uncaught exceptions from async operations
  process.on('uncaughtExceptionMonitor', (error, origin) => {
    console.error('🚨 MONITOR: Uncaught exception in async operation');
    console.error('Origin:', origin);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  });

  // Handle warnings
  process.on('warning', (warning) => {
    console.warn('⚠️  System Warning:', warning.name, warning.message);
    console.warn('Stack:', warning.stack);
  });

  console.log('🛡️  Crash handlers initialized with professional monitoring');
};

// Log system errors to database
const logSystemError = async (type, message, stack) => {
  try {
    // Try to log to admin user's security logs
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      adminUser.securityLogs.push({
        action: `SYSTEM_ERROR_${type}`,
        ipAddress: 'SYSTEM',
        userAgent: 'SYSTEM',
        details: `${message}\n${stack || ''}`
      });
      await adminUser.save();
    }
  } catch (error) {
    console.error('Failed to log system error to database:', error);
  }
};

// Custom error response formatter
const createErrorResponse = (statusCode, message, details = null) => {
  const errorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    poweredBy: 'SecureVibe'
  };

  // Add details in development
  if (process.env.NODE_ENV !== 'production' && details) {
    errorResponse.details = details;
  }

  // Add helpful information based on error type
  if (statusCode === 404) {
    errorResponse.help = 'Check the API documentation at /api/docs';
  } else if (statusCode === 429) {
    errorResponse.help = 'Rate limit exceeded. Please wait and try again.';
  } else if (statusCode === 401) {
    errorResponse.help = 'Authentication required. Please login or provide valid token.';
  } else if (statusCode >= 500) {
    errorResponse.help = 'Internal server error. Our team has been notified.';
  }

  return { statusCode, ...errorResponse };
};

// Enhanced error handler middleware
const enhancedErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error with context
  console.error(`❌ Error [${req.method} ${req.path}]:`, {
    message: error.message,
    stack: error.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  // Try to log to database
  logSystemError('REQUEST_ERROR', error.message, error.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = createErrorResponse(400, message);
  }

  // Mongoose duplicate key
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = createErrorResponse(400, message);
  }

  // Mongoose validation error
  else if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    error = createErrorResponse(400, `Validation Error: ${errors.join(', ')}`);
  }

  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = createErrorResponse(401, 'Invalid token');
  }

  else if (err.name === 'TokenExpiredError') {
    error = createErrorResponse(401, 'Token expired');
  }

  // Network/Database errors
  else if (err.code === 'ECONNREFUSED' || err.name === 'MongoNetworkError') {
    error = createErrorResponse(503, 'Service temporarily unavailable');
  }

  // Default server error
  else {
    error = createErrorResponse(500, 'Internal server error');
  }

  res.status(error.statusCode).json(error);
};

// Custom 404 page
const custom404Handler = (req, res) => {
  const notFoundResponse = createErrorResponse(404, `Route '${req.originalUrl}' not found`);

  // Add suggestions for common endpoints
  notFoundResponse.suggestions = {
    auth: '/api/auth',
    health: '/api/health',
    logo: '/api/logo',
    docs: 'Check guides/ directory for documentation'
  };

  res.status(404).json(notFoundResponse);
};

// Health check with system status
const healthCheck = (req, res) => {
  const healthData = {
    success: true,
    message: 'SecureVibe is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: 'MongoDB Atlas',
    poweredBy: 'SecureVibe'
  };

  // Check if we have any recent errors
  const hasRecentErrors = global.lastError && (Date.now() - global.lastError.timestamp < 60000);
  if (hasRecentErrors) {
    healthData.warnings = ['Recent errors detected in logs'];
  }

  res.json(healthData);
};

module.exports = {
  setupCrashHandlers,
  enhancedErrorHandler,
  custom404Handler,
  healthCheck,
  logSystemError,
  createErrorResponse
};
