/**
 * @fileoverview Comprehensive URL utilities for developers
 * @version 1.0.0
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/** URL components interface */
export interface UrlComponents {
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  query: string;
  hash: string;
  origin: string;
  href: string;
}

/** Query parameters object */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/** Data URL components */
export interface DataUrlComponents {
  mimeType: string;
  charset: string;
  data: string;
  isBase64: boolean;
}

/** Blob URL components */
export interface BlobUrlComponents {
  objectUrl: string;
  uuid: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safely parse a URL and return URL object
 * @param url - URL to parse
 * @returns URL object or null if invalid
 */
function safeParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * Get default port for protocol
 * @param protocol - Protocol string
 * @returns Default port or empty string
 */
function getDefaultPort(protocol: string): string {
  const ports: Record<string, string> = {
    'http:': '80',
    'https:': '443',
    'ftp:': '21',
    'ftps:': '990',
    'ssh:': '22',
    'telnet:': '23',
    'smtp:': '25',
    'pop3:': '110',
    'imap:': '143',
  };
  return ports[protocol.toLowerCase()] || '';
}

/**
 * Check if port is default for protocol
 * @param port - Port number
 * @param protocol - Protocol string
 * @returns True if port is default
 */
function isDefaultPort(port: string, protocol: string): boolean {
  return port === getDefaultPort(protocol);
}

// =============================================================================
// URL PARSING & ANALYSIS
// =============================================================================

/**
 * Parse URL and return all components.
 * Useful for extracting different parts of a URL for analysis or manipulation.
 *
 * @param url - URL to parse
 * @returns Object containing all URL components
 */
export function parse(url: string): UrlComponents | null {
  const parsed = safeParseUrl(url);
  if (!parsed) return null;

  return {
    protocol: parsed.protocol,
    host: parsed.host,
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname,
    query: parsed.search,
    hash: parsed.hash,
    origin: parsed.origin,
    href: parsed.href,
  };
}

/**
 * Get protocol from URL (http, https, ftp, etc.).
 * Useful for checking or changing URL protocol.
 *
 * @param url - URL to extract protocol from
 * @returns Protocol string (with colon), or empty string if invalid
 */
export function getProtocol(url: string): string {
  const parsed = safeParseUrl(url);
  return parsed?.protocol || '';
}

/**
 * Get domain name from URL (without subdomain).
 * Useful for extracting main domain for analytics or comparisons.
 *
 * @param url - URL to extract domain from
 * @returns Domain name (e.g., "example.com"), or empty string if invalid
 */
export function getDomain(url: string): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return '';

  const hostname = parsed.hostname;
  const parts = hostname.split('.');

  if (parts.length <= 2) {
    return hostname;
  }

  // Handle co.uk, com.au, etc.
  const lastTwo = parts.slice(-2).join('.');
  const specialTLDs = ['co.uk', 'com.au', 'org.za', 'net.au', 'ac.uk', 'gov.uk'];
  
  if (specialTLDs.includes(lastTwo)) {
    return parts.slice(-3).join('.');
  }

  return parts.slice(-2).join('.');
}

/**
 * Get hostname from URL (including subdomain).
 * Useful for full hostname extraction.
 *
 * @param url - URL to extract hostname from
 * @returns Hostname (e.g., "sub.example.com"), or empty string if invalid
 */
export function getHostname(url: string): string {
  return safeParseUrl(url)?.hostname || '';
}

/**
 * Get port number from URL.
 * Useful for extracting explicit port or checking if default port is used.
 *
 * @param url - URL to extract port from
 * @returns Port number string, or empty string if not specified
 */
export function getPort(url: string): string {
  return safeParseUrl(url)?.port || '';
}

/**
 * Get pathname from URL.
 * Useful for extracting the path portion of a URL.
 *
 * @param url - URL to extract pathname from
 * @returns Pathname string, or empty string if invalid
 */
export function getPath(url: string): string {
  return safeParseUrl(url)?.pathname || '';
}

