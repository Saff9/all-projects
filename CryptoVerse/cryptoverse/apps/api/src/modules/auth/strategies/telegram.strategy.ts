import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Strategy for validating Telegram WebApp init data
 * Based on Telegram's documentation for validating WebApp data
 */
@Injectable()
export class TelegramStrategy {
  private readonly logger = new Logger(TelegramStrategy.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Validate Telegram WebApp init data
   * @param initData - The init data string from Telegram WebApp
   * @returns Parsed user data if validation succeeds
   */
  async validateInitData(initData: string): Promise<{
    user: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
    auth_date: number;
    query_id?: string;
  }> {
    const botToken = this.configService.get<string>('telegram.botToken');

    if (!botToken) {
      this.logger.error('Telegram bot token not configured');
      throw new UnauthorizedException('Telegram authentication not configured');
    }

    // Parse the init data
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      throw new UnauthorizedException('Invalid init data: missing hash');
    }

    // Remove hash from params for verification
    params.delete('hash');

    // Sort parameters alphabetically and create data check string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key from bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes
    if (calculatedHash !== hash) {
      this.logger.warn('Telegram init data hash mismatch');
      throw new UnauthorizedException('Invalid init data: hash mismatch');
    }

    // Check auth_date (data should not be older than 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours in seconds

    if (currentTime - authDate > maxAge) {
      throw new UnauthorizedException('Init data expired');
    }

    // Parse user data
    const userJson = params.get('user');
    if (!userJson) {
      throw new UnauthorizedException('Invalid init data: missing user');
    }

    try {
      const user = JSON.parse(userJson);
      return {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
        },
        auth_date: authDate,
        query_id: params.get('query_id') || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to parse user data', error);
      throw new UnauthorizedException('Invalid user data format');
    }
  }
}
