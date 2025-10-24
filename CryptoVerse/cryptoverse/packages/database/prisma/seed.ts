import { PrismaClient, CharacterRarity, AchievementCategory, QuestType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ==========================================
  // Seed Characters
  // ==========================================
  console.log('📦 Seeding characters...');

  const characters = [
    {
      name: 'Crypto Novice',
      description: 'A beginner in the crypto world, eager to learn and earn.',
      rarity: CharacterRarity.COMMON,
      baseMiningBonus: 1.1,
      maxLevel: 10,
    },
    {
      name: 'Blockchain Builder',
      description: 'Building the future, one block at a time.',
      rarity: CharacterRarity.COMMON,
      baseMiningBonus: 1.15,
      maxLevel: 10,
    },
    {
      name: 'Token Trader',
      description: 'A skilled trader who knows when to HODL and when to sell.',
      rarity: CharacterRarity.UNCOMMON,
      baseMiningBonus: 1.25,
      maxLevel: 15,
    },
    {
      name: 'DeFi Developer',
      description: 'Creating decentralized solutions for a better financial future.',
      rarity: CharacterRarity.UNCOMMON,
      baseMiningBonus: 1.3,
      maxLevel: 15,
    },
    {
      name: 'NFT Artist',
      description: 'Turning digital art into valuable collectibles.',
      rarity: CharacterRarity.RARE,
      baseMiningBonus: 1.5,
      maxLevel: 20,
    },
    {
      name: 'Smart Contract Auditor',
      description: 'Ensuring the security and reliability of blockchain applications.',
      rarity: CharacterRarity.RARE,
      baseMiningBonus: 1.6,
      maxLevel: 20,
    },
    {
      name: 'Whale Watcher',
      description: 'Tracking the big players and following their moves.',
      rarity: CharacterRarity.EPIC,
      baseMiningBonus: 2.0,
      maxLevel: 25,
    },
    {
      name: 'Satoshi\'s Heir',
      description: 'Carrying forward the vision of decentralized currency.',
      rarity: CharacterRarity.EPIC,
      baseMiningBonus: 2.25,
      maxLevel: 25,
    },
    {
      name: 'Crypto Pioneer',
      description: 'One of the first to believe in the power of cryptocurrency.',
      rarity: CharacterRarity.LEGENDARY,
      baseMiningBonus: 3.0,
      maxLevel: 30,
    },
    {
      name: 'Bitcoin Oracle',
      description: 'Possessing the wisdom to predict market movements.',
      rarity: CharacterRarity.LEGENDARY,
      baseMiningBonus: 3.5,
      maxLevel: 30,
      specialAbility: 'Double mining rewards for 1 hour once per day',
    },
  ];

  for (const character of characters) {
    await prisma.character.upsert({
      where: { name: character.name },
      update: character,
      create: character,
    });
  }

  console.log(`✅ Created ${characters.length} characters`);

  // ==========================================
  // Seed Achievements
  // ==========================================
  console.log('🏆 Seeding achievements...');

  const achievements = [
    // Mining Achievements
    {
      name: 'First Tap',
      description: 'Make your first mining tap',
      category: AchievementCategory.MINING,
      requirement: 1,
      reward: BigInt(10),
    },
    {
      name: 'Mining Enthusiast',
      description: 'Tap 1,000 times',
      category: AchievementCategory.MINING,
      requirement: 1000,
      reward: BigInt(100),
    },
    {
      name: 'Mining Pro',
      description: 'Tap 10,000 times',
      category: AchievementCategory.MINING,
      requirement: 10000,
      reward: BigInt(500),
    },
    {
      name: 'Mining Master',
      description: 'Tap 100,000 times',
      category: AchievementCategory.MINING,
      requirement: 100000,
      reward: BigInt(2000),
    },
    {
      name: 'Coin Collector',
      description: 'Earn 10,000 coins total',
      category: AchievementCategory.MINING,
      requirement: 10000,
      reward: BigInt(200),
    },
    {
      name: 'Wealth Builder',
      description: 'Earn 100,000 coins total',
      category: AchievementCategory.MINING,
      requirement: 100000,
      reward: BigInt(1000),
    },
    {
      name: 'Crypto Millionaire',
      description: 'Earn 1,000,000 coins total',
      category: AchievementCategory.MINING,
      requirement: 1000000,
      reward: BigInt(10000),
    },

    // Social Achievements
    {
      name: 'First Referral',
      description: 'Invite your first friend',
      category: AchievementCategory.SOCIAL,
      requirement: 1,
      reward: BigInt(100),
    },
    {
      name: 'Social Butterfly',
      description: 'Invite 10 friends',
      category: AchievementCategory.SOCIAL,
      requirement: 10,
      reward: BigInt(500),
    },
    {
      name: 'Community Builder',
      description: 'Invite 50 friends',
      category: AchievementCategory.SOCIAL,
      requirement: 50,
      reward: BigInt(2500),
    },
    {
      name: 'Influencer',
      description: 'Invite 100 friends',
      category: AchievementCategory.SOCIAL,
      requirement: 100,
      reward: BigInt(10000),
    },

    // Collection Achievements
    {
      name: 'First Character',
      description: 'Acquire your first character',
      category: AchievementCategory.COLLECTION,
      requirement: 1,
      reward: BigInt(50),
    },
    {
      name: 'Collector',
      description: 'Own 5 characters',
      category: AchievementCategory.COLLECTION,
      requirement: 5,
      reward: BigInt(250),
    },
    {
      name: 'Enthusiast',
      description: 'Own 10 characters',
      category: AchievementCategory.COLLECTION,
      requirement: 10,
      reward: BigInt(1000),
    },
    {
      name: 'Rarity Hunter',
      description: 'Own a legendary character',
      category: AchievementCategory.COLLECTION,
      requirement: 1,
      reward: BigInt(5000),
    },

    // Quest Achievements
    {
      name: 'Quest Starter',
      description: 'Complete your first quest',
      category: AchievementCategory.QUEST,
      requirement: 1,
      reward: BigInt(50),
    },
    {
      name: 'Quest Completer',
      description: 'Complete 10 quests',
      category: AchievementCategory.QUEST,
      requirement: 10,
      reward: BigInt(300),
    },
    {
      name: 'Quest Master',
      description: 'Complete 50 quests',
      category: AchievementCategory.QUEST,
      requirement: 50,
      reward: BigInt(1500),
    },
    {
      name: 'Quest Legend',
      description: 'Complete 100 quests',
      category: AchievementCategory.QUEST,
      requirement: 100,
      reward: BigInt(5000),
    },

    // Special Achievements
    {
      name: 'Early Adopter',
      description: 'Join CryptoVerse in the first week',
      category: AchievementCategory.SPECIAL,
      requirement: 1,
      reward: BigInt(1000),
    },
    {
      name: 'Week Warrior',
      description: 'Log in 7 days in a row',
      category: AchievementCategory.SPECIAL,
      requirement: 7,
      reward: BigInt(500),
    },
    {
      name: 'Monthly Master',
      description: 'Log in 30 days in a row',
      category: AchievementCategory.SPECIAL,
      requirement: 30,
      reward: BigInt(5000),
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✅ Created ${achievements.length} achievements`);

  // ==========================================
  // Seed Quests
  // ==========================================
  console.log('📋 Seeding quests...');

  const dailyQuests = [
    {
      name: 'Daily Miner',
      description: 'Tap 100 times today',
      type: QuestType.DAILY,
      requirement: 100,
      reward: BigInt(50),
    },
    {
      name: 'Daily Earner',
      description: 'Earn 500 coins today',
      type: QuestType.DAILY,
      requirement: 500,
      reward: BigInt(75),
    },
    {
      name: 'Daily Social',
      description: 'Invite 1 friend today',
      type: QuestType.DAILY,
      requirement: 1,
      reward: BigInt(100),
    },
    {
      name: 'Daily Streak',
      description: 'Log in to maintain your streak',
      type: QuestType.DAILY,
      requirement: 1,
      reward: BigInt(25),
    },
  ];

  const weeklyQuests = [
    {
      name: 'Weekly Grinder',
      description: 'Tap 5,000 times this week',
      type: QuestType.WEEKLY,
      requirement: 5000,
      reward: BigInt(500),
    },
    {
      name: 'Weekly Wealth',
      description: 'Earn 10,000 coins this week',
      type: QuestType.WEEKLY,
      requirement: 10000,
      reward: BigInt(750),
    },
    {
      name: 'Weekly Social',
      description: 'Invite 5 friends this week',
      type: QuestType.WEEKLY,
      requirement: 5,
      reward: BigInt(1000),
    },
    {
      name: 'Weekly Collector',
      description: 'Acquire 2 new characters this week',
      type: QuestType.WEEKLY,
      requirement: 2,
      reward: BigInt(600),
    },
  ];

  const allQuests = [...dailyQuests, ...weeklyQuests];

  for (const quest of allQuests) {
    await prisma.quest.upsert({
      where: { name: quest.name },
      update: quest,
      create: quest,
    });
  }

  console.log(`✅ Created ${allQuests.length} quests`);

  // ==========================================
  // Seed Mining Boosts
  // ==========================================
  console.log('⚡ Seeding mining boosts...');

  const boosts = [
    {
      name: 'Mini Boost',
      description: '2x mining rate for 5 minutes',
      multiplier: 2.0,
      duration: 300, // 5 minutes
      cost: BigInt(100),
    },
    {
      name: 'Standard Boost',
      description: '2x mining rate for 15 minutes',
      multiplier: 2.0,
      duration: 900, // 15 minutes
      cost: BigInt(250),
    },
    {
      name: 'Mega Boost',
      description: '3x mining rate for 30 minutes',
      multiplier: 3.0,
      duration: 1800, // 30 minutes
      cost: BigInt(500),
    },
    {
      name: 'Ultra Boost',
      description: '5x mining rate for 1 hour',
      multiplier: 5.0,
      duration: 3600, // 1 hour
      cost: BigInt(1000),
    },
    {
      name: 'Legendary Boost',
      description: '10x mining rate for 2 hours',
      multiplier: 10.0,
      duration: 7200, // 2 hours
      cost: BigInt(5000),
    },
  ];

  for (const boost of boosts) {
    await prisma.miningBoost.upsert({
      where: { name: boost.name },
      update: boost,
      create: boost,
    });
  }

  console.log(`✅ Created ${boosts.length} mining boosts`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