/**
 * Get pathname from URL (alias for getPath).
 * Useful for extracting the path portion of a URL.
 *
 * @param url - URL to extract pathname from
 * @returns Pathname string, or empty string if invalid
 */
export function getPathname(url: string): string {
  return getPath(url);
}

/**
 * Get query string from URL (without leading ?).
 * Useful for extracting raw query string.
 *
 * @param url - URL to extract query from
 * @returns Query string (without ?), or empty string if no query
 */
export function getQuery(url: string): string {
  return safeParseUrl(url)?.search.slice(1) || '';
}

/**
 * Get query parameters as an object.
 * Useful for extracting and working with URL parameters.
 *
 * @param url - URL to extract query params from
 * @returns Object with query parameter key-value pairs
 */
export function getQueryParams(url: string): Record<string, string> {
  const parsed = safeParseUrl(url);
  if (!parsed) return {};

  const params: Record<string, string> = {};
  parsed.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Get hash fragment from URL (without leading #).
 * Useful for extracting URL fragment identifiers.
 *
 * @param url - URL to extract hash from
 * @returns Hash string (without #), or empty string if no hash
 */
export function getHash(url: string): string {
  return safeParseUrl(url)?.hash.slice(1) || '';
}

/**
 * Get search string from URL (with leading ?).
 * Useful for extracting full search portion.
 *
 * @param url - URL to extract search from
 * @returns Search string (with ?), or empty string if no query
 */
export function getSearch(url: string): string {
  return safeParseUrl(url)?.search || '';
}

/**
 * Get origin from URL (protocol + host + port).
 * Useful for origin-based operations and comparisons.
 *
 * @param url - URL to extract origin from
 * @returns Origin string, or empty string if invalid
 */
export function getOrigin(url: string): string {
  return safeParseUrl(url)?.origin || '';
}

/**
 * Get full href from URL.
 * Useful for getting the complete URL string.
 *
 * @param url - URL to extract href from
 * @returns Full URL string, or empty string if invalid
 */
export function getHref(url: string): string {
  return safeParseUrl(url)?.href || '';
}

// =============================================================================
// URL QUERY STRING MANIPULATION
// =============================================================================

/**
 * Add or update a single query parameter.
 * Useful for modifying URL parameters without affecting others.
 *
 * @param url - URL to modify
 * @param key - Parameter key
 * @param value - Parameter value
 * @returns Updated URL string
 */
export function addQueryParam(url: string, key: string, value: string | number | boolean): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  parsed.searchParams.set(key, String(value));
  return parsed.toString();
}

/**
 * Add or update multiple query parameters.
 * Useful for batch updating URL parameters.
 *
 * @param url - URL to modify
 * @param params - Object with parameter key-value pairs
 * @returns Updated URL string
 */
export function addQueryParams(url: string, params: QueryParams): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      parsed.searchParams.set(key, String(value));
    }
  });

  return parsed.toString();
}

/**
 * Remove a single query parameter.
 * Useful for cleaning up URL parameters.
 *
 * @param url - URL to modify
 * @param key - Parameter key to remove
 * @returns Updated URL string
 */
export function removeQueryParam(url: string, key: string): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  parsed.searchParams.delete(key);
  return parsed.toString();
}

/**
 * Remove multiple query parameters.
 * Useful for batch removing URL parameters.
 *
 * @param url - URL to modify
 * @param keys - Array of parameter keys to remove
 * @returns Updated URL string
 */
export function removeQueryParams(url: string, keys: string[]): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  keys.forEach(key => parsed.searchParams.delete(key));
  return parsed.toString();
}

/**
 * Strip (remove) a specific query parameter from URL.
 * Alias for removeQueryParam for semantic clarity.
 *
 * @param url - URL to modify
 * @param key - Parameter key to strip
 * @returns Updated URL string
 */
export function stripQueryParam(url: string, key: string): string {
  return removeQueryParam(url, key);
}

