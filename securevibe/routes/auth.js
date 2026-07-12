const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Joi = require('joi');
const nodemailer = require('nodemailer');
const passport = require('passport');
const { ErrorFactory } = require('../utils/errorHandler');

// Note: No database operations - this is a zero-data authentication service
// All user data is managed by clients in their own databases

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  captchaId: Joi.string().required(),
  captcha: Joi.string().min(4).max(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const newPasswordSchema = Joi.object({
  password: Joi.string().min(6).required()
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

// Email transporter - FIXED: createTransport (not createTransporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Generate custom branded magic link email
 */
function generateMagicLinkEmail(email, magicLinkUrl, branding = {}) {
  const companyName = branding.companyName || 'SecureVibe';
  const appName = branding.appName || 'your app';
  const logoUrl = branding.logoUrl || 'https://via.placeholder.com/120x40/667eea/ffffff?text=' + encodeURIComponent(companyName);
  const primaryColor = branding.primaryColor || '#667eea';
  const secondaryColor = branding.secondaryColor || '#764ba2';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sign in to ${appName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #718096;
          margin-bottom: 30px;
        }
        .content {
          margin-bottom: 30px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-align: center;
          margin: 20px 0;
          box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.3);
          transition: transform 0.2s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        .warning {
          background: #fef5e7;
          border: 1px solid #f6ad55;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          color: #c05621;
        }
        .footer {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          margin-top: 30px;
          text-align: center;
          color: #718096;
          font-size: 14px;
        }
        .secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 20px;
          padding: 8px 16px;
          margin-top: 20px;
          color: #0c4a6e;
          font-size: 12px;
          font-weight: 600;
        }
        .secure-icon {
          font-size: 16px;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .container {
            padding: 20px;
          }
          .title {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="${companyName} Logo" class="logo">
          <h1 class="title">Sign in to ${appName}</h1>
          <p class="subtitle">Click the button below to securely sign in</p>
        </div>

        <div class="content">
          <p>Hello,</p>
          <p>You requested to sign in to ${appName}. Click the button below to complete your authentication:</p>

          <div style="text-align: center;">
            <a href="${magicLinkUrl}" class="cta-button">
              🔐 Sign In Securely
            </a>
          </div>

          <div class="warning">
            <strong>Security Notice:</strong> This link expires in 15 minutes and can only be used once. If you didn't request this sign-in, please ignore this email.
          </div>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f7fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 14px;">
            ${magicLinkUrl}
          </p>
        </div>

        <div class="footer">
          <p>This email was sent to <strong>${email}</strong> because someone requested to sign in to ${appName}.</p>
          <p>If you have any questions, please contact our support team.</p>

          <div class="secure-badge">
            <span class="secure-icon">🛡️</span>
            Protected by SecureVibe
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// @desc    Register user (deprecated - clients manage their own users)
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  // This endpoint is deprecated in zero-data mode
  // Clients should handle user registration in their own databases
  res.status(410).json({
    success: false,
    message: 'Registration endpoint deprecated. Clients manage their own user databases.',
    poweredBy: 'SecureVibe'
  });
});

// @desc    Verify email (deprecated - clients handle verification)
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', async (req, res, next) => {
  // This endpoint is deprecated in zero-data mode
  // Clients should handle email verification in their own applications
  res.status(410).json({
    success: false,
    message: 'Email verification endpoint deprecated. Clients manage their own user verification.',
    poweredBy: 'SecureVibe'
  });
});

// @desc    Send magic link for authentication
// @route   POST /api/auth/magic-link
// @access  Public
router.post('/magic-link', async (req, res, next) => {
  try {
    const { email, clientId, redirectUri, branding } = req.body;

    if (!email || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'Email and clientId are required',
        poweredBy: 'SecureVibe'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
        poweredBy: 'SecureVibe'
      });
    }

    // Generate magic link token
    const magicToken = crypto.randomBytes(32).toString('hex');
    const magicLinkId = crypto.randomBytes(16).toString('hex');

    // Store magic link temporarily (in production, use Redis or database)
    if (!global.magicLinks) {
      global.magicLinks = new Map();
    }

    global.magicLinks.set(magicLinkId, {
      email,
      clientId,
      redirectUri: redirectUri || 'http://localhost:3000',
      branding: branding || {},
      token: magicToken,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      used: false
    });

    // Note: Magic link cleanup is handled globally to avoid multiple intervals
    // Initialize cleanup if not already done
    if (!global.magicLinkCleanupInitialized) {
      global.magicLinkCleanupInitialized = true;

      setInterval(() => {
        if (global.magicLinks) {
          const now = Date.now();
          for (const [id, link] of global.magicLinks.entries()) {
            if (now > link.expires) {
              global.magicLinks.delete(id);
            }
          }
        }
      }, 60 * 1000); // Clean every minute
    }

    // Generate magic link URL
    const magicLinkUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/magic-link/${magicLinkId}`;

    // Send magic link email with custom branding
    const mailOptions = {
      from: `"${branding.companyName || 'SecureVibe'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Sign in to ${branding.appName || 'your app'}`,
      html: generateMagicLinkEmail(email, magicLinkUrl, branding)
    };

    await transporter.sendMail(mailOptions);

    // Log magic link sent (for analytics)
    console.log(`🔗 Magic link sent to ${email} for client ${clientId}`);

    res.json({
      success: true,
      message: 'Magic link sent successfully',
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    console.error('Magic link error:', error);
    
    // Better error handling for email sending
    if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
      return res.status(500).json({
        success: false,
        message: 'Email service configuration error. Please check SMTP settings.',
        poweredBy: 'SecureVibe'
      });
    }
    
    next(error);
  }
});

