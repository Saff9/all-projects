import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { CurrentUser } from '../../common/decorators';

@ApiTags('leaderboard')
@ApiBearerAuth()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':type')
  @ApiOperation({ summary: 'Get leaderboard by type' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLeaderboard(
    @CurrentUser('id') userId: string,
    @Param('type') type: string,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getLeaderboard(userId, type, limit);
  }

  @Get('friends/all')
  @ApiOperation({ summary: 'Get friends leaderboard' })
  @ApiResponse({ status: 200, description: 'Friends leaderboard retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getFriendsLeaderboard(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getFriendsLeaderboard(userId, limit);
  }

  @Get('daily/all')
  @ApiOperation({ summary: 'Get daily leaderboard' })
  @ApiResponse({ status: 200, description: 'Daily leaderboard retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDailyLeaderboard(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getDailyLeaderboard(userId, limit);
  }
}