/**
 * Strip (remove) multiple query parameters from URL.
 * Alias for removeQueryParams for semantic clarity.
 *
 * @param url - URL to modify
 * @param keys - Array of parameter keys to strip
 * @returns Updated URL string
 */
export function stripQueryParams(url: string, keys: string[]): string {
  return removeQueryParams(url, keys);
}

/**
 * Get single query parameter value.
 * Useful for extracting specific URL parameters with default fallback.
 *
 * @param url - URL to extract from
 * @param key - Parameter key
 * @param defaultValue - Default value if parameter doesn't exist
 * @returns Parameter value or default
 */
export function getQueryParam(
  url: string,
  key: string,
  defaultValue: string = ''
): string {
  const params = getQueryParams(url);
  return params[key] || defaultValue;
}

/**
 * Check if query parameter exists.
 * Useful for conditional URL parameter checking.
 *
 * @param url - URL to check
 * @param key - Parameter key
 * @returns True if parameter exists
 */
export function hasQueryParam(url: string, key: string): boolean {
  const parsed = safeParseUrl(url);
  if (!parsed) return false;

  return parsed.searchParams.has(key);
}

/**
 * Build query string from object.
 * Useful for creating URL parameters from data objects.
 *
 * @param params - Object to convert to query string
 * @returns Query string (with leading ?)
 */
