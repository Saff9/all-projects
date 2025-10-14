import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { VALIDATION } from '@cryptoverse/shared';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'cryptomaster',
    required: false,
    minLength: VALIDATION.USERNAME_MIN_LENGTH,
    maxLength: VALIDATION.USERNAME_MAX_LENGTH,
  })
  @IsString()
  @IsOptional()
  @MinLength(VALIDATION.USERNAME_MIN_LENGTH, {
    message: `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`,
  })
  @MaxLength(VALIDATION.USERNAME_MAX_LENGTH, {
    message: `Username must not exceed ${VALIDATION.USERNAME_MAX_LENGTH} characters`,
  })
  username?: string;

  @ApiProperty({
    description: 'Avatar photo URL',
    example: 'https://t.me/i/userpic/...',
    required: false,
  })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class ApplyReferralDto {
  @ApiProperty({
    description: 'Referral code',
    example: 'ABC12345',
  })
  @IsString()
  @MinLength(1, { message: 'Referral code is required' })
  referralCode: string;
}
