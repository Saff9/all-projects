import { api } from './api';
import { Airdrop, UserAirdrop } from '@cryptoverse/shared';

// ==========================================
// Types
// ==========================================

export interface AirdropWithEligibility extends Airdrop {
  eligible: boolean;
  claimed: boolean;
  claimedAt?: Date;
  requirementsMet: string[];
  requirementsMissing: string[];
}

export interface EligibilityCheck {
  airdropId: string;
  eligible: boolean;
  requirementsMet: string[];
  requirementsMissing: string[];
}

export interface ClaimAirdropData {
  airdropId: string;
  walletAddress?: string;
}

export interface ClaimResult {
  userAirdrop: UserAirdrop;
  tokensClaimed: number;
}

// ==========================================
// Airdrop Service
// ==========================================

export const airdropService = {
  /**
   * Get all active airdrops
   */
  getAllAirdrops: async (): Promise<Airdrop[]> => {
    return api.get<Airdrop[]>('/airdrops');
  },

  /**
   * Get current user's airdrops with eligibility
   */
  getUserAirdrops: async (): Promise<AirdropWithEligibility[]> => {
    return api.get<AirdropWithEligibility[]>('/airdrops/user');
  },

  /**
   * Check eligibility for an airdrop
   */
  checkEligibility: async (airdropId: string): Promise<EligibilityCheck> => {
    return api.get<EligibilityCheck>(`/airdrops/${airdropId}/eligibility`);
  },

  /**
   * Claim an airdrop
   */
  claimAirdrop: async (data: ClaimAirdropData): Promise<ClaimResult> => {
    return api.post<ClaimResult>('/airdrops/claim', data);
  },
};

export default airdropService;