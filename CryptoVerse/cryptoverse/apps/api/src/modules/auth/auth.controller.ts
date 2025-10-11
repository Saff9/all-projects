import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, AuthResult } from './auth.service';
import { TelegramAuthDto, RefreshTokenDto, AuthResponseDto } from './dto/telegram-auth.dto';
import { Public } from '../../common/decorators';
import { CurrentUser } from '../../common/decorators';

function mapToResponseDto(result: AuthResult): AuthResponseDto {
  return {
    access_token: result.accessToken,
    refresh_token: result.refreshToken,
    expires_in: result.expiresIn,
    user_id: result.userId,
    is_new_user: result.isNewUser,
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Telegram WebApp init data' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid Telegram init data' })
  async loginWithTelegram(
    @Body() telegramAuthDto: TelegramAuthDto,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.loginWithTelegram(telegramAuthDto.init_data);
    return mapToResponseDto(result);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.refreshToken(refreshTokenDto.refresh_token);
    return mapToResponseDto(result);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser('id') userId: string) {
    return this.authService.validateUser(userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout() {
    // In a stateless JWT setup, logout is handled client-side
    // by removing the token. We can implement token blacklisting
    // here if needed for enhanced security.
    return {
      success: true,
      message: 'Successfully logged out',
    };
  }
}
