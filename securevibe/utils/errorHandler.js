/**
 * SecureVibe Professional Error Handler
 * ====================================
 *
 * Enterprise-grade error handling with security considerations,
 * proper HTTP status codes, and comprehensive logging.
 *
 * Features:
 * - Professional error codes (400, 402, 503, etc.)
 * - Security-aware error responses
 * - Rate limiting integration
 * - Audit logging
 * - Client-safe error messages
 *
 * @version 1.0.0
 * @author SecureVibe Engineering Team
 */

// Professional error definitions with security considerations
const ERRORS = {
  // Authentication Errors (400-403)
  INVALID_CREDENTIALS: {
    code: 401,
    message: 'Invalid credentials provided',
    details: 'The email or password you entered is incorrect.',
    category: 'AUTHENTICATION'
  },

  ACCOUNT_LOCKED: {
    code: 423,
    message: 'Account temporarily locked',
    details: 'Your account has been locked due to multiple failed login attempts. Please try again later.',
    category: 'AUTHENTICATION'
  },

  EMAIL_NOT_VERIFIED: {
    code: 403,
    message: 'Email verification required',
    details: 'Please verify your email address before logging in.',
    category: 'AUTHENTICATION'
  },

  TOKEN_EXPIRED: {
    code: 401,
    message: 'Authentication token expired',
    details: 'Your session has expired. Please log in again.',
    category: 'AUTHENTICATION'
  },

  INVALID_TOKEN: {
    code: 401,
    message: 'Invalid authentication token',
    details: 'The provided token is invalid or malformed.',
    category: 'AUTHENTICATION'
  },

  // Business Logic Errors (402, 409, 410)
  SUBSCRIPTION_REQUIRED: {
    code: 402,
    message: 'Subscription required',
    details: 'This feature requires an active subscription. Please upgrade your plan.',
    category: 'SUBSCRIPTION',
    upgradeUrl: '/pricing'
  },

  SUBSCRIPTION_EXPIRED: {
    code: 402,
    message: 'Subscription expired',
    details: 'Your subscription has expired. Please renew to continue using this service.',
    category: 'SUBSCRIPTION',
    upgradeUrl: '/pricing'
  },

  FEATURE_NOT_AVAILABLE: {
    code: 402,
    message: 'Feature not available',
    details: 'This feature is not included in your current subscription plan.',
    category: 'SUBSCRIPTION',
    upgradeUrl: '/pricing'
  },

  USAGE_LIMIT_EXCEEDED: {
    code: 429,
    message: 'Usage limit exceeded',
    details: 'You have exceeded your monthly usage limit. Please upgrade or wait until next month.',
    category: 'USAGE',
    upgradeUrl: '/pricing'
  },

  RESOURCE_CONFLICT: {
    code: 409,
    message: 'Resource conflict',
    details: 'The requested operation conflicts with existing data.',
    category: 'BUSINESS_LOGIC'
  },

  ENDPOINT_DEPRECATED: {
    code: 410,
    message: 'Endpoint deprecated',
    details: 'This endpoint has been permanently removed. Please use the updated API.',
    category: 'API_VERSION'
  },

  // Magic Link Specific Errors
  MAGIC_LINK_EXPIRED: {
    code: 410,
    message: 'Magic link expired',
    details: 'This magic link has expired for security reasons. Please request a new one.',
    category: 'MAGIC_LINK'
  },

  MAGIC_LINK_USED: {
    code: 410,
    message: 'Magic link already used',
    details: 'This magic link has already been used and cannot be used again.',
    category: 'MAGIC_LINK'
  },

  MAGIC_LINK_INVALID: {
    code: 400,
    message: 'Invalid magic link',
    details: 'The magic link format is invalid or corrupted.',
    category: 'MAGIC_LINK'
  },

  // Client Errors (400-422)
  INVALID_INPUT: {
    code: 400,
    message: 'Invalid input provided',
    details: 'Please check your input and try again.',
    category: 'VALIDATION'
  },

  MISSING_REQUIRED_FIELD: {
    code: 400,
    message: 'Required field missing',
    details: 'A required field is missing from your request.',
    category: 'VALIDATION'
  },

  INVALID_EMAIL_FORMAT: {
    code: 400,
    message: 'Invalid email format',
    details: 'Please provide a valid email address.',
    category: 'VALIDATION'
  },

  PASSWORD_TOO_WEAK: {
    code: 400,
    message: 'Password too weak',
    details: 'Password must be at least 6 characters long and contain a mix of letters and numbers.',
    category: 'VALIDATION'
  },

  INVALID_CLIENT_ID: {
    code: 403,
    message: 'Invalid client configuration',
    details: 'The client ID provided is not authorized to use this service.',
    category: 'CLIENT_AUTH'
  },

  // Server Errors (500-504)
  INTERNAL_ERROR: {
    code: 500,
    message: 'Internal server error',
    details: 'An unexpected error occurred. Our team has been notified.',
    category: 'SERVER_ERROR'
  },

  SERVICE_UNAVAILABLE: {
    code: 503,
    message: 'Service temporarily unavailable',
    details: 'The service is temporarily down for maintenance. Please try again in a few minutes.',
    category: 'SERVER_ERROR'
  },

  DATABASE_ERROR: {
    code: 503,
    message: 'Database temporarily unavailable',
    details: 'Unable to connect to database. Please try again.',
    category: 'SERVER_ERROR'
  },

  EMAIL_SERVICE_ERROR: {
    code: 503,
    message: 'Email service temporarily unavailable',
    details: 'Unable to send email at this time. Please try again later.',
    category: 'SERVER_ERROR'
  },

  EXTERNAL_SERVICE_ERROR: {
    code: 502,
    message: 'External service error',
    details: 'A required external service is currently unavailable.',
    category: 'SERVER_ERROR'
  },

  RATE_LIMIT_EXCEEDED: {
    code: 429,
    message: 'Rate limit exceeded',
    details: 'Too many requests. Please slow down and try again later.',
    category: 'RATE_LIMIT',
    retryAfter: 60
  }
};

