import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database';
import { LEADERBOARD_CONFIG } from '@cryptoverse/shared';

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get global leaderboard by type
   */
  async getLeaderboard(
    userId: string,
    type: string,
    limit: number = LEADERBOARD_CONFIG.LIMIT,
  ) {
    const leaderboardType = type.toUpperCase();

    let orderBy: any = { coins: 'desc' };
    let selectValue = 'coins';

    switch (leaderboardType) {
      case 'COINS':
        orderBy = { coins: 'desc' };
        selectValue = 'coins';
        break;
      case 'MINING':
        orderBy = { totalMined: 'desc' };
        selectValue = 'totalMined';
        break;
      case 'ACHIEVEMENTS':
        // Need to join with userStats
        orderBy = { stats: { achievementsUnlocked: 'desc' } };
        selectValue = 'achievementsUnlocked';
        break;
      case 'REFERRALS':
        // Count referrals
        orderBy = { referrals: { _count: 'desc' } };
        selectValue = 'referrals';
        break;
      default:
        orderBy = { coins: 'desc' };
        selectValue = 'coins';
    }

    // Get top users
    const users = await this.prisma.user.findMany({
      where: {},
      orderBy,
      take: limit,
      select: {
        id: true,
        username: true,
        firstName: true,
        photoUrl: true,
        coins: true,
        totalMined: true,
        stats: {
          select: {
            achievementsUnlocked: true,
          },
        },
        _count: {
          select: {
            referrals: true,
          },
        },
      },
    });

    // Get current user's rank
    let currentUserRank: number | undefined;
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        coins: true,
        totalMined: true,
        stats: {
          select: {
            achievementsUnlocked: true,
          },
        },
        _count: {
          select: {
            referrals: true,
          },
        },
      },
    });

    if (currentUser) {
      // Count users with higher value
      if (leaderboardType === 'COINS') {
        const higherCount = await this.prisma.user.count({
          where: { coins: { gt: currentUser.coins } },
        });
        currentUserRank = higherCount + 1;
      } else if (leaderboardType === 'MINING') {
        const higherCount = await this.prisma.user.count({
          where: { totalMined: { gt: currentUser.totalMined } },
        });
        currentUserRank = higherCount + 1;
      } else if (leaderboardType === 'ACHIEVEMENTS') {
        const userAchievements = currentUser.stats?.achievementsUnlocked || 0;
        const higherCount = await this.prisma.userStats.count({
          where: { achievementsUnlocked: { gt: userAchievements } },
        });
        currentUserRank = higherCount + 1;
      } else if (leaderboardType === 'REFERRALS') {
        const userReferrals = currentUser._count.referrals;
        // This is more complex, simplified version
        currentUserRank = undefined;
      }
    }

    // Format entries
    const entries = users.map((user, index) => {
      let value: bigint | number;
      switch (leaderboardType) {
        case 'COINS':
          value = user.coins;
          break;
        case 'MINING':
          value = user.totalMined;
          break;
        case 'ACHIEVEMENTS':
          value = user.stats?.achievementsUnlocked || 0;
          break;
        case 'REFERRALS':
          value = user._count.referrals;
          break;
        default:
          value = user.coins;
      }

      return {
        rank: index + 1,
        userId: user.id,
        username: user.username || user.firstName,
        photoUrl: user.photoUrl,
        value: typeof value === 'bigint' ? value.toString() : value.toString(),
        isCurrentUser: user.id === userId,
      };
    });

    return {
      type: type.toLowerCase(),
      entries,
      currentUserRank,
      updatedAt: new Date(),
    };
  }

  /**
   * Get friends leaderboard
   */
  async getFriendsLeaderboard(
    userId: string,
    limit: number = LEADERBOARD_CONFIG.LIMIT,
  ) {
    // Get user's referrals (friends)
    const friends = await this.prisma.user.findMany({
      where: { referredBy: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        photoUrl: true,
        coins: true,
      },
      orderBy: { coins: 'desc' },
      take: limit,
    });

    // Include current user
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        photoUrl: true,
        coins: true,
      },
    });

    const allUsers = currentUser ? [currentUser, ...friends] : friends;

    // Sort by coins
    allUsers.sort((a, b) => {
      const coinsA = Number(a.coins);
      const coinsB = Number(b.coins);
      return coinsB - coinsA;
    });

    const entries = allUsers.slice(0, limit).map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username || user.firstName,
      photoUrl: user.photoUrl,
      value: user.coins.toString(),
      isCurrentUser: user.id === userId,
    }));

    return {
      type: 'friends',
      entries,
      currentUserRank: entries.find((e) => e.isCurrentUser)?.rank,
      updatedAt: new Date(),
    };
  }

  /**
   * Get daily leaderboard (resets daily)
   */
  async getDailyLeaderboard(
    userId: string,
    limit: number = LEADERBOARD_CONFIG.LIMIT,
  ) {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get mining sessions from today
    const sessions = await this.prisma.miningSession.findMany({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        userId: true,
        coinsEarned: true,
      },
    });

    // Aggregate by user
    const userEarnings = new Map<string, bigint>();
    for (const session of sessions) {
      const current = userEarnings.get(session.userId) || BigInt(0);
      userEarnings.set(session.userId, current + session.coinsEarned);
    }

    // Sort and get top users
    const sortedUsers = Array.from(userEarnings.entries())
      .sort((a, b) => {
        const aVal = Number(a[1]);
        const bVal = Number(b[1]);
        return bVal - aVal;
      })
      .slice(0, limit);

    // Get user details
    const userIds = sortedUsers.map(([id]) => id);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        firstName: true,
        photoUrl: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const entries = sortedUsers.map(([id, earnings], index) => {
      const user = userMap.get(id);
      return {
        rank: index + 1,
        userId: id,
        username: user?.username || user?.firstName,
        photoUrl: user?.photoUrl,
        value: earnings.toString(),
        isCurrentUser: id === userId,
      };
    });

    // Get current user rank
    const currentUserRank = sortedUsers.findIndex(([id]) => id === userId) + 1;

    return {
      type: 'daily',
      entries,
      currentUserRank: currentUserRank || undefined,
      updatedAt: new Date(),
    };
  }
}
