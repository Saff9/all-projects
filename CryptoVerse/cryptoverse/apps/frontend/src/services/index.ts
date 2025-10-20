// API Client
export { api, tokenManager, handleApiError, ApiError } from './api';
export { default as apiClient } from './api';

// Services
export { authService } from './auth.service';
export { userService } from './user.service';
export { walletService } from './wallet.service';
export { miningService } from './mining.service';
export { characterService } from './character.service';
export { achievementService } from './achievement.service';
export { questService } from './quest.service';
export { leaderboardService } from './leaderboard.service';
export { airdropService } from './airdrop.service';
export { telegramService, getTelegramWebApp, isTelegramEnvironment, getTelegramUser } from './telegram.service';

// Types
export type { AuthResponse, TelegramAuthData } from './auth.service';
export type { UserProfile, ReferralStats, Referral, UpdateProfileData, ApplyReferralData } from './user.service';
export type { WalletBalance, Transaction, TransactionHistory, TransferData, StakeData, UnstakeData, ConnectWalletData, StakeInfo } from './wallet.service';
export type { MiningStats, ActiveBoost, TapResult, TapData, StartMiningData, MiningSession, MiningHistory } from './mining.service';
export type { CharacterWithProgress, UserCharacterWithDetails, UpgradeResult, UnlockResult, UpgradeData, UnlockData, CharacterAbility } from './character.service';
export type { AchievementWithProgress, ClaimResult as AchievementClaimResult } from './achievement.service';
export type { QuestWithProgress, StartQuestData, ClaimResult as QuestClaimResult } from './quest.service';
export type { LeaderboardData } from './leaderboard.service';
export type { AirdropWithEligibility, EligibilityCheck, ClaimAirdropData, ClaimResult as AirdropClaimResult } from './airdrop.service';
export type { TelegramUser, TelegramWebApp } from './telegram.service';
