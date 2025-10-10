import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Setup Swagger documentation (only in development and staging)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CryptoVerse API')
      .setDescription('CryptoVerse Telegram Mini App API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('user', 'User management endpoints')
      .addTag('wallet', 'Wallet endpoints')
      .addTag('mining', 'Mining endpoints')
      .addTag('character', 'Character endpoints')
      .addTag('achievement', 'Achievement endpoints')
      .addTag('quest', 'Quest endpoints')
      .addTag('leaderboard', 'Leaderboard endpoints')
      .addTag('airdrop', 'Airdrop endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Start the server
  await app.listen(port);

  console.log(`🚀 CryptoVerse API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🌍 Environment: ${nodeEnv}`);
}

bootstrap();
