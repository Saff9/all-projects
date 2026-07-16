import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { jwtConfig, JwtPayload } from '../config/jwt';
import { 
  RegisterInput, 
  LoginInput, 
  ResetPasswordInput,
  ChangePasswordInput,
  UpdateProfileInput 
} from '../validators/auth.validator';

const prisma = new PrismaClient();

// User type without password
export type SafeUser = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  targetExam: string | null;
  targetYear: number | null;
  role: string;
  subscriptionStatus: string;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  /**
   * Generate access and refresh tokens
   */
  private generateTokens(userId: string, email: string, role: string): TokenResponse {
    const accessToken = jwt.sign(
      { userId, email, role },
      config.jwt.secret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId, email, role },
      config.jwt.refreshSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  /**
   * Compare password with hash
   */
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Save refresh token to database
   */
  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Remove refresh token from database (for logout)
   */
  private async removeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Remove all refresh tokens for a user (for logout all sessions)
   */
  private async removeAllRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Verify refresh token from database
   */
  private async verifyRefreshToken(token: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken) {
      return null;
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await this.removeRefreshToken(token);
      return null;
    }

    return storedToken;
  }

  /**
   * Convert user to safe user (without password)
   */
  private toSafeUser(user: any): SafeUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      targetExam: user.targetExam,
      targetYear: user.targetYear,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    const { email, password, fullName, phone, targetExam, targetYear } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
        phone,
        targetExam,
        targetYear,
        role: 'student',
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Save refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.toSafeUser(user),
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email, user.role);

    // Save refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.toSafeUser(user),
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(token: string): Promise<TokenResponse> {
    // Verify the refresh token in database
    const storedToken = await this.verifyRefreshToken(token);
    if (!storedToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // Verify JWT
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;

      // Remove old refresh token
      await this.removeRefreshToken(token);

      // Generate new tokens
      const tokens = this.generateTokens(decoded.userId, decoded.email, decoded.role);

      // Save new refresh token
      await this.saveRefreshToken(decoded.userId, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken?: string, userId?: string): Promise<void> {
    if (refreshToken) {
      await this.removeRefreshToken(refreshToken);
    }
    if (userId) {
      await this.removeAllRefreshTokens(userId);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return this.toSafeUser(user);
  }

  /**
   * Forgot password - generate reset token
   */
  async forgotPassword(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return 'If an account with that email exists, a reset link has been sent.';
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, purpose: 'password-reset' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    // For now, we'll just return the token (mock implementation)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return 'If an account with that email exists, a reset link has been sent.';
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordInput): Promise<void> {
    const { token, password } = data;

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; purpose: string };

      if (decoded.purpose !== 'password-reset') {
        throw new Error('Invalid reset token');
      }

      const hashedPassword = await this.hashPassword(password);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash: hashedPassword },
      });

      // Invalidate all refresh tokens for this user
      await this.removeAllRefreshTokens(decoded.userId);
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(userId: string, data: ChangePasswordInput): Promise<void> {
    const { currentPassword, newPassword } = data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    // Invalidate all refresh tokens for this user (except current session)
    await this.removeAllRefreshTokens(userId);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput): Promise<SafeUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.toSafeUser(user);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; purpose: string };

      if (decoded.purpose !== 'email-verification') {
        throw new Error('Invalid verification token');
      }

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { emailVerifiedAt: new Date() },
      });
    } catch (error) {
      throw new Error('Invalid or expired verification token');
    }
  }

  /**
   * Generate email verification token
   */
  async generateEmailVerificationToken(userId: string): Promise<string> {
    const token = jwt.sign(
      { userId, purpose: 'email-verification' },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    // In production, send email with verification link
    console.log(`Email verification token: ${token}`);

    return token;
  }
}

export const authService = new AuthService();
export default authService;
