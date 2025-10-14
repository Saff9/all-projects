import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ description: 'User ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'Telegram ID', example: '123456789' })
  telegramId: string;

  @ApiProperty({ description: 'Username', example: 'cryptomaster', nullable: true })
  username?: string;

  @ApiProperty({ description: 'First name', example: 'John', nullable: true })
  firstName?: string;

  @ApiProperty({ description: 'Last name', example: 'Doe', nullable: true })
  lastName?: string;

  @ApiProperty({ description: 'Profile photo URL', nullable: true })
  photoUrl?: string;

  @ApiProperty({ description: 'Current coins balance', example: '10000' })
  coins: string;

  @ApiProperty({ description: 'Mining rate multiplier', example: 1.5 })
  miningRate: number;

  @ApiProperty({ description: 'Total coins mined', example: '50000' })
  totalMined: string;

  @ApiProperty({ description: 'Referral code', example: 'ABC12345' })
  referralCode: string;

  @ApiProperty({ description: 'Referrer user ID', nullable: true })
  referredBy?: string;

  @ApiProperty({ description: 'Current energy', example: 800 })
  energy: number;

  @ApiProperty({ description: 'Maximum energy', example: 1000 })
  maxEnergy: number;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class UserStatsEntity {
  @ApiProperty({ description: 'Total taps made', example: '15000' })
  totalTaps: string;

  @ApiProperty({ description: 'Total coins earned', example: '50000' })
  totalEarned: string;

  @ApiProperty({ description: 'Number of achievements unlocked', example: 12 })
  achievementsUnlocked: number;

  @ApiProperty({ description: 'Number of characters owned', example: 5 })
  charactersOwned: number;

  @ApiProperty({ description: 'Number of quests completed', example: 25 })
  questsCompleted: number;

  @ApiProperty({ description: 'Current login streak', example: 7 })
  currentStreak: number;

  @ApiProperty({ description: 'Best login streak', example: 30 })
  bestStreak: number;

  @ApiProperty({ description: 'Last active timestamp' })
  lastActiveAt: Date;
}

export class ReferralStatsEntity {
  @ApiProperty({ description: 'Total number of referrals', example: 15 })
  totalReferrals: number;

  @ApiProperty({ description: 'Coins earned from referrals', example: '15000' })
  coinsEarned: string;

  @ApiProperty({ description: 'List of referred users' })
  referrals: Array<{
    id: string;
    username?: string;
    firstName?: string;
    photoUrl?: string;
    createdAt: Date;
  }>;
}

export class UserProfileEntity {
  @ApiProperty({ description: 'User information', type: UserEntity })
  user: UserEntity;

  @ApiProperty({ description: 'User statistics', type: UserStatsEntity })
  stats: UserStatsEntity;
}
