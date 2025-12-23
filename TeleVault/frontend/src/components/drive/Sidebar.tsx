import React, { useState } from 'react';
import {
  Star,
  Trash2,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Code,
  ShieldCheck,
  EyeOff,
  Scale,
  HardDrive,
  Plus,
  Upload,
  FolderPlus,
  Cloud,
  Layers
} from 'lucide-react';
import type { FileCategory, FileItem } from '../../types';
import { VFSService } from '../../services/vfsService';

interface SidebarProps {
  currentCategory: FileCategory;
  onSelectCategory: (cat: FileCategory) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: (val: boolean) => void;
  showTrashOnly: boolean;
  onToggleTrash: (val: boolean) => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
  onOpenSync: () => void;
  files?: FileItem[];
  onUploadClick?: () => void;
  onCreateFolderClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  showFavoritesOnly,
  onToggleFavorites,
  showTrashOnly,
  onToggleTrash,
  onOpenLegal,
  onOpenSync: _onOpenSync,
  files,
  onUploadClick,
  onCreateFolderClick,
  isOpen,
  onClose,
}) => {
  const [showNewMenu, setShowNewMenu] = useState(false);

  const allFiles = files || VFSService.getFiles();
  const activeFiles = allFiles.filter((f) => !f.isTrashed);
  const totalBytes = activeFiles.reduce((acc, f) => acc + f.size, 0);
  const favoritesCount = allFiles.filter((f) => !f.isTrashed && f.isFavorite).length;
  const trashCount = allFiles.filter((f) => f.isTrashed).length;

  const categories: { id: FileCategory; label: string; icon: any }[] = [
    { id: 'all', label: 'All Files', icon: Layers },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'archives', label: 'Archives', icon: Archive },
    { id: 'code', label: 'Code & Dev', icon: Code },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:w-60 md:z-auto border-r border-white/[0.06] bg-[#0b0e15] flex flex-col justify-between shrink-0 select-none p-3 h-[calc(100vh-53px)] overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-4">
          {/* Action Button: "+ New Upload" */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-100 font-medium text-xs shadow-sm transition cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
              <span>New</span>
            </button>

            {/* Dropdown Menu */}
            {showNewMenu && (
              <>
                <div
                  onClick={() => setShowNewMenu(false)}
                  className="fixed inset-0 z-30"
                />
                <div className="absolute top-10 left-0 right-0 z-40 p-1 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col space-y-0.5">
                  {onUploadClick && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewMenu(false);
                        onUploadClick();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Upload Files</span>
                    </button>
                  )}
                  {onCreateFolderClick && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewMenu(false);
                        onCreateFolderClick();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-zinc-400" />
                      <span>New Folder</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Drive Navigation */}
          <div className="space-y-0.5">
            <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Drive
            </div>

            <button
              onClick={() => {
                onToggleFavorites(false);
                onToggleTrash(false);
                onSelectCategory('all');
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                !showFavoritesOnly && !showTrashOnly && currentCategory === 'all'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <HardDrive className="w-3.5 h-3.5" />
                <span>My Vault</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {activeFiles.length}
              </span>
            </button>

            <button
              onClick={() => {
                onToggleFavorites(true);
                onToggleTrash(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                showFavoritesOnly
                  ? 'bg-zinc-800 text-amber-300 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span>Starred</span>
              </div>
              {favoritesCount > 0 && (
                <span className="text-[10px] font-mono text-zinc-500">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onToggleTrash(true);
                onToggleFavorites(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                showTrashOnly
                  ? 'bg-zinc-800 text-rose-400 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Recycle Bin</span>
              </div>
              {trashCount > 0 && (
                <span className="text-[10px] font-mono text-zinc-500">
                  {trashCount}
                </span>
              )}
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-0.5">
            <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Filter
            </div>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = !showFavoritesOnly && !showTrashOnly && currentCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onToggleFavorites(false);
                    onToggleTrash(false);
                    onSelectCategory(cat.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-800 text-white font-medium'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{cat.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Storage Capacity Progress */}
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Cloud className="w-3.5 h-3.5 text-zinc-400" /> Storage
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Unlimited
              </span>
            </div>

            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-zinc-300 h-full rounded-full w-[15%]" />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>{VFSService.formatBytes(totalBytes)} used</span>
              <span>MTProto Cloud</span>
            </div>
          </div>

          {/* Stealth Status */}
          <div className="px-2.5 py-2 rounded-lg bg-zinc-900/40 border border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-zinc-500" /> Cloaked Vault
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-[11px] text-zinc-500">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-zinc-300 transition cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-500/70" /> Privacy
            </button>
            <span>•</span>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-zinc-300 transition cursor-pointer flex items-center gap-1"
            >
              <Scale className="w-3 h-3" /> Terms
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
