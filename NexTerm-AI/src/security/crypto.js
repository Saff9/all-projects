/**
 * Crypto — Encrypt/decrypt API keys using Web Crypto API
 * AES-GCM with PBKDF2-derived key from user PIN
 */

const SALT_KEY = 'nexterm_crypto_salt';
const IV_LENGTH = 12;
const ITERATIONS = 600000;
const TAG_LENGTH = 128;

export class CryptoManager {
    constructor() {
        this.derivedKey = null;
        this.isUnlocked = false;
        this._sensitiveBuffers = [];
    }

    /**
     * Derive encryption key from a passphrase/PIN
     */
    async deriveKey(passphrase) {
        if (typeof passphrase !== 'string' || passphrase.length < 4) {
            throw new Error('PIN must be at least 4 characters');
        }

        const enc = new TextEncoder();
        const passphraseBuffer = enc.encode(passphrase);
        this._trackSensitiveBuffer(passphraseBuffer);
        
        const salt = await this._getSalt();

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passphraseBuffer,
            'PBKDF2',
            false,
            ['deriveKey']
        );

        this.derivedKey = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-512' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        this.isUnlocked = true;
        this._wipeBuffer(passphraseBuffer);
    }

    /**
     * Encrypt a string
     */
    async encrypt(plaintext) {
        if (!this.derivedKey) throw new Error('Crypto not unlocked. Set a PIN first.');

        const enc = new TextEncoder();
        const plaintextBuffer = enc.encode(plaintext);
        this._trackSensitiveBuffer(plaintextBuffer);
        
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv, tagLength: TAG_LENGTH },
            this.derivedKey,
            plaintextBuffer
        );

        // Combine IV + ciphertext and base64 encode
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);

        this._wipeBuffer(plaintextBuffer);
        return btoa(String.fromCharCode(...combined));
    }

    /**
     * Decrypt a string
     */
    async decrypt(encrypted) {
        if (!this.derivedKey) throw new Error('Crypto not unlocked. Enter your PIN.');

        try {
            const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
            const iv = combined.slice(0, IV_LENGTH);
            const ciphertext = combined.slice(IV_LENGTH);

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv, tagLength: TAG_LENGTH },
                this.derivedKey,
                ciphertext
            );

            const result = new TextDecoder().decode(decrypted);
            this._wipeBuffer(new Uint8Array(decrypted));
            return result;
        } catch {
            throw new Error('Decryption failed. Wrong PIN or corrupted data.');
        }
    }

    /**
     * Securely wipe sensitive buffer from memory
     */
    _wipeBuffer(buffer) {
        if (buffer instanceof Uint8Array) {
            crypto.getRandomValues(buffer);
            buffer.fill(0);
        }
    }

    /**
     * Track sensitive buffers for secure cleanup
     */
    _trackSensitiveBuffer(buffer) {
        this._sensitiveBuffers.push(buffer);
    }

    /**
     * Wipe all tracked sensitive memory
     */
    wipeAllSensitiveMemory() {
        this._sensitiveBuffers.forEach(buf => this._wipeBuffer(buf));
        this._sensitiveBuffers = [];
        this.lock();
    }

    /**
     * Lock (clear the derived key)
     */
    lock() {
        this.derivedKey = null;
        this.isUnlocked = false;
    }

    /**
     * Get or create a persistent salt
     */
    async _getSalt() {
        let saltB64 = localStorage.getItem(SALT_KEY);
        if (!saltB64) {
            const salt = crypto.getRandomValues(new Uint8Array(32));
            saltB64 = btoa(String.fromCharCode(...salt));
            localStorage.setItem(SALT_KEY, saltB64);
        }
        return Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    }

    /**
     * Check if crypto is set up (has a salt = user has set a PIN before)
     */
    isSetUp() {
        return !!localStorage.getItem(SALT_KEY);
    }

    /**
     * Encrypt value for secure localStorage storage
     */
    async secureStore(key, value) {
        const encrypted = await this.encrypt(JSON.stringify(value));
        localStorage.setItem(key, encrypted);
    }

    /**
     * Decrypt value from secure localStorage
     */
    async secureRetrieve(key) {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        return JSON.parse(await this.decrypt(encrypted));
    }

    /**
     * Secure logout - wipe all state and memory
     */
    secureLogout() {
        this.wipeAllSensitiveMemory();
        
        // Clear all sensitive localStorage items
        Object.keys(localStorage).forEach(key => {
            if (!['theme', 'locale'].includes(key)) {
                localStorage.removeItem(key);
            }
        });

        // Clear session storage
        sessionStorage.clear();

        // Force garbage collection hint
        if (window.gc) window.gc();
    }
}

/**
 * Secure context check - enforce HTTPS in production
 */
export function isSecureContext() {
    return window.isSecureContext && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
}

export function enforceSecureContext() {
    if (import.meta.env.PROD && !isSecureContext()) {
        throw new Error('Application must run over HTTPS in production');
    }
}
