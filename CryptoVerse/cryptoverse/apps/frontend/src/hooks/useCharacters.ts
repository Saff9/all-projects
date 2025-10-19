import { useCallback, useEffect } from 'react';
import { CharacterRarity } from '@cryptoverse/shared';
import { useCharacterStore, useAuthStore } from '../stores';

// ==========================================
// Hook
// ==========================================

export function useCharacters() {
  const { isAuthenticated } = useAuthStore();
  const {
    allCharacters,
    userCharacters,
    selectedCharacter,
    isLoading,
    isUpgrading,
    isUnlocking,
    error,
    filter,
    fetchAllCharacters,
    fetchUserCharacters,
    selectCharacter,
    upgradeCharacter,
    unlockCharacter,
    setFilter,
    clearFilter,
    setLoading,
    setError,
    reset,
  } = useCharacterStore();

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllCharacters();
      fetchUserCharacters();
    }
  }, [isAuthenticated, fetchAllCharacters, fetchUserCharacters]);

  // Handle upgrade
  const handleUpgrade = useCallback(
    async (userCharacterId: string, levels?: number) => {
      try {
        await upgradeCharacter(userCharacterId, levels);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upgrade character';
        setError(message);
        return { success: false, error: message };
      }
    },
    [upgradeCharacter, setError]
  );

  // Handle unlock
  const handleUnlock = useCallback(
    async (characterId: string) => {
      try {
        await unlockCharacter(characterId);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to unlock character';
        setError(message);
        return { success: false, error: message };
      }
    },
    [unlockCharacter, setError]
  );

  // Filter characters
  const filteredCharacters = allCharacters.filter((char) => {
    if (filter.rarity && char.rarity !== filter.rarity) return false;
    if (filter.owned && !char.owned) return false;
    return true;
  });

  // Get characters by rarity
  const getCharactersByRarity = useCallback(
    (rarity: CharacterRarity) => {
      return allCharacters.filter((char) => char.rarity === rarity);
    },
    [allCharacters]
  );

  // Get owned characters count
  const ownedCount = userCharacters.length;

  // Get total mining bonus from all characters
  const totalMiningBonus = userCharacters.reduce((total, uc) => {
    const bonus = uc.character.baseMiningBonus * (1 + (uc.level - 1) * 0.1);
    return total + bonus;
  }, 0);

  // Get strongest character
  const strongestCharacter = userCharacters.reduce((strongest, uc) => {
    const bonus = uc.character.baseMiningBonus * (1 + (uc.level - 1) * 0.1);
    const strongestBonus = strongest
      ? strongest.character.baseMiningBonus * (1 + (strongest.level - 1) * 0.1)
      : 0;
    return bonus > strongestBonus ? uc : strongest;
  }, null as typeof userCharacters[0] | null);

  return {
    allCharacters,
    filteredCharacters,
    userCharacters,
    selectedCharacter,
    isLoading,
    isUpgrading,
    isUnlocking,
    error,
    filter,
    ownedCount,
    totalMiningBonus,
    strongestCharacter,
    fetchAllCharacters,
    fetchUserCharacters,
    selectCharacter,
    upgradeCharacter: handleUpgrade,
    unlockCharacter: handleUnlock,
    setFilter,
    clearFilter,
    getCharactersByRarity,
    setLoading,
    setError,
    reset,
  };
}

export default useCharacters;