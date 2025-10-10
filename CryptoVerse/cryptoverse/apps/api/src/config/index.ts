import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cryptoverse',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRATION || '7d',
}));

export const telegramConfig = registerAs('telegram', () => ({
  botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  botId: process.env.TELEGRAM_BOT_ID || '',
}));

export const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}));