// @desc    Verify magic link and authenticate
// @route   GET /api/auth/magic-link/:id
// @access  Public
router.get('/magic-link/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!global.magicLinks || !global.magicLinks.has(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired magic link',
        poweredBy: 'SecureVibe'
      });
    }

    const magicLink = global.magicLinks.get(id);

    if (magicLink.used || Date.now() > magicLink.expires) {
      global.magicLinks.delete(id);
      return res.status(400).json({
        success: false,
        message: 'Magic link has expired or already been used',
        poweredBy: 'SecureVibe'
      });
    }

    // Mark as used
    magicLink.used = true;

    // Generate authentication tokens
    const token = generateToken({
      email: magicLink.email,
      clientId: magicLink.clientId,
      type: 'magic_link'
    });

    const refreshToken = generateRefreshToken({
      email: magicLink.email,
      clientId: magicLink.clientId,
      type: 'magic_link'
    });

    // Clean up used magic link
    global.magicLinks.delete(id);

    // Log successful authentication
    console.log(`✅ Magic link authentication successful for ${magicLink.email}`);

    // Redirect back to client application with tokens
    const redirectUrl = new URL(magicLink.redirectUri);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('refreshToken', refreshToken);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Magic link verification error:', error);
    next(error);
  }
});

// @desc    Refresh token (deprecated - clients handle tokens)
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res, next) => {
  // This endpoint is deprecated in zero-data mode
  // Clients should handle token refresh in their own applications
  res.status(410).json({
    success: false,
    message: 'Token refresh endpoint deprecated. Clients manage their own token lifecycle.',
    poweredBy: 'SecureVibe'
  });
});

// @desc    Forgot password (deprecated - clients handle passwords)
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  // This endpoint is deprecated in zero-data mode
  // Clients should handle password reset in their own applications
  res.status(410).json({
    success: false,
    message: 'Password reset endpoint deprecated. Clients manage their own password policies.',
    poweredBy: 'SecureVibe'
  });
});

// @desc    Reset password (deprecated - clients handle passwords)
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res, next) => {
  // This endpoint is deprecated in zero-data mode
  // Clients should handle password reset in their own applications
  res.status(410).json({
    success: false,
    message: 'Password reset endpoint deprecated. Clients manage their own password policies.',
    poweredBy: 'SecureVibe'
  });
});

// @desc    Get current user (deprecated - clients manage users)
// @route   GET /api/auth/me
// @access  Private
router.get('/me', (req, res) => {
  // This endpoint is deprecated in zero-data mode
  // Clients should manage user data in their own databases
  res.status(410).json({
    success: false,
    message: 'User profile endpoint deprecated. Clients manage their own user data.',
    poweredBy: 'SecureVibe'
  });
});

// @desc    Logout (deprecated - clients handle logout)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  // This endpoint is deprecated in zero-data mode
  // Clients should handle logout in their own applications
  res.status(410).json({
    success: false,
    message: 'Logout endpoint deprecated. Clients manage their own session lifecycle.',
    poweredBy: 'SecureVibe'
  });
});

// Google OAuth (deprecated - clients handle OAuth)
// @desc    Google OAuth (deprecated - clients handle OAuth)
// @route   GET /api/auth/google
// @access  Public
router.get('/google', (req, res) => {
  // This endpoint is deprecated in zero-data mode
  // Clients should implement their own OAuth flows
  res.status(410).json({
    success: false,
    message: 'OAuth endpoints deprecated. Clients implement their own social login.',
    poweredBy: 'SecureVibe'
  });
});

// @desc    Google OAuth callback (deprecated - clients handle OAuth)
// @route   GET /api/auth/google/callback
// @access  Public
router.get('/google/callback', (req, res) => {
  // This endpoint is deprecated in zero-data mode
  // Clients should implement their own OAuth flows
  res.status(410).json({
    success: false,
    message: 'OAuth endpoints deprecated. Clients implement their own social login.',
    poweredBy: 'SecureVibe'
  });
});

module.exports = router;