export function buildQuery(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Parse query string to object.
 * Useful for converting URL query strings to usable objects.
 *
 * @param queryString - Query string to parse (with or without ?)
 * @returns Object with parsed query parameters
 */
export function parseQuery(queryString: string): Record<string, string> {
  const cleanQuery = queryString.startsWith('?') ? queryString.slice(1) : queryString;

  if (!cleanQuery) return {};

  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(cleanQuery);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// =============================================================================
// URL VALIDATION & CHECKING
// =============================================================================

/**
 * Check if string is a valid URL.
 * Useful for form validation and input sanitization.
 *
 * @param url - String to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  return safeParseUrl(url) !== null;
}

/**
 * Check if URL is absolute (has protocol).
 * Useful for determining URL type for routing or linking.
 *
 * @param url - URL to check
 * @returns True if absolute URL
 */
export function isAbsoluteUrl(url: string): boolean {
  const parsed = safeParseUrl(url);
  if (!parsed) return false;

  return parsed.protocol !== '' && parsed.host !== '';
}

/**
 * Check if URL is relative (no protocol).
 * Useful for relative path handling.
 *
 * @param url - URL to check
 * @returns True if relative URL
 */
export function isRelativeUrl(url: string): boolean {
  return !isAbsoluteUrl(url);
}

/**
 * Check if two URLs have the same origin.
 * Useful for CORS and security checks.
 *
 * @param url1 - First URL
 * @param url2 - Second URL
 * @returns True if same origin
 */
export function isSameOrigin(url1: string, url2: string): boolean {
  const parsed1 = safeParseUrl(url1);
  const parsed2 = safeParseUrl(url2);

  if (!parsed1 || !parsed2) return false;

  return (
    parsed1.protocol === parsed2.protocol &&
    parsed1.hostname === parsed2.hostname &&
    parsed1.port === parsed2.port
  );
}

/**
 * Check if child domain is subdomain of parent.
 * Useful for domain ownership verification and security.
 *
 * @param parent - Parent domain
 * @param child - Child domain to check
 * @returns True if child is subdomain of parent
 */
export function isSubdomain(parent: string, child: string): boolean {
  const parentDomain = getDomain(parent);
  const childDomain = getDomain(child);

  if (!parentDomain || !childDomain) return false;

  return (
    childDomain.endsWith(`.${parentDomain}`) ||
    childDomain === parentDomain
  );
}

/**
 * Check if link is internal to base URL.
 * Useful for navigation and link classification.
 *
 * @param url - URL to check
 * @param baseUrl - Base URL to compare against
 * @returns True if internal link
 */
export function isInternalLink(url: string, baseUrl: string): boolean {
  const parsed = safeParseUrl(url);
  const base = safeParseUrl(baseUrl);

  if (!parsed || !base) return false;

  // Relative URLs are internal
  if (isRelativeUrl(url)) return true;

  // Same origin is internal
  return isSameOrigin(url, baseUrl);
}

/**
 * Check if link is external to base URL.
 * Useful for navigation and link classification.
 *
 * @param url - URL to check
 * @param baseUrl - Base URL to compare against
 * @returns True if external link
 */
export function isExternalLink(url: string, baseUrl: string): boolean {
  return !isInternalLink(url, baseUrl);
}

/**
 * Check if URL uses HTTPS.
 * Useful for security checks and redirects.
 *
 * @param url - URL to check
 * @returns True if HTTPS
 */
export function isSecure(url: string): boolean {
  const protocol = getProtocol(url);
  return protocol === 'https:';
}

/**
 * Check if URL uses HTTP (not HTTPS).
 * Useful for detecting insecure connections.
 *
 * @param url - URL to check
 * @returns True if HTTP
 */
export function isHttp(url: string): boolean {
  const protocol = getProtocol(url);
  return protocol === 'http:';
}

/**
 * Check if URL is a data URL.
 * Useful for identifying inline data content.
 *
 * @param url - URL to check
 * @returns True if data URL
 */
export function isDataUrl(url: string): boolean {
  return url.toLowerCase().startsWith('data:');
}

/**
 * Check if URL is mailto link.
 * Useful for identifying email links.
 *
 * @param url - URL to check
 * @returns True if mailto link
 */
export function isMailto(url: string): boolean {
  return url.toLowerCase().startsWith('mailto:');
}

/**
 * Check if URL is tel link.
 * Useful for identifying phone links.
 *
 * @param url - URL to check
 * @returns True if tel link
 */
export function isTel(url: string): boolean {
  return url.toLowerCase().startsWith('tel:');
}

/**
 * Check if URL is blob URL.
 * Useful for identifying blob URLs (from URL.createObjectURL).
 *
 * @param url - URL to check
 * @returns True if blob URL
 */
export function isBlobUrl(url: string): boolean {
  return url.toLowerCase().startsWith('blob:');
}

// =============================================================================
// URL RESOLUTION & NORMALIZATION
// =============================================================================

/**
 * Resolve relative URL against base URL.
 * Useful for URL path resolution and joining.
 *
 * @param base - Base URL
 * @param relative - Relative URL to resolve
 * @returns Resolved URL string
 */
export function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

/**
 * Normalize URL (lowercase protocol, remove trailing slash, etc.).
 * Useful for URL comparison and canonicalization.
 *
 * @param url - URL to normalize
 * @returns Normalized URL string
 */
export function normalizeUrl(url: string): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  // Lowercase protocol and hostname
  const normalized = `${parsed.protocol}${parsed.hostname.toLowerCase()}`;

  // Add port only if non-default
  const port = parsed.port ? `:${parsed.port}` : '';
  const path = parsed.pathname.replace(/\/$/, '') || '/';
  const search = parsed.search;
  const hash = parsed.hash;

  return `${normalized}${port}${path}${search}${hash}`;
}

/**
 * Resolve path segments relative to base path.
 * Useful for path manipulation and resolution.
 *
 * @param basePath - Base path
 * @param relativePath - Relative path to resolve
 * @returns Resolved path
 */
export function resolvePath(basePath: string, relativePath: string): string {
  const base = safeParseUrl(basePath) || new URL('http://localhost/');
  const resolved = new URL(relativePath, base);
  return resolved.pathname;
}

/**
 * Join multiple path segments.
 * Useful for building paths without worrying about slashes.
 *
 * @param paths - Path segments to join
 * @returns Joined path
 */
export function joinPath(...paths: string[]): string {
  return paths
    .map(path => path.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
}

/**
 * Get filename from path.
 * Useful for extracting filename from URL or file path.
 *
 * @param path - Path or URL
 * @returns Filename or empty string
 */
export function basename(path: string): string {
  const parsed = safeParseUrl(path);
  const pathname = parsed?.pathname || path;
  
  const segments = pathname.split('/');
  return segments[segments.length - 1] || '';
}

/**
 * Get directory name from path.
 * Useful for extracting directory from URL or file path.
 *
 * @param path - Path or URL
 * @returns Directory path or empty string
 */
export function dirname(path: string): string {
  const parsed = safeParseUrl(path);
  const pathname = parsed?.pathname || path;

  const segments = pathname.split('/');
  segments.pop();
  return segments.join('/') || '/';
}

/**
 * Get file extension from path.
 * Useful for determining file type from URL.
 *
 * @param path - Path or URL
 * @returns File extension (with dot) or empty string
 */
export function extname(path: string): string {
  const filename = basename(path);
  const lastDot = filename.lastIndexOf('.');
  
  return lastDot > 0 ? filename.slice(lastDot) : '';
}

/**
 * Resolve absolute path from base and relative paths.
 * Similar to Node.js path.resolve.
 *
 * @param base - Base path or URL
 * @param paths - Path segments to resolve
 * @returns Resolved absolute path
 */
export function resolve(base: string, ...paths: string[]): string {
  const baseUrl = safeParseUrl(base) || new URL(`http://localhost/${base}`);
  
  let result = baseUrl.origin;
  
  paths.forEach(path => {
    if (path.startsWith('/')) {
      result = `${baseUrl.origin}${path}`;
    } else {
      result = new URL(path, `${result}/`).pathname;
    }
  });

  return result;
}

/**
 * Get relative path from one path to another.
 * Similar to Node.js path.relative.
 *
 * @param from - Source path
 * @param to - Target path
 * @returns Relative path
 */
export function relative(from: string, to: string): string {
  const fromParsed = safeParseUrl(from) || new URL(`http://localhost/${from}`);
  const toParsed = safeParseUrl(to) || new URL(`http://localhost/${to}`);

  const fromPath = fromParsed.pathname.split('/').filter(Boolean);
  const toPath = toParsed.pathname.split('/').filter(Boolean);

  let i = 0;
  while (i < fromPath.length && i < toPath.length && fromPath[i] === toPath[i]) {
    i++;
  }

  const up = fromPath.slice(i).map(() => '..').join('/');
  const down = toPath.slice(i).join('/');

  return up ? (down ? `${up}/${down}` : up || '.') : (down || '.');
}

// =============================================================================
// URL ENCODING & DECODING
// =============================================================================

/**
 * Encode URL component (deprecated, use encodeURIComponent instead).
 * Useful for legacy compatibility.
 *
 * @param str - String to encode
 * @returns Encoded string
 * @deprecated Use encodeURIComponent
 */
export function encodeUrlComponent(str: string): string {
  return encodeURIComponent(str);
}

/**
 * Decode URL component (deprecated, use decodeURIComponent instead).
 * Useful for legacy compatibility.
 *
 * @param str - String to decode
 * @returns Decoded string
 * @deprecated Use decodeURIComponent
 */
export function decodeUrlComponent(str: string): string {
  return decodeURIComponent(str);
}

/**
 * Encode URI (spaces to %20, preserves special URI chars).
 * Useful for encoding complete URIs while keeping URI structure.
 *
 * @param str - String to encode
 * @returns Encoded URI
 */
export function encodeURI(str: string): string {
  return globalThis.encodeURI(str);
}

/**
 * Decode URI (reverse of encodeURI).
 * Useful for decoding complete URIs.
 *
 * @param str - String to decode
 * @returns Decoded URI
 */
export function decodeURI(str: string): string {
  return globalThis.decodeURI(str);
}

/**
 * Encode URI component (encodes special characters).
 * Useful for encoding query string parameters.
 *
 * @param str - String to encode
 * @returns Encoded URI component
 */
export function encodeURIComponent(str: string): string {
  return globalThis.encodeURIComponent(str);
}

/**
 * Decode URI component (reverse of encodeURIComponent).
 * Useful for decoding query string parameters.
 *
 * @param str - String to decode
 * @returns Decoded URI component
 */
export function decodeURIComponent(str: string): string {
  return globalThis.decodeURIComponent(str);
}

/**
 * Encode special HTML characters.
 * Useful for XSS prevention and safe HTML rendering.
 *
 * @param str - String to encode
 * @returns HTML-encoded string
 */
export function encodeSpecialChars(str: string): string {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Decode special HTML characters.
 * Useful for decoding HTML entities.
 *
 * @param str - String to decode
 * @returns HTML-decoded string
 */
export function decodeSpecialChars(str: string): string {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x2F;/g, '/');
}

// =============================================================================
// URL FORMATTING & BUILDING
// =============================================================================

/**
 * Build URL from components.
 * Useful for constructing URLs programmatically.
 *
 * @param protocol - URL protocol (e.g., "https")
 * @param host - Hostname (e.g., "example.com")
 * @param path - Pathname (e.g., "/api/users")
 * @param query - Query string or object
 * @param hash - Hash fragment (with or without #)
 * @returns Constructed URL string
 */
export function buildUrl(
  protocol: string,
  host: string,
  path: string = '/',
  query: string | Record<string, string | number | boolean> = '',
  hash: string = ''
): string {
  // Ensure protocol has colon
  const protocolStr = protocol.endsWith(':') ? protocol : `${protocol}:`;
  
  // Ensure host doesn't have protocol
  const hostStr = host.replace(/^https?:\/\//, '');
  
  // Clean path
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Handle query
  let queryStr = '';
  if (typeof query === 'string') {
    queryStr = query.startsWith('?') ? query : (query ? `?${query}` : '');
  } else if (typeof query === 'object' && query !== null) {
    queryStr = buildQuery(query);
  }
  
  // Handle hash
  const hashStr = hash.startsWith('#') ? hash : (hash ? `#${hash}` : '');
  
  return `${protocolStr}//${hostStr}${cleanPath}${queryStr}${hashStr}`;
}

/**
 * Build HTTPS URL from components.
 * Useful for constructing secure URLs.
 *
 * @param host - Hostname
 * @param path - Pathname
 * @param query - Query string or object
 * @param hash - Hash fragment
 * @returns HTTPS URL string
 */
export function buildSecureUrl(
  host: string,
  path: string = '/',
  query: string | Record<string, string | number | boolean> = '',
  hash: string = ''
): string {
  return buildUrl('https', host, path, query, hash);
}

/**
 * Change URL protocol.
 * Useful for converting between HTTP and HTTPS.
 *
 * @param url - URL to modify
 * @param protocol - New protocol (with or without colon)
 * @returns Modified URL string
 */
export function withProtocol(url: string, protocol: string): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  const protocolStr = protocol.endsWith(':') ? protocol : `${protocol}:`;
  const port = parsed.port ? `:${parsed.port}` : '';
  const path = parsed.pathname;
  const search = parsed.search;
  const hash = parsed.hash;

  return `${protocolStr}//${parsed.hostname}${port}${path}${search}${hash}`;
}

/**
 * Change URL host.
 * Useful for domain switching or proxying.
 *
 * @param url - URL to modify
 * @param host - New hostname
 * @returns Modified URL string
 */
export function withHost(url: string, host: string): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  const protocol = parsed.protocol;
  const port = parsed.port ? `:${parsed.port}` : '';
  const cleanHost = host.replace(/^https?:\/\//, '').replace(/:$/, '');
  const path = parsed.pathname;
  const search = parsed.search;
  const hash = parsed.hash;

  return `${protocol}//${cleanHost}${port}${path}${search}${hash}`;
}

/**
 * Change URL port.
 * Useful for port redirection or testing.
 *
 * @param url - URL to modify
 * @param port - New port number
 * @returns Modified URL string
 */
export function withPort(url: string, port: string | number): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  const protocol = parsed.protocol;
  const host = parsed.hostname;
  const portStr = port ? `:${port}` : '';
  const path = parsed.pathname;
  const search = parsed.search;
  const hash = parsed.hash;

  return `${protocol}//${host}${portStr}${path}${search}${hash}`;
}

/**
 * Change URL path.
 * Useful for route changing or path manipulation.
 *
 * @param url - URL to modify
 * @param path - New pathname
 * @returns Modified URL string
 */
export function withPath(url: string, path: string): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const protocol = parsed.protocol;
  const host = parsed.host;
  const search = parsed.search;
  const hash = parsed.hash;

  return `${protocol}//${host}${cleanPath}${search}${hash}`;
}

