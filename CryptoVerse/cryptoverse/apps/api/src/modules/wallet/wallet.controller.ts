import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import {
  TransferDto,
  StakeDto,
  UnstakeDto,
  ConnectWalletDto,
  TransactionQueryDto,
} from './dto/transfer.dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer tokens to another user' })
  @ApiResponse({ status: 200, description: 'Transfer successful' })
  @ApiResponse({ status: 400, description: 'Insufficient coins or invalid recipient' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async transfer(
    @CurrentUser('id') userId: string,
    @Body() transferDto: TransferDto,
  ) {
    return this.walletService.transfer(userId, transferDto);
  }

  @Post('stake')
  @ApiOperation({ summary: 'Stake tokens' })
  @ApiResponse({ status: 200, description: 'Tokens staked successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient coins' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async stake(
    @CurrentUser('id') userId: string,
    @Body() stakeDto: StakeDto,
  ) {
    return this.walletService.stake(userId, stakeDto);
  }

  @Post('unstake')
  @ApiOperation({ summary: 'Unstake tokens' })
  @ApiResponse({ status: 200, description: 'Tokens unstaked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid stake or lock period not ended' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unstake(
    @CurrentUser('id') userId: string,
    @Body() unstakeDto: UnstakeDto,
  ) {
    return this.walletService.unstake(userId, unstakeDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query() query: TransactionQueryDto,
  ) {
    return this.walletService.getTransactionHistory(
      userId,
      query.page,
      query.limit,
      query.type,
    );
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect external wallet' })
  @ApiResponse({ status: 200, description: 'Wallet connected successfully' })
  @ApiResponse({ status: 400, description: 'Wallet already connected' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async connectWallet(
    @CurrentUser('id') userId: string,
    @Body() connectWalletDto: ConnectWalletDto,
  ) {
    return this.walletService.connectWallet(userId, connectWalletDto);
  }

  @Get('connected')
  @ApiOperation({ summary: 'Get connected wallets' })
  @ApiResponse({ status: 200, description: 'Connected wallets retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWallets(@CurrentUser('id') userId: string) {
    return this.walletService.getWallets(userId);
  }

  @Delete(':walletId')
  @ApiOperation({ summary: 'Disconnect wallet' })
  @ApiResponse({ status: 200, description: 'Wallet disconnected successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async disconnectWallet(
    @CurrentUser('id') userId: string,
    @Param('walletId') walletId: string,
  ) {
    return this.walletService.disconnectWallet(userId, walletId);
  }
}