/**
 * Professional Error Handler Class
 */
class SecureVibeError extends Error {
  constructor(errorType, customDetails = null, metadata = {}) {
    const errorConfig = ERRORS[errorType];

    if (!errorConfig) {
      throw new Error(`Unknown error type: ${errorType}`);
    }

    super(errorConfig.message);
    this.name = 'SecureVibeError';
    this.code = errorConfig.code;
    this.category = errorConfig.category;
    this.details = customDetails || errorConfig.details;
    this.upgradeUrl = errorConfig.upgradeUrl;
    this.retryAfter = errorConfig.retryAfter;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, SecureVibeError);
  }

  /**
   * Convert to API response format
   */
  toResponse(includeDetails = false) {
    const response = {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        category: this.category,
        timestamp: this.timestamp
      },
      poweredBy: 'SecureVibe'
    };

    // Add upgrade URL if applicable
    if (this.upgradeUrl) {
      response.error.upgradeUrl = this.upgradeUrl;
    }

    // Add retry information for rate limits
    if (this.retryAfter) {
      response.error.retryAfter = this.retryAfter;
    }

    // Add details in development or for specific error types
    if (includeDetails || process.env.NODE_ENV !== 'production') {
      response.error.details = this.details;
    }

    // Add helpful suggestions based on error type
    response.error.suggestions = this.getSuggestions();

    return response;
  }

  /**
   * Get helpful suggestions based on error type
   */
  getSuggestions() {
    const suggestions = [];

    switch (this.category) {
      case 'AUTHENTICATION':
        suggestions.push('Try logging in again with correct credentials');
        suggestions.push('Reset your password if you forgot it');
        break;

      case 'SUBSCRIPTION':
        suggestions.push('Check your current subscription status');
        suggestions.push('Contact support to upgrade your plan');
        break;

      case 'VALIDATION':
        suggestions.push('Check the API documentation for correct parameter format');
        suggestions.push('Ensure all required fields are provided');
        break;

      case 'MAGIC_LINK':
        suggestions.push('Request a new magic link');
        suggestions.push('Check that you clicked the complete link');
        break;

      case 'RATE_LIMIT':
        suggestions.push('Wait a few minutes before trying again');
        suggestions.push('Consider upgrading to a higher tier for more requests');
        break;

      case 'SERVER_ERROR':
        suggestions.push('Try again in a few minutes');
        suggestions.push('Check our status page for service updates');
        break;
    }

    return suggestions;
  }

  /**
   * Log error with security considerations
   */
  log(req = null) {
    const logData = {
      timestamp: this.timestamp,
      error: this.name,
      code: this.code,
      message: this.message,
      category: this.category,
      details: this.details,
      metadata: this.metadata
    };

    // Add request context if available
    if (req) {
      logData.request = {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        clientId: req.headers['x-client-id'] || 'unknown'
      };

      // Never log sensitive data like passwords or full tokens
      if (req.body && typeof req.body === 'object') {
        const safeBody = { ...req.body };
        delete safeBody.password;
        delete safeBody.token;
        delete safeBody.refreshToken;
        logData.request.body = safeBody;
      }
    }

    // Log based on severity
    if (this.code >= 500) {
      console.error('🚨 CRITICAL ERROR:', logData);
    } else if (this.code >= 400 && this.code < 500) {
      console.warn('⚠️  CLIENT ERROR:', logData);
    } else {
      console.info('ℹ️  INFO:', logData);
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service (Sentry, DataDog, etc.)
      // This would integrate with your monitoring stack
    }

    return logData;
  }
}

