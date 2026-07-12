// SecureVibe Frontend - Enterprise Authentication Service
// Professional, secure, and user-friendly interface

// API Configuration
const API_BASE_URL = window.location.origin;

// DOM Elements
const registerModal = document.getElementById('registerModal');
const loginModal = document.getElementById('loginModal');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Global State
let currentUser = null;
let authToken = localStorage.getItem('securevibe_token');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthenticationStatus();
});

// Initialize App
function initializeApp() {
    // Add loading states and smooth scrolling
    document.body.classList.add('loaded');

    // Initialize animations
    initializeAnimations();

    // Check for URL parameters (OAuth callbacks)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('token')) {
        handleAuthCallback(urlParams);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Modal controls
    document.addEventListener('click', handleModalClick);

    // Form submissions
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Window resize handling
    window.addEventListener('resize', handleResize);
}

// Modal Functions
function showRegisterModal() {
    if (registerModal) {
        registerModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function showLoginModal() {
    if (loginModal) {
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function handleModalClick(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
}

// Authentication Functions
async function handleRegister(event) {
    event.preventDefault();

    const formData = new FormData(registerForm);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    // Get captcha from user input (in a real implementation)
    const captchaId = generateCaptchaId();
    const captchaInput = 'test'; // Mock captcha for demo

    try {
        showLoading(registerForm);

        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'demo_api_key' // In production, get from user
            },
            body: JSON.stringify({
                ...userData,
                captchaId,
                captcha: captchaInput
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Registration successful! Please check your email to verify your account.', 'success');
            closeModal('registerModal');
            registerForm.reset();
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }

    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        hideLoading(registerForm);
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        showLoading(loginForm);

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'demo_api_key'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (data.success) {
            // Store authentication data
            authToken = data.data.token;
            localStorage.setItem('securevibe_token', authToken);
            localStorage.setItem('securevibe_refresh_token', data.data.refreshToken);

            currentUser = data.data.user;

            showNotification('Login successful! Welcome back.', 'success');
            closeModal('loginModal');
            loginForm.reset();

            // Update UI for authenticated user
            updateAuthenticatedUI();

        } else {
            showNotification(data.message || 'Login failed', 'error');
        }

    } catch (error) {
        console.error('Login error:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        hideLoading(loginForm);
    }
}

async function handleLogout() {
    try {
        const response = await authenticatedFetch('/api/auth/logout', {
            method: 'POST'
        });

        // Clear local storage
        localStorage.removeItem('securevibe_token');
        localStorage.removeItem('securevibe_refresh_token');
        authToken = null;
        currentUser = null;

        showNotification('Logged out successfully', 'success');
        updateUnauthenticatedUI();

    } catch (error) {
        console.error('Logout error:', error);
        // Force logout on client side even if API call fails
        localStorage.clear();
        authToken = null;
        currentUser = null;
        updateUnauthenticatedUI();
    }
}

async function checkAuthenticationStatus() {
    const token = localStorage.getItem('securevibe_token');
    if (!token) {
        updateUnauthenticatedUI();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.data.user;
            authToken = token;
            updateAuthenticatedUI();
        } else {
            // Token invalid, clear it
            localStorage.removeItem('securevibe_token');
            updateUnauthenticatedUI();
        }

    } catch (error) {
        console.error('Auth check error:', error);
        updateUnauthenticatedUI();
    }
}

function handleAuthCallback(urlParams) {
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken');

    if (token && refreshToken) {
        localStorage.setItem('securevibe_token', token);
        localStorage.setItem('securevibe_refresh_token', refreshToken);
        authToken = token;

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        showNotification('Successfully signed in with Google!', 'success');
        checkAuthenticationStatus();
    }
}

// UI Update Functions
function updateAuthenticatedUI() {
    // Update navigation
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.innerHTML = `
            <span class="user-greeting">Welcome, ${currentUser?.name || 'User'}!</span>
            <a href="#dashboard">Dashboard</a>
            <a href="#analytics">Analytics</a>
            <button class="btn-secondary" onclick="handleLogout()">Logout</button>
        `;
    }

    // Hide modals
    closeModal('registerModal');
    closeModal('loginModal');
}

function updateUnauthenticatedUI() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.innerHTML = `
            <a href="#features">Features</a>
            <a href="#security">Security</a>
            <a href="#pricing">Pricing</a>
            <a href="#docs">Docs</a>
            <button class="btn-primary" onclick="showLoginModal()">Sign In</button>
            <button class="btn-secondary" onclick="showRegisterModal()">Sign Up</button>
        `;
    }
}

// Utility Functions
function authenticatedFetch(endpoint, options = {}) {
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
}

function generateCaptchaId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';
    }
}

function hideLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);

    // Add CSS for notifications
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                min-width: 300px;
                max-width: 500px;
                animation: slideIn 0.3s ease;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
            }

            .notification-success { background: linear-gradient(135deg, #10b981, #059669); color: white; }
            .notification-error { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
            .notification-info { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }

            .notification-close {
                background: none;
                border: none;
                color: currentColor;
                font-size: 20px;
                cursor: pointer;
                opacity: 0.7;
                margin-left: auto;
            }

            .notification-close:hover { opacity: 1; }

            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
}

function initializeAnimations() {
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .pricing-card, .security-feature').forEach(el => {
        observer.observe(el);
    });

    // Add CSS for animations
    if (!document.getElementById('animation-styles')) {
        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            .feature-card, .pricing-card, .security-feature {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease;
            }

            .animate-in {
                opacity: 1;
                transform: translateY(0);
            }

            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: white;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

function handleResize() {
    // Handle responsive adjustments
    const width = window.innerWidth;

    if (width <= 768) {
        // Mobile adjustments
        document.querySelectorAll('.hero-buttons').forEach(el => {
            el.style.flexDirection = 'column';
        });
    } else {
        // Desktop adjustments
        document.querySelectorAll('.hero-buttons').forEach(el => {
            el.style.flexDirection = 'row';
        });
    }
}

function scrollToFeatures() {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToDocs() {
    // In a real implementation, this would scroll to docs or redirect
    window.open('/docs', '_blank');
}

function contactSales() {
    showNotification('Enterprise sales contact: enterprise@securevibe.com', 'info');
}

// Global functions for HTML onclick handlers
window.showRegisterModal = showRegisterModal;
window.showLoginModal = showLoginModal;
window.closeModal = closeModal;
window.scrollToFeatures = scrollToFeatures;
window.scrollToDocs = scrollToDocs;
window.contactSales = contactSales;
window.handleLogout = handleLogout;

// Export functions for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showRegisterModal,
        showLoginModal,
        closeModal,
        authenticatedFetch,
        showNotification
    };
}
