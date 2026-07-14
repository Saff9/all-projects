import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../config/jwt';
import { ApiError } from './error.middleware';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Protect routes - require authentication
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'You are not logged in. Please log in to get access.'));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Add user to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, 'Your token has expired. Please log in again.'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }
    return next(new ApiError(401, 'Authentication failed. Please log in again.'));
  }
};

/**
 * Restrict access to specific roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'You are not logged in.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }

    next();
  };
};

/**
 * Optional authentication - attach user if token present, but don't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

/**
 * Check if user owns the resource or is admin
 */
export const checkOwnership = (getResourceUserId: (req: Request) => string | Promise<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new ApiError(401, 'You are not logged in.'));
      }

      // Admins can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Get the user ID of the resource owner
      const resourceUserId = await getResourceUserId(req);

      // Check if the current user owns the resource
      if (req.user.userId !== resourceUserId) {
        return next(new ApiError(403, 'You do not have permission to access this resource.'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Rate limiter for auth routes (more strict)
 */
export const authRateLimit = () => {
  const attempts = new Map<string, { count: number; lastAttempt: number }>();
  const maxAttempts = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const userAttempts = attempts.get(ip);

    if (userAttempts) {
      // Reset if window has passed
      if (now - userAttempts.lastAttempt > windowMs) {
        attempts.set(ip, { count: 1, lastAttempt: now });
      } else if (userAttempts.count >= maxAttempts) {
        return next(new ApiError(429, 'Too many attempts. Please try again later.'));
      } else {
        attempts.set(ip, { count: userAttempts.count + 1, lastAttempt: now });
      }
    } else {
      attempts.set(ip, { count: 1, lastAttempt: now });
    }

    next();
  };
};
