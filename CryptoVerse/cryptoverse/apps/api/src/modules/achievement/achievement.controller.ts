import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementService } from './achievement.service';
import { ClaimAchievementDto, AchievementQueryDto } from './dto/claim-achievement.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('achievement')
@ApiBearerAuth()
@Controller('achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all achievements with user progress' })
  @ApiResponse({ status: 200, description: 'Achievements retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllAchievements(
    @CurrentUser('id') userId: string,
    @Query() query: AchievementQueryDto,
  ) {
    return this.achievementService.getAllAchievements(userId, query.category);
  }

  @Get('user')
  @ApiOperation({ summary: "Get current user's achievements" })
  @ApiResponse({ status: 200, description: 'User achievements retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserAchievements(@CurrentUser('id') userId: string) {
    return this.achievementService.getUserAchievements(userId);
  }

  @Post(':id/claim')
  @ApiOperation({ summary: 'Claim achievement reward' })
  @ApiResponse({ status: 200, description: 'Reward claimed successfully' })
  @ApiResponse({ status: 400, description: 'Achievement not unlocked or already claimed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Achievement not found' })
  async claimReward(
    @CurrentUser('id') userId: string,
    @Param('id') achievementId: string,
  ) {
    return this.achievementService.claimReward(userId, achievementId);
  }
}
