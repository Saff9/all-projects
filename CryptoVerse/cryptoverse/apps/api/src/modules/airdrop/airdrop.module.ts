import { Module } from '@nestjs/common';
import { AirdropController } from './airdrop.controller';
import { AirdropService } from './airdrop.service';
import { PrismaService } from '../../database';

@Module({
  controllers: [AirdropController],
  providers: [AirdropService, PrismaService],
  exports: [AirdropService],
})
export class AirdropModule {}
