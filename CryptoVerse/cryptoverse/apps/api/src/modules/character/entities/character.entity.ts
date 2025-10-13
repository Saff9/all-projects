import { ApiProperty } from '@nestjs/swagger';

export class CharacterEntity {
  @ApiProperty({ description: 'Character ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'Character name', example: 'Crypto Knight' })
  name: string;

  @ApiProperty({ description: 'Character description', example: 'A brave knight from the crypto realm' })
  description: string;

  @ApiProperty({ description: 'Character image URL' })
  imageUrl: string;

  @ApiProperty({ description: 'Character rarity', example: 'rare', enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] })
  rarity: string;

  @ApiProperty({ description: 'Base mining bonus', example: 1.5 })
  baseMiningBonus: number;

  @ApiProperty({ description: 'Special ability description', nullable: true })
  specialAbility?: string;

  @ApiProperty({ description: 'Maximum level', example: 10 })
  maxLevel: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

export class UserCharacterEntity {
  @ApiProperty({ description: 'User character ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'clx123456789' })
  userId: string;

  @ApiProperty({ description: 'Character ID', example: 'clx123456789' })
  characterId: string;

  @ApiProperty({ description: 'Current level', example: 5 })
  level: number;

  @ApiProperty({ description: 'Current experience', example: '1500' })
  experience: string;

  @ApiProperty({ description: 'Acquisition date' })
  acquiredAt: Date;

  @ApiProperty({ description: 'Character details', type: CharacterEntity })
  character: CharacterEntity;

  @ApiProperty({ description: 'Current mining bonus at this level', example: 2.5 })
  currentMiningBonus: number;

  @ApiProperty({ description: 'Experience needed for next level', example: '500' })
  experienceToNextLevel: string;
}

export class CharacterUpgradeResultEntity {
  @ApiProperty({ description: 'Previous level', example: 4 })
  previousLevel: number;

  @ApiProperty({ description: 'New level', example: 5 })
  newLevel: number;

  @ApiProperty({ description: 'Previous mining bonus', example: 2.0 })
  previousMiningBonus: number;

  @ApiProperty({ description: 'New mining bonus', example: 2.5 })
  newMiningBonus: number;

  @ApiProperty({ description: 'Cost of upgrade', example: '1000' })
  cost: string;

  @ApiProperty({ description: 'Updated user character', type: UserCharacterEntity })
  character: UserCharacterEntity;
}
