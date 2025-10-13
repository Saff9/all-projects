import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MiningService } from './mining.service';
import { TapDto, StartMiningDto, MiningStatsQueryDto } from './dto/tap.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('mining')
@ApiBearerAuth()
@Controller('mining')
export class MiningController {
  constructor(private readonly miningService: MiningService) {}

  @Post('tap')
  @ApiOperation({ summary: 'Tap to mine coins' })
  @ApiResponse({ status: 200, description: 'Tap successful' })
  @ApiResponse({ status: 400, description: 'Insufficient energy' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async tap(
    @CurrentUser('id') userId: string,
    @Body() tapDto: TapDto,
  ) {
    return this.miningService.tap(userId, tapDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get mining statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.miningService.getMiningStats(userId);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start a mining session' })
  @ApiResponse({ status: 200, description: 'Mining session started' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async startMining(
    @CurrentUser('id') userId: string,
    @Body() startMiningDto?: StartMiningDto,
  ) {
    return this.miningService.startMining(userId, startMiningDto);
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop current mining session' })
  @ApiResponse({ status: 200, description: 'Mining session stopped' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async stopMining(@CurrentUser('id') userId: string) {
    return this.miningService.stopMining(userId);
  }

  @Get('boosts')
  @ApiOperation({ summary: 'Get available mining boosts' })
  @ApiResponse({ status: 200, description: 'Boosts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBoosts() {
    return this.miningService.getBoosts();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get mining session history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query() query: MiningStatsQueryDto,
  ) {
    return this.miningService.getMiningHistory(
      userId,
      query.page,
      query.limit,
    );
  }
}
