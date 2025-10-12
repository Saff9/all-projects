import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TelegramStrategy } from '../strategies/telegram.strategy';

/**
 * Guard for validating Telegram WebApp init data
 * Use this for endpoints that need to validate Telegram init data directly
 */
@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private readonly telegramStrategy: TelegramStrategy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const initData = request.headers['x-telegram-init-data'] || 
                     request.body?.init_data;

    if (!initData) {
      throw new UnauthorizedException('Telegram init data required');
    }

    try {
      const validatedData = await this.telegramStrategy.validateInitData(initData);
      request.telegramUser = validatedData.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : 'Invalid Telegram init data',
      );
    }
  }
}
