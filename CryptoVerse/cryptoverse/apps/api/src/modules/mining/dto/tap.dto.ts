import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional } from 'class-validator';

export class TapDto {
  @ApiProperty({
    description: 'Number of taps to perform',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsNumber()
  @Min(1, { message: 'Tap count must be at least 1' })
  @IsOptional()
  count?: number;
}

export class StartMiningDto {
  @ApiProperty({
    description: 'Boost ID to apply (optional)',
    example: 'clx123456789',
    required: false,
  })
  @IsOptional()
  boostId?: string;
}

export class MiningStatsQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    default: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
    default: 20,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