/**
 * Set query string on URL.
 * Useful for replacing all query parameters.
 *
 * @param url - URL to modify
 * @param query - New query string or object
 * @returns Modified URL string
 */
export function withQuery(
  url: string,
  query: string | Record<string, string | number | boolean>
): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  if (typeof query === 'string') {
    parsed.search = query.startsWith('?') ? query.slice(1) : query;
  } else {
    parsed.search = '';
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        parsed.searchParams.set(key, String(value));
      }
    });
  }

  return parsed.toString();
}

/**
 * Set hash fragment on URL.
 * Useful for anchor navigation or client-side routing.
 *
 * @param url - URL to modify
 * @param hash - New hash (with or without #)
 * @returns Modified URL string
 */
export function withHash(url: string, hash: string): string {
  const parsed = safeParseUrl(url);
  if (!parsed) return url;

  parsed.hash = hash.startsWith('#') ? hash : `#${hash}`;
  return parsed.toString();
}

// =============================================================================
// URL INFORMATION & METADATA
// =============================================================================

/**
 * Get filename from URL.
 * Useful for extracting the filename portion of a URL.
 *
 * @param url - URL to extract from
 * @returns Filename or empty string
 */
export function getFileName(url: string): string {
  return basename(url);
}

/**
 * Get file extension from URL.
 * Useful for determining file type from URL.
 *
 * @param url - URL to extract from
 * @returns File extension (with dot) or empty string
 */
