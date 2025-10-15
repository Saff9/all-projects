'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MainLayout, PageHeader } from '../../components/layout';
import { Card, Tabs, Modal } from '../../components/common';
import { CharacterGrid, CharacterDetail } from '../../components/features';
import { useCharacters, useToast } from '../../hooks';
import { CharacterWithProgress } from '../../services';

export default function CharactersPage() {
  const { allCharacters, fetchAllCharacters, upgradeCharacter, isLoading } = useCharacters();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterWithProgress | null>(null);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCharacters();
  }, [fetchAllCharacters]);

  const handleCharacterClick = (character: CharacterWithProgress) => {
    setSelectedCharacter(character);
  };

  const handleUpgrade = async (character: CharacterWithProgress) => {
    setUpgradingId(character.id);
    try {
      await upgradeCharacter(character.id);
      success(`Character upgraded to level ${(character.level || 1) + 1}!`);
      fetchAllCharacters();
    } catch (err) {
      error('Failed to upgrade character');
    } finally {
      setUpgradingId(null);
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'owned', label: 'Owned' },
    { id: 'locked', label: 'Locked' },
  ];

  const filteredCharacters = allCharacters.filter((char) => {
    if (activeTab === 'owned') return char.owned;
    if (activeTab === 'locked') return !char.owned;
    return true;
  });

  return (
    <MainLayout>
      <div className="px-4 py-4">
        <PageHeader
          title="Heroes"
          subtitle="Collect and upgrade your heroes"
        />

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card variant="glass" className="p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {allCharacters.filter((c) => c.owned).length}
            </p>
            <p className="text-xs text-gray-400">Owned</p>
          </Card>
          <Card variant="glass" className="p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {allCharacters.length}
            </p>
            <p className="text-xs text-gray-400">Total</p>
          </Card>
          <Card variant="glass" className="p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {allCharacters.filter((c) => c.rarity === 'legendary').length}
            </p>
            <p className="text-xs text-gray-400">Legendary</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* Characters Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <CharacterGrid
            characters={filteredCharacters}
            onCharacterClick={handleCharacterClick}
            onUpgrade={handleUpgrade}
            upgradingId={upgradingId}
            showUpgrade={true}
          />
        </motion.div>
      </div>

      {/* Character Detail Modal */}
      <Modal
        isOpen={!!selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        title={selectedCharacter?.name || 'Character'}
        size="md"
      >
        {selectedCharacter && (
          <CharacterDetail
            character={selectedCharacter}
            onUpgrade={() => handleUpgrade(selectedCharacter)}
            isUpgrading={upgradingId === selectedCharacter.id}
          />
        )}
      </Modal>
    </MainLayout>
  );
}