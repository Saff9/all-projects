// Persistent IndexedDB File & Blob Cache for TeleVault
// Ensures uploaded images, videos, audio, and documents play and render in full fidelity

const DB_NAME = 'TeleVault_Storage_v1';
const STORE_NAME = 'file_blobs';
const DB_VERSION = 1;

class FileCacheManager {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryUrlMap: Map<string, string> = new Map();
  private memoryTextMap: Map<string, string> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  /**
   * Stores an uploaded or decrypted file blob and optional text content in IndexedDB.
   */
  public async saveBlob(id: string, blob: Blob, textContent?: string): Promise<string> {
    // Generate in-memory object URL for zero-lag streaming
    const objectUrl = URL.createObjectURL(blob);
    this.memoryUrlMap.set(id, objectUrl);
    if (textContent) {
      this.memoryTextMap.set(id, textContent);
    }

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, blob, textContent });
    } catch (err) {
      console.warn('[FileCache] IndexedDB persistence warning:', err);
    }

    return objectUrl;
  }

  /**
   * Retrieves an active object URL for an image, video, audio, or document.
   */
  public async getObjectUrl(id: string): Promise<string | null> {
    if (this.memoryUrlMap.has(id)) {
      return this.memoryUrlMap.get(id)!;
    }

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      return new Promise((resolve) => {
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            const url = URL.createObjectURL(req.result.blob);
            this.memoryUrlMap.set(id, url);
            if (req.result.textContent) {
              this.memoryTextMap.set(id, req.result.textContent);
            }
            resolve(url);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Retrieves text content for code or text files.
   */
  public async getTextContent(id: string): Promise<string | null> {
    if (this.memoryTextMap.has(id)) {
      return this.memoryTextMap.get(id)!;
    }

    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      return new Promise((resolve) => {
        req.onsuccess = () => {
          if (req.result && req.result.textContent) {
            this.memoryTextMap.set(id, req.result.textContent);
            resolve(req.result.textContent);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }
}

export const FileCache = new FileCacheManager();
