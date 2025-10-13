import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CompleteQuestDto {
  @ApiProperty({
    description: 'Quest ID to complete',
    example: 'clx123456789',
  })
  @IsString()
  @IsNotEmpty()
  questId: string;
}

export class StartQuestDto {
  @ApiProperty({
    description: 'Quest ID to start',
    example: 'clx123456789',
  })
  @IsString()
  @IsNotEmpty()
  questId: string;
}

export class QuestQueryDto {
  @ApiProperty({
    description: 'Filter by quest type',
    example: 'daily',
    enum: ['daily', 'weekly', 'special'],
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Filter by status',
    example: 'pending',
    enum: ['pending', 'in_progress', 'completed', 'claimed'],
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;
}
