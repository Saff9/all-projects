import { Controller, Get, Patch, Body, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto, ApplyReferralDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile with stats' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getUserProfile(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get current user statistics' })
  @ApiResponse({ status: 200, description: 'User stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.userService.getUserStats(userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or username already taken' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(userId, updateUserDto);
  }

  @Get('referrals')
  @ApiOperation({ summary: 'Get referral statistics' })
  @ApiResponse({ status: 200, description: 'Referral stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReferralStats(@CurrentUser('id') userId: string) {
    return this.userService.getReferralStats(userId);
  }

  @Post('referral/apply')
  @ApiOperation({ summary: 'Apply a referral code' })
  @ApiResponse({ status: 200, description: 'Referral code applied successfully' })
  @ApiResponse({ status: 400, description: 'Invalid referral code or already applied' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async applyReferral(
    @CurrentUser('id') userId: string,
    @Body() applyReferralDto: ApplyReferralDto,
  ) {
    return this.userService.applyReferral(userId, applyReferralDto);
  }
}
