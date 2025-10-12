import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class UpgradeCharacterDto {
  @ApiProperty({
    description: 'Number of levels to upgrade',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsNumber()
  @Min(1, { message: 'Upgrade levels must be at least 1' })
  @IsOptional()
  levels?: number;
}

export class UnlockCharacterDto {
  @ApiProperty({
    description: 'Character ID to unlock',
    example: 'clx123456789',
  })
  @IsString()
  @IsNotEmpty()
  characterId: string;
}

export class CharacterQueryDto {
  @ApiProperty({
    description: 'Filter by rarity',
    example: 'rare',
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    required: false,
  })
  @IsString()
  @IsOptional()
  rarity?: string;
}
