import React, { useState } from 'react';
import {
  X,
  FolderSync,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Wifi,
  BatteryCharging,
  HardDrive,
  Shield,
  FolderOpen
} from 'lucide-react';
import type { SyncFolderRule, FolderItem } from '../../types';
import { SyncService, type AppPermissions } from '../../services/syncService';

interface AutoSyncModalProps {
  isOpen: boolean;
  folders: FolderItem[];
  onClose: () => void;
}

export const AutoSyncModal: React.FC<AutoSyncModalProps> = ({
  isOpen,
  folders,
  onClose,
}) => {
  const [rules, setRules] = useState<SyncFolderRule[]>(SyncService.getRules());
  const [permissions, setPermissions] = useState<AppPermissions>(SyncService.getPermissions());
  const [isAdding, setIsAdding] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const [newPath, setNewPath] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folders[0]?.id || null);
  const [mode, setMode] = useState<'backup' | 'two_way'>('backup');
  const [wifiOnly, setWifiOnly] = useState(true);
  const [chargingOnly, setChargingOnly] = useState(false);

  if (!isOpen) return null;

  const handleToggleRule = (id: string, current: boolean) => {
    SyncService.updateRule(id, { isActive: !current });
    setRules(SyncService.getRules());
  };

  const handleDeleteRule = (id: string) => {
    SyncService.deleteRule(id);
    setRules(SyncService.getRules());
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim()) return;

    SyncService.addRule({
      localPath: newPath.trim(),
      remoteFolderId: selectedFolderId,
      mode,
      wifiOnly,
      chargingOnly,
      isActive: true,
    });

    setRules(SyncService.getRules());
    setIsAdding(false);
    setNewPath('');
  };

  const handleManualSync = async (ruleId: string) => {
    setSyncingId(ruleId);
    try {
      await SyncService.triggerManualSync(ruleId, () => {});
      setRules(SyncService.getRules());
    } finally {
      setSyncingId(null);
    }
  };

  const handleGrantPermission = (key: keyof AppPermissions) => {
    SyncService.setPermission(key, 'granted');
    setPermissions(SyncService.getPermissions());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[88vh] rounded-3xl bg-[#0e1422] border border-cyan-500/30 shadow-2xl shadow-cyan-950/70 flex flex-col text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FolderSync className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Auto-Sync & Local Watchers</h2>
              <p className="text-xs text-slate-400">
                Automatically backup device folders directly to your Telegram vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                Required System Permissions
              </div>
              <span className="text-[11px] text-slate-400">Android & Desktop</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>Files & Storage Access</span>
                </div>
                {permissions.storage === 'granted' ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                  </span>
                ) : (
                  <button
                    onClick={() => handleGrantPermission('storage')}
                    className="px-2 py-1 rounded bg-cyan-500 text-black font-semibold text-[10px] cursor-pointer"
                  >
                    Allow
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-yellow-400" />
                  <span>Background Exemption</span>
                </div>
                {permissions.batteryExemption === 'granted' ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Granted
                  </span>
                ) : (
                  <button
                    onClick={() => handleGrantPermission('batteryExemption')}
                    className="px-2 py-1 rounded bg-cyan-500 text-black font-semibold text-[10px] cursor-pointer"
                  >
                    Allow
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Active Folder Rules</h3>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Folder to Watch
                </button>
              )}
            </div>

            {isAdding && (
              <form onSubmit={handleCreateRule} className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
                <div className="font-semibold text-xs text-cyan-300">Configure New Watched Folder</div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Local Device Folder Path</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPath}
                      onChange={(e) => setNewPath(e.target.value)}
                      placeholder="/storage/emulated/0/DCIM or C:\Users\..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setNewPath('/storage/emulated/0/Pictures/TelegramDrive')}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
                    >
                      Presets
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Target Vault Folder</label>
                    <select
                      value={selectedFolderId || ''}
                      onChange={(e) => setSelectedFolderId(e.target.value || null)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Sync Strategy</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-400"
                    >
                      <option value="backup">One-Way Cloud Backup (Local → TG)</option>
                      <option value="two_way">Two-Way Mirror (Local ⇄ TG)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wifiOnly}
                      onChange={(e) => setWifiOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500"
                    />
                    <span>Wi-Fi Only (Save Mobile Data)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chargingOnly}
                      onChange={(e) => setChargingOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-cyan-500"
                    />
                    <span>Only While Charging</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                  >
                    Save Rule
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-semibold text-xs text-white truncate max-w-xs sm:max-w-sm">
                        {rule.localPath}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono">
                        {rule.mode === 'backup' ? 'Backup' : 'Mirror'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{rule.fileCount} items synced</span>
                      {rule.wifiOnly && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Wifi className="w-3 h-3 text-cyan-400" /> Wi-Fi
                        </span>
                      )}
                      <span>
                        Last sync: {rule.lastSyncAt ? new Date(rule.lastSyncAt).toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleManualSync(rule.id)}
                      disabled={syncingId === rule.id}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs transition cursor-pointer"
                      title="Sync Now"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncingId === rule.id ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleToggleRule(rule.id, rule.isActive)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        rule.isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Paused'}
                    </button>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
