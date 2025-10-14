import { ApiProperty } from '@nestjs/swagger';

export class WalletEntity {
  @ApiProperty({ description: 'Wallet ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'clx123456789' })
  userId: string;

  @ApiProperty({ description: 'Wallet address', example: '0x1234...5678' })
  address: string;

  @ApiProperty({ description: 'Network', example: 'ethereum' })
  network: string;

  @ApiProperty({ description: 'Is wallet verified', example: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Verification date', nullable: true })
  verifiedAt?: Date;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

export class WalletBalanceEntity {
  @ApiProperty({ description: 'Available coins balance', example: '10000' })
  available: string;

  @ApiProperty({ description: 'Staked coins', example: '5000' })
  staked: string;

  @ApiProperty({ description: 'Total balance', example: '15000' })
  total: string;

  @ApiProperty({ description: 'Pending rewards from staking', example: '500' })
  pendingRewards: string;
}

export class TransactionEntity {
  @ApiProperty({ description: 'Transaction ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'Sender user ID', nullable: true })
  senderId?: string;

  @ApiProperty({ description: 'Recipient user ID', nullable: true })
  recipientId?: string;

  @ApiProperty({ description: 'Transaction type', example: 'transfer' })
  type: string;

  @ApiProperty({ description: 'Transaction amount', example: '1000' })
  amount: string;

  @ApiProperty({ description: 'Transaction status', example: 'completed' })
  status: string;

  @ApiProperty({ description: 'Transaction timestamp' })
  createdAt: Date;
}

export class StakeEntity {
  @ApiProperty({ description: 'Stake ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'clx123456789' })
  userId: string;

  @ApiProperty({ description: 'Staked amount', example: '5000' })
  amount: string;

  @ApiProperty({ description: 'APY percentage', example: 10 })
  apy: number;

  @ApiProperty({ description: 'Lock period in days', example: 30 })
  lockPeriodDays: number;

  @ApiProperty({ description: 'Start date' })
  startDate: Date;

  @ApiProperty({ description: 'End date' })
  endDate: Date;

  @ApiProperty({ description: 'Is stake active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Pending rewards', example: '100' })
  pendingRewards: string;
}
