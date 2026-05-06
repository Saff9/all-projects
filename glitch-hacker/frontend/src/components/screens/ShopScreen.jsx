import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Cpu, Shield, Zap, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import UpgradeCard from '../game/UpgradeCard';
import Card from '../ui/Card';
import Button from '../ui/Button';
import GlitchText from '../ui/GlitchText';
import Modal from '../ui/Modal';

// Hooks
import { useTelegram } from '../../hooks/useTelegram';

// Stores
import useUserStore from '../../stores/userStore';
import useShopStore from '../../stores/shopStore';

const ShopScreen = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Telegram hook
  const { hapticImpact, hapticNotification } = useTelegram();

  // Stores
  const { balance, firewall, updateBalance } = useUserStore();
  const { 
    items, 
    firewall: firewallUpgrade, 
    fetchItems, 
    buyItem, 
    buyFirewall,
    isLoading,
    purchaseInProgress,
  } = useShopStore();

  // Fetch shop items on mount
  useEffect(() => {
    const loadItems = async () => {
      await fetchItems();
      setIsInitialized(true);
    };
    loadItems();
  }, [fetchItems]);

  const handleBuyClick = (item) => {
    if (item.canAfford) {
      setSelectedItem(item);
      setShowConfirmModal(true);
      hapticImpact('light');
    } else {
      showNotification('Insufficient funds!', 'error');
      hapticNotification('error');
    }
  };

  const handleConfirmBuy = async () => {
    if (selectedItem) {
      const result = await buyItem(selectedItem.id);
      
      if (result.success) {
        // Update local balance
        updateBalance(-selectedItem.currentPrice);
        
        setShowConfirmModal(false);
        showNotification(`Purchased ${selectedItem.name}!`, 'success');
        hapticNotification('success');
        setSelectedItem(null);
      } else {
        showNotification(result.error || 'Purchase failed', 'error');
        hapticNotification('error');
      }
    }
  };

  const handleFirewallUpgrade = async () => {
    if (!firewallUpgrade?.canAfford) {
      showNotification('Insufficient funds!', 'error');
      hapticNotification('error');
      return;
    }

    const result = await buyFirewall();
    
    if (result.success) {
      // Update local balance
      updateBalance(-firewallUpgrade.currentPrice);
      
      showNotification('Firewall upgraded!', 'success');
      hapticNotification('success');
    } else {
      showNotification(result.error || 'Upgrade failed', 'error');
      hapticNotification('error');
    }
  };

  const showNotification = (text, type) => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 2000);
  };

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <GlitchText text="BLACK MARKET" size="2xl" color="primary" />
        <p className="text-xs text-primary/50 font-mono mt-1">
          Purchase upgrades to increase your mining power
        </p>
      </div>

      {/* Balance display */}
      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm text-primary/70">Available:</span>
        </div>
        <span className="font-mono font-bold text-xl text-primary">
          {Math.floor(balance).toLocaleString()} $BITZ
        </span>
      </Card>

      {/* Botnet upgrades */}
      <div className="space-y-3">
        <h3 className="font-mono text-sm text-primary/70 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          Botnet Upgrades
        </h3>
        
        {items.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-primary/50 font-mono text-sm">No items available</p>
          </Card>
        ) : (
          items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <UpgradeCard
                name={item.name}
                level={item.owned || 0}
                income={item.effects?.[0]?.value || 0}
                cost={item.currentPrice}
                owned={item.owned || 0}
                canAfford={item.canAfford}
                onBuy={() => handleBuyClick(item)}
                icon={Cpu}
                maxed={item.maxed}
                description={item.description}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Firewall upgrade */}
      {firewallUpgrade && (
        <Card title="Firewall Defense" icon={Shield}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-sm text-primary">Current Level</p>
              <p className="font-mono text-2xl font-bold text-primary">
                {firewallUpgrade.level}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-primary/70">Upgrade Cost</p>
              <p className={`font-mono text-lg font-bold ${firewallUpgrade.canAfford ? 'text-primary' : 'text-alert'}`}>
                {firewallUpgrade.currentPrice?.toLocaleString() || '-'} $BITZ
              </p>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-surface-light/50 rounded border border-primary/10">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <p className="text-xs text-primary/60 font-mono">
                Higher firewall levels reduce the chance of successful hacks against you. 
                Each level provides +10% defense.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            disabled={!firewallUpgrade.canAfford || firewallUpgrade.maxed || purchaseInProgress}
            onClick={handleFirewallUpgrade}
            className="w-full"
          >
            <span className="flex items-center justify-between w-full">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {firewallUpgrade.maxed ? 'MAX LEVEL' : 'UPGRADE FIREWALL'}
              </span>
              {!firewallUpgrade.maxed && <span>+1 Level</span>}
            </span>
          </Button>
        </Card>
      )}

      {/* Confirm purchase modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Purchase"
      >
        <div className="text-center py-4">
          <p className="font-mono text-primary mb-2">
            Purchase <span className="font-bold">{selectedItem?.name}</span>?
          </p>
          <p className="font-mono text-2xl font-bold text-primary mb-4">
            {selectedItem?.currentPrice?.toLocaleString()} $BITZ
          </p>
          <p className="text-xs text-primary/50 mb-6">
            Income: +{selectedItem?.effects?.[0]?.value || 0} $BITZ/sec
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmBuy}
              disabled={purchaseInProgress}
              className="flex-1"
            >
              {purchaseInProgress ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Confirm'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notification toast */}
      {notification && (
        <motion.div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg font-mono text-sm z-50 ${
            notification.type === 'error' 
              ? 'bg-alert/20 border border-alert text-alert' 
              : 'bg-primary/20 border border-primary text-primary'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {notification.text}
        </motion.div>
      )}
    </div>
  );
};

export default ShopScreen;
