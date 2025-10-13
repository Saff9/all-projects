import { ApiProperty } from '@nestjs/swagger';

export class QuestEntity {
  @ApiProperty({ description: 'Quest ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'Quest name', example: 'Daily Mining' })
  name: string;

  @ApiProperty({ description: 'Quest description', example: 'Mine 100 coins today' })
  description: string;

  @ApiProperty({ description: 'Quest type', example: 'daily', enum: ['daily', 'weekly', 'special'] })
  type: string;

  @ApiProperty({ description: 'Requirement to complete', example: 100 })
  requirement: number;

  @ApiProperty({ description: 'Reward coins', example: '500' })
  reward: string;

  @ApiProperty({ description: 'Expiration date', nullable: true })
  expiresAt?: Date;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

export class UserQuestEntity {
  @ApiProperty({ description: 'User quest ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'clx123456789' })
  userId: string;

  @ApiProperty({ description: 'Quest ID', example: 'clx123456789' })
  questId: string;

  @ApiProperty({ description: 'Current progress', example: 50 })
  progress: number;

  @ApiProperty({ description: 'Quest status', example: 'in_progress', enum: ['pending', 'in_progress', 'completed', 'claimed'] })
  status: string;

  @ApiProperty({ description: 'Start date' })
  startedAt: Date;

  @ApiProperty({ description: 'Completion date', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: 'Claim date', nullable: true })
  claimedAt?: Date;

  @ApiProperty({ description: 'Quest details', type: QuestEntity })
  quest: QuestEntity;

  @ApiProperty({ description: 'Progress percentage', example: 50 })
  progressPercentage: number;

  @ApiProperty({ description: 'Is completed', example: false })
  isCompleted: boolean;
}

export class QuestClaimResultEntity {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Reward claimed', example: '500' })
  reward: string;

  @ApiProperty({ description: 'Quest details', type: QuestEntity })
  quest: QuestEntity;
}
