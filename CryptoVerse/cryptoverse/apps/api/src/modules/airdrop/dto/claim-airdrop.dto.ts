import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ClaimAirdropDto {
  @ApiProperty({
    description: 'Airdrop ID to claim',
    example: 'clx123456789',
  })
  @IsString()
  @IsNotEmpty()
  airdropId: string;
}

export class CheckEligibilityDto {
  @ApiProperty({
    description: 'Airdrop ID to check eligibility',
    example: 'clx123456789',
  })
  @IsString()
  @IsNotEmpty()
  airdropId: string;
}