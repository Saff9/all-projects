/**
 * SecureVibe Authentication SDK
 * =============================
 *
 * Client-side authentication library that integrates SecureVibe's
 * enterprise-grade authentication into any application.
 *
 * Features:
 * - Magic Link Authentication
 * - Social Login (Google, etc.)
 * - Passwordless authentication
 * - Custom branding
 * - Zero data collection
 * - Client-owned database
 *
 * @version 1.0.0
 * @author SecureVibe Team
 */

class SecureVibeAuth {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || 'https://api.securevibe.com';
    this.clientId = config.clientId;
    this.redirectUri = config.redirectUri || window.location.origin;
    this.branding = config.branding || {};

    if (!this.clientId) {
      throw new Error('SecureVibe: clientId is required');
    }

    this.session = this.loadSession();
    this.listeners = new Map();

    // Initialize UI
    this.initUI();

    console.log('🔐 SecureVibe Auth SDK initialized');
  }

  /**
   * Initialize the authentication UI
   */
  initUI() {
    // Create modal container if it doesn't exist
    if (!document.getElementById('securevibe-modal')) {
      const modal = document.createElement('div');
      modal.id = 'securevibe-modal';
      modal.innerHTML = `
        <div class="securevibe-overlay" onclick="securevibeAuth.closeModal()"></div>
        <div class="securevibe-modal-content">
          <button class="securevibe-close" onclick="securevibeAuth.closeModal()">×</button>
          <div id="securevibe-content"></div>
        </div>
      `;
      document.body.appendChild(modal);

      // Add CSS
      this.injectStyles();
    }
  }

  /**
   * Inject SecureVibe styles
   */
  injectStyles() {
    if (document.getElementById('securevibe-styles')) return;

    const styles = `
      <style id="securevibe-styles">
        .securevibe-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          z-index: 10000;
          display: none;
        }

        .securevibe-modal-content {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 10001;
          max-width: 400px;
          width: 90%;
          display: none;
        }

        .securevibe-close {
          position: absolute;
          top: 15px;
          right: 20px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .securevibe-close:hover {
          color: #333;
        }

        .securevibe-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .securevibe-input {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .securevibe-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .securevibe-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .securevibe-btn:hover {
          transform: translateY(-2px);
        }

        .securevibe-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .securevibe-divider {
          text-align: center;
          margin: 20px 0;
          position: relative;
          color: #666;
        }

        .securevibe-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e1e5e9;
        }

        .securevibe-divider span {
          background: white;
          padding: 0 15px;
        }

        .securevibe-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 24px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          color: #333;
        }

        .securevibe-social-btn:hover {
          border-color: #667eea;
          transform: translateY(-1px);
        }

        .securevibe-loading {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: securevibe-spin 1s linear infinite;
        }

        @keyframes securevibe-spin {
          to { transform: rotate(360deg); }
        }

        .securevibe-success {
          text-align: center;
          color: #10b981;
        }

        .securevibe-error {
          color: #ef4444;
          font-size: 14px;
          margin-top: 5px;
        }

        .securevibe-branding {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          color: #666;
          font-size: 12px;
        }

        .securevibe-branding img {
          max-width: 100px;
          margin-bottom: 10px;
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  /**
   * Authenticate with magic link
   */
  async magicLink(email) {
    try {
      const response = await this.apiRequest('/auth/magic-link', {
        method: 'POST',
        body: JSON.stringify({
          email,
          clientId: this.clientId,
          redirectUri: this.redirectUri,
          branding: this.branding
        })
      });

      if (response.success) {
        this.showSuccess('Magic link sent! Check your email.');
        return { success: true };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.showError(error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Authenticate with Google
   */
  async googleLogin() {
    const authUrl = `${this.apiUrl}/auth/google?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    window.location.href = authUrl;
  }

  /**
   * Handle authentication callback
   */
  async handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken');
    const error = urlParams.get('error');

    if (error) {
      this.showError('Authentication failed: ' + error);
      return false;
    }

    if (token && refreshToken) {
      // Store tokens securely
      this.setSession({ token, refreshToken });

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Trigger success callback
      this.trigger('authenticated', this.session);

      return true;
    }

    return false;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!(this.session && this.session.token && !this.isTokenExpired());
  }

  /**
   * Get current user session
   */
  getSession() {
    return this.session;
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await this.apiRequest('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.session.token}`
        }
      });
    } catch (error) {
      console.warn('Logout API call failed, clearing local session anyway');
    }

    this.clearSession();
    this.trigger('logout');
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const response = await this.apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: this.session.refreshToken
        })
      });

      if (response.success) {
        this.session.token = response.data.token;
        this.session.refreshToken = response.data.refreshToken;
        this.saveSession();
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearSession();
    return false;
  }

  /**
   * Make authenticated API request
   */
  async authenticatedRequest(url, options = {}) {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    // Check if token needs refresh
    if (this.isTokenExpired()) {
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        throw new Error('Session expired');
      }
    }

    const headers = {
      'Authorization': `Bearer ${this.session.token}`,
      'X-API-Key': this.clientId,
      ...options.headers
    };

    return fetch(url, { ...options, headers });
  }

  /**
   * Show login modal
   */
  showLogin() {
    const content = `
      <div class="securevibe-form">
        <h2 style="margin-bottom: 10px; color: #333;">Welcome Back</h2>
        <p style="margin-bottom: 30px; color: #666;">Sign in to continue</p>

        <form id="securevibe-login-form">
          <input type="email" id="email" class="securevibe-input" placeholder="Enter your email" required>
          <button type="submit" class="securevibe-btn">
            <span id="btn-text">Send Magic Link</span>
            <span id="btn-loading" class="securevibe-loading" style="display: none;"></span>
          </button>
        </form>

        <div class="securevibe-divider">
          <span>or</span>
        </div>

        <button onclick="securevibeAuth.googleLogin()" class="securevibe-social-btn">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div id="securevibe-message"></div>

        <div class="securevibe-branding">
          <div style="font-weight: 600; margin-bottom: 5px;">Protected by</div>
          <div style="font-size: 18px; font-weight: 700; color: #667eea;">SecureVibe</div>
        </div>
      </div>
    `;

    this.showModal(content);

    // Attach form handler
    setTimeout(() => {
      const form = document.getElementById('securevibe-login-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value;

          document.getElementById('btn-text').style.display = 'none';
          document.getElementById('btn-loading').style.display = 'inline-block';

          const result = await this.magicLink(email);

          document.getElementById('btn-text').style.display = 'inline';
          document.getElementById('btn-loading').style.display = 'none';

          if (result.success) {
            setTimeout(() => {
              this.closeModal();
            }, 2000);
          }
        });
      }
    }, 100);
  }

  /**
   * Show modal with content
   */
  showModal(content) {
    document.getElementById('securevibe-content').innerHTML = content;
    document.querySelector('.securevibe-overlay').style.display = 'block';
    document.querySelector('.securevibe-modal-content').style.display = 'block';
  }

  /**
   * Close modal
   */
  closeModal() {
    document.querySelector('.securevibe-overlay').style.display = 'none';
    document.querySelector('.securevibe-modal-content').style.display = 'none';
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const messageDiv = document.getElementById('securevibe-message');
    if (messageDiv) {
      messageDiv.innerHTML = `<div class="securevibe-success">${message}</div>`;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const messageDiv = document.getElementById('securevibe-message');
    if (messageDiv) {
      messageDiv.innerHTML = `<div class="securevibe-error">${message}</div>`;
    }
  }

  /**
   * Make API request to SecureVibe
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Client-ID': this.clientId,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired() {
    if (!this.session || !this.session.token) return true;

    try {
      const payload = JSON.parse(atob(this.session.token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  /**
   * Set user session
   */
  setSession(session) {
    this.session = {
      ...session,
      createdAt: Date.now()
    };
    this.saveSession();
  }

  /**
   * Load session from storage
   */
  loadSession() {
    try {
      const session = localStorage.getItem('securevibe_session');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save session to storage
   */
  saveSession() {
    try {
      localStorage.setItem('securevibe_session', JSON.stringify(this.session));
    } catch (error) {
      console.warn('Failed to save session to localStorage');
    }
  }

  /**
   * Clear user session
   */
  clearSession() {
    this.session = null;
    try {
      localStorage.removeItem('securevibe_session');
    } catch (error) {
      console.warn('Failed to clear session from localStorage');
    }
  }

  /**
   * Event system for authentication callbacks
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  trigger(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

// Global instance for easy access
let securevibeAuth = null;

/**
 * Initialize SecureVibe Auth
 */
function initSecureVibeAuth(config) {
  securevibeAuth = new SecureVibeAuth(config);
  window.securevibeAuth = securevibeAuth;

  // Check for authentication callback on page load
  if (window.location.search.includes('token=')) {
    securevibeAuth.handleCallback();
  }

  return securevibeAuth;
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SecureVibeAuth, initSecureVibeAuth };
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return { SecureVibeAuth, initSecureVibeAuth }; });
} else {
  window.initSecureVibeAuth = initSecureVibeAuth;
  window.SecureVibeAuth = SecureVibeAuth;
}
