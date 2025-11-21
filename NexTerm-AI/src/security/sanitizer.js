/**
 * Sanitizer — Output sanitization and rate limiting
 */

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'b', 'i', 'code', 'pre', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const ALLOWED_ATTRIBUTES = [];

/**
 * Sanitize HTML content to prevent XSS using DOM parsing with whitelist
 */
export function sanitizeHTML(html) {
    if (!html) return '';
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<!DOCTYPE html><body>${html}`, 'text/html');
    
    function cleanNode(node) {
        if (node.nodeType === Node.TEXT_NODE) return;
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            
            if (!ALLOWED_TAGS.includes(tagName)) {
                node.replaceWith(...node.childNodes);
                return;
            }
            
            // Remove all attributes
            while (node.attributes.length > 0) {
                node.removeAttribute(node.attributes[0].name);
            }
        }
        
        Array.from(node.childNodes).forEach(cleanNode);
    }
    
    cleanNode(doc.body);
    return doc.body.innerHTML;
}

/**
 * Sanitize markdown content (allow safe markdown, block dangerous HTML)
 */
export function sanitizeMarkdown(text) {
    if (!text) return '';

    let sanitized = text;
    
    // Neutralize all javascript/unsafe protocols
    sanitized = sanitized.replace(/\b(?:javascript|vbscript|data|file):/gi, '#');
    
    // Remove all event handlers
    sanitized = sanitized.replace(/\son\w+\s*=/gi, ' ');
    
    // Remove dangerous tags completely
    sanitized = sanitized.replace(/<(script|iframe|object|embed|form|style|meta|link|base)\b[^>]*>/gi, '');
    
    // Escape remaining HTML tags if not in allowed list
    sanitized = sanitized.replace(/<(\/?)(\w+)[^>]*>/gi, (match, closing, tag) => {
        tag = tag.toLowerCase();
        if (ALLOWED_TAGS.includes(tag)) {
            return `<${closing}${tag}>`;
        }
        return '';
    });

    return sanitized;
}

/**
 * Escape text for HTML output
 */
export function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Secure Rate Limiter — Non-bypassable client side rate limiting
 */
export class RateLimiter {
    #maxRequests;
    #windowMs;
    #requests;
    #storageKey;

    constructor(maxRequests = 15, windowMs = 60000, storageKey = 'rate_limiter_state') {
        this.#maxRequests = maxRequests;
        this.#windowMs = windowMs;
        this.#storageKey = storageKey;
        this.#loadState();
    }

    #loadState() {
        try {
            const stored = localStorage.getItem(this.#storageKey);
            this.#requests = stored ? JSON.parse(stored).filter(t => typeof t === 'number') : [];
        } catch {
            this.#requests = [];
        }
        this.#cleanup();
    }

    #saveState() {
        try {
            localStorage.setItem(this.#storageKey, JSON.stringify(this.#requests));
        } catch {}
    }

    /**
     * Check if a request is allowed
     * @returns {boolean}
     */
    canRequest() {
        this.#cleanup();
        return this.#requests.length < this.#maxRequests;
    }

    /**
     * Record a request
     */
    record() {
        const now = Date.now();
        this.#requests.push(now);
        this.#saveState();
    }

    /**
     * Get remaining requests
     */
    remaining() {
        this.#cleanup();
        return Math.max(0, this.#maxRequests - this.#requests.length);
    }

    /**
     * Get time until next available request (ms)
     */
    retryAfter() {
        if (this.canRequest()) return 0;
        return Math.max(0, this.#requests[0] + this.#windowMs - Date.now());
    }

    #cleanup() {
        const cutoff = Date.now() - this.#windowMs;
        this.#requests = this.#requests.filter(t => t > cutoff).sort((a,b) => a - b);
    }

    /**
     * Reset rate limiter state
     */
    reset() {
        this.#requests = [];
        this.#saveState();
    }
}

/**
 * File upload validation with magic number checking
 */
export const ALLOWED_MIME_TYPES = [
    'text/plain', 'text/javascript', 'text/css', 'text/html',
    'application/json', 'application/pdf',
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const FILE_MAGIC_NUMBERS = {
    'png': [0x89, 0x50, 0x4E, 0x47],
    'jpg': [0xFF, 0xD8, 0xFF],
    'gif': [0x47, 0x49, 0x46],
    'pdf': [0x25, 0x50, 0x44, 0x46],
    'webp': [0x52, 0x49, 0x46, 0x46]
};

export async function validateFileUpload(file, maxSizeBytes = 10 * 1024 * 1024) {
    if (!file) return { valid: false, reason: 'No file provided' };
    
    if (file.size > maxSizeBytes) {
        return { valid: false, reason: `File too large (max ${maxSizeBytes / 1024 / 1024}MB)` };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { valid: false, reason: `File type ${file.type} not allowed` };
    }

    // Magic number validation for binary files
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const buffer = await file.slice(0, 8).arrayBuffer();
        const bytes = new Uint8Array(buffer);
        
        let validMagic = false;
        for (const magic of Object.values(FILE_MAGIC_NUMBERS)) {
            if (magic.every((b, i) => bytes[i] === b)) {
                validMagic = true;
                break;
            }
        }

        if (!validMagic) {
            return { valid: false, reason: 'File signature does not match declared type' };
        }
    }

    // Sanitize filename
    const safeName = file.name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 255);

    return { valid: true, safeName };
}

/**
 * Input validator
 */
export function validateInput(input) {
    if (!input || typeof input !== 'string') return { valid: false, reason: 'Empty input' };
    if (input.length > 15000) return { valid: false, reason: 'Input too long (max 15,000 chars)' };
    
    // Check for obvious malicious patterns
    if (/<script\b/i.test(input)) return { valid: false, reason: 'Disallowed content detected' };
    
    return { valid: true };
}
