import type { FileItem, FolderItem, FileCategory } from '../types';

const STORAGE_KEYS = {
  FOLDERS: 'televault_folders_v2',
  FILES: 'televault_files_v2',
  TRASH: 'televault_trash_v2',
  SETTINGS: 'televault_settings_v2',
  SYNC_RULES: 'televault_sync_rules_v2',
};

const DEFAULT_FOLDERS: FolderItem[] = [
  {
    id: 'folder-media',
    name: 'Photos & Videos',
    parentId: null,
    color: '#2aabee',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'folder-docs',
    name: 'Personal Documents',
    parentId: null,
    color: '#4fae4e',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'folder-projects',
    name: 'Source Code & Archives',
    parentId: null,
    color: '#ab47bc',
    isEncrypted: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

// Default initial empty list - no fake demo files
const DEFAULT_FILES: FileItem[] = [];

const BACKEND_BASE = 'http://localhost:8000/api';

export class VFSService {
  public static async fetchFoldersFromBackend(): Promise<FolderItem[]> {
    try {
      const res = await fetch(`${BACKEND_BASE}/folders`);
      if (!res.ok) return this.getFolders();
      const backendFolders = await res.json();
      if (Array.isArray(backendFolders)) {
        const mapped: FolderItem[] = backendFolders.map((f: any) => ({
          id: f.id,
          name: f.name,
          parentId: f.parent_id || null,
          color: f.color || '#2aabee',
          isEncrypted: true,
          createdAt: f.created_at || new Date().toISOString(),
          updatedAt: f.updated_at || new Date().toISOString(),
        }));
        this.saveFolders(mapped);
        return mapped;
      }
    } catch {}
    return this.getFolders();
  }

  public static async fetchFilesFromBackend(): Promise<FileItem[]> {
    try {
      const res = await fetch(`${BACKEND_BASE}/files`);
      if (!res.ok) return this.getFiles();
      const backendFiles = await res.json();
      if (Array.isArray(backendFiles)) {
        const localFiles = this.getFiles();
        const localMap = new Map<string, FileItem>(localFiles.map((lf) => [lf.id, lf]));

        const mapped: FileItem[] = backendFiles.map((f: any) => {
          let msgIds: number[] = [];
          if (f.chunks_json) {
            try {
              const parsed = JSON.parse(f.chunks_json);
              if (Array.isArray(parsed)) msgIds = parsed;
            } catch {}
          } else if (f.telegram_message_ids) {
            try {
              const parsed = typeof f.telegram_message_ids === 'string' ? JSON.parse(f.telegram_message_ids) : f.telegram_message_ids;
              if (Array.isArray(parsed)) msgIds = parsed;
            } catch {}
          } else if (f.telegram_channel_id) {
            msgIds = [f.telegram_channel_id];
          }

          const existing = localMap.get(f.id);
          const category = f.category || this.detectCategory(f.name, f.mime_type || '');

          return {
            id: f.id,
            name: f.name,
            size: f.size,
            mimeType: f.mime_type || 'application/octet-stream',
            category,
            parentId: f.parent_id || null,
            isEncrypted: f.is_encrypted !== false,
            isFavorite: Boolean(f.is_favorite),
            isTrashed: Boolean(f.is_trashed),
            telegramMessageIds: msgIds,
            chunkCount: f.chunk_count || (msgIds.length > 0 ? msgIds.length : 1),
            downloadUrl: existing?.downloadUrl || `${BACKEND_BASE}/files/download?name=${encodeURIComponent(f.name)}`,
            thumbnailUrl: existing?.thumbnailUrl || ((category === 'images' || f.mime_type?.startsWith('image/')) ? `${BACKEND_BASE}/files/download?name=${encodeURIComponent(f.name)}` : undefined),
            textContent: existing?.textContent,
            createdAt: f.created_at || new Date().toISOString(),
            updatedAt: f.updated_at || new Date().toISOString(),
          };
        });

        this.saveFiles(mapped);
        return mapped;
      }
    } catch {}
    return this.getFiles();
  }

  public static async syncFileToBackend(file: FileItem) {
    try {
      const msgIds = file.telegramMessageIds || [];
      await fetch(`${BACKEND_BASE}/files/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: file.id,
          name: file.name,
          size: file.size,
          mime_type: file.mimeType,
          category: file.category,
          parent_id: file.parentId || null,
          is_encrypted: file.isEncrypted,
          is_favorite: file.isFavorite,
          is_trashed: file.isTrashed,
          chunk_count: file.chunkCount || (msgIds.length > 0 ? msgIds.length : 1),
          chunks_json: JSON.stringify(msgIds),
          telegram_message_ids: JSON.stringify(msgIds),
          created_at: file.createdAt,
          updated_at: file.updatedAt,
        }),
      });
    } catch (err) {
      console.warn('[VFSService] syncFileToBackend notice:', err);
    }
  }

  public static async syncFolderToBackend(folder: FolderItem) {
    try {
      await fetch(`${BACKEND_BASE}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folder.name,
          parent_id: folder.parentId,
          color: folder.color,
        }),
      });
    } catch (err) {
      console.warn('[VFSService] syncFolderToBackend notice:', err);
    }
  }

  public static getFolders(): FolderItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(DEFAULT_FOLDERS));
      return DEFAULT_FOLDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_FOLDERS;
    }
  }

  public static saveFolders(folders: FolderItem[]) {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  }

  public static getFiles(): FileItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.FILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(DEFAULT_FILES));
      return DEFAULT_FILES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_FILES;
    }
  }

  public static saveFiles(files: FileItem[]) {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  }

  public static createFolder(name: string, parentId: string | null = null, color = '#2aabee'): FolderItem {
    const folders = this.getFolders();
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      parentId,
      color,
      isEncrypted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    folders.push(newFolder);
    this.saveFolders(folders);
    this.syncFolderToBackend(newFolder);
    return newFolder;
  }

  public static renameFolder(id: string, newName: string) {
    const folders = this.getFolders().map((f) =>
      f.id === id ? { ...f, name: newName.trim(), updatedAt: new Date().toISOString() } : f
    );
    this.saveFolders(folders);
  }

  public static deleteFolder(id: string) {
    const folders = this.getFolders().filter((f) => f.id !== id && f.parentId !== id);
    this.saveFolders(folders);

    try {
      fetch(`${BACKEND_BASE}/folders/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    const files = this.getFiles().map((file) =>
      file.parentId === id ? { ...file, isTrashed: true, updatedAt: new Date().toISOString() } : file
    );
    this.saveFiles(files);
  }

  public static addFile(fileData: Omit<FileItem, 'id' | 'createdAt' | 'updatedAt'>): FileItem {
    const files = this.getFiles();
    const newFile: FileItem = {
      ...fileData,
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    files.unshift(newFile);
    this.saveFiles(files);
    this.syncFileToBackend(newFile);
    return newFile;
  }

  public static toggleFavorite(fileId: string): boolean {
    let newState = false;
    const files = this.getFiles().map((f) => {
      if (f.id === fileId) {
        newState = !f.isFavorite;
        return { ...f, isFavorite: newState, updatedAt: new Date().toISOString() };
      }
      return f;
    });
    this.saveFiles(files);
    try {
      fetch(`${BACKEND_BASE}/files/favorite/${fileId}`, { method: 'POST' }).catch(() => {});
    } catch {}
    return newState;
  }

  public static moveToTrash(fileId: string) {
    const files = this.getFiles().map((f) =>
      f.id === fileId ? { ...f, isTrashed: true, updatedAt: new Date().toISOString() } : f
    );
    this.saveFiles(files);
    try {
      fetch(`${BACKEND_BASE}/files/trash/${fileId}`, { method: 'POST' }).catch(() => {});
    } catch {}
  }

  public static restoreFromTrash(fileId: string) {
    const files = this.getFiles().map((f) =>
      f.id === fileId ? { ...f, isTrashed: false, updatedAt: new Date().toISOString() } : f
    );
    this.saveFiles(files);
    try {
      fetch(`${BACKEND_BASE}/files/restore/${fileId}`, { method: 'POST' }).catch(() => {});
    } catch {}
  }

  public static permanentlyDelete(fileId: string) {
    const files = this.getFiles().filter((f) => f.id !== fileId);
    this.saveFiles(files);
    try {
      fetch(`${BACKEND_BASE}/files/${fileId}`, { method: 'DELETE' }).catch(() => {});
    } catch {}
  }

  public static emptyTrash() {
    const files = this.getFiles().filter((f) => !f.isTrashed);
    this.saveFiles(files);
  }

  public static detectCategory(filename: string, mimeType: string): FileCategory {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext) || mimeType.startsWith('image/')) {
      return 'images';
    }
    if (['mp4', 'mkv', 'webm', 'avi', 'mov', 'wmv', 'flv', 'm4v'].includes(ext) || mimeType.startsWith('video/')) {
      return 'videos';
    }
    if (['mp3', 'flac', 'wav', 'aac', 'ogg', 'm4a', 'wma'].includes(ext) || mimeType.startsWith('audio/')) {
      return 'audio';
    }
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'csv'].includes(ext)) {
      return 'documents';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
      return 'archives';
    }
    if (['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json', 'cpp', 'c', 'java', 'go', 'rs', 'sql'].includes(ext)) {
      return 'code';
    }
    return 'other';
  }

  public static getBreadcrumbs(currentFolderId: string | null, folders: FolderItem[]) {
    const crumbs: { id: string | null; name: string }[] = [{ id: null, name: 'Cloud Drive' }];
    if (!currentFolderId) return crumbs;

    const findFolder = (id: string): FolderItem | undefined => folders.find((f) => f.id === id);
    const path: FolderItem[] = [];
    let curr = findFolder(currentFolderId);

    while (curr) {
      path.unshift(curr);
      curr = curr.parentId ? findFolder(curr.parentId) : undefined;
    }

    path.forEach((f) => crumbs.push({ id: f.id, name: f.name }));
    return crumbs;
  }

  public static getStorageStats() {
    const allFiles = this.getFiles();
    const activeFiles = allFiles.filter((f) => !f.isTrashed);
    const totalBytes = activeFiles.reduce((acc, f) => acc + f.size, 0);

    const breakdown: Record<FileCategory, number> = {
      all: totalBytes,
      documents: 0,
      images: 0,
      videos: 0,
      audio: 0,
      archives: 0,
      code: 0,
      other: 0,
    };

    activeFiles.forEach((f) => {
      if (breakdown[f.category] !== undefined) {
        breakdown[f.category] += f.size;
      } else {
        breakdown.other += f.size;
      }
    });

    return {
      totalBytes,
      fileCount: activeFiles.length,
      favoritesCount: allFiles.filter((f) => !f.isTrashed && f.isFavorite).length,
      trashCount: allFiles.filter((f) => f.isTrashed).length,
      breakdown,
    };
  }

  public static formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
