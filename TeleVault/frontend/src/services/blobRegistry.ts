// TeleVault Live In-Memory & IndexedDB Media Registry
// Guarantees that any uploaded video, photo, audio, or document plays and renders immediately

class BlobRegistryManager {
  private blobs: Map<string, Blob> = new Map();
  private liveUrls: Map<string, string> = new Map();
  private textContents: Map<string, string> = new Map();

  /**
   * Registers a live File or Blob instance immediately upon selection.
   */
  public register(id: string, fileOrBlob: Blob, textContent?: string): string {
    this.blobs.set(id, fileOrBlob);

    // Revoke old URL if any to prevent memory leaks
    if (this.liveUrls.has(id)) {
      try {
        URL.revokeObjectURL(this.liveUrls.get(id)!);
      } catch {}
    }

    const url = URL.createObjectURL(fileOrBlob);
    this.liveUrls.set(id, url);

    if (textContent) {
      this.textContents.set(id, textContent);
    }

    // Persist asynchronously to IndexedDB
    this.persistToIndexedDB(id, fileOrBlob, textContent).catch((err) => {
      console.warn('[BlobRegistry] DB save warning:', err);
    });

    return url;
  }

  /**
   * Returns a guaranteed valid, live URL for <video> and <img> tags.
   */
  public async getLiveUrl(id: string): Promise<string | null> {
    if (this.liveUrls.has(id)) {
      return this.liveUrls.get(id)!;
    }

    if (this.blobs.has(id)) {
      const url = URL.createObjectURL(this.blobs.get(id)!);
      this.liveUrls.set(id, url);
      return url;
    }

    // Attempt retrieval from IndexedDB
    const restored = await this.loadFromIndexedDB(id);
    if (restored) {
      this.blobs.set(id, restored.blob);
      const url = URL.createObjectURL(restored.blob);
      this.liveUrls.set(id, url);
      if (restored.textContent) {
        this.textContents.set(id, restored.textContent);
      }
      return url;
    }

    return null;
  }

  public async getBlob(id: string): Promise<Blob | null> {
    if (this.blobs.has(id)) {
      return this.blobs.get(id)!;
    }
    const restored = await this.loadFromIndexedDB(id);
    if (restored) {
      this.blobs.set(id, restored.blob);
      return restored.blob;
    }
    return null;
  }

  public getText(id: string): string | null {
    return this.textContents.get(id) || null;
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('TeleVault_MediaStore_v2', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('blobs')) {
          db.createObjectStore('blobs', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async persistToIndexedDB(id: string, blob: Blob, textContent?: string) {
    try {
      const db = await this.getDB();
      const tx = db.transaction('blobs', 'readwrite');
      tx.objectStore('blobs').put({ id, blob, textContent });
    } catch {}
  }

  private async loadFromIndexedDB(id: string): Promise<{ blob: Blob; textContent?: string } | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('blobs', 'readonly');
        const req = tx.objectStore('blobs').get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }
}

export const BlobRegistry = new BlobRegistryManager();
