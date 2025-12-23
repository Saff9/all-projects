import React, { useState, useEffect, useRef } from 'react';
import type { FileItem, FolderItem, FileCategory, AppTheme, TransferTask } from './types';
import { VFSService } from './services/vfsService';
import { TelegramService } from './services/telegramService';
import { CryptoEngine } from './services/crypto';
import { BlobRegistry } from './services/blobRegistry';
import { TopBar } from './components/drive/TopBar';
import { Sidebar } from './components/drive/Sidebar';
import { FileExplorer } from './components/drive/FileExplorer';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { LockScreen } from './components/security/LockScreen';
import { MediaPreviewModal } from './components/drive/MediaPreviewModal';
import { AutoSyncModal } from './components/sync/AutoSyncModal';
import { LegalModal } from './components/legal/LegalModal';
import { NewFolderModal } from './components/drive/NewFolderModal';
import { TransferManager } from './components/transfers/TransferManager';
import { MobileNav } from './components/drive/MobileNav';

export function App() {
  // App state
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('televault_onboarded') === 'true';
  });
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('televault_theme') as AppTheme) || 'auto';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // VFS state
  const [files, setFiles] = useState<FileItem[]>(() => VFSService.getFiles());
  const [folders, setFolders] = useState<FolderItem[]>(() => VFSService.getFolders());
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<FileCategory>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [showTrashOnly, setShowTrashOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [showAutoSyncModal, setShowAutoSyncModal] = useState<boolean>(false);
  const [legalModalState, setLegalModalState] = useState<{ isOpen: boolean; type: 'privacy' | 'terms' }>({
    isOpen: false,
    type: 'privacy',
  });

  // Transfers
  const [transfers, setTransfers] = useState<TransferTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('televault_theme', theme);

    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Check backend configuration on mount (for multi-browser and seamless sync)
  useEffect(() => {
    const checkSystemConfig = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/status');
        if (res.ok) {
          const data = await res.json();
          if (data.is_configured && data.has_password) {
            setIsOnboarded(true);
            if (data.salt_hex) {
              localStorage.setItem('televault_master_salt', data.salt_hex);
            }
          }
        }
      } catch {}
    };
    checkSystemConfig();
  }, []);

  // Real-time synchronization across all browser windows/devices
  useEffect(() => {
    const syncData = async () => {
      try {
        const [f, d] = await Promise.all([
          VFSService.fetchFilesFromBackend(),
          VFSService.fetchFoldersFromBackend(),
        ]);
        if (f !== undefined) setFiles(f);
        if (d !== undefined) setFolders(d);
      } catch {}
    };

    syncData();
    const interval = window.setInterval(syncData, 3000);
    return () => clearInterval(interval);
  }, [isOnboarded, isUnlocked]);

  // Filtered files based on search, folder, category, favorites, or trash
  const filteredFiles = files.filter((file) => {
    // 1. Recycle Bin view
    if (showTrashOnly) {
      if (!file.isTrashed) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          file.name.toLowerCase().includes(q) ||
          file.category.toLowerCase().includes(q) ||
          file.mimeType.toLowerCase().includes(q)
        );
      }
      return true;
    }

    // Normal or Starred views should never show trashed files
    if (file.isTrashed) {
      return false;
    }

    // 2. Starred view - shows ALL starred files across all folders
    if (showFavoritesOnly) {
      if (!file.isFavorite) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          file.name.toLowerCase().includes(q) ||
          file.category.toLowerCase().includes(q) ||
          file.mimeType.toLowerCase().includes(q)
        );
      }
      return true;
    }

    // 3. Search active
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = file.name.toLowerCase().includes(q);
      const matchesCategory = file.category.toLowerCase().includes(q);
      const matchesMime = file.mimeType.toLowerCase().includes(q);
      return matchesName || matchesCategory || matchesMime;
    }

    // 4. Category filter
    if (currentCategory !== 'all') {
      return file.category === currentCategory;
    }

    // 5. Folder contents
    return file.parentId === currentFolderId;
  });

  // Filtered folders
  const filteredFolders =
    showTrashOnly || searchQuery.trim() || currentCategory !== 'all' || showFavoritesOnly
      ? []
      : folders.filter((folder) => folder.parentId === currentFolderId);

  // File Upload Handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const taskId = `task-${Date.now()}-${i}`;
      const totalSize = file.size;
      const CHUNK_SIZE = 10 * 1024 * 1024;
      const chunkCount = Math.max(1, Math.ceil(totalSize / CHUNK_SIZE));

      const newTask: TransferTask = {
        id: taskId,
        fileId: `file-${Date.now()}-${i}`,
        fileName: file.name,
        size: totalSize,
        progress: 0,
        speedBytesPerSec: 0,
        type: 'upload',
        status: 'transferring',
        chunksTotal: chunkCount,
        chunksCompleted: 0,
      };

      setTransfers((prev) => [newTask, ...prev]);

      const category = VFSService.detectCategory(file.name, file.type);
      let textContent: string | undefined;
      if (category === 'code' || category === 'documents') {
        try {
          textContent = await file.text();
        } catch {}
      }

      // 1. Add file to VFS immediately so it shows up in UI with zero delay
      const newFile = VFSService.addFile({
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        category,
        parentId: currentFolderId,
        isEncrypted: true,
        isFavorite: false,
        isTrashed: false,
        telegramMessageIds: [],
        chunkCount,
        textContent,
      });

      // 2. Register live File object in BlobRegistry (Memory + IndexedDB)
      const liveBlobUrl = BlobRegistry.register(newFile.id, file, textContent);
      newFile.downloadUrl = liveBlobUrl;
      newFile.thumbnailUrl = category === 'images' ? liveBlobUrl : undefined;

      const currentFiles = VFSService.getFiles().map((f) =>
        f.id === newFile.id ? { ...f, downloadUrl: liveBlobUrl, thumbnailUrl: newFile.thumbnailUrl } : f
      );
      VFSService.saveFiles(currentFiles);
      setFiles(currentFiles);

      // 3. Initiate encrypted Telegram upload in background
      try {
        const { messageIds, chunkCount: uploadedChunks } = await TelegramService.uploadFile(
          file,
          (percent, speed, chunkIdx, total) => {
            setTransfers((prev) =>
              prev.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      progress: percent,
                      speedBytesPerSec: speed,
                      chunksCompleted: chunkIdx,
                      chunksTotal: total,
                    }
                  : t
              )
            );
          }
        );

        // Update message IDs and chunk count on completion
        const finalFiles = VFSService.getFiles().map((f) =>
          f.id === newFile.id ? { ...f, telegramMessageIds: messageIds, chunkCount: uploadedChunks } : f
        );
        VFSService.saveFiles(finalFiles);
        setFiles(finalFiles);

        // Sync completed file record to central backend SQLite
        const uploadedRecord = finalFiles.find((f) => f.id === newFile.id);
        if (uploadedRecord) {
          await VFSService.syncFileToBackend(uploadedRecord);
        }

        setTransfers((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'completed',
                  progress: 100,
                  chunksCompleted: uploadedChunks,
                }
              : t
          )
        );
      } catch (err: any) {
        setTransfers((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: 'error', errorMessage: err.message } : t))
        );
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download Handler with Real-Time Decryption & Chunk Progress
  const handleDownloadFile = async (file: FileItem) => {
    const taskId = `dl-${Date.now()}`;
    const totalChunks = file.chunkCount || (file.telegramMessageIds ? file.telegramMessageIds.length : 1);

    const newTask: TransferTask = {
      id: taskId,
      fileId: file.id,
      fileName: file.name,
      size: file.size,
      progress: 0,
      speedBytesPerSec: 0,
      type: 'download',
      status: 'transferring',
      chunksTotal: totalChunks,
      chunksCompleted: 0,
    };

    setTransfers((prev) => [newTask, ...prev]);

    try {
      const blob = await TelegramService.downloadAndDecryptFile(
        file,
        (percent, speed, chunkIdx, total) => {
          setTransfers((prev) =>
            prev.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    progress: percent,
                    speedBytesPerSec: speed,
                    chunksCompleted: chunkIdx,
                    chunksTotal: total,
                  }
                : t
            )
          );
        }
      );

      // Register decrypted blob in BlobRegistry for instant future previews
      BlobRegistry.register(file.id, blob);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTransfers((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: 'completed', progress: 100, chunksCompleted: totalChunks }
            : t
        )
      );
    } catch (err: any) {
      setTransfers((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'error', errorMessage: err.message } : t))
      );
    }
  };

  // Folder Actions
  const handleCreateFolder = (name: string, color: string) => {
    VFSService.createFolder(name, currentFolderId, color);
    setFolders(VFSService.getFolders());
  };

  // File Actions
  const handleToggleFavorite = (fileId: string) => {
    VFSService.toggleFavorite(fileId);
    setFiles(VFSService.getFiles());
  };

  const handleMoveToTrash = (fileId: string) => {
    VFSService.moveToTrash(fileId);
    setFiles(VFSService.getFiles());
  };

  const handleRestoreFromTrash = (fileId: string) => {
    VFSService.restoreFromTrash(fileId);
    setFiles(VFSService.getFiles());
  };

  const handlePermanentDelete = (fileId: string) => {
    VFSService.permanentlyDelete(fileId);
    setFiles(VFSService.getFiles());
  };

  const handleEmptyTrash = () => {
    VFSService.emptyTrash();
    setFiles(VFSService.getFiles());
  };

  // Lock Vault
  const handleLockVault = () => {
    CryptoEngine.setSessionKey(null);
    setIsUnlocked(false);
  };

  // Reset Vault
  const handleResetVault = () => {
    localStorage.clear();
    CryptoEngine.setSessionKey(null);
    setIsOnboarded(false);
    setIsUnlocked(false);
    setFiles(VFSService.getFiles());
    setFolders(VFSService.getFolders());
  };

  return (
    <div className="min-h-screen bg-[var(--tg-bg-base)] text-[var(--tg-text-primary)] flex flex-col antialiased">
      {/* Hidden file picker input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Onboarding Wizard */}
      <OnboardingModal
        isOpen={!isOnboarded}
        onComplete={() => {
          setIsOnboarded(true);
          setIsUnlocked(true);
        }}
        onOpenLegal={(type) => setLegalModalState({ isOpen: true, type })}
      />

      {/* Lock Screen */}
      {isOnboarded && !isUnlocked && (
        <LockScreen
          onUnlock={() => setIsUnlocked(true)}
          onResetVault={handleResetVault}
        />
      )}

      {/* Main App Layout */}
      {isOnboarded && isUnlocked && (
        <>
          {/* Top Bar */}
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            theme={theme}
            onThemeChange={setTheme}
            onUploadClick={() => fileInputRef.current?.click()}
            onCreateFolderClick={() => setShowNewFolderModal(true)}
            onLockVault={handleLockVault}
            onOpenSync={() => setShowAutoSyncModal(true)}
            onOpenLegal={(type) => setLegalModalState({ isOpen: true, type })}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          {/* Core Body: Sidebar + File Explorer */}
          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              currentCategory={currentCategory}
              onSelectCategory={(cat) => {
                setCurrentCategory(cat);
                setShowFavoritesOnly(false);
                setShowTrashOnly(false);
              }}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavorites={(val) => {
                setShowFavoritesOnly(val);
                setShowTrashOnly(false);
                setCurrentCategory('all');
                setCurrentFolderId(null);
              }}
              showTrashOnly={showTrashOnly}
              onToggleTrash={(val) => {
                setShowTrashOnly(val);
                setShowFavoritesOnly(false);
                setCurrentCategory('all');
                setCurrentFolderId(null);
              }}
              onOpenLegal={(type) => setLegalModalState({ isOpen: true, type })}
              onOpenSync={() => setShowAutoSyncModal(true)}
              files={files}
              onUploadClick={() => fileInputRef.current?.click()}
              onCreateFolderClick={() => setShowNewFolderModal(true)}
            />

            <FileExplorer
              files={filteredFiles}
              folders={filteredFolders}
              currentFolderId={currentFolderId}
              onNavigateFolder={(id) => {
                setCurrentFolderId(id);
                setShowFavoritesOnly(false);
                setShowTrashOnly(false);
              }}
              onPreviewFile={(f) => setPreviewFile(f)}
              onDownloadFile={handleDownloadFile}
              onToggleFavorite={handleToggleFavorite}
              onMoveToTrash={handleMoveToTrash}
              onRestoreFromTrash={handleRestoreFromTrash}
              onPermanentDelete={handlePermanentDelete}
              onEmptyTrash={handleEmptyTrash}
              onUploadClick={() => fileInputRef.current?.click()}
              onCreateFolderClick={() => setShowNewFolderModal(true)}
              isTrashView={showTrashOnly}
              isFavoritesView={showFavoritesOnly}
            />
          </div>

          {/* Media Preview & Streaming Player Modal */}
          <MediaPreviewModal
            file={previewFile}
            isOpen={previewFile !== null}
            onClose={() => setPreviewFile(null)}
            onDownload={(f) => handleDownloadFile(f)}
          />

          {/* New Folder Modal */}
          <NewFolderModal
            isOpen={showNewFolderModal}
            onClose={() => setShowNewFolderModal(false)}
            onCreate={handleCreateFolder}
          />

          {/* Auto-Sync Settings Modal */}
          <AutoSyncModal
            isOpen={showAutoSyncModal}
            folders={folders}
            onClose={() => setShowAutoSyncModal(false)}
          />

          {/* Legal Terms & Privacy Policy Modal */}
          <LegalModal
            isOpen={legalModalState.isOpen}
            type={legalModalState.type}
            onClose={() => setLegalModalState({ isOpen: false, type: 'privacy' })}
          />

          {/* Floating Transfer Manager Drawer */}
          <TransferManager
            transfers={transfers}
            onCancelTransfer={(id) =>
              setTransfers((prev) => prev.filter((t) => t.id !== id))
            }
            onTogglePause={(id) =>
              setTransfers((prev) =>
                prev.map((t) =>
                  t.id === id
                    ? { ...t, status: t.status === 'paused' ? 'transferring' : 'paused' }
                    : t
                )
              )
            }
            onClearCompleted={() =>
              setTransfers((prev) => prev.filter((t) => t.status !== 'completed'))
            }
          />
          
          <MobileNav
            onHomeClick={() => {
              setCurrentCategory('all');
              setCurrentFolderId(null);
              setShowFavoritesOnly(false);
              setShowTrashOnly(false);
            }}
            onStarredClick={() => {
              setShowFavoritesOnly(true);
              setShowTrashOnly(false);
              setCurrentCategory('all');
            }}
            onUploadClick={() => fileInputRef.current?.click()}
            onTrashClick={() => {
              setShowTrashOnly(true);
              setShowFavoritesOnly(false);
              setCurrentCategory('all');
            }}
            activeTab={showTrashOnly ? 'trash' : showFavoritesOnly ? 'starred' : 'home'}
          />
        </>
      )}
    </div>
  );
}

export default App;
