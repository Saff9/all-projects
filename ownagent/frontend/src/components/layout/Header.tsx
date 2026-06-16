import React, { useEffect } from 'react';
import {
  MoreVertical,
  Share2,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { chatService } from '../../services/chat';
import { providerService } from '../../services/providers';

export const Header: React.FC = () => {
  const {
    currentConversation,
    updateConversation,
    setCurrentConversation,
    providers,
    setProviders,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    sidebarOpen,
    addToast,
  } = useStore();

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState('');
  const [showActions, setShowActions] = React.useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      setSelectedProvider(currentConversation.provider);
      setSelectedModel(currentConversation.model);
    }
  }, [currentConversation, setSelectedProvider, setSelectedModel]);

  const loadProviders = async () => {
    try {
      const data = await providerService.getProviders();
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const handleTitleUpdate = async () => {
    if (!currentConversation || !editTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await chatService.updateConversation(currentConversation.id, {
        title: editTitle.trim(),
      });
      updateConversation(currentConversation.id, { title: editTitle.trim() });
      setIsEditingTitle(false);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update title' });
    }
  };

  const handleDeleteConversation = async () => {
    if (!currentConversation) return;

    try {
      await chatService.deleteConversation(currentConversation.id);
      setCurrentConversation(null);
      addToast({ type: 'success', message: 'Conversation deleted' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to delete conversation' });
    }
  };

  const providerColors: Record<string, string> = {
    deepseek: '#6058e3',
    claude: '#d97757',
    grok: '#1d9bf0',
    openai: '#10a37f',
    openrouter: '#ef4444',
    perplexity: '#22d3ee',
  };

  const currentProvider = providers.find((p) => p.id === selectedProvider);

  if (!currentConversation) {
    return (
      <header
        className={`
          h-14 border-b border-[var(--border-primary)]
          flex items-center px-4
          bg-[var(--bg-primary)]
          ${sidebarOpen ? 'ml-[280px]' : ''}
          transition-all duration-300
        `}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[#3b82f6] flex items-center justify-center">
            <span className="text-white font-semibold text-xs">G</span>
          </div>
          <span className="font-medium text-[var(--text-primary)] text-sm">
            Apex Smart
          </span>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`
        h-14 border-b border-[var(--border-primary)]
        flex items-center justify-between px-4
        bg-[var(--bg-primary)]
        ${sidebarOpen && !useStore.getState().isMobile ? 'ml-[280px]' : ''}
        transition-all duration-300
      `}
    >
      {/* Title Section */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleUpdate();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="bg-[var(--bg-input)] border border-[var(--border-primary)] rounded px-2.5 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] w-64"
              autoFocus
            />
            <button
              onClick={handleTitleUpdate}
              className="p-1 rounded text-[var(--accent-success)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditingTitle(false)}
              className="p-1 rounded text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-medium text-[var(--text-primary)] truncate">
              {currentConversation.title}
            </h1>
            <button
              onClick={() => {
                setEditTitle(currentConversation.title);
                setIsEditingTitle(true);
              }}
              className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] opacity-0 group-hover:opacity-100 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Provider & Model Selectors */}
      <div className="flex items-center gap-2">
        {/* Provider Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md"
          style={{
            '--provider-color': providerColors[currentProvider?.id || ''] || 'var(--accent-primary)',
          } as React.CSSProperties}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: providerColors[currentProvider?.id || ''] || 'var(--accent-primary)' }}
          />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {currentProvider?.name || selectedProvider}
          </span>
          <ChevronDown className="w-3 h-3 text-[var(--text-tertiary)]" />
        </div>

        {/* Model Selector */}
        {currentProvider?.models && currentProvider.models.length > 0 && (
          <select
            value={selectedModel || ''}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-2.5 py-1 text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)] cursor-pointer"
          >
            {currentProvider.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        )}

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg z-50 animate-slideUp overflow-hidden">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/chat/${currentConversation.id}`
                  );
                  addToast({ type: 'success', message: 'Link copied!' });
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => {
                  handleDeleteConversation();
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--accent-error)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