export function getFileExtension(url: string): string {
  return extname(url);
}

/**
 * Get file size from URL (requires fetch).
 * Note: This is async and requires network access.
 * Useful for file size checking before download.
 *
 * @param url - URL to check
 * @returns File size in bytes or null if unavailable
 */
export async function getFileSize(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    return contentLength ? parseInt(contentLength, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Get content type from URL (requires fetch).
 * Note: This is async and requires network access.
 * Useful for determining file type before download.
 *
 * @param url - URL to check
 * @returns Content type header or null if unavailable
 */
export async function getContentType(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.headers.get('Content-Type');
  } catch {
    return null;
  }
}

/**
 * Get last modified date from URL (requires fetch).
 * Note: This is async and requires network access.
 * Useful for caching and freshness checks.
 *
 * @param url - URL to check
 * @returns Last modified date or null if unavailable
 */
export async function getLastModified(url: string): Promise<Date | null> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const lastModified = response.headers.get('Last-Modified');
    return lastModified ? new Date(lastModified) : null;
  } catch {
    return null;
  }
}

/**
 * Check if URL points to an image.
 * Useful for content type detection and filtering.
 *
 * @param url - URL to check
 * @returns True if likely an image URL
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'];
  const extension = extname(url).toLowerCase().slice(1);
  
  return imageExtensions.includes(extension);
}

/**
 * Check if URL points to a video.
 * Useful for content type detection and filtering.
 *
 * @param url - URL to check
 * @returns True if likely a video URL
 */
