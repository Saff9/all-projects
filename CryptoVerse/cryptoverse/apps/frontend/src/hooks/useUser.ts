import { useCallback, useEffect } from 'react';
import { useUserStore, useAuthStore } from '../stores';
import { UpdateProfileData } from '../services';

// ==========================================
// Hook
// ==========================================

export function useUser() {
  const { user: authUser, isAuthenticated } = useAuthStore();
  const {
    profile,
    stats,
    referralStats,
    isLoading,
    error,
    fetchProfile,
    fetchStats,
    fetchReferralStats,
    updateProfile,
    applyReferral,
    updateCoins,
    updateMiningRate,
    setLoading,
    setError,
    reset,
  } = useUserStore();

  // Fetch profile when authenticated
  useEffect(() => {
    if (isAuthenticated && authUser) {
      fetchProfile();
      fetchStats();
    }
  }, [isAuthenticated, authUser, fetchProfile, fetchStats]);

  // Update profile handler
  const handleUpdateProfile = useCallback(
    async (data: UpdateProfileData) => {
      try {
        await updateProfile(data);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        return false;
      }
    },
    [updateProfile, setError]
  );

  // Apply referral code handler
  const handleApplyReferral = useCallback(
    async (code: string) => {
      try {
        const result = await applyReferral(code);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to apply referral');
        throw err;
      }
    },
    [applyReferral, setError]
  );

  // Get display name
  const displayName = profile?.username || profile?.firstName || 'Player';

  // Get level progress
  const levelProgress = profile
    ? {
        level: profile.level,
        current: profile.experience,
        needed: profile.nextLevelExp,
        percentage: Math.min((profile.experience / profile.nextLevelExp) * 100, 100),
      }
    : null;

  return {
    profile,
    stats,
    referralStats,
    isLoading,
    error,
    displayName,
    levelProgress,
    fetchProfile,
    fetchStats,
    fetchReferralStats,
    updateProfile: handleUpdateProfile,
    applyReferral: handleApplyReferral,
    updateCoins,
    updateMiningRate,
    setLoading,
    setError,
    reset,
  };
}

export default useUser;