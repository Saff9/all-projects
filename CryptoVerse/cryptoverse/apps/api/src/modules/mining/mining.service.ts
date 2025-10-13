import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database';
import { TapDto, StartMiningDto } from './dto/tap.dto';
import { MINING_CONFIG, ERROR_MESSAGES } from '@cryptoverse/shared';

@Injectable()
export class MiningService {
  private readonly logger = new Logger(MiningService.name);

  // In-memory store for combo tracking (in production, use Redis)
  private comboTracker: Map<string, { count: number; lastTap: number }> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Perform tap action
   */
  async tap(userId: string, tapDto: TapDto) {
    const tapCount = tapDto.count || 1;
    
    // Get user with current energy
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        coins: true,
        energy: true,
        maxEnergy: true,
        miningRate: true,
        totalMined: true,
        energyUpdatedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Regenerate energy based on time passed
    const now = Date.now();
    const lastUpdate = user.energyUpdatedAt.getTime();
    const secondsPassed = Math.floor((now - lastUpdate) / 1000);
    const regeneratedEnergy = Math.min(
      secondsPassed * MINING_CONFIG.ENERGY_REGEN_RATE,
      user.maxEnergy - user.energy,
    );
    const currentEnergy = Math.min(user.energy + regeneratedEnergy, user.maxEnergy);

    // Check if enough energy
    const energyCost = tapCount * MINING_CONFIG.TAP_ENERGY_COST;
    if (currentEnergy < energyCost) {
      throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_ENERGY);
    }

    // Calculate coins earned
    let totalCoinsEarned = BigInt(0);
    let isCritical = false;
    const results: Array<{
      coinsEarned: number;
      isCritical: boolean;
      comboMultiplier: number;
    }> = [];

    for (let i = 0; i < tapCount; i++) {
      const result = this.calculateTapReward(userId, user.miningRate);
      totalCoinsEarned += BigInt(result.coinsEarned);
      if (result.isCritical) isCritical = true;
      results.push(result);
    }

    // Update combo tracker
    const combo = this.updateCombo(userId);

    // Update user in transaction
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          energy: currentEnergy - energyCost,
          coins: { increment: totalCoinsEarned },
          totalMined: { increment: totalCoinsEarned },
          energyUpdatedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Update stats
      await tx.userStats.update({
        where: { userId },
        data: {
          totalTaps: { increment: BigInt(tapCount) },
          totalEarned: { increment: totalCoinsEarned },
          lastActiveAt: new Date(),
        },
      });

