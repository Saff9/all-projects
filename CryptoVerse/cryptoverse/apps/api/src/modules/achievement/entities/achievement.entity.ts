import { ApiProperty } from '@nestjs/swagger';

export class AchievementEntity {
  @ApiProperty({ description: 'Achievement ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'Achievement name', example: 'First Tap' })
  name: string;

  @ApiProperty({ description: 'Achievement description', example: 'Make your first tap' })
  description: string;

  @ApiProperty({ description: 'Achievement icon URL' })
  icon: string;

  @ApiProperty({ description: 'Achievement category', example: 'mining', enum: ['mining', 'social', 'collection', 'quest', 'special'] })
  category: string;

  @ApiProperty({ description: 'Requirement to unlock', example: 100 })
  requirement: number;

  @ApiProperty({ description: 'Reward coins', example: '1000' })
  reward: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

export class UserAchievementEntity {
  @ApiProperty({ description: 'User achievement ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'clx123456789' })
  userId: string;

  @ApiProperty({ description: 'Achievement ID', example: 'clx123456789' })
  achievementId: string;

  @ApiProperty({ description: 'Current progress', example: 50 })
  progress: number;

  @ApiProperty({ description: 'Unlock date', nullable: true })
  unlockedAt?: Date;

  @ApiProperty({ description: 'Is claimed', example: false })
  claimed: boolean;

  @ApiProperty({ description: 'Claim date', nullable: true })
  claimedAt?: Date;

  @ApiProperty({ description: 'Achievement details', type: AchievementEntity })
  achievement: AchievementEntity;

  @ApiProperty({ description: 'Progress percentage', example: 50 })
  progressPercentage: number;

  @ApiProperty({ description: 'Is unlocked', example: true })
  isUnlocked: boolean;
}

export class ClaimResultEntity {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Reward claimed', example: '1000' })
  reward: string;

  @ApiProperty({ description: 'Achievement details', type: AchievementEntity })
  achievement: AchievementEntity;
}
