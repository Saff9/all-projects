import { apiClient } from './api';
import type { Settings, GeneralSettings, ChatSettings } from '../types';

class SettingsService {
  async getSettings(): Promise<Settings> {
    return apiClient.get<Settings>('/settings');
  }

  async updateSettings(settings: {
    general?: Partial<GeneralSettings>;
    chat?: Partial<ChatSettings>;
  }): Promise<Settings> {
    return apiClient.patch<Settings>('/settings', settings);
  }

  async configureProvider(
    providerId: string,
    apiKey: string,
    baseUrl?: string
  ): Promise<void> {
    await apiClient.instance.put(`/settings/providers/${providerId}`, {
      api_key: apiKey,
      base_url: baseUrl,
    });
  }

  async removeProviderConfig(providerId: string): Promise<void> {
    await apiClient.delete(`/settings/providers/${providerId}`);
  }

  // Local storage helpers for UI preferences
  getLocalSetting<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(`genzsmart_${key}`);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  setLocalSetting<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`genzsmart_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  }

  removeLocalSetting(key: string): void {
    localStorage.removeItem(`genzsmart_${key}`);
  }
}

export const settingsService = new SettingsService();
export default settingsService;