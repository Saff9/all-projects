import { ApiProperty } from '@nestjs/swagger';

export class MiningStatsEntity {
  @ApiProperty({ description: 'Current energy', example: 800 })
  energy: number;

  @ApiProperty({ description: 'Maximum energy', example: 1000 })
  maxEnergy: number;

  @ApiProperty({ description: 'Energy regeneration rate per second', example: 1 })
  energyRegenRate: number;

  @ApiProperty({ description: 'Current mining rate multiplier', example: 1.5 })
  miningRate: number;

  @ApiProperty({ description: 'Total coins mined', example: '50000' })
  totalMined: string;

  @ApiProperty({ description: 'Total taps made', example: '15000' })
  totalTaps: string;

  @ApiProperty({ description: 'Time until full energy (seconds)', example: 200 })
  timeUntilFullEnergy: number;

  @ApiProperty({ description: 'Active boost (if any)', nullable: true })
  activeBoost?: {
    id: string;
    name: string;
    multiplier: number;
    remainingTime: number;
  };
}

export class TapResultEntity {
  @ApiProperty({ description: 'Coins earned from tap', example: 5 })
  coinsEarned: number;

  @ApiProperty({ description: 'Whether it was a critical hit', example: false })
  isCritical: boolean;

  @ApiProperty({ description: 'Combo multiplier', example: 1.5 })
  comboMultiplier: number;

  @ApiProperty({ description: 'Current combo count', example: 10 })
  comboCount: number;

  @ApiProperty({ description: 'Remaining energy', example: 795 })
  remainingEnergy: number;

  @ApiProperty({ description: 'Total coins balance', example: '50005' })
  totalCoins: string;
}

export class MiningSessionEntity {
  @ApiProperty({ description: 'Session ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'Session start time' })
  startTime: Date;

  @ApiProperty({ description: 'Session end time', nullable: true })
  endTime?: Date;

  @ApiProperty({ description: 'Coins earned in session', example: '1000' })
  coinsEarned: string;

  @ApiProperty({ description: 'Is session active', example: true })
  isActive: boolean;
}

export class MiningBoostEntity {
  @ApiProperty({ description: 'Boost ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'Boost name', example: '2x Mining Boost' })
  name: string;

  @ApiProperty({ description: 'Boost description', example: 'Double your mining rate for 1 hour' })
  description: string;

  @ApiProperty({ description: 'Multiplier', example: 2.0 })
  multiplier: number;

  @ApiProperty({ description: 'Duration in seconds', example: 3600 })
  duration: number;

  @ApiProperty({ description: 'Cost in coins', example: '1000' })
  cost: string;
}
