import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TelegramStrategy } from './strategies/telegram.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TelegramAuthGuard } from './guards/telegram-auth.guard';
import { PrismaService } from '../../database';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TelegramStrategy,
    JwtAuthGuard,
    TelegramAuthGuard,
    PrismaService,
  ],
  exports: [AuthService, JwtAuthGuard, TelegramAuthGuard],
})
export class AuthModule {}