export function isVideoUrl(url: string): boolean {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
  const extension = extname(url).toLowerCase().slice(1);
  
  return videoExtensions.includes(extension);
}

/**
 * Check if URL points to audio.
 * Useful for content type detection and filtering.
 *
 * @param url - URL to check
 * @returns True if likely an audio URL
 */
export function isAudioUrl(url: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'];
  const extension = extname(url).toLowerCase().slice(1);
  
  return audioExtensions.includes(extension);
}

/**
 * Check if URL points to a PDF.
 * Useful for document detection and handling.
 *
 * @param url - URL to check
 * @returns True if PDF URL
 */
export function isPdfUrl(url: string): boolean {
  return extname(url).toLowerCase() === '.pdf';
}

/**
 * Check if URL points to a JavaScript file.
 * Useful for script loading and detection.
 *
 * @param url - URL to check
 * @returns True if JavaScript URL
 */
export function isScriptUrl(url: string): boolean {
  return extname(url).toLowerCase() === '.js';
}

/**
 * Check if URL points to a CSS stylesheet.
 * Useful for style loading and detection.
 *
 * @param url - URL to check
 * @returns True if CSS URL
 */
export function isStyleUrl(url: string): boolean {
  return extname(url).toLowerCase() === '.css';
}

// =============================================================================
// SPECIAL URL TYPES
// =============================================================================

