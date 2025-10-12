import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class TelegramUserDto {
  @ApiProperty({
    description: 'Telegram user ID',
    example: 123456789,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'Language code',
    example: 'en',
    required: false,
  })
  @IsString()
  @IsOptional()
  language_code?: string;

  @ApiProperty({
    description: 'Profile photo URL',
    example: 'https://t.me/i/userpic/...',
    required: false,
  })
  @IsString()
  @IsOptional()
  photo_url?: string;
}

export class TelegramAuthDto {
  @ApiProperty({
    description: 'Telegram WebApp init data string',
    example: 'user=%7B%22id%22%3A123456789%7D&auth_date=1234567890&hash=abc123',
  })
  @IsString()
  @IsNotEmpty()
  init_data: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 604800,
  })
  expires_in: number;

  @ApiProperty({
    description: 'User ID',
    example: 'clx123456789',
  })
  user_id: string;

  @ApiProperty({
    description: 'Whether this is a new user',
    example: false,
  })
  is_new_user: boolean;
}
