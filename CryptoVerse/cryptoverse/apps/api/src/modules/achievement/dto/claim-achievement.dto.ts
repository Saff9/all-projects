import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ClaimAchievementDto {
  @ApiProperty({
    description: 'Achievement ID to claim',
    example: 'clx123456789',
  })
  @IsString()
  @IsNotEmpty()
  achievementId: string;
}

export class AchievementQueryDto {
  @ApiProperty({
    description: 'Filter by category',
    example: 'mining',
    enum: ['mining', 'social', 'collection', 'quest', 'special'],
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;
}