/**
 * Express middleware for handling SecureVibe errors
 */
const errorMiddleware = (err, req, res, next) => {
  // Handle SecureVibe errors
  if (err instanceof SecureVibeError) {
    // Log the error
    err.log(req);

    // Set appropriate headers
    res.status(err.code);

    if (err.retryAfter) {
      res.set('Retry-After', err.retryAfter);
    }

    // Send response
    const includeDetails = process.env.NODE_ENV !== 'production' || req.headers['x-debug'] === 'true';
    return res.json(err.toResponse(includeDetails));
  }

  // Handle other types of errors
  console.error('Unhandled error:', err);

  // Don't expose internal error details in production
  const response = {
    success: false,
    error: {
      code: 500,
      message: 'An unexpected error occurred',
      category: 'SERVER_ERROR',
      timestamp: new Date().toISOString()
    },
    poweredBy: 'SecureVibe'
  };

  if (process.env.NODE_ENV !== 'production') {
    response.error.details = err.message;
    response.error.stack = err.stack;
  }

  res.status(500).json(response);
};

/**
 * Utility functions for creating specific errors
 */
const ErrorFactory = {
  // Authentication errors
  invalidCredentials: (metadata = {}) =>
    new SecureVibeError('INVALID_CREDENTIALS', null, metadata),

  accountLocked: (metadata = {}) =>
    new SecureVibeError('ACCOUNT_LOCKED', null, metadata),

  emailNotVerified: (metadata = {}) =>
    new SecureVibeError('EMAIL_NOT_VERIFIED', null, metadata),

  tokenExpired: (metadata = {}) =>
    new SecureVibeError('TOKEN_EXPIRED', null, metadata),

  invalidToken: (metadata = {}) =>
    new SecureVibeError('INVALID_TOKEN', null, metadata),

  // Subscription errors
  subscriptionRequired: (metadata = {}) =>
    new SecureVibeError('SUBSCRIPTION_REQUIRED', null, metadata),

  subscriptionExpired: (metadata = {}) =>
    new SecureVibeError('SUBSCRIPTION_EXPIRED', null, metadata),

  featureNotAvailable: (metadata = {}) =>
    new SecureVibeError('FEATURE_NOT_AVAILABLE', null, metadata),

  usageLimitExceeded: (metadata = {}) =>
    new SecureVibeError('USAGE_LIMIT_EXCEEDED', null, metadata),

  // Magic link errors
  magicLinkExpired: (metadata = {}) =>
    new SecureVibeError('MAGIC_LINK_EXPIRED', null, metadata),

  magicLinkUsed: (metadata = {}) =>
    new SecureVibeError('MAGIC_LINK_USED', null, metadata),

  magicLinkInvalid: (metadata = {}) =>
    new SecureVibeError('MAGIC_LINK_INVALID', null, metadata),

  // Validation errors
  invalidInput: (details, metadata = {}) =>
    new SecureVibeError('INVALID_INPUT', details, metadata),

  missingRequiredField: (field, metadata = {}) =>
    new SecureVibeError('MISSING_REQUIRED_FIELD', `Field '${field}' is required`, metadata),

  invalidEmailFormat: (metadata = {}) =>
    new SecureVibeError('INVALID_EMAIL_FORMAT', null, metadata),

  passwordTooWeak: (metadata = {}) =>
    new SecureVibeError('PASSWORD_TOO_WEAK', null, metadata),

  // Client errors
  invalidClientId: (metadata = {}) =>
    new SecureVibeError('INVALID_CLIENT_ID', null, metadata),

  // Server errors
  internalError: (details, metadata = {}) =>
    new SecureVibeError('INTERNAL_ERROR', details, metadata),

  serviceUnavailable: (details, metadata = {}) =>
    new SecureVibeError('SERVICE_UNAVAILABLE', details, metadata),

  databaseError: (metadata = {}) =>
    new SecureVibeError('DATABASE_ERROR', null, metadata),

  emailServiceError: (metadata = {}) =>
    new SecureVibeError('EMAIL_SERVICE_ERROR', null, metadata),

  externalServiceError: (metadata = {}) =>
    new SecureVibeError('EXTERNAL_SERVICE_ERROR', null, metadata),

  // Rate limiting
  rateLimitExceeded: (metadata = {}) =>
    new SecureVibeError('RATE_LIMIT_EXCEEDED', null, metadata)
};

module.exports = {
  SecureVibeError,
  ErrorFactory,
  errorMiddleware,
  ERRORS
};
