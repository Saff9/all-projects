import { VALIDATION_PATTERNS, BREAKPOINTS, DEVICE_TYPES } from './constants'

// ==================== STRING HELPERS ====================

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
export function generateRandomString(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a unique username from email
 * @param {string} email - Email address
 * @returns {string} Generated username
 */
export function generateUsername(email) {
  const base = email.split('@')[0].toLowerCase()
  const randomSuffix = Math.random().toString(36).substring(2, 7)
  return `${base}_${randomSuffix}`
}

/**
 * Slugify a string for URL use
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export function truncate(text, length = 100, suffix = '...') {
  if (!text || text.length <= length) return text
  return text.substring(0, length - suffix.length) + suffix
}

/**
 * Capitalize first letter of a string
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalize(text) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convert string to title case
 * @param {string} text - Text to convert
 * @returns {string} Title case text
 */
export function toTitleCase(text) {
  if (!text) return ''
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

// ==================== VALIDATION HELPERS ====================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export function isValidEmail(email) {
  return VALIDATION_PATTERNS.EMAIL.test(email)
}

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {boolean} Is valid
 */
export function isValidUsername(username) {
  return VALIDATION_PATTERNS.USERNAME.test(username)
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
export function isValidUrl(url) {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

/**
 * Validate hex color
 * @param {string} color - Color to validate
 * @returns {boolean} Is valid
 */
export function isValidHexColor(color) {
  return VALIDATION_PATTERNS.HEX_COLOR.test(color)
}

// ==================== URL HELPERS ====================

/**
 * Ensure URL has protocol
 * @param {string} url - URL to check
 * @param {string} protocol - Protocol to add (default: 'https')
 * @returns {string} URL with protocol
 */
export function ensureUrlProtocol(url, protocol = 'https') {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  if (url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url
  }
  return `${protocol}://${url}`
}

/**
 * Get profile URL
 * @param {string} username - Username
 * @returns {string} Full profile URL
 */
export function getProfileUrl(username) {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://onelink.app'
  return `${baseUrl}/${username}`
}

/**
 * Parse query string parameters
 * @param {string} queryString - Query string to parse
 * @returns {object} Parsed parameters
 */
export function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString)
  const result = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

/**
 * Build query string from object
 * @param {object} params - Parameters object
 * @returns {string} Query string
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value)
    }
  })
  return searchParams.toString()
}

// ==================== DATE HELPERS ====================

/**
 * Format date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date))
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now - then) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }
  
  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
}

/**
 * Get date range for analytics
 * @param {string} range - Range type
 * @returns {object} Start and end dates
 */
export function getDateRange(range) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (range) {
    case 'today':
      return { start: today, end: now }
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: yesterday, end: today }
    case 'last7days':
      const last7 = new Date(today)
      last7.setDate(last7.getDate() - 7)
      return { start: last7, end: now }
    case 'last30days':
      const last30 = new Date(today)
      last30.setDate(last30.getDate() - 30)
      return { start: last30, end: now }
    case 'last90days':
      const last90 = new Date(today)
      last90.setDate(last90.getDate() - 90)
      return { start: last90, end: now }
    default:
      return { start: today, end: now }
  }
}

/**
 * Format date for API queries (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDateForQuery(date) {
  return date.toISOString().split('T')[0]
}

// ==================== NUMBER HELPERS ====================

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format number to compact form (e.g., 1.2K, 3.5M)
 * @param {number} num - Number to format
 * @returns {string} Compact number
 */
export function formatCompactNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  return num.toString()
}

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @param {number} decimals - Decimal places
 * @returns {number} Percentage
 */
export function calculatePercentage(value, total, decimals = 1) {
  if (total === 0) return 0
  return Number(((value / total) * 100).toFixed(decimals))
}

// ==================== DEVICE HELPERS ====================

/**
 * Detect device type based on window width
 * @returns {string} Device type
 */
export function getDeviceType() {
  const width = window.innerWidth
  if (width < BREAKPOINTS.md) return DEVICE_TYPES.MOBILE
  if (width < BREAKPOINTS.lg) return DEVICE_TYPES.TABLET
  return DEVICE_TYPES.DESKTOP
}

/**
 * Check if device is mobile
 * @returns {boolean} Is mobile
 */
export function isMobile() {
  return getDeviceType() === DEVICE_TYPES.MOBILE
}

/**
 * Check if device is touch enabled
 * @returns {boolean} Is touch enabled
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// ==================== COLOR HELPERS ====================

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color
 * @returns {object} RGB values
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red value
 * @param {number} g - Green value
 * @param {number} b - Blue value
 * @returns {string} Hex color
 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * Get contrasting text color (black or white) for background
 * @param {string} hexColor - Background hex color
 * @returns {string} Contrasting color
 */
export function getContrastColor(hexColor) {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000000'
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

/**
 * Lighten or darken a color
 * @param {string} hex - Hex color
 * @param {number} percent - Percent to lighten (positive) or darken (negative)
 * @returns {string} Modified hex color
 */
export function adjustColor(hex, percent) {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  
  const adjust = (value) => {
    const adjusted = value + (value * percent / 100)
    return Math.min(255, Math.max(0, Math.round(adjusted)))
  }
  
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b))
}

