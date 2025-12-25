import { CryptoEngine } from './crypto';

export interface TelegramCredentials {
  apiId: number;
  apiHash: string;
  phoneNumber: string;
  sessionString?: string;
  storageChannelId?: number;
  storageChannelTitle?: string;
  user?: {
    id: number;
    firstName: string;
    username?: string;
    phone?: string;
  };
}

const TG_CRED_KEY = 'televault_tg_creds_v1';
const BACKEND_BASE = 'http://localhost:8000/api';

export const DEFAULT_TELEGRAM_CLIENT = {
  apiId: 2040,
  apiHash: 'b18441a1ff607e10a989891a5462e627',
};

export class TelegramService {
  private static credentials: TelegramCredentials | null = null;

  public static getCredentials(): TelegramCredentials | null {
    if (this.credentials) return this.credentials;
    const raw = localStorage.getItem(TG_CRED_KEY);
    if (raw) {
      try {
        this.credentials = JSON.parse(raw);
        return this.credentials;
      } catch {
        return null;
      }
    }
    return null;
  }

  public static saveCredentials(creds: TelegramCredentials) {
    this.credentials = creds;
    localStorage.setItem(TG_CRED_KEY, JSON.stringify(creds));
  }

  public static clearCredentials() {
    this.credentials = null;
    localStorage.removeItem(TG_CRED_KEY);
  }

  public static async sendLoginCodeSimple(phoneNumber: string): Promise<{ success: boolean; phoneCodeHash: string }> {
    return this.sendLoginCode(DEFAULT_TELEGRAM_CLIENT.apiId, DEFAULT_TELEGRAM_CLIENT.apiHash, phoneNumber);
  }

  public static async sendLoginCode(
    apiId: number,
    apiHash: string,
    phoneNumber: string
  ): Promise<{ success: boolean; phoneCodeHash: string }> {
    const cleaned = phoneNumber.replace(/[\s-]/g, '');
    if (!cleaned || cleaned.length < 7) {
      throw new Error('Enter a valid phone number with country code (e.g. +1... or +91...).');
    }

    const res = await fetch(`${BACKEND_BASE}/telegram/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_id: apiId, api_hash: apiHash, phone_number: cleaned }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send login code.' }));
      throw new Error(err.detail || 'Failed to send login code.');
    }

    return await res.json();
  }

  public static async verifyLoginCode(
    apiId: number,
    apiHash: string,
    phoneNumber: string,
    code: string,
    password2FA?: string,
    phoneCodeHash?: string
  ): Promise<{ success: boolean; user: { firstName: string; username: string; id: number } }> {
    const cleanedCode = code.trim();
    if (!cleanedCode || cleanedCode.length < 5) {
      throw new Error('Enter the 5-digit code sent to your Telegram app.');
    }

    const res = await fetch(`${BACKEND_BASE}/telegram/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_code: cleanedCode,
        phone_number: phoneNumber.replace(/[\s-]/g, ''),
        phone_code_hash: phoneCodeHash || null,
        api_id: apiId,
        api_hash: apiHash,
        password_2fa: password2FA || null
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Verification failed.' }));
      throw new Error(err.detail || 'Verification failed.');
    }

    const data = await res.json();

    this.saveCredentials({
      apiId,
      apiHash,
      phoneNumber,
      sessionString: data.session_string,
      storageChannelId: data.channel_id,
      storageChannelTitle: data.channel_title || 'TeleVault Storage',
      user: data.user,
    });

    return { success: true, user: data.user };
  }

