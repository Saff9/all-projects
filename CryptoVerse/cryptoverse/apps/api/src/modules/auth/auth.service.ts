import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database';
import { TelegramStrategy } from './strategies/telegram.strategy';
import { REFERRAL_CONFIG } from '@cryptoverse/shared';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  isNewUser: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly telegramStrategy: TelegramStrategy,
  ) {}

  /**
   * Authenticate user with Telegram init data
   */
  async loginWithTelegram(initData: string): Promise<AuthResult> {
    // Validate Telegram init data
    const validatedData = await this.telegramStrategy.validateInitData(initData);
    const telegramUser = validatedData.user;

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { telegramId: telegramUser.id.toString() },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user
      isNewUser = true;
      user = await this.createUser(telegramUser);
      this.logger.log(`New user created: ${user.id} (Telegram: ${telegramUser.id})`);
    } else {
      // Update user info
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name,
          username: telegramUser.username,
          photoUrl: telegramUser.photo_url,
          updatedAt: new Date(),
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.telegramId);

    return {
      ...tokens,
      userId: user.id,
      isNewUser,
    };
  }

  /**
   * Create a new user from Telegram data
   */
  private async createUser(telegramUser: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  }) {
    // Generate unique referral code
    const referralCode = await this.generateReferralCode();

    const user = await this.prisma.user.create({
      data: {
        telegramId: telegramUser.id.toString(),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        photoUrl: telegramUser.photo_url,
        referralCode,
        coins: BigInt(REFERRAL_CONFIG.REFERREE_BONUS), // Welcome bonus
        totalMined: BigInt(0),
        miningRate: 1.0,
        energy: 1000,
        maxEnergy: 1000,
      },
    });

    // Create user stats
    await this.prisma.userStats.create({
      data: {
        userId: user.id,
        totalTaps: BigInt(0),
        totalEarned: BigInt(REFERRAL_CONFIG.REFERREE_BONUS),
        achievementsUnlocked: 0,
        charactersOwned: 0,
        questsCompleted: 0,
        currentStreak: 0,
        bestStreak: 0,
      },
    });

    return user;
  }

  /**
   * Generate unique referral code
   */
  private async generateReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let exists = true;

    while (exists) {
      code = Array.from({ length: 8 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length)),
      ).join('');

      const existing = await this.prisma.user.findUnique({
        where: { referralCode: code },
      });
      exists = !!existing;
    }

    return code!;
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(userId: string, telegramId: string) {
    const payload = {
      sub: userId,
      telegramId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn', '7d'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    // Calculate expiration in seconds
    const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user.id, user.telegramId);

      return {
        ...tokens,
        userId: user.id,
        isNewUser: false,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate user by ID
   */
  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        coins: true,
        miningRate: true,
        totalMined: true,
        referralCode: true,
        referredBy: true,
        energy: true,
        maxEnergy: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
