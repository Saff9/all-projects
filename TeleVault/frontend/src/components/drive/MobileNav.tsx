import React from 'react';
import { HardDrive, Star, Plus, Trash2 } from 'lucide-react';

interface MobileNavProps {
  onHomeClick: () => void;
  onStarredClick: () => void;
  onUploadClick: () => void;
  onTrashClick: () => void;
  activeTab: 'home' | 'starred' | 'trash';
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onHomeClick,
  onStarredClick,
  onUploadClick,
  onTrashClick,
  activeTab,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0c0f17]/95 backdrop-blur-md border-t border-zinc-800 pb-[env(safe-area-inset-bottom)] select-none">
      <div className="flex items-center justify-around px-4 py-2">
        <button
          onClick={onHomeClick}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition cursor-pointer ${
            activeTab === 'home' ? 'text-zinc-100' : 'text-zinc-500'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span className="text-[10px] font-medium">Vault</span>
        </button>

        <button
          onClick={onStarredClick}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition cursor-pointer ${
            activeTab === 'starred' ? 'text-amber-300' : 'text-zinc-500'
          }`}
        >
          <Star className={`w-4 h-4 ${activeTab === 'starred' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Starred</span>
        </button>

        <button
          onClick={onUploadClick}
          className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-950 flex items-center justify-center shadow-md active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={onTrashClick}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition cursor-pointer ${
            activeTab === 'trash' ? 'text-rose-400' : 'text-zinc-500'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-[10px] font-medium">Trash</span>
        </button>
      </div>
    </nav>
  );
};
