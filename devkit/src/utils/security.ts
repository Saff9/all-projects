// Security utilities for input sanitization and validation

// Sanitize string input to prevent XSS
export function sanitizeString(input: string, maxLength = 10000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Limit length to prevent DoS
  const truncated = input.slice(0, maxLength);
  
  // Remove potential XSS vectors
  return truncated
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/<iframe/gi, '')
    .replace(/<object/gi, '')
    .replace(/<embed/gi, '')
    .replace(/<svg/gi, '')
    .replace(/<math/gi, '');
}

// Sanitize JSON input
export function sanitizeJson(input: string): string {
  const sanitized = sanitizeString(input, 50000);
  
  // Try to parse and re-stringify to ensure valid JSON
  try {
    const parsed = JSON.parse(sanitized);
    return JSON.stringify(parsed);
  } catch {
    // If not valid JSON, return sanitized string
    return sanitized;
  }
}

// Validate and sanitize base64 input
export function sanitizeBase64(input: string): string {
  // Remove data URI prefix if present
  const withoutPrefix = input.replace(/^data:image\/\w+;base64,/, '');
  
  // Validate base64 characters
  const sanitized = withoutPrefix.replace(/[^A-Za-z0-9+/]/g, '');
  
  // Check for valid base64 length
  if (sanitized.length % 4 !== 0) {
    return sanitized.padEnd(Math.ceil(sanitized.length / 4) * 4, '=');
  }
  
  return sanitized;
}

// Sanitize HTML entities
const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

function escapeHtmlChars(str: string): string {
  return str.replace(/[&<>"']/g, (match) => htmlEscapes[match]);
}

export function sanitizeHtml(input: string): string {
  // Use browser's built-in escaping when available
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
  // Fallback for server-side
  return escapeHtmlChars(input);
}

// Validate URL
export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input);
    // Only allow safe protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    // If URL parsing fails, return empty string
    return '';
  }
}

// Generate secure random string
export function generateSecureRandom(length: number, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for server-side
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => charset[byte % charset.length]).join('');
}

// Rate limiting helper (client-side)
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(maxTokens = 100, refillRate = 10) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
    this.refillRate = refillRate;
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  tryConsume(tokens = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
}

// Content Security Policy headers helper
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
};

// Escape regex special characters
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Validate UUID format
export function isValidUUID(input: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(input);
}

// Truncate string with ellipsis
export function truncateString(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength - 3) + '...';
}
