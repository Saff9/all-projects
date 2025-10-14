import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QuestService } from './quest.service';
import { StartQuestDto, QuestQueryDto } from './dto/complete-quest.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('quest')
@ApiBearerAuth()
@Controller('quests')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get()
  @ApiOperation({ summary: 'Get all quests with user progress' })
  @ApiResponse({ status: 200, description: 'Quests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllQuests(
    @CurrentUser('id') userId: string,
    @Query() query: QuestQueryDto,
  ) {
    return this.questService.getAllQuests(userId, query.type, query.status);
  }

  @Get('user')
  @ApiOperation({ summary: "Get current user's quests" })
  @ApiResponse({ status: 200, description: 'User quests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserQuests(@CurrentUser('id') userId: string) {
    return this.questService.getUserQuests(userId);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start a quest' })
  @ApiResponse({ status: 200, description: 'Quest started successfully' })
  @ApiResponse({ status: 400, description: 'Quest already completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quest not found' })
  async startQuest(
    @CurrentUser('id') userId: string,
    @Body() startQuestDto: StartQuestDto,
  ) {
    return this.questService.startQuest(userId, startQuestDto);
  }

  @Post(':id/claim')
  @ApiOperation({ summary: 'Claim quest reward' })
  @ApiResponse({ status: 200, description: 'Reward claimed successfully' })
  @ApiResponse({ status: 400, description: 'Quest not completed or already claimed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quest not found' })
  async claimReward(
    @CurrentUser('id') userId: string,
    @Param('id') questId: string,
  ) {
    return this.questService.claimReward(userId, questId);
  }
}
