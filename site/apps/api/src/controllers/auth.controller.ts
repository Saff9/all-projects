import { Request, Response, NextFunction } from 'express';
import { authService, SafeUser } from '../services/auth.service';
import { ApiError } from '../middleware/error.middleware';

// (Removed duplicate global Request augmentation)

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User with this email already exists') {
        return next(new ApiError(400, error.message));
      }
    }
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.login(req.body);

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid email or password') {
        return next(new ApiError(401, error.message));
      }
    }
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new ApiError(400, 'Refresh token is required'));
    }

    const tokens = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return next(new ApiError(401, error.message));
      }
    }
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.body.refreshToken;
    const userId = req.user?.userId;

    await authService.logout(refreshToken, userId);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const user = await authService.getCurrentUser(req.user.userId);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const message = await authService.forgotPassword(email);

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.resetPassword(req.body);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return next(new ApiError(400, error.message));
      }
    }
    next(error);
  }
};

/**
 * Change password (authenticated)
 * POST /api/auth/change-password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    await authService.changePassword(req.user.userId, req.body);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Current password is incorrect') {
        return next(new ApiError(400, error.message));
      }
    }
    next(error);
  }
};

/**
 * Verify email
 * POST /api/auth/verify-email
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.body;
    await authService.verifyEmail(token);

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return next(new ApiError(400, error.message));
      }
    }
    next(error);
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    await authService.generateEmailVerificationToken(req.user.userId);

    res.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    next(error);
  }
};
