import { Module } from '@nestjs/common';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { PrismaService } from '../../database';

@Module({
  controllers: [QuestController],
  providers: [QuestService, PrismaService],
  exports: [QuestService],
})
export class QuestModule {}
