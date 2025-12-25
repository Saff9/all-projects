// TeleVault Zero-Knowledge Cryptographic Engine
// Uses native WebCrypto API (hardware-accelerated, available in Android Webview, Desktop browsers, Node)

const PBKDF2_ITERATIONS = 600_000;
const KEY_LENGTH_BITS = 256;
const IV_LENGTH_BYTES = 12;

export class CryptoEngine {
  private static cachedKey: CryptoKey | null = null;

  /**
   * Generates a random 16-byte cryptographic salt.
   */
  public static generateSalt(): Uint8Array {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    return salt;
  }

  /**
   * Derives a 256-bit AES-GCM key from master password and salt.
   */
  public static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey', 'deriveBits']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH_BITS },
      true,
      ['encrypt', 'decrypt']
    );

    this.cachedKey = key;
    return key;
  }

  /**
   * Sets or clears the active session encryption key in memory.
   */
  public static setSessionKey(key: CryptoKey | null) {
    this.cachedKey = key;
  }

  public static getSessionKey(): CryptoKey | null {
    return this.cachedKey;
  }

  public static isUnlocked(): boolean {
    return this.cachedKey !== null;
  }

  /**
   * Computes a verification hash of the password to verify unlocks without storing plaintext.
   */
  public static async computeVerificationHash(password: string, salt: Uint8Array): Promise<string> {
    const key = await this.deriveKey(password, salt);
    const raw = await crypto.subtle.exportKey('raw', key).catch(() => null);
    if (raw) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', raw);
      return this.bufToHex(new Uint8Array(hashBuffer));
    }
    // Fallback digest
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(password + this.bufToHex(salt)));
    return this.bufToHex(new Uint8Array(digest));
  }

  /**
   * Encrypts a byte array with AES-256-GCM.
   * Returns Uint8Array: [12 bytes IV] + [Ciphertext with 16-byte auth tag]
   */
  public static async encryptBytes(data: Uint8Array, key?: CryptoKey): Promise<Uint8Array> {
    const activeKey = key || this.cachedKey;
    if (!activeKey) throw new Error('Encryption key not initialized. Please unlock TeleVault.');

    const iv = new Uint8Array(IV_LENGTH_BYTES);
    crypto.getRandomValues(iv);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as any },
      activeKey,
      data as any
    );

    const result = new Uint8Array(iv.length + ciphertext.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(ciphertext), iv.length);
    return result;
  }

  /**
   * Decrypts a byte array encrypted with AES-256-GCM.
   */
  public static async decryptBytes(payload: Uint8Array, key?: CryptoKey): Promise<Uint8Array> {
    const activeKey = key || this.cachedKey;
    if (!activeKey) throw new Error('Encryption key not initialized. Please unlock TeleVault.');

    if (payload.length < IV_LENGTH_BYTES + 16) {
      throw new Error('Malformed payload or corrupted chunk.');
    }

    const iv = payload.slice(0, IV_LENGTH_BYTES);
    const ciphertext = payload.slice(IV_LENGTH_BYTES);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as any },
      activeKey,
      ciphertext as any
    );

    return new Uint8Array(decrypted);
  }

  /**
   * Encrypts arbitrary binary data (Uint8Array or ArrayBuffer) using AES-256-GCM.
   */
  public static async encryptData(data: Uint8Array | ArrayBuffer, key?: CryptoKey): Promise<Uint8Array> {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
    return this.encryptBytes(bytes, key);
  }

  /**
   * Decrypts AES-256-GCM encrypted payload (Uint8Array or ArrayBuffer).
   */
  public static async decryptData(payload: Uint8Array | ArrayBuffer, key?: CryptoKey): Promise<Uint8Array> {
    const bytes = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
    return this.decryptBytes(bytes, key);
  }

  /**
   * Encrypts a UTF-8 string (such as real filename or folder name) to Base64 ciphertext.
   */
  public static async encryptString(text: string): Promise<string> {
    const enc = new TextEncoder();
    const encrypted = await this.encryptBytes(enc.encode(text));
    return this.bufToBase64(encrypted);
  }

  /**
   * Decrypts a Base64 ciphertext back to original UTF-8 string.
   */
  public static async decryptString(base64Payload: string): Promise<string> {
    const bytes = this.base64ToBuf(base64Payload);
    const decrypted = await this.decryptBytes(bytes);
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  }

  // Utilities
  public static bufToHex(buf: Uint8Array): string {
    return Array.from(buf)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public static hexToBuf(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substring(i * 2, (i + 1) * 2), 16);
    }
    return bytes;
  }

  public static bufToBase64(buf: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buf);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  public static base64ToBuf(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