/**
 * Parse data URL into components.
 * Useful for working with inline data URLs.
 *
 * @param dataUrl - Data URL to parse
 * @returns Object with mimeType, charset, data, and isBase64
 */
export function parseDataUrl(dataUrl: string): DataUrlComponents | null {
  if (!isDataUrl(dataUrl)) return null;

  const matches = dataUrl.match(/^data:([^;,]*)(;charset=([^;,]*))?(;base64)?,(.*)$/i);

  if (!matches) {
    return {
      mimeType: 'text/plain',
      charset: 'US-ASCII',
      data: dataUrl.slice(dataUrl.indexOf(',') + 1),
      isBase64: false,
    };
  }

  return {
    mimeType: matches[1] || 'text/plain',
    charset: matches[3] || 'US-ASCII',
    data: matches[5] || '',
    isBase64: !!matches[4],
  };
}

/**
 * Parse blob URL into components.
 * Useful for working with blob URLs from URL.createObjectURL.
 *
 * @param blobUrl - Blob URL to parse
 * @returns Object with objectUrl and uuid
 */
export function parseBlobUrl(blobUrl: string): BlobUrlComponents | null {
  if (!isBlobUrl(blobUrl)) return null;

  const matches = blobUrl.match(/^blob:([^/]+)\/(.+)$/i);

  return {
    objectUrl: blobUrl,
    uuid: matches ? matches[2] : '',
  };
}

/**
 * Create object URL from data (Node.js compatible).
 * Creates a blob URL from binary data. In browsers, uses URL.createObjectURL.
 * In Node.js, creates a data URL instead.
 *
 * @param data - Data to create URL from
 * @param mimeType - MIME type of the data
 * @returns Object URL string
 */
export function createObjectUrl(data: string | Uint8Array, mimeType = 'text/plain'): string {
  // Check if running in browser
  if (typeof globalThis.URL !== 'undefined' && typeof globalThis.Blob !== 'undefined') {
    let blobParts: BlobPart[];
    
    if (typeof data === 'string') {
      blobParts = [data];
    } else {
      blobParts = [data.buffer as ArrayBuffer];
    }
    
    const blob = new Blob(blobParts, { type: mimeType });
    return globalThis.URL.createObjectURL(blob);
  }

  // Node.js fallback: create data URL
  const isBase64 = typeof data !== 'string';
  const encodedData = isBase64 
    ? Buffer.from(data as Uint8Array).toString('base64')
    : encodeURIComponent(data);

  const encoding = isBase64 ? 'base64' : 'charset=UTF-8';
  return `data:${mimeType};${encoding},${encodedData}`;
}

/**
 * Revoke object URL.
 * Frees up memory by revoking a blob URL created with createObjectURL.
 * In browsers, uses URL.revokeObjectURL. In Node.js, this is a no-op.
 *
 * @param url - Object URL to revoke
 */
export function revokeObjectUrl(url: string): void {
  if (isBlobUrl(url) && typeof globalThis.URL !== 'undefined') {
    try {
      globalThis.URL.revokeObjectURL(url);
    } catch {
      // Ignore errors in non-browser environments
    }
  }
}
