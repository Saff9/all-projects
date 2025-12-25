export type FileCategory =
  | 'all'
  | 'documents'
  | 'images'
  | 'videos'
  | 'audio'
  | 'archives'
  | 'code'
  | 'other';

export type AppTheme = 'auto' | 'light' | 'dark' | 'oled';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  parentId: string | null;
  isEncrypted: boolean;
  isFavorite: boolean;
  isTrashed: boolean;
  telegramMessageIds: number[];
  chunkCount: number;
  sha256?: string;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  textContent?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransferTask {
  id: string;
  fileId: string;
  fileName: string;
  size: number;
  progress: number; // 0 - 100
  speedBytesPerSec: number;
  type: 'upload' | 'download';
  status: 'queued' | 'transferring' | 'paused' | 'completed' | 'error';
  errorMessage?: string;
  chunksTotal: number;
  chunksCompleted: number;
}

export interface SyncFolderRule {
  id: string;
  localPath: string;
  remoteFolderId: string | null;
  mode: 'backup' | 'two_way';
  wifiOnly: boolean;
  chargingOnly: boolean;
  isActive: boolean;
  lastSyncAt: string | null;
  fileCount: number;
}

export interface UserAccount {
  isConfigured: boolean;
  isUnlocked: boolean;
  phone?: string;
  firstName?: string;
  username?: string;
  vaultChannelId?: number;
  vaultChannelTitle: string;
  hasMasterPassword: boolean;
}
