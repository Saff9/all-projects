import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryEntity {
  @ApiProperty({ description: 'Rank position', example: 1 })
  rank: number;

  @ApiProperty({ description: 'User ID', example: 'clx123456789' })
  userId: string;

  @ApiProperty({ description: 'Username', example: 'cryptomaster', nullable: true })
  username?: string;

  @ApiProperty({ description: 'Profile photo URL', nullable: true })
  photoUrl?: string;

  @ApiProperty({ description: 'Value for ranking', example: '100000' })
  value: string;

  @ApiProperty({ description: 'Is current user', example: false })
  isCurrentUser: boolean;
}

export class LeaderboardEntity {
  @ApiProperty({ description: 'Leaderboard type', example: 'coins' })
  type: string;

  @ApiProperty({ description: 'Leaderboard entries', type: [LeaderboardEntryEntity] })
  entries: LeaderboardEntryEntity[];

  @ApiProperty({ description: 'Current user rank', nullable: true })
  currentUserRank?: number;

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt: Date;
}
