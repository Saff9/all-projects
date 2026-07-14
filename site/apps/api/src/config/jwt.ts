import { config } from './index';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const jwtConfig = {
  secret: config.jwt.secret,
  refreshSecret: config.jwt.refreshSecret,
  expiresIn: config.jwt.expiresIn,
  refreshExpiresIn: config.jwt.refreshExpiresIn,
  
  // Token expiration times in seconds
  accessTokenExpirySeconds: 15 * 60, // 15 minutes
  refreshTokenExpirySeconds: 7 * 24 * 60 * 60, // 7 days
  
  // Cookie options for refresh token
  cookieOptions: {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },
};

export default jwtConfig;