      return updated;
    });

    this.logger.debug(`Tap: ${userId} earned ${totalCoinsEarned} coins from ${tapCount} taps`);

    return {
      coinsEarned: Number(totalCoinsEarned),
      isCritical,
      comboMultiplier: combo.multiplier,
      comboCount: combo.count,
      remainingEnergy: updatedUser.energy,
      totalCoins: updatedUser.coins.toString(),
    };
  }

  /**
   * Calculate tap reward
   */
  private calculateTapReward(userId: string, miningRate: number) {
    const combo = this.getCombo(userId);
    
    // Base coins
    let coinsEarned = Math.floor(MINING_CONFIG.BASE_MINING_RATE * miningRate);
    
    // Apply combo multiplier
    coinsEarned = Math.floor(coinsEarned * combo.multiplier);

    // Check for critical hit
    let isCritical = false;
    if (Math.random() < MINING_CONFIG.CRITICAL_CHANCE) {
      coinsEarned = Math.floor(coinsEarned * MINING_CONFIG.CRITICAL_MULTIPLIER);
      isCritical = true;
    }

    return {
      coinsEarned,
      isCritical,
      comboMultiplier: combo.multiplier,
    };
  }

  /**
   * Get combo multiplier for user
   */
  private getCombo(userId: string): { count: number; multiplier: number } {
    const tracker = this.comboTracker.get(userId);
    
    if (!tracker) {
      return { count: 0, multiplier: 1 };
    }

    // Combo expires after 2 seconds
    const now = Date.now();
    if (now - tracker.lastTap > 2000) {
      return { count: 0, multiplier: 1 };
    }

    // Calculate multiplier based on combo count
    // 1.0x at 0 combo, up to 2.0x at 50+ combo
    const multiplier = Math.min(1 + (tracker.count * 0.02), 2.0);
    
    return { count: tracker.count, multiplier };
  }

  /**
   * Update combo tracker
   */
  private updateCombo(userId: string): { count: number; multiplier: number } {
    const now = Date.now();
    const tracker = this.comboTracker.get(userId);

    if (!tracker || now - tracker.lastTap > 2000) {
      // Start new combo
      this.comboTracker.set(userId, { count: 1, lastTap: now });
      return { count: 1, multiplier: 1 };
    }

    // Continue combo
    const newCount = tracker.count + 1;
    this.comboTracker.set(userId, { count: newCount, lastTap: now });
    
    const multiplier = Math.min(1 + (newCount * 0.02), 2.0);
    return { count: newCount, multiplier };
  }

  /**
   * Get mining stats
   */
  async getMiningStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        energy: true,
        maxEnergy: true,
        miningRate: true,
        totalMined: true,
        energyUpdatedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const stats = await this.prisma.userStats.findUnique({
      where: { userId },
      select: { totalTaps: true },
    });

    // Calculate regenerated energy
    const now = Date.now();
    const lastUpdate = user.energyUpdatedAt.getTime();
    const secondsPassed = Math.floor((now - lastUpdate) / 1000);
    const regeneratedEnergy = Math.min(
      secondsPassed * MINING_CONFIG.ENERGY_REGEN_RATE,
      user.maxEnergy - user.energy,
    );
    const currentEnergy = Math.min(user.energy + regeneratedEnergy, user.maxEnergy);

    // Calculate time until full energy
    const energyNeeded = user.maxEnergy - currentEnergy;
    const timeUntilFull = Math.ceil(energyNeeded / MINING_CONFIG.ENERGY_REGEN_RATE);

    return {
      energy: currentEnergy,
      maxEnergy: user.maxEnergy,
      energyRegenRate: MINING_CONFIG.ENERGY_REGEN_RATE,
      miningRate: user.miningRate,
      totalMined: user.totalMined.toString(),
      totalTaps: stats?.totalTaps.toString() || '0',
      timeUntilFullEnergy: timeUntilFull,
    };
  }

  /**
   * Start mining session
   */
  async startMining(userId: string, startMiningDto?: StartMiningDto) {
    // Check for existing active session
    const existingSession = await this.prisma.miningSession.findFirst({
      where: { userId, isActive: true },
    });

    if (existingSession) {
      return {
        success: true,
        message: 'Mining session already active',
        session: {
          id: existingSession.id,
          startTime: existingSession.startTime,
          coinsEarned: existingSession.coinsEarned.toString(),
          isActive: existingSession.isActive,
        },
      };
    }

    // Create new session
    const session = await this.prisma.miningSession.create({
      data: {
        userId,
        startTime: new Date(),
        coinsEarned: BigInt(0),
        isActive: true,
      },
    });

    this.logger.log(`Mining session started: ${userId}`);

    return {
      success: true,
      message: 'Mining session started',
      session: {
        id: session.id,
        startTime: session.startTime,
        coinsEarned: session.coinsEarned.toString(),
        isActive: session.isActive,
      },
    };
  }

  /**
   * Stop mining session
   */
  async stopMining(userId: string) {
    const session = await this.prisma.miningSession.findFirst({
      where: { userId, isActive: true },
    });

    if (!session) {
      return {
        success: true,
        message: 'No active mining session',
      };
    }

    // End session
    const updatedSession = await this.prisma.miningSession.update({
      where: { id: session.id },
      data: {
        endTime: new Date(),
        isActive: false,
      },
    });

    this.logger.log(`Mining session stopped: ${userId}`);

    return {
      success: true,
      message: 'Mining session stopped',
      session: {
        id: updatedSession.id,
        startTime: updatedSession.startTime,
        endTime: updatedSession.endTime,
        coinsEarned: updatedSession.coinsEarned.toString(),
        isActive: updatedSession.isActive,
      },
    };
  }

  /**
   * Get available mining boosts
   */
  async getBoosts() {
    const boosts = await this.prisma.miningBoost.findMany({
      orderBy: { cost: 'asc' },
    });

    return boosts.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      multiplier: b.multiplier,
      duration: b.duration,
      cost: b.cost.toString(),
    }));
  }

  /**
   * Get mining history
   */
  async getMiningHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.prisma.miningSession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.miningSession.count({
        where: { userId },
      }),
    ]);

    return {
      data: sessions.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        coinsEarned: s.coinsEarned.toString(),
        isActive: s.isActive,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
