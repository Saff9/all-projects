import { Module } from '@nestjs/common';
import { MiningController } from './mining.controller';
import { MiningService } from './mining.service';
import { PrismaService } from '../../database';

@Module({
  controllers: [MiningController],
  providers: [MiningService, PrismaService],
  exports: [MiningService],
})
export class MiningModule {}