  public static async loginWithBotToken(
    botToken: string,
    targetChatId?: string,
    apiId?: number,
    apiHash?: string
  ): Promise<{ success: boolean; user: { firstName: string; username: string; id: number; isBot?: boolean } }> {
    const cleaned = botToken.trim();
    if (!cleaned || !cleaned.includes(':')) {
      throw new Error('Please enter a valid Telegram Bot Token from @BotFather (format: 123456789:ABCDef...).');
    }

    const res = await fetch(`${BACKEND_BASE}/telegram/bot-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bot_token: cleaned,
        target_chat_id: targetChatId ? targetChatId.trim() : null,
        api_id: apiId || DEFAULT_TELEGRAM_CLIENT.apiId,
        api_hash: apiHash || DEFAULT_TELEGRAM_CLIENT.apiHash
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Bot login failed.' }));
      throw new Error(err.detail || 'Bot login failed.');
    }

    const data = await res.json();
    this.saveCredentials({
      apiId: apiId || DEFAULT_TELEGRAM_CLIENT.apiId,
      apiHash: apiHash || DEFAULT_TELEGRAM_CLIENT.apiHash,
      phoneNumber: `bot:${data.user.username || data.user.firstName}`,
      sessionString: data.session_string,
      storageChannelTitle: data.channel_title || 'TeleVault Storage',
      user: data.user,
    });

    return { success: true, user: data.user };
  }

  public static async startQRLogin(
    apiId?: number,
    apiHash?: string
  ): Promise<{ success: boolean; sessionKey: string; tokenUrl: string; expires?: number }> {
    const res = await fetch(`${BACKEND_BASE}/telegram/qr-start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_id: apiId || DEFAULT_TELEGRAM_CLIENT.apiId,
        api_hash: apiHash || DEFAULT_TELEGRAM_CLIENT.apiHash
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to start QR login.' }));
      throw new Error(err.detail || 'Failed to start QR login.');
    }

    const data = await res.json();
    return {
      success: true,
      sessionKey: data.session_key,
      tokenUrl: data.token_url,
      expires: data.expires
    };
  }

