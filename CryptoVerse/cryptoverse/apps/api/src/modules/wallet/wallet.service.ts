import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import { TransferDto, StakeDto, UnstakeDto, ConnectWalletDto } from './dto/transfer.dto';
import { ERROR_MESSAGES } from '@cryptoverse/shared';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  // Staking APY based on lock period
  private readonly STAKING_APY: Record<number, number> = {
    7: 5,   // 5% APY for 7 days
    14: 7,  // 7% APY for 14 days
    30: 10, // 10% APY for 30 days
    90: 15, // 15% APY for 90 days
    180: 20, // 20% APY for 180 days
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get wallet balance
   */
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Get staked amount (if we had a Stake model)
    // For now, we'll return 0 for staked
    const staked = BigInt(0);
    const pendingRewards = BigInt(0);

    return {
      available: user.coins.toString(),
      staked: staked.toString(),
      total: (user.coins + staked).toString(),
      pendingRewards: pendingRewards.toString(),
    };
  }

  /**
   * Transfer tokens to another user
   */
  async transfer(userId: string, transferDto: TransferDto) {
    const { recipientId, amount } = transferDto;
    const amountBigInt = BigInt(amount);

    // Check if recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    if (recipientId === userId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Check sender balance
    const sender = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!sender || sender.coins < amountBigInt) {
      throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_COINS);
    }

    // Perform transfer in transaction
    await this.prisma.$transaction(async (tx) => {
      // Deduct from sender
      await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: amountBigInt } },
      });

      // Add to recipient
      await tx.user.update({
        where: { id: recipientId },
        data: { coins: { increment: amountBigInt } },
      });

      // Update recipient stats
      await tx.userStats.update({
        where: { userId: recipientId },
        data: { totalEarned: { increment: amountBigInt } },
      });
    });

    this.logger.log(`Transfer: ${userId} -> ${recipientId}: ${amount}`);

    return {
      success: true,
      message: 'Transfer successful',
      amount: amount,
      recipientId,
    };
  }

  /**
   * Stake tokens
   */
  async stake(userId: string, stakeDto: StakeDto) {
    const { amount, lockPeriodDays = 30 } = stakeDto;
    const amountBigInt = BigInt(amount);

    // Get APY for lock period
    const apy = this.STAKING_APY[lockPeriodDays] || 10;

    // Check user balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!user || user.coins < amountBigInt) {
      throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_COINS);
    }

    // Deduct staked amount
    await this.prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: amountBigInt } },
    });

    this.logger.log(`Stake: ${userId} staked ${amount} for ${lockPeriodDays} days`);

    // Note: In a real implementation, you would create a Stake record
    // For now, we'll just return the stake info
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + lockPeriodDays);

    return {
      success: true,
      message: 'Tokens staked successfully',
      stake: {
        amount: amount,
        apy,
        lockPeriodDays,
        startDate,
        endDate,
        pendingRewards: 0,
      },
    };
  }

  /**
   * Unstake tokens
   */
  async unstake(userId: string, unstakeDto: UnstakeDto) {
    // Note: In a real implementation, you would:
    // 1. Find the stake record
    // 2. Check if lock period has ended
    // 3. Calculate rewards
    // 4. Return principal + rewards to user

    this.logger.log(`Unstake: ${userId} unstaking ${unstakeDto.stakeId}`);

    return {
      success: true,
      message: 'Tokens unstaked successfully',
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    type?: string,
  ) {
    // Note: In a real implementation, you would have a Transaction model
    // For now, we'll return an empty list
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  /**
   * Connect wallet address
   */
  async connectWallet(userId: string, connectWalletDto: ConnectWalletDto) {
    const { address, network = 'ethereum' } = connectWalletDto;

    // Check if wallet already connected
    const existingWallet = await this.prisma.wallet.findFirst({
      where: { userId, address },
    });

    if (existingWallet) {
      throw new BadRequestException(ERROR_MESSAGES.WALLET_ALREADY_CONNECTED);
    }

    // Create wallet
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        address,
        network,
        isVerified: false,
      },
    });

    this.logger.log(`Wallet connected: ${userId} - ${address}`);

    return {
      id: wallet.id,
      userId: wallet.userId,
      address: wallet.address,
      network: wallet.network,
      isVerified: wallet.isVerified,
      createdAt: wallet.createdAt,
    };
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(userId: string, walletId: string) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    await this.prisma.wallet.delete({
      where: { id: walletId },
    });

    this.logger.log(`Wallet disconnected: ${userId} - ${walletId}`);

    return {
      success: true,
      message: 'Wallet disconnected successfully',
    };
  }

  /**
   * Get connected wallets
   */
  async getWallets(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return wallets.map((w) => ({
      id: w.id,
      userId: w.userId,
      address: w.address,
      network: w.network,
      isVerified: w.isVerified,
      verifiedAt: w.verifiedAt,
      createdAt: w.createdAt,
    }));
  }
}
