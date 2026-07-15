import { Router, Request, Response, NextFunction } from 'express';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  refreshToken, 
  forgotPassword, 
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification
} from '../controllers/auth.controller';
import { protect, restrictTo, authRateLimit } from '../middleware/auth.middleware';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema
} from '../validators/auth.validator';

// Validation middleware
const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body });
      next();
    } catch (error: any) {
      const errors = error.errors?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })) || [{ message: 'Validation failed' }];
      
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
  };
};

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimit(), validate(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimit(), validate(loginSchema), login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', authRateLimit(), validate(forgotPasswordSchema), forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', authRateLimit(), validate(resetPasswordSchema), resetPassword);

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);

// ============================================
// Protected Routes
// ============================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (authenticated)
 * @access  Private
 */
router.post('/change-password', protect, validate(changePasswordSchema), changePassword);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Private
 */
router.post('/resend-verification', protect, resendVerification);

export default router;
