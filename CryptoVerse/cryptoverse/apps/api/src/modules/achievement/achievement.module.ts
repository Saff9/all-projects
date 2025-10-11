import { Module } from '@nestjs/common';
import { AchievementController } from './achievement.controller';
import { AchievementService } from './achievement.service';
import { PrismaService } from '../../database';

@Module({
  controllers: [AchievementController],
  providers: [AchievementService, PrismaService],
  exports: [AchievementService],
})
export class AchievementModule {}
