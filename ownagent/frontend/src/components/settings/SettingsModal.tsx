import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor, Key, Save, Check, AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '../common';
import { useStore } from '../../store/useStore';
import { settingsService } from '../../services/settings';
import { providerService } from '../../services/providers';
import type { Settings, Provider } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, setTheme, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'general' | 'providers'>('general');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadProviders();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadProviders = async () => {
    try {
      const data = await providerService.getProviders();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const handleSaveApiKey = async (providerId: string) => {
    const apiKey = apiKeys[providerId];
    if (!apiKey) return;

    setSaving(true);
    try {
      await settingsService.configureProvider(providerId, apiKey);
      addToast({
        type: 'success',
        message: `${providerId} API key saved`,
      });
      setApiKeys((prev) => ({ ...prev, [providerId]: '' }));
      loadProviders();
    } catch (error) {
      addToast({
        type: 'error',
        message: `Failed to save ${providerId} API key`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveApiKey = async (providerId: string) => {
    try {
      await settingsService.removeProviderConfig(providerId);
      addToast({
        type: 'success',
        message: `${providerId} API key removed`,
      });
      loadProviders();
    } catch (error) {
      addToast({
        type: 'error',
        message: `Failed to remove ${providerId} API key`,
      });
    }
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'providers', label: 'Providers' },
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      description="Customize your Apex Smart experience"
      size="lg"
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-[var(--bg-tertiary)] rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${
                activeTab === tab.id
                  ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              Theme
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg border transition-all
                  ${
                    theme === 'light'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                      : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
                  }
                `}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg border transition-all
                  ${
                    theme === 'dark'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                      : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
                  }
                `}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg border transition-all
                  ${
                    theme === 'system'
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                      : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
                  }
                `}
              >
                <Monitor className="w-4 h-4" />
                System
              </button>
            </div>
          </div>

          {/* Default Provider */}
          {settings && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
                Default Provider
              </label>
              <select
                value={settings.chat.default_provider}
                onChange={(e) => {
                  // TODO: Update default provider
                  console.log('Default provider:', e.target.value);
                }}
                className="w-full bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Provider Settings */}
      {activeTab === 'providers' && (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)]"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <ProviderIcon providerId={provider.id} />
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">
                      {provider.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                      {provider.is_configured ? (
                        <span className="flex items-center gap-1 text-[var(--accent-success)]">
                          <Check className="w-3 h-3" />
                          Configured
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[var(--text-tertiary)]">
                          <AlertCircle className="w-3 h-3" />
                          Not configured
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs ${
                          provider.status === 'available'
                            ? 'bg-[var(--accent-success)]/10 text-[var(--accent-success)]'
                            : 'bg-[var(--accent-error)]/10 text-[var(--accent-error)]'
                        }`}
                      >
                        {provider.status}
                      </span>
                    </div>
                  </div>
                </div>
                {provider.is_configured && (
                  <button
                    onClick={() => handleRemoveApiKey(provider.id)}
                    className="text-xs text-[var(--accent-error)] hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder={`Enter ${provider.name} API key`}
                  value={apiKeys[provider.id] || ''}
                  onChange={(e) =>
                    setApiKeys((prev) => ({
                      ...prev,
                      [provider.id]: e.target.value,
                    }))
                  }
                  leftIcon={<Key className="w-4 h-4" />}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSaveApiKey(provider.id)}
                  isLoading={saving}
                  disabled={!apiKeys[provider.id]}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

const ProviderIcon: React.FC<{ providerId: string }> = ({ providerId }) => {
  const colors: Record<string, string> = {
    deepseek: '#4f46e5',
    claude: '#d97757',
    grok: '#1d9bf0',
    openai: '#10a37f',
    openrouter: '#ef4444',
    perplexity: '#22d3ee',
  };

  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
      style={{ backgroundColor: colors[providerId] || '#6366f1' }}
    >
      {providerId.charAt(0).toUpperCase()}
    </div>
  );
};

export default SettingsModal;