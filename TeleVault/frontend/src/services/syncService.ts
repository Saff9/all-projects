import type { SyncFolderRule } from '../types';

const SYNC_RULES_KEY = 'televault_sync_rules_v1';
const PERMISSIONS_KEY = 'televault_permissions_v1';

export interface AppPermissions {
  storage: 'granted' | 'denied' | 'prompt';
  backgroundSync: 'granted' | 'denied' | 'prompt';
  batteryExemption: 'granted' | 'denied' | 'prompt';
  notifications: 'granted' | 'denied' | 'prompt';
}

const DEFAULT_RULES: SyncFolderRule[] = [
  {
    id: 'sync-camera',
    localPath: '/storage/emulated/0/DCIM/Camera',
    remoteFolderId: 'folder-media',
    mode: 'backup',
    wifiOnly: true,
    chargingOnly: false,
    isActive: true,
    lastSyncAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    fileCount: 142,
  },
  {
    id: 'sync-documents',
    localPath: 'C:/Projects\\Documents\\TeleVaultSync',
    remoteFolderId: 'folder-docs',
    mode: 'two_way',
    wifiOnly: false,
    chargingOnly: false,
    isActive: true,
    lastSyncAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    fileCount: 28,
  },
];

export class SyncService {
  public static getRules(): SyncFolderRule[] {
    const raw = localStorage.getItem(SYNC_RULES_KEY);
    if (!raw) {
      localStorage.setItem(SYNC_RULES_KEY, JSON.stringify(DEFAULT_RULES));
      return DEFAULT_RULES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_RULES;
    }
  }

  public static saveRules(rules: SyncFolderRule[]) {
    localStorage.setItem(SYNC_RULES_KEY, JSON.stringify(rules));
  }

  public static addRule(rule: Omit<SyncFolderRule, 'id' | 'lastSyncAt' | 'fileCount'>): SyncFolderRule {
    const rules = this.getRules();
    const newRule: SyncFolderRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      lastSyncAt: null,
      fileCount: 0,
    };
    rules.push(newRule);
    this.saveRules(rules);
    return newRule;
  }

  public static updateRule(id: string, updates: Partial<SyncFolderRule>) {
    const rules = this.getRules().map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.saveRules(rules);
  }

  public static deleteRule(id: string) {
    const rules = this.getRules().filter((r) => r.id !== id);
    this.saveRules(rules);
  }

  public static getPermissions(): AppPermissions {
    const raw = localStorage.getItem(PERMISSIONS_KEY);
    if (!raw) {
      const defaults: AppPermissions = {
        storage: 'granted',
        backgroundSync: 'granted',
        batteryExemption: 'prompt',
        notifications: 'granted',
      };
      localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        storage: 'granted',
        backgroundSync: 'granted',
        batteryExemption: 'prompt',
        notifications: 'granted',
      };
    }
  }

  public static setPermission(key: keyof AppPermissions, status: 'granted' | 'denied' | 'prompt') {
    const perms = this.getPermissions();
    perms[key] = status;
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(perms));
  }

  public static async triggerManualSync(ruleId: string, onProgress: (count: number) => void): Promise<number> {
    await new Promise((r) => setTimeout(r, 600));
    onProgress(5);
    await new Promise((r) => setTimeout(r, 800));
    onProgress(12);
    await new Promise((r) => setTimeout(r, 600));
    onProgress(18);

    this.updateRule(ruleId, {
      lastSyncAt: new Date().toISOString(),
      fileCount: Math.floor(Math.random() * 50) + 15,
    });

    return 18;
  }
}
