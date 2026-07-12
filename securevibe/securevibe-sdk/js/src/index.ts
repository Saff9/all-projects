/**
 * SecureVibe JavaScript/TypeScript SDK
 * ====================================
 * 
 * Enterprise-grade authentication SDK for SecureVibe Zero-Knowledge Authentication.
 * 
 * Features:
 * - Zero-knowledge authentication
 * - Automatic token rotation
 * - Secure storage management
 * - Device binding and security
 * - Multi-framework support
 * - TypeScript support
 * 
 * @version 1.0.0
 * @author SecureVibe SDK Team
 */

// Core types and interfaces
export interface SecureVibeConfig {
  tenantId: string;
  apiUrl: string;
  clientId?: string;
  clientSecret?: string;
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
  autoRefresh?: boolean;
  debug?: boolean;
}

export interface AuthenticationResult {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  riskScore?: number;
  error?: string;
  errorDetails?: {
    code: string;
    message: string;
    details?: any;
  };
  rotationCount?: number;
}

export interface SessionData {
  token: string;
  refreshToken: string;
  expiresAt: number;
  tenantId: string;
  deviceFingerprint: string;
  createdAt: number;
  lastRefreshedAt: number;
}

export interface IdentityClaim {
  email: string;
  password: string;
  timestamp: number;
  nonce: string;
}

export interface TokenValidationResult {
  valid: boolean;
  tenantId?: string;
  expiresAt?: number;
  deviceFingerprint?: string;
  riskScore?: number;
  error?: string;
}

export interface SecurityContext {
  deviceFingerprint: string;
  clientEntropy: string;
  timestamp: number;
  userAgent: string;
  language: string;
  platform: string;
}

// Main SDK Client
export class SecureVibeClient {
  private config: SecureVibeConfig;
  private session: SessionData | null = null;
  private securityContext: SecurityContext | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor(config: SecureVibeConfig) {
    this.config = {
      storage: 'localStorage',
      autoRefresh: true,
      debug: false,
      ...config
    };

    this.initialize();
  }

  /**
   * Initialize the SDK
   */
  private async initialize() {
    await this.initializeSecurityContext();
    this.loadSession();
    this.startAutoRefresh();
    
    if (this.config.debug) {
      console.log('🔐 SecureVibe SDK initialized for tenant:', this.config.tenantId);
    }
  }

  /**
   * Initialize security context with device fingerprinting
   */
  private async initializeSecurityContext() {
    this.securityContext = {
      deviceFingerprint: await this.generateDeviceFingerprint(),
      clientEntropy: this.generateClientEntropy(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    };

    if (this.config.debug) {
      console.log('🛡️ Security context initialized:', {
        deviceFingerprint: this.securityContext.deviceFingerprint.substring(0, 16) + '...',
        entropyLength: this.securityContext.clientEntropy.length
      });
    }
  }

  /**
   * Generate cryptographically secure device fingerprint
   */
  private async generateDeviceFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
      screen.availWidth + 'x' + screen.availHeight,
      (new Date()).getTimezoneOffset().toString(),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      this.getCanvasFingerprint(),
      this.getWebGLFingerprint()
    ];