// ==================== OBJECT HELPERS ====================

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Is empty
 */
export function isEmpty(obj) {
  if (!obj) return true
  return Object.keys(obj).length === 0
}

/**
 * Pick specific keys from object
 * @param {object} obj - Source object
 * @param {array} keys - Keys to pick
 * @returns {object} New object with picked keys
 */
export function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key]
    }
    return acc
  }, {})
}

/**
 * Omit specific keys from object
 * @param {object} obj - Source object
 * @param {array} keys - Keys to omit
 * @returns {object} New object without omitted keys
 */
export function omit(obj, keys) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key)) {
      acc[key] = obj[key]
    }
    return acc
  }, {})
}

// ==================== ARRAY HELPERS ====================

/**
 * Shuffle array
 * @param {array} array - Array to shuffle
 * @returns {array} Shuffled array
 */
export function shuffle(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Group array by key
 * @param {array} array - Array to group
 * @param {string|function} key - Key to group by
 * @returns {object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key]
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(item)
    return acc
  }, {})
}

/**
 * Remove duplicates from array
 * @param {array} array - Array with potential duplicates
 * @param {string} key - Key to check for duplicates (for objects)
 * @returns {array} Array without duplicates
 */
export function unique(array, key = null) {
  if (!key) {
    return [...new Set(array)]
  }
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

// ==================== FILE HELPERS ====================

/**
 * Format file size to readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension
 * @param {string} filename - Filename
 * @returns {string} File extension
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Check if file is an image
 * @param {string} type - File MIME type
 * @returns {boolean} Is image
 */
export function isImageFile(type) {
  return type.startsWith('image/')
}

// ==================== BROWSER HELPERS ====================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

/**
 * Scroll to element
 * @param {string|HTMLElement} element - Element or selector
 * @param {object} options - Scroll options
 */
export function scrollToElement(element, options = {}) {
  const el = typeof element === 'string' ? document.querySelector(element) : element
  if (el) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options
    })
  }
}

/**
 * Store in local storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

/**
 * Get from local storage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Stored value or default
 */
export function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Remove from local storage
 * @param {string} key - Storage key
 */
export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

// ==================== DEBOUNCE & THROTTLE ====================

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 * @param {function} func - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// ==================== VISITOR DATA ====================

/**
 * Get visitor data for analytics
 * @returns {object} Visitor data
 */
export function getVisitorData() {
  const ua = navigator.userAgent
  
  // Parse browser
  let browser = 'Unknown'
  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera'
  
  // Parse OS
  let os = 'Unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'MacOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  
  // Get device type
  const device = getDeviceType()
  
  // Get referrer
  const referrer = document.referrer || null
  
  return {
    userAgent: ua,
    browser,
    os,
    device,
    referrer,
    country: null, // Will be filled by server
    city: null // Will be filled by server
  }
}

// ==================== INPUT SANITIZATION ====================

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  const temp = document.createElement('div')
  temp.textContent = html
  return temp.innerHTML
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * Strip HTML tags from string
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

/**
 * Validate and sanitize URL
 * @param {string} url - URL to validate
 * @returns {string|null} Sanitized URL or null if invalid
 */
export function sanitizeUrl(url) {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Sanitize username - only allow alphanumeric and underscore
 * @param {string} username - Username to sanitize
 * @returns {string} Sanitized username
 */
export function sanitizeUsername(username) {
  return username
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_{2,}/g, '_')
    .substring(0, 30)
}

/**
 * Truncate and sanitize string for display
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated and sanitized text
 */
export function truncateAndSanitize(text, maxLength = 100) {
  if (!text) return ''
  const sanitized = stripHtml(text).trim()
  if (sanitized.length <= maxLength) return sanitized
  return sanitized.substring(0, maxLength).trim() + '...'
}

// Export all helpers
export default {
  // String
  generateRandomString,
  generateUsername,
  slugify,
  truncate,
  capitalize,
  toTitleCase,
  
  // Validation
  isValidEmail,
  isValidUsername,
  isValidUrl,
  isValidHexColor,
  
  // URL
  ensureUrlProtocol,
  getProfileUrl,
  parseQueryString,
  buildQueryString,
  
  // Date
  formatDate,
  formatRelativeTime,
  getDateRange,
  formatDateForQuery,
  
  // Number
  formatNumber,
  formatCompactNumber,
  calculatePercentage,
  
  // Device
  getDeviceType,
  isMobile,
  isTouchDevice,
  
  // Color
  hexToRgb,
  rgbToHex,
  getContrastColor,
  adjustColor,
  
  // Object
  deepClone,
  isEmpty,
  pick,
  omit,
  
  // Array
  shuffle,
  groupBy,
  unique,
  
  // File
  formatFileSize,
  getFileExtension,
  isImageFile,
  
  // Browser
  copyToClipboard,
  scrollToElement,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  
  // Function
  debounce,
  throttle,
  
  // Visitor
  getVisitorData
}