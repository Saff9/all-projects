import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AirdropService } from './airdrop.service';
import { ClaimAirdropDto } from './dto/claim-airdrop.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('airdrop')
@ApiBearerAuth()
@Controller('airdrops')
export class AirdropController {
  constructor(private readonly airdropService: AirdropService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active airdrops' })
  @ApiResponse({ status: 200, description: 'Airdrops retrieved successfully' })
  async getAllAirdrops() {
    return this.airdropService.getAllAirdrops();
  }

  @Get('user')
  @ApiOperation({ summary: "Get current user's airdrops with eligibility" })
  @ApiResponse({ status: 200, description: 'User airdrops retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserAirdrops(@CurrentUser('id') userId: string) {
    return this.airdropService.getUserAirdrops(userId);
  }

  @Get(':id/eligibility')
  @ApiOperation({ summary: 'Check eligibility for an airdrop' })
  @ApiResponse({ status: 200, description: 'Eligibility checked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Airdrop not found' })
  async checkEligibility(
    @CurrentUser('id') userId: string,
    @Param('id') airdropId: string,
  ) {
    return this.airdropService.checkEligibility(userId, airdropId);
  }

  @Post('claim')
  @ApiOperation({ summary: 'Claim an airdrop' })
  @ApiResponse({ status: 200, description: 'Airdrop claimed successfully' })
  @ApiResponse({ status: 400, description: 'Not eligible or already claimed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Airdrop not found' })
  async claimAirdrop(
    @CurrentUser('id') userId: string,
    @Body() claimAirdropDto: ClaimAirdropDto,
  ) {
    return this.airdropService.claimAirdrop(userId, claimAirdropDto);
  }
}