    const fingerprintString = components.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintString);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate cryptographically secure client entropy
   */
  private generateClientEntropy(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Get basic canvas fingerprint
   */
  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'canvas_unavailable';
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('SecureVibe Canvas Fingerprint', 2, 2);
      return canvas.toDataURL();
    } catch (error) {
      return 'canvas_unavailable';
    }
  }

  /**
   * Get basic WebGL fingerprint
   */
  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'webgl_unavailable';

      // Type assertion for WebGL context
      const webgl = gl as WebGLRenderingContext;
      const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) +
               webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      }
      return 'webgl_basic';
    } catch (error) {
      return 'webgl_error';
    }
  }

  /**
   * Authenticate a user
   */
  async authenticate(identityData: Omit<IdentityClaim, 'timestamp' | 'nonce'>): Promise<AuthenticationResult> {
    try {
      if (!this.securityContext) {
        throw new Error('Security context not initialized');
      }

      const claim: IdentityClaim = {
        ...identityData,
        timestamp: Date.now(),
        nonce: crypto.randomUUID()
      };

      // Encrypt identity claim client-side
      const encryptedClaim = await this.encryptIdentityClaim(claim);

      // Sign the encrypted claim
      const signature = await this.signEncryptedClaim(encryptedClaim);

      // Prepare authentication payload
      const payload = {
        encryptedClaim: encryptedClaim.encryptedData,
        signature: signature,
        tenantId: this.config.tenantId,
        deviceFingerprint: this.securityContext.deviceFingerprint,
        ipProfile: 'client-detected',
        clientEntropy: this.securityContext.clientEntropy
      };

      if (this.config.debug) {
        console.log('📤 Sending authentication request...');
      }

      const response = await this.apiRequest('/auth/verify-claim', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        // Store session securely
        this.setSession({
          token: response.token,
          refreshToken: response.refreshToken || '',
          expiresAt: Date.now() + response.expiresIn * 1000,
          tenantId: this.config.tenantId,
          deviceFingerprint: this.securityContext.deviceFingerprint,
          createdAt: Date.now(),
          lastRefreshedAt: Date.now()
        });

        this.trigger('authenticated', {
          token: response.token,
          riskScore: response.riskScore,
          tenantId: this.config.tenantId
        });

        if (this.config.debug) {
          console.log('✅ Authentication successful! Risk score:', response.riskScore);
        }

        return { 
          success: true, 
          token: response.token, 
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn,
          riskScore: response.riskScore 
        };
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      const result: AuthenticationResult = {
        success: false,
        error: error.message,
        errorDetails: {
          code: 'AUTHENTICATION_ERROR',
          message: error.message
        }
      };

      this.trigger('authentication_failed', result);
      
      if (this.config.debug) {
        console.error('Authentication error:', error);
      }

      return result;
    }
  }

  /**
   * Encrypt identity claim client-side
   */
  private async encryptIdentityClaim(claim: IdentityClaim): Promise<any> {
    try {
      // Get tenant public key
      const tenantInfo = await this.getTenantPublicKey();

      // Convert claim to string
      const claimString = JSON.stringify(claim);

      // Derive encryption key from tenant public key and client entropy
      const keyMaterial = await this.deriveEncryptionKey(tenantInfo.publicKey);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encoder = new TextEncoder();
      const data = encoder.encode(claimString);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        keyMaterial,
        data
      );

      return {
        encryptedData: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv)),
        algorithm: 'AES-GCM',
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error('Identity encryption failed');
    }
  }

  /**
   * Derive encryption key from tenant public key and client entropy
   */
  private async deriveEncryptionKey(tenantPublicKey: string): Promise<CryptoKey> {
    const entropyString = this.securityContext.clientEntropy + tenantPublicKey;
    const encoder = new TextEncoder();
    const entropyData = encoder.encode(entropyString);

    const hash = await crypto.subtle.digest('SHA-256', entropyData);

    return await crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Sign encrypted claim with client-side key
   */
  private async signEncryptedClaim(encryptedClaim: any): Promise<string> {
    try {
      // Generate client key pair for signing
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        true,
        ['sign', 'verify']
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(encryptedClaim));

      const signature = await crypto.subtle.sign(
        {
          name: 'ECDSA',
          hash: { name: 'SHA-256' }
        },
        keyPair.privateKey,
        data
      );

      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    } catch (error) {
      throw new Error('Claim signing failed');
    }
  }

  /**
   * Get tenant public key from server
   */
  private async getTenantPublicKey(): Promise<{ publicKey: string; keyRotationDate: Date }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/keys/info/${this.config.tenantId}`);
      const data = await response.json();

      if (!data.success || !data.tenant) {
        throw new Error('Tenant not found or inactive');
      }

      return {
        publicKey: data.tenant.publicKey,
        keyRotationDate: new Date(data.tenant.keyRotationDate)
      };
    } catch (error) {
      throw new Error('Unable to retrieve tenant configuration');
    }
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<TokenValidationResult> {
    if (!this.session) {
      return { valid: false, error: 'No active session' };
    }

    try {
      const response = await this.apiRequest('/auth/validate-token', {
        method: 'POST',
        body: JSON.stringify({
          token: this.session.token
        })
      });

      if (response.success && response.valid) {
        return { 
          valid: true, 
          tenantId: response.tenantId,
          expiresAt: response.expiresAt,
          deviceFingerprint: response.deviceFingerprint,
          riskScore: response.riskScore
        };
      } else {
        this.clearSession();
        return { valid: false, error: response.message || 'Token validation failed' };
      }
    } catch (error) {
      this.clearSession();
      return { valid: false, error: error.message };
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(): Promise<AuthenticationResult> {
    if (!this.session) {
      return { success: false, error: 'No active session to refresh' };
    }

    try {
      const response = await this.apiRequest('/auth/rotate-token', {
        method: 'POST',
        body: JSON.stringify({
          token: this.session.token,
          deviceFingerprint: this.session.deviceFingerprint,
          clientEntropy: this.securityContext.clientEntropy
        })
      });

      if (response.success) {
        this.setSession({
          ...this.session,
          token: response.token,
          expiresAt: Date.now() + response.expiresIn * 1000,
          lastRefreshedAt: Date.now()
        });

        this.trigger('token_refreshed', {
          expiresIn: response.expiresIn,
          rotationCount: response.rotationCount
        });

        return { 
          success: true, 
          token: response.token, 
          expiresIn: response.expiresIn,
          rotationCount: response.rotationCount 
        };
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error) {
      this.clearSession();
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    if (!this.session) {
      return { success: true }; // Already logged out
    }

    try {
      await this.apiRequest('/auth/revoke-token', {
        method: 'POST',
        body: JSON.stringify({
          token: this.session.token
        })
      });

      this.clearSession();
      this.trigger('logout');
      
      return { success: true };
    } catch (error) {
      this.clearSession();
      return { success: false, error: error.message };
    }
  }

  /**
   * Make authenticated API request
   */
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    // Check if token needs refresh
    if (this.isTokenExpired()) {
      const refreshed = await this.refreshToken();
      if (!refreshed.success) {
        throw new Error('Session expired and could not be refreshed');
      }
    }

    const headers = {
      'Authorization': `Bearer ${this.session.token}`,
      'X-Tenant-ID': this.config.tenantId,
      'X-Device-Fingerprint': this.session.deviceFingerprint,
      'X-Client-Entropy': this.securityContext.clientEntropy,
      ...options.headers
    };

    return fetch(url, { ...options, headers });
  }

  /**
   * Get current session
   */
  getSession(): SessionData | null {
    return this.session;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.session && !this.isTokenExpired());
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.session) return true;
    return Date.now() >= this.session.expiresAt;
  }

  /**
   * Set session data
   */
  private setSession(session: SessionData) {
    this.session = session;
    this.saveSession();
  }

  /**
   * Load session from storage
   */
  private loadSession() {
    try {
      const storage = this.getStorage();
      const sessionData = storage.getItem('securevibe_session');
      
      if (!sessionData) return;

      const session = JSON.parse(sessionData);
      
      // Validate session integrity
      if (session.tenantId !== this.config.tenantId) {
        console.warn('Session tenant mismatch, clearing session');
        this.clearSession();
        return;
      }

      this.session = session;
    } catch (error) {
      console.warn('Failed to load session:', error);
    }
  }

  /**
   * Save session to storage
   */
  private saveSession() {
    try {
      const storage = this.getStorage();
      const sessionData = JSON.stringify(this.session);
      storage.setItem('securevibe_session', sessionData);
    } catch (error) {
      console.warn('Failed to save session to storage');
    }
  }

  /**
   * Clear session data
   */
  private clearSession() {
    this.session = null;
    try {
      const storage = this.getStorage();
      storage.removeItem('securevibe_session');
    } catch (error) {
      console.warn('Failed to clear session from storage');
    }
  }

  /**
   * Get storage interface
   */
  private getStorage(): Storage {
    switch (this.config.storage) {
      case 'sessionStorage':
        return sessionStorage;
      case 'memory':
        return new MemoryStorage();
      default:
        return localStorage;
    }
  }

  /**
   * Start automatic token refresh
   */
  private startAutoRefresh() {
    if (!this.config.autoRefresh || !this.session) return;

    const refreshTime = this.session.expiresAt - Date.now() - 60000; // Refresh 1 minute before expiry

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        await this.refreshToken();
        this.startAutoRefresh(); // Schedule next refresh
      }, refreshTime);
    }
  }

  /**
   * Stop automatic token refresh
   */
  private stopAutoRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Event system for authentication callbacks
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  private trigger(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }

  /**
   * Get security context information
   */
  getSecurityContext(): SecurityContext | null {
    return this.securityContext;
  }

  /**
   * Get SDK version
   */
  static getVersion(): string {
    return '1.0.0';
  }

  /**
   * Make API request with error handling
   */
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.config.tenantId,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      if (this.config.debug) {
        console.error('API request error:', error);
      }
      throw error;
    }
  }
}

/**
 * Memory storage implementation for testing
 */
class MemoryStorage implements Storage {
  private data: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  get length(): number {
    return this.data.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.data.keys());
    return keys[index] || null;
  }
}

// Export default client
export default SecureVibeClient;