  public static async waitQRLogin(
    sessionKey: string
  ): Promise<{ success: boolean; status?: string; user?: any; error?: string }> {
    const res = await fetch(`${BACKEND_BASE}/telegram/qr-status?session_key=${encodeURIComponent(sessionKey)}`);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'QR scan check failed.' }));
      throw new Error(err.detail || 'QR scan check failed.');
    }

    const data = await res.json();
    if (data.status === 'success' && data.user) {
      this.saveCredentials({
        apiId: DEFAULT_TELEGRAM_CLIENT.apiId,
        apiHash: DEFAULT_TELEGRAM_CLIENT.apiHash,
        phoneNumber: data.user.phone || `user_${data.user.id}`,
        sessionString: data.session_string,
        storageChannelId: data.channel_id,
        storageChannelTitle: data.channel_title || 'TeleVault Storage',
        user: data.user,
      });
      return { success: true, user: data.user };
    } else if (data.status === 'error') {
      return { success: false, status: 'error', error: data.error };
    }

    return { success: false, status: 'pending' };
  }

  public static async uploadFile(
    file: File,
    onProgress?: (percent: number, speedBytesPerSec: number, chunkIndex: number, totalChunks: number) => void
  ): Promise<{ messageIds: number[]; chunkCount: number }> {
    const totalSize = file.size;
    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunking
    const chunkCount = Math.max(1, Math.ceil(totalSize / CHUNK_SIZE));
    const messageIds: number[] = [];

    let uploadedBytes = 0;
    const startTime = Date.now();

    for (let i = 0; i < chunkCount; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, totalSize);
      const slice = file.slice(start, end);
      const buffer = new Uint8Array(await slice.arrayBuffer());

      let payload: Uint8Array = buffer;
      if (CryptoEngine.isUnlocked()) {
        payload = await CryptoEngine.encryptData(buffer);
      }

      const formData = new FormData();
      formData.append('chunk', new Blob([payload as BlobPart]), `chunk_${i}`);
      formData.append('chunk_index', String(i));
      formData.append('total_chunks', String(chunkCount));
      formData.append('file_name', file.name);

      const res = await fetch(`${BACKEND_BASE}/files/upload-chunk`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Upload failed on chunk ${i + 1}/${chunkCount}.` }));
        throw new Error(err.detail || `Upload failed on chunk ${i + 1}/${chunkCount}.`);
      }

      const result = await res.json();
      if (result.message_id) {
        messageIds.push(result.message_id);
      }

      uploadedBytes += slice.size;
      const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
      const speed = Math.round(uploadedBytes / elapsedSec);
      const percent = Math.min(100, Math.round((uploadedBytes / totalSize) * 100));
      if (onProgress) {
        onProgress(percent, speed, i + 1, chunkCount);
      }
    }

    return { messageIds, chunkCount };
  }

  /**
   * Downloads a single encrypted chunk from Telegram by message ID and decrypts it locally.
   */
  public static async downloadChunk(messageId: number, isEncrypted = true): Promise<Uint8Array> {
    const res = await fetch(`${BACKEND_BASE}/files/download-chunk/${messageId}`);
    if (!res.ok) {
      throw new Error(`Failed to download chunk message ${messageId} (status: ${res.status}).`);
    }

    const arrayBuf = await res.arrayBuffer();
    const rawBytes = new Uint8Array(arrayBuf);

    if (isEncrypted && CryptoEngine.isUnlocked()) {
      try {
        return await CryptoEngine.decryptData(rawBytes);
      } catch (decErr) {
        console.warn(`[TelegramService] Decryption notice on chunk ${messageId}:`, decErr);
        return rawBytes;
      }
    }

    return rawBytes;
  }

  /**
   * End-to-end download and client-side decryption of all chunks.
   * Assembles chunks into a final decrypted Blob.
   */
  public static async downloadAndDecryptFile(
    file: { name: string; size: number; mimeType?: string; telegramMessageIds?: number[]; chunkCount?: number; isEncrypted?: boolean },
    onProgress?: (percent: number, speedBytesPerSec: number, currentChunk: number, totalChunks: number) => void
  ): Promise<Blob> {
    const messageIds = file.telegramMessageIds || [];
    const totalSize = file.size || 0;
    const mimeType = file.mimeType || 'application/octet-stream';
    const isEncrypted = file.isEncrypted !== false;

    // 1. Download chunk-by-chunk via real message IDs if available
    if (messageIds.length > 0) {
      const totalChunks = messageIds.length;
      const decryptedChunks: Uint8Array[] = [];
      let totalReceivedBytes = 0;
      const startTime = Date.now();

      for (let i = 0; i < totalChunks; i++) {
        const msgId = messageIds[i];
        const chunkData = await this.downloadChunk(msgId, isEncrypted);
        decryptedChunks.push(chunkData);
        totalReceivedBytes += chunkData.length;

        const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
        const speed = Math.round(totalReceivedBytes / elapsedSec);
        const percent = Math.min(100, Math.round(((i + 1) / totalChunks) * 100));

        if (onProgress) {
          onProgress(percent, speed, i + 1, totalChunks);
        }
      }

      return new Blob(decryptedChunks as BlobPart[], { type: mimeType });
    }

    // 2. Fallback: Stream from backend /files/download
    const res = await fetch(`${BACKEND_BASE}/files/download?name=${encodeURIComponent(file.name)}`);
    if (!res.ok) {
      throw new Error(`Download failed for ${file.name} (status: ${res.status}).`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      const blob = await res.blob();
      return blob;
    }

    const rawChunks: Uint8Array[] = [];
    let received = 0;
    const startTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        rawChunks.push(value);
        received += value.length;
        const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
        const speed = Math.round(received / elapsedSec);
        const percent = totalSize > 0 ? Math.min(100, Math.round((received / totalSize) * 100)) : 100;
        if (onProgress) {
          onProgress(percent, speed, 1, 1);
        }
      }
    }

    const fullBuffer = new Uint8Array(received);
    let offset = 0;
    for (const c of rawChunks) {
      fullBuffer.set(c, offset);
      offset += c.length;
    }

    if (isEncrypted && CryptoEngine.isUnlocked()) {
      try {
        const decrypted = await CryptoEngine.decryptData(fullBuffer);
        return new Blob([decrypted as BlobPart], { type: mimeType });
      } catch {
        return new Blob([fullBuffer as BlobPart], { type: mimeType });
      }
    }

    return new Blob([fullBuffer as BlobPart], { type: mimeType });
  }

  /**
   * Overloaded downloadFile helper for backwards and direct compatibility.
   */
  public static async downloadFile(
    fileOrName: string | { name: string; size: number; mimeType?: string; telegramMessageIds?: number[]; isEncrypted?: boolean },
    fileSize?: number,
    mimeType?: string,
    onProgress?: (percent: number, speedBytesPerSec?: number) => void
  ): Promise<Blob> {
    if (typeof fileOrName === 'object') {
      return this.downloadAndDecryptFile(fileOrName, (percent, speed) => {
        if (onProgress) onProgress(percent, speed);
      });
    }

    return this.downloadAndDecryptFile(
      {
        name: fileOrName,
        size: fileSize || 0,
        mimeType: mimeType || 'application/octet-stream',
        telegramMessageIds: [],
      },
      (percent, speed) => {
        if (onProgress) onProgress(percent, speed);
      }
    );
  }
}
