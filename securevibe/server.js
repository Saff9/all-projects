const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const passport = require('passport');

/**
 * Validates critical environment variables for security
 * @throws {Error} If required environment variables are missing or invalid
 */
function validateEnvironmentVariables() {
  const required = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }

  // Optional: Validate email settings if provided
  if (process.env.EMAIL_USER && !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_PASS is required when EMAIL_USER is provided');
  }

  console.log('✅ Environment variables validated successfully');
}

// Load and validate environment variables
dotenv.config();
validateEnvironmentVariables();

// Note: We don't connect to a database since clients use their own databases
// All authentication is handled via magic links and tokens without storing user data
// This ensures privacy and compliance - we never see or store client user data
console.log('🔒 SecureVibe running in zero-data mode - clients manage their own databases');

// Initialize keep-alive for Render free tier (only in production)
const keepAlive = require('./utils/keepAlive');
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  keepAlive();
}

// Setup crash handlers for production stability
const { setupCrashHandlers } = require('./middleware/crashHandler');
setupCrashHandlers();

// Import professional error handler
const { errorMiddleware } = require('./utils/errorHandler');

// Passport config
require('./config/passport')(passport);

const app = express();

// Trust proxy for proper IP detection behind load balancers
app.set('trust proxy', 1);

// Security middleware - Enhanced CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://via.placeholder.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Compression middleware
app.use(compression());

// Strict rate limiting - More secure defaults
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Reduced from 100 - more secure
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    poweredBy: 'SecureVibe'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' // Allow localhost for health checks
});

app.use(limiter);

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parser with secure limits
app.use(express.json({
  limit: '1mb', // Reduced from 10mb for security
  strict: true,
  verify: (req, res, buf) => {
    // Prevent overly large payloads
    if (buf.length > 1024 * 1024) { // 1MB limit
      throw new Error('Request entity too large');
    }
  }
}));

app.use(express.urlencoded({
  extended: false, // More secure than extended: true
  limit: '1mb'
}));

// Advanced security middleware
const { detectSuspiciousActivity, userRateLimit, performanceMonitor } = require('./middleware/security');
app.use(detectSuspiciousActivity);
app.use(userRateLimit);
app.use(performanceMonitor);

// Passport middleware
app.use(passport.initialize());

// Serve static files (interface)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/analytics', require('./routes/analytics'));

// Captcha endpoint
app.get('/api/captcha', require('./middleware/captcha').generateCaptcha);

// Health check
const { healthCheck } = require('./middleware/crashHandler');
app.get('/api/health', healthCheck);

// Status endpoint for keep-alive
app.get('/api/auth/status', (req, res) => {
  res.json({
    success: true,
    message: 'SecureVibe Auth Service Status: ACTIVE',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    poweredBy: 'SecureVibe'
  });
});

// Custom logo/icon endpoint
app.get('/api/logo', (req, res) => {
  const logo = `
 ███████╗███████╗ ██████╗██╗   ██╗██████╗ ███████╗██╗   ██╗██╗██████╗ ███████╗
 ██╔════╝██╔════╝██╔════╝██║   ██║██╔══██╗██╔════╝██║   ██║██║██╔══██╗██╔════╝
 ███████╗█████╗  ██║     ██║   ██║██████╔╝█████╗  ██║   ██║██║██████╔╝█████╗
 ╚════██║██╔══╝  ██║     ██║   ██║██╔══██╗██╔══╝  ╚██╗ ██╔╝██║██╔══██╗██╔══╝
 ███████║███████╗╚██████╗╚██████╔╝██║  ██║███████╗ ╚████╔╝ ██║██████╔╝███████╗
 ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝  ╚═══╝  ╚═╝╚═════╝ ╚══════╝

                    🔐 Enterprise Authentication Service 🔐
                          Protected by SecureVibe
  `;
  res.type('text/plain').send(logo);
});

// 404 handler
const { custom404Handler } = require('./middleware/crashHandler');
app.use('*', custom404Handler);

// Professional error handler with proper HTTP status codes
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SecureVibe server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
