import React, { useState } from 'react';
import {
  Search,
  Upload,
  FolderPlus,
  Lock,
  Sun,
  Moon,
  Smartphone,
  FolderSync,
  Cloud,
  X,
  Palette,
  Menu,
  ShieldCheck
} from 'lucide-react';
import { TeleVaultLogo } from '../common/TeleVaultLogo';
import type { AppTheme } from '../../types';
import { VFSService } from '../../services/vfsService';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  theme: AppTheme;
  onThemeChange: (t: AppTheme) => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
  onLockVault: () => void;
  onOpenSync: () => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
  onMenuClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  theme,
  onThemeChange,
  onUploadClick,
  onCreateFolderClick,
  onLockVault,
  onOpenSync,
  onOpenLegal: _onOpenLegal,
  onMenuClick,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const stats = VFSService.getStorageStats();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.06] bg-[#090a0f]/80 backdrop-blur-xl px-4 py-2.5 sm:px-6 select-none">
      <div className="flex items-center justify-between gap-4">
        {/* Brand Section */}
        <div className="flex items-center gap-3 shrink-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer md:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <TeleVaultLogo size={32} showText={true} />
        </div>

        {/* Minimalist Search Input */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-9 pr-12 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/30 transition"
            />
            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-zinc-500" />
            
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute right-2.5 top-1.5 pointer-events-none">
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  /
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* E2EE Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" /> AES-256
            </span>
          </div>

          {/* Storage Gauge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-[11px] font-medium">
              {VFSService.formatBytes(stats.totalBytes)}
            </span>
          </div>

          {/* Auto-Sync */}
          <button
            onClick={onOpenSync}
            title="Auto-Sync"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            <FolderSync className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden xl:inline text-[11px]">Sync</span>
          </button>

          {/* New Folder */}
          <button
            onClick={onCreateFolderClick}
            title="New Folder"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
          >
            <FolderPlus className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline text-[11px]">Folder</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onUploadClick}
            className="py-1.5 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Theme"
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {showThemeMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl p-1 text-xs space-y-0.5 z-50">
                  <button
                    onClick={() => {
                      onThemeChange('dark');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${
                      theme === 'dark' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" /> Dark Obsidian
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange('oled');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${
                      theme === 'oled' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-zinc-500" /> Pitch OLED
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange('light');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${
                      theme === 'light' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" /> Light Clean
                  </button>
                  <button
                    onClick={() => {
                      onThemeChange('auto');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition ${
                      theme === 'auto' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Auto System
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Lock Vault */}
          <button
            onClick={onLockVault}
            title="Lock Vault"
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-800/50 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Search Row */}
      <div className="mt-2 md:hidden">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search all files..."
            className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
          />
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-zinc-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
