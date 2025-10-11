import { ApiProperty } from '@nestjs/swagger';

export class AirdropEntity {
  @ApiProperty({ description: 'Airdrop ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'Airdrop name', example: 'Token Launch Airdrop' })
  name: string;

  @ApiProperty({ description: 'Airdrop description', example: 'Celebrate our token launch with this special airdrop' })
  description: string;

  @ApiProperty({ description: 'Total tokens available', example: '1000000' })
  totalTokens: string;

  @ApiProperty({ description: 'Tokens per user', example: '100' })
  tokensPerUser: string;

  @ApiProperty({ description: 'Start date' })
  startDate: Date;

  @ApiProperty({ description: 'End date' })
  endDate: Date;

  @ApiProperty({ description: 'Requirements list', type: [String] })
  requirements: string[];

  @ApiProperty({ description: 'Is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;
}

export class UserAirdropEntity {
  @ApiProperty({ description: 'User airdrop ID', example: 'clx123456789' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'clx123456789' })
  userId: string;

  @ApiProperty({ description: 'Airdrop ID', example: 'clx123456789' })
  airdropId: string;

  @ApiProperty({ description: 'Is eligible', example: true })
  eligible: boolean;

  @ApiProperty({ description: 'Is claimed', example: false })
  claimed: boolean;

  @ApiProperty({ description: 'Claim date', nullable: true })
  claimedAt?: Date;

  @ApiProperty({ description: 'Airdrop details', type: AirdropEntity })
  airdrop: AirdropEntity;
}

export class AirdropEligibilityEntity {
  @ApiProperty({ description: 'Airdrop ID', example: 'clx123456789' })
  airdropId: string;

  @ApiProperty({ description: 'Is eligible', example: true })
  isEligible: boolean;

  @ApiProperty({ description: 'Missing requirements', type: [String] })
  missingRequirements: string[];

  @ApiProperty({ description: 'Tokens to receive if eligible', example: '100' })
  tokensToReceive: string;
}

export class AirdropClaimResultEntity {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Tokens claimed', example: '100' })
  tokensClaimed: string;

  @ApiProperty({ description: 'Airdrop details', type: AirdropEntity })
  airdrop: AirdropEntity;
}