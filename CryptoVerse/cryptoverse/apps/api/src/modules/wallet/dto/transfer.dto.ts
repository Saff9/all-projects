import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    description: 'Recipient user ID',
    example: 'clx123456789',
  })
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @ApiProperty({
    description: 'Amount to transfer',
    example: 1000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Transfer amount must be at least 1' })
  amount: number;
}

export class StakeDto {
  @ApiProperty({
    description: 'Amount to stake',
    example: 5000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Stake amount must be at least 1' })
  amount: number;

  @ApiProperty({
    description: 'Lock period in days',
    example: 30,
    enum: [7, 14, 30, 90, 180],
  })
  @IsNumber()
  @IsOptional()
  lockPeriodDays?: number;
}

export class UnstakeDto {
  @ApiProperty({
    description: 'Stake ID to unstake',
    example: 'clx123456789',
  })
  @IsString()
  @IsNotEmpty()
  stakeId: string;
}

export class ConnectWalletDto {
  @ApiProperty({
    description: 'Wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Network',
    example: 'ethereum',
    enum: ['ethereum', 'bsc', 'polygon'],
  })
  @IsString()
  @IsOptional()
  network?: string;
}

export class TransactionQueryDto {
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

  @ApiProperty({
    description: 'Transaction type filter',
    example: 'transfer',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;
}
