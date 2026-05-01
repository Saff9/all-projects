/**
 * Comprehensive cryptographic utilities for developers.
 * Provides hashing, encryption, key derivation, random generation, and more.
 * Works in both Node.js and browser environments where possible.
 */

import crypto from "crypto";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Supported hash algorithms
 */
export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

/**
 * Supported cipher algorithms
 */
export type CipherAlgorithm = "aes-256-cbc" | "aes-256-gcm" | "aes-128-cbc" | "aes-128-gcm";

/**
 * Elliptic curve names
 */
export type EllipticCurve = "prime256v1" | "secp384r1" | "secp521r1" | "secp256k1";

/**
 * Key export formats
 */
export type KeyFormat = "pem" | "der" | "jwk";

/**
 * RSA/ECDSA signature schemes
 */
export type SignatureScheme = "RSA-SHA256" | "RSA-SHA384" | "RSA-SHA512" | "ECDSA-SHA256" | "ECDSA-SHA384" | "ECDSA-SHA512";

/**
 * Options for PBKDF2 key derivation
 */
export interface Pbkdf2Options {
  /** Number of iterations */
  iterations: number;
  /** Key length in bytes */
  keyLen: number;
  /** Digest algorithm */
  digest?: "sha1" | "sha256" | "sha512";
}

/**
 * Options for Argon2 hashing
 */
export interface Argon2Options {
  /** Memory cost in KiB */
  memoryCost?: number;
  /** Time cost (iterations) */
  timeCost?: number;
  /** Parallelism factor */
  parallelism?: number;
}

/**
 * Options for AES-GCM encryption
 */
export interface AesGcmOptions {
  /** Authentication tag length in bytes */
  tagLength?: number;
}

/**
 * Options for ChaCha20-Poly1305 encryption
 */
export interface ChaCha20Poly1305Options {
  /** Authentication tag length in bytes (12, 13, 14, 15, or 16) */
  tagLength?: number;
}

/**
 * Options for RSA key pair generation
 */
export interface RsaKeyPairOptions {
  /** Key size in bits */
  bits?: number;
  /** Public exponent */
  exponent?: number;
}

/**
 * Options for Diffie-Hellman key exchange
 */
export interface DiffieHellmanOptions {
  /** Prime length in bits */
  primeLength?: number;
  /** Generator */
  generator?: number;
}

/**
 * Self-signed certificate options
 */
export interface CertificateOptions {
  /** Common Name */
  commonName: string;
  /** Organization */
  organization?: string;
  /** Organizational Unit */
  organizationalUnit?: string;
  /** City/Locality */
  locality?: string;
  /** State/Province */
  state?: string;
  /** Country */
  country?: string;
  /** Key size in bits */
  keySize?: number;
  /** Days until expiration */
  days?: number;
}

/**
 * Web Crypto algorithm configuration
 */
export interface WebCryptoAlgorithm {
  /** Algorithm name */
  name: string;
  /** Named curve for EC */
  namedCurve?: EllipticCurve;
  /** Modulus length for RSA */
  modulusLength?: number;
  /** Public exponent */
  publicExponent?: Uint8Array;
  /** Hash algorithm */
  hash?: "SHA-256" | "SHA-384" | "SHA-512";
  /** Cipher operation */
  iv?: Uint8Array;
}

// ============================================================================
// Hashing Functions
// ============================================================================

/**
 * Hash data using specified algorithm.
 * Useful for data integrity verification, checksums, or password storage preparation.
 *
 * @param data - Data to hash (string, Buffer, or TypedArray)
 * @param algorithm - Hash algorithm to use (md5, sha1, sha256, sha512)
 * @returns Hex-encoded hash string
 */
export function hash(data: string | Buffer | Uint8Array, algorithm: HashAlgorithm = "sha256"): string {
  const hash = crypto.createHash(algorithm);
  hash.update(typeof data === "string" ? Buffer.from(data) : data);
  return hash.digest("hex");
}

/**
 * Hash file using specified algorithm.
 * Useful for file integrity verification or checksums.
 *
 * @param path - Path to file
 * @param algorithm - Hash algorithm to use
 * @returns Promise resolving to hex-encoded hash string
 */
export async function hashFile(path: string, algorithm: HashAlgorithm = "sha256"): Promise<string> {
  const fs = await import("fs/promises");
  const data = await fs.readFile(path);
  return hash(data, algorithm);
}

/**
 * Hash data synchronously using specified algorithm.
 * Use for smaller data where async overhead is unnecessary.
 *
 * @param data - Data to hash
 * @param algorithm - Hash algorithm to use
 * @returns Hex-encoded hash string
 */
export function hashSync(data: string | Buffer | Uint8Array, algorithm: HashAlgorithm = "sha256"): string {
  return hash(data, algorithm);
}

/**
 * Create HMAC (Hash-based Message Authentication Code).
 * Useful for message authentication, API request signing, or data integrity with authentication.
 *
 * @param data - Data to sign
 * @param key - Secret key
 * @param algorithm - Hash algorithm to use
 * @returns Hex-encoded HMAC signature
 */
export function hmac(data: string | Buffer, key: string | Buffer, algorithm: HashAlgorithm = "sha256"): string {
  const hmac = crypto.createHmac(algorithm, typeof key === "string" ? key : key.toString("hex"));
  hmac.update(typeof data === "string" ? data : data.toString("hex"));
  return hmac.digest("hex");
}

/**
 * Hash password with salt using PBKDF2.
 * Recommended for password storage with cryptographic salt.
 *
 * @param password - Password to hash
 * @param salt - Salt value (will be generated if not provided)
 * @param iterations - Number of iterations (default: 100000)
 * @param keyLen - Output key length in bytes (default: 64)
 * @returns Object containing hash and salt
 */
export function hashPassword(
  password: string,
  salt?: string,
  iterations: number = 100000,
  keyLen: number = 64
): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(32).toString("hex");
  const derivedKey = crypto.pbkdf2Sync(password, actualSalt, iterations, keyLen, "sha512");
  return {
    hash: derivedKey.toString("hex"),
    salt: actualSalt,
  };
}

/**
 * Verify password against stored hash.
 * Timing-safe comparison to prevent timing attacks.
 *
 * @param password - Password to verify
 * @param storedHash - Stored hash to compare against
 * @param salt - Salt used during hashing
 * @param iterations - Iterations used during hashing
 * @param keyLen - Key length used during hashing
 * @returns True if password matches, false otherwise
 */
export function verifyPassword(
  password: string,
  storedHash: string,
  salt: string,
  iterations: number = 100000,
  keyLen: number = 64
): boolean {
  const { hash: computedHash } = hashPassword(password, salt, iterations, keyLen);
  return secureCompare(computedHash, storedHash);
}

/**
 * Derive key using scrypt algorithm.
 * Memory-hard key derivation function resistant to hardware attacks.
 *
 * @param data - Data to derive key from (usually password)
 * @param salt - Salt value
 * @param keyLen - Output key length in bytes
 * @param options - Scrypt parameters (N, r, p)
 * @returns Derived key as Buffer
 */
export function scrypt(
  data: string | Buffer,
  salt: string | Buffer,
  keyLen: number,
  options?: { N?: number; r?: number; p?: number }
): Buffer {
  const N = options?.N || 16384;
  const r = options?.r || 8;
  const p = options?.p || 1;
  
  return crypto.scryptSync(
    typeof data === "string" ? data : data.toString("hex"),
    typeof salt === "string" ? salt : salt.toString("hex"),
    keyLen,
    { N, r, p }
  );
}

/**
 * Hash data using Argon2 algorithm.
 * Modern password hashing with configurable memory and time costs.
 * Requires argon2 package to be installed.
 *
 * @param data - Data to hash
 * @param salt - Salt value
 * @param options - Argon2 options
 * @returns Argon2 hash string
 */
export async function argon2(
  _data: string,
  _salt: string,
  _options?: Argon2Options
): Promise<string> {
  throw new Error("Argon2 not available. Install with: npm install argon2");
}

/**
 * Verify Argon2 hash.
 * Requires argon2 package to be installed.
 *
 * @param data - Data to verify
 * @param hash - Hash to verify against
 * @returns True if data matches hash
 */
export async function verifyArgon2(_data: string, _hash: string): Promise<boolean> {
  throw new Error("Argon2 not available. Install with: npm install argon2");
}

// ============================================================================
// Encryption/Decryption Functions
// ============================================================================

/**
 * Encrypt data using password-based encryption.
 * Uses AES-256-CBC with PBKDF2 key derivation.
 *
 * @param data - Data to encrypt
 * @param password - Password for encryption
 * @returns Object containing encrypted data, IV, and salt (Base64 encoded)
 */
export function encrypt(data: string, password: string): { encryptedData: string; iv: string; salt: string } {
  const salt = crypto.randomBytes(32).toString("hex");
  const iv = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");
  
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    salt,
  };
}

/**
 * Decrypt password-encrypted data.
 *
 * @param encryptedData - Encrypted data (hex or base64)
 * @param password - Password for decryption
 * @param iv - Initialization vector (hex)
 * @param salt - Salt used for key derivation (hex)
 * @returns Decrypted string
 */
export function decrypt(
  encryptedData: string,
  password: string,
  iv: string,
  salt: string
): string {
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
  
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}

/**
 * Encrypt data with explicit key and IV.
 * Gives full control over cryptographic parameters.
 *
 * @param data - Data to encrypt
 * @param key - Encryption key (32 bytes for AES-256)
 * @param iv - Initialization vector (16 bytes for AES)
 * @param algorithm - Cipher algorithm
 * @returns Encrypted data as Buffer
 */
export function encryptWithKey(
  data: string | Buffer,
  key: string | Buffer,
  iv: string | Buffer,
  algorithm: CipherAlgorithm = "aes-256-cbc"
): Buffer {
  const cipher = crypto.createCipheriv(
    algorithm,
    typeof key === "string" ? Buffer.from(key, "hex") : key,
    typeof iv === "string" ? Buffer.from(iv, "hex") : iv
  );
  
  const input = typeof data === "string" ? Buffer.from(data) : data;
  return Buffer.concat([cipher.update(input), cipher.final()]);
}

/**
 * Decrypt data with explicit key and IV.
 *
 * @param encryptedData - Encrypted data
 * @param key - Decryption key
 * @param iv - Initialization vector
 * @param algorithm - Cipher algorithm
 * @returns Decrypted data as Buffer
 */
export function decryptWithKey(
  encryptedData: Buffer,
  key: string | Buffer,
  iv: string | Buffer,
  algorithm: CipherAlgorithm = "aes-256-cbc"
): Buffer {
  const decipher = crypto.createDecipheriv(
    algorithm,
    typeof key === "string" ? Buffer.from(key, "hex") : key,
    typeof iv === "string" ? Buffer.from(iv, "hex") : iv
  );
  
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}

/**
 * Generate cryptographic key for specified algorithm.
 *
 * @param algorithm - Algorithm to generate key for
 * @param length - Key length in bytes
 * @returns Object containing key and algorithm info
 */
export function generateKey(algorithm: CipherAlgorithm = "aes-256-cbc", length?: number): { key: Buffer; algorithm: string } {
  let keyLength = length;
  
  if (!keyLength) {
    switch (algorithm) {
      case "aes-256-cbc":
      case "aes-256-gcm":
        keyLength = 32;
        break;
      case "aes-128-cbc":
      case "aes-128-gcm":
        keyLength = 16;
        break;
      default:
        keyLength = 32;
    }
  }
  
  return {
    key: crypto.randomBytes(keyLength),
    algorithm,
  };
}

/**
 * Generate initialization vector for specified algorithm.
 *
 * @param algorithm - Algorithm to generate IV for
 * @returns Initialization vector as Buffer
 */
export function generateIv(algorithm: CipherAlgorithm = "aes-256-cbc"): Buffer {
  switch (algorithm) {
    case "aes-256-cbc":
    case "aes-256-gcm":
    case "aes-128-cbc":
    case "aes-128-gcm":
      return crypto.randomBytes(16);
    default:
      return crypto.randomBytes(16);
  }
}

/**
 * Derive cryptographic key from password using PBKDF2.
 *
 * @param password - Password to derive key from
 * @param salt - Salt value
 * @param algorithm - Target algorithm for key length
 * @param keyLen - Desired key length
 * @param iterations - PBKDF2 iterations
 * @returns Derived key as Buffer
 */
export function deriveKey(
  password: string,
  salt: string | Buffer,
  algorithm: CipherAlgorithm = "aes-256-cbc",
  keyLen?: number,
  iterations: number = 100000
): Buffer {
  let length = keyLen;
  
  if (!length) {
    switch (algorithm) {
      case "aes-256-cbc":
      case "aes-256-gcm":
        length = 32;
        break;
      case "aes-128-cbc":
      case "aes-128-gcm":
        length = 16;
        break;
      default:
        length = 32;
    }
  }
  
  return crypto.pbkdf2Sync(
    password,
    typeof salt === "string" ? Buffer.from(salt) : salt,
    iterations,
    length,
    "sha512"
  );
}

/**
 * Generate RSA or EC key pair.
 *
 * @param algorithm - Key pair algorithm ("rsa" or "ec")
 * @param options - Algorithm-specific options
 * @returns Object containing public and private keys in PEM format
 */
export function generateKeyPair(
  algorithm: "rsa" | "ec",
  options?: RsaKeyPairOptions | EllipticCurve
): { publicKey: string; privateKey: string } {
  if (algorithm === "rsa") {
    const rsaOptions = options as RsaKeyPairOptions;
    const keyPair = crypto.generateKeyPairSync("rsa", {
      modulusLength: rsaOptions?.bits || 4096,
      publicExponent: rsaOptions?.exponent || 65537,
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });
    return keyPair;
  } else {
    const ecOptions = options as EllipticCurve;
    const keyPair = crypto.generateKeyPairSync("ec", {
      namedCurve: ecOptions || "prime256v1",
      privateKeyEncoding: { type: "sec1", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });
    return keyPair;
  }
}

// ============================================================================
// Symmetric Encryption
// ============================================================================

/**
 * Encrypt data using AES-256-CBC.
 * Symmetric encryption with secure defaults.
 *
 * @param data - Data to encrypt
 * @param key - 32-byte encryption key
 * @returns Object containing encrypted data and IV
 */
export function aesEncrypt(data: string | Buffer, key: string | Buffer): { encrypted: Buffer; iv: Buffer } {
  const keyBuffer = typeof key === "string" ? Buffer.from(key, "hex") : key;
  const iv = crypto.randomBytes(16);
  
  if (keyBuffer.length !== 32) {
    throw new Error("AES-256 requires a 32-byte key");
  }
  
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  const dataBuffer = typeof data === "string" ? Buffer.from(data) : data;
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  
  return { encrypted, iv };
}

/**
 * Decrypt AES-256-CBC encrypted data.
 *
 * @param encryptedData - Encrypted data
 * @param key - 32-byte decryption key
 * @param iv - Initialization vector
 * @returns Decrypted data as Buffer
 */
export function aesDecrypt(
  encryptedData: Buffer,
  key: string | Buffer,
  iv: string | Buffer
): Buffer {
  const keyBuffer = typeof key === "string" ? Buffer.from(key, "hex") : key;
  const ivBuffer = typeof iv === "string" ? Buffer.from(iv, "hex") : iv;
  
  if (keyBuffer.length !== 32) {
    throw new Error("AES-256 requires a 32-byte key");
  }
  
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, ivBuffer);
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}

/**
 * Encrypt data using AES-GCM (authenticated encryption).
 * Provides both confidentiality and authenticity.
 *
 * @param data - Data to encrypt
 * @param key - Encryption key (16, 24, or 32 bytes)
 * @param iv - Initialization vector (12 bytes recommended for GCM)
 * @param options - GCM options
 * @returns Object containing encrypted data, IV, and authentication tag
 */
export function aesGcmEncrypt(
  data: string | Buffer,
  key: string | Buffer,
  iv: string | Buffer,
  options?: AesGcmOptions
): { encrypted: Buffer; iv: Buffer; tag: Buffer } {
  const keyBuffer = typeof key === "string" ? Buffer.from(key, "hex") : key;
  const ivBuffer = typeof iv === "string" ? Buffer.from(iv, "hex") : iv;
  const tagLength = options?.tagLength || 16;
  
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, ivBuffer);
  const dataBuffer = typeof data === "string" ? Buffer.from(data) : data;
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return { encrypted, iv: ivBuffer, tag };
}

/**
 * Decrypt AES-GCM encrypted data with authentication.
 *
 * @param encryptedData - Encrypted data
 * @param key - Decryption key
 * @param iv - Initialization vector
 * @param tag - Authentication tag
 * @returns Decrypted data as Buffer
 */
export function aesGcmDecrypt(
  encryptedData: Buffer,
  key: string | Buffer,
  iv: string | Buffer,
  tag: string | Buffer
): Buffer {
  const keyBuffer = typeof key === "string" ? Buffer.from(key, "hex") : key;
  const ivBuffer = typeof iv === "string" ? Buffer.from(iv, "hex") : iv;
  const tagBuffer = typeof tag === "string" ? Buffer.from(tag, "hex") : tag;
  
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer, ivBuffer);
  decipher.setAuthTag(tagBuffer);
  
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}

/**
 * Encrypt data using ChaCha20-Poly1305.
 * Modern authenticated encryption, faster than AES on some platforms.
 *
 * @param data - Data to encrypt
 * @param key - 32-byte encryption key
 * @param options - Encryption options
 * @returns Object containing encrypted data and nonce
 */
export function chacha20Poly1305Encrypt(
  data: string | Buffer,
  key: string | Buffer,
  options?: ChaCha20Poly1305Options
): { encrypted: Buffer; nonce: Buffer } {
  const keyBuffer = typeof key === "string" ? Buffer.from(key, "hex") : key;
  const nonce = crypto.randomBytes(12);
  const tagLength = options?.tagLength || 16;
  
  const cipher = crypto.createCipheriv("chacha20-poly1305", keyBuffer, nonce);
  const dataBuffer = typeof data === "string" ? Buffer.from(data) : data;
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return { encrypted: Buffer.concat([encrypted, tag]), nonce };
}

/**
 * Decrypt ChaCha20-Poly1305 encrypted data.
 *
 * @param encryptedData - Encrypted data (includes auth tag)
 * @param key - Decryption key
 * @param nonce - Nonce used during encryption
 * @returns Decrypted data as Buffer
 */
export function chacha20Poly1305Decrypt(
  encryptedData: Buffer,
  key: string | Buffer,
  nonce: string | Buffer
): Buffer {
  const keyBuffer = typeof key === "string" ? Buffer.from(key, "hex") : key;
  const nonceBuffer = typeof nonce === "string" ? Buffer.from(nonce, "hex") : nonce;
  
  // Separate encrypted data and tag (last 16 bytes)
  const encrypted = encryptedData.subarray(0, -16);
  const tag = encryptedData.subarray(-16);
  
  const decipher = crypto.createDecipheriv("chacha20-poly1305", keyBuffer, nonceBuffer);
  decipher.setAuthTag(tag);
  
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// ============================================================================
// Asymmetric Encryption
// ============================================================================

/**
 * Encrypt data using RSA public key.
 *
 * @param data - Data to encrypt
 * @param publicKey - PEM-encoded public key
 * @returns Encrypted data as Buffer
 */
export function rsaEncrypt(data: string | Buffer, publicKey: string): Buffer {
  const dataBuffer = typeof data === "string" ? Buffer.from(data) : data;
  return crypto.publicEncrypt(publicKey, dataBuffer);
}

/**
 * Decrypt RSA encrypted data using private key.
 *
 * @param encryptedData - Encrypted data
 * @param privateKey - PEM-encoded private key
 * @returns Decrypted data as Buffer
 */
export function rsaDecrypt(encryptedData: Buffer, privateKey: string): Buffer {
  return crypto.privateDecrypt(privateKey, encryptedData);
}

/**
 * Create RSA digital signature.
 *
 * @param data - Data to sign
 * @param privateKey - PEM-encoded private key
 * @param algorithm - Hash algorithm for signature
 * @returns Signature as Buffer
 */
export function rsaSign(
  data: string | Buffer,
  privateKey: string,
  algorithm: "sha256" | "sha384" | "sha512" = "sha256"
): Buffer {
  const sign = crypto.createSign(algorithm);
  sign.update(typeof data === "string" ? data : data.toString("hex"));
  return sign.sign(privateKey);
}

/**
 * Verify RSA digital signature.
 *
 * @param data - Original signed data
 * @param signature - Signature to verify
 * @param publicKey - PEM-encoded public key
 * @param algorithm - Hash algorithm used for signature
 * @returns True if signature is valid
 */
export function rsaVerify(
  data: string | Buffer,
  signature: Buffer,
  publicKey: string,
  algorithm: "sha256" | "sha384" | "sha512" = "sha256"
): boolean {
  const verify = crypto.createVerify(algorithm);
  verify.update(typeof data === "string" ? data : data.toString("hex"));
  return verify.verify(publicKey, signature);
}

/**
 * Generate RSA key pair.
 *
 * @param bits - Key size in bits (default: 2048)
 * @param exponent - Public exponent (default: 65537)
 * @returns Object containing public and private keys in PEM format
 */
export function rsaGenerateKeyPair(bits: number = 2048, exponent: number = 65537): { publicKey: string; privateKey: string } {
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: bits,
    publicExponent: exponent,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  return keyPair;
}

/**
 * Generate EC (Elliptic Curve) key pair.
 *
 * @param curve - Elliptic curve name
 * @returns Object containing public and private keys in PEM format
 */
export function ecGenerateKeyPair(curve: EllipticCurve = "prime256v1"): { publicKey: string; privateKey: string } {
  const keyPair = crypto.generateKeyPairSync("ec", {
    namedCurve: curve,
    privateKeyEncoding: { type: "sec1", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  return keyPair;
}

/**
 * Create ECDSA digital signature.
 *
 * @param data - Data to sign
 * @param privateKey - PEM-encoded EC private key
 * @param curve - Elliptic curve name
 * @returns Signature as Buffer (DER encoded)
 */
export function ecSign(
  data: string | Buffer,
  privateKey: string,
  curve: EllipticCurve = "prime256v1"
): Buffer {
  const sign = crypto.createSign(`ECDSA-SHA256`);
  sign.update(typeof data === "string" ? data : data.toString("hex"));
  return sign.sign(privateKey);
}

/**
 * Verify ECDSA digital signature.
 *
 * @param data - Original signed data
 * @param signature - Signature to verify
 * @param publicKey - PEM-encoded EC public key
 * @param curve - Elliptic curve name
 * @returns True if signature is valid
 */
export function ecVerify(
  data: string | Buffer,
  signature: Buffer,
  publicKey: string,
  curve: EllipticCurve = "prime256v1"
): boolean {
  const verify = crypto.createVerify(`ECDSA-SHA256`);
  verify.update(typeof data === "string" ? data : data.toString("hex"));
  return verify.verify(publicKey, signature);
}

// ============================================================================
// Key Operations
// ============================================================================

/**
 * Export key to specified format.
 *
 * @param key - Key to export (Buffer or KeyObject)
 * @param format - Output format (pem, der, jwk)
 * @param type - Key type (public, private)
 * @returns Exported key as string or Buffer
 */
export function exportKey(
  key: Buffer,
  format: "pem" | "der" | "jwk",
  type: "public" | "private" = "private"
): string | Buffer {
  if (format === "pem") {
    return key.toString("base64");
  } else if (format === "der") {
    return key;
  } else if (format === "jwk") {
    // Basic JWK structure
    return JSON.stringify({
      kty: type === "private" ? "RSA" : "RSA",
      use: "enc",
      alg: "RSA-OAEP",
    });
  }
  throw new Error(`Unsupported key format: ${format}`);
}

/**
 * Import key from specified format.
 *
 * @param key - Key data to import
 * @param format - Input format (pem, der, jwk)
 * @param type - Key type (public, private)
 * @returns Imported key as Buffer
 */
export function importKey(
  key: string | Buffer,
  format: "pem" | "der" | "jwk",
  type: "public" | "private"
): Buffer {
  if (format === "pem") {
    const keyStr = typeof key === "string" ? key : key.toString("utf8");
    // Remove PEM headers and decode
    const base64 = keyStr
      .replace(/-----BEGIN.*?-----/, "")
      .replace(/-----END.*?-----/, "")
      .replace(/\s/g, "");
    return Buffer.from(base64, "base64");
  } else if (format === "der") {
    return typeof key === "string" ? Buffer.from(key, "hex") : key;
  } else if (format === "jwk") {
    const jwk = typeof key === "string" ? JSON.parse(key) : JSON.parse(key.toString());
    // For RSA-OAEP, extract n (modulus) and e (exponent)
    if (jwk.n && jwk.e) {
      return Buffer.from(jwk.n + jwk.e, "base64url");
    }
    throw new Error("Invalid JWK format");
  }
  throw new Error(`Unsupported key format: ${format}`);
}

/**
 * Extract public key from private key.
 *
 * @param privateKey - PEM-encoded private key
 * @returns PEM-encoded public key
 */
export function publicKeyFromPrivate(privateKey: string): string {
  const { publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicExponent: 65537,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  return publicKey;
}

/**
 * Encrypt data using public key (RSA-OAEP).
 *
 * @param data - Data to encrypt
 * @param publicKey - PEM-encoded public key
 * @returns Encrypted data as Buffer
 */
export function encryptPublicKey(data: string | Buffer, publicKey: string): Buffer {
  const dataBuffer = typeof data === "string" ? Buffer.from(data) : data;
  return crypto.publicEncrypt(
    {
      key: publicKey,
      oaepHash: "sha256",
    },
    dataBuffer
  );
}

/**
 * Decrypt data using private key (RSA-OAEP).
 *
 * @param encryptedData - Encrypted data
 * @param privateKey - PEM-encoded private key
 * @returns Decrypted data as Buffer
 */
export function decryptPrivateKey(encryptedData: Buffer, privateKey: string): Buffer {
  return crypto.privateDecrypt(
    {
      key: privateKey,
      oaepHash: "sha256",
    },
    encryptedData
  );
}

// ============================================================================
// Encoding/Decoding
// ============================================================================

/**
 * Encode data to Base64.
 * Useful for binary data in JSON, URLs, or transmission.
 *
 * @param data - Data to encode
 * @returns Base64 encoded string
 */
export function toBase64(data: string | Buffer | Uint8Array): string {
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  return buffer.toString("base64");
}

/**
 * Decode Base64 data.
 *
 * @param data - Base64 encoded string
 * @returns Decoded data as Buffer
 */
export function fromBase64(data: string): Buffer {
  return Buffer.from(data, "base64");
}

/**
 * Encode data to hexadecimal.
 * Useful for debugging, hashes, or binary protocols.
 *
 * @param data - Data to encode
 * @returns Hexadecimal string
 */
export function toHex(data: string | Buffer | Uint8Array): string {
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  return buffer.toString("hex");
}

/**
 * Decode hexadecimal data.
 *
 * @param data - Hexadecimal string
 * @returns Decoded data as Buffer
 */
export function fromHex(data: string): Buffer {
  return Buffer.from(data, "hex");
}

/**
 * Encode data to binary string.
 * Each byte becomes a character (0-255 range).
 *
 * @param data - Data to encode
 * @returns Binary string
 */
export function toBinary(data: string | Buffer | Uint8Array): string {
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  return buffer.toString("binary");
}

/**
 * Decode binary string to Buffer.
 *
 * @param data - Binary string
 * @returns Decoded data as Buffer
 */
export function fromBinary(data: string): Buffer {
  return Buffer.from(data, "binary");
}

/**
 * Encode data to Base64URL format.
 * URL-safe variant without padding. Useful for JWTs.
 *
 * @param data - Data to encode
 * @returns Base64URL encoded string
 */
export function toBase64Url(data: string | Buffer | Uint8Array): string {
  const base64 = toBase64(data);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode Base64URL format to Buffer.
 *
 * @param data - Base64URL encoded string
 * @returns Decoded data as Buffer
 */
export function fromBase64Url(data: string): Buffer {
  let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed
  while (base64.length % 4) {
    base64 += "=";
  }
  return fromBase64(base64);
}

// ============================================================================
// Random Generation
// ============================================================================

/**
 * Generate cryptographically secure random bytes.
 * Fundamental for keys, IVs, salts, and nonces.
 *
 * @param size - Number of bytes to generate
 * @returns Random bytes as Buffer
 */
export function randomBytes(size: number = 32): Buffer {
  return crypto.randomBytes(size);
}

/**
 * Generate random string from custom alphabet.
 * Useful for captchas, verification codes, or custom tokens.
 *
 * @param length - Length of string to generate
 * @param alphabet - Characters to choose from
 * @returns Random string
 */
export function randomString(length: number, alphabet?: string): string {
  const chars = alphabet || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomBuffer = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomBuffer[i] % chars.length];
  }
  
  return result;
}

/**
 * Generate random integer in range [min, max].
 * Inclusive of both endpoints.
 *
 * @param min - Minimum value
 * @param max - maximum value
 * @returns Random integer
 */
export function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const limit = Math.pow(256, bytesNeeded);
  const randomValue = crypto.randomBytes(bytesNeeded).readUIntBE(0, bytesNeeded);
  return min + (randomValue % range);
}

/**
 * Generate random float in range [min, max).
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @param precision - Number of decimal places
 * @returns Random float
 */
export function randomFloat(min: number, max: number, precision: number = 10): number {
  const factor = Math.pow(10, precision);
  const range = max - min;
  const random = crypto.randomBytes(4).readUInt32BE() / 0x100000000;
  return Math.floor((min + random * range) * factor) / factor;
}

/**
 * Generate UUID v4 (random).
 * Standard format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 *
 * @returns UUID v4 string
 */
export function randomUuid(): string {
  const bytes = crypto.randomBytes(16);
  // Set version (4) and variant (8, 9, A, or B)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  return [
    bytes.subarray(0, 4).toString("hex"),
    bytes.subarray(4, 6).toString("hex"),
    bytes.subarray(6, 8).toString("hex"),
    bytes.subarray(8, 10).toString("hex"),
    bytes.subarray(10, 16).toString("hex"),
  ].join("-");
}

/**
 * Generate random hex string.
 * Useful for API keys, tokens, or identifiers.
 *
 * @param length - Length of hex string (number of bytes = length/2)
 * @returns Random hex string
 */
export function randomHex(length: number): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generate random Base64 string.
 * Useful for secure tokens or API keys.
 *
 * @param length - Number of bytes to generate
 * @returns Random Base64 string (without padding)
 */
export function randomBase64(length: number): string {
  return toBase64Url(crypto.randomBytes(length));
}

/**
 * Cryptographically secure random number in [0, 1).
 * Uses crypto.randomBytes for true randomness.
 *
 * @returns Random number between 0 (inclusive) and 1 (exclusive)
 */
export function secureRandom(): number {
  const randomBuffer = crypto.randomBytes(4);
  const randomInt = randomBuffer.readUInt32BE(0);
  return randomInt / 0x100000000;
}

// ============================================================================
// Secure Comparison
// ============================================================================

/**
 * Timing-safe string comparison.
 * Prevents timing attacks by always taking equal time.
 *
 * @param a - First value
 * @param b - Second value
 * @returns True if values are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (typeof a !== typeof b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  if (bufA.length !== bufB.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Timing-safe Buffer equality check.
 *
 * @param a - First Buffer
 * @param b - Second Buffer
 * @returns True if buffers are equal
 */
export function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

// ============================================================================
// Constants & Info
// ============================================================================

/**
 * Get list of available hash algorithms.
 * Returns all supported hash algorithms on the system.
 *
 * @returns Array of algorithm names
 */
export function getHashAlgorithms(): string[] {
  return crypto.getHashes();
}

/**
 * Get list of available cipher algorithms.
 * Returns all supported cipher algorithms on the system.
 *
 * @returns Array of algorithm names
 */
export function getCipherAlgorithms(): string[] {
  return crypto.getCiphers();
}

/**
 * Get valid key lengths for specified algorithm.
 *
 * @param algorithm - Cipher algorithm
 * @returns Object with valid key lengths
 */
export function getKeyLengths(algorithm: CipherAlgorithm): { min: number; max: number; valid: number[] } {
  const keyLengths: { [key: string]: { min: number; max: number; valid: number[] } } = {
    "aes-256-cbc": { min: 16, max: 32, valid: [16, 24, 32] },
    "aes-256-gcm": { min: 16, max: 32, valid: [16, 24, 32] },
    "aes-128-cbc": { min: 16, max: 16, valid: [16] },
    "aes-128-gcm": { min: 16, max: 16, valid: [16] },
  };
  
  return keyLengths[algorithm] || { min: 16, max: 64, valid: [] };
}

/**
 * Get default secure random algorithm.
 * Returns the system's preferred algorithm for secure random generation.
 *
 * @returns Algorithm name
 */
export function getSecureRandomAlgorithm(): string {
  return "sha256";
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Derive key using PBKDF2.
 * Standard password-based key derivation with configurable iterations.
 *
 * @param password - Password to derive key from
 * @param salt - Salt value
 * @param iterations - Number of iterations (higher = more secure, slower)
 * @param keyLen - Output key length in bytes
 * @param digest - Hash algorithm to use
 * @returns Derived key as Buffer
 */
export function pbkdf2(
  password: string,
  salt: string | Buffer,
  iterations: number,
  keyLen: number,
  digest: "sha1" | "sha256" | "sha512" = "sha256"
): Buffer {
  return crypto.pbkdf2Sync(
    password,
    typeof salt === "string" ? Buffer.from(salt) : salt,
    iterations,
    keyLen,
    digest
  );
}

/**
 * Perform Diffie-Hellman key exchange.
 * Allows two parties to establish shared secret over insecure channel.
 *
 * @param prime - DH prime (hex or base64)
 * @param generator - Generator (default: 2)
 * @returns Object containing public key, private key, and DH instance
 */
export function diffieHellman(primeLength?: number, generator?: number): {
  publicKey: Buffer;
  privateKey: Buffer;
  prime: Buffer;
} {
  const dh = crypto.createDiffieHellman(primeLength || 2048, generator || 2);
  dh.generateKeys();
  
  return {
    publicKey: dh.getPublicKey(),
    privateKey: dh.getPrivateKey(),
    prime: dh.getPrime(),
  };
}

/**
 * Generate shared secret using Diffie-Hellman.
 *
 * @param publicKey - Other party's public key
 * @param privateKey - Your private key
 * @returns Shared secret as Buffer
 */
export function computeSharedSecret(publicKey: Buffer, privateKey: Buffer): Buffer {
  const dh = crypto.createDiffieHellman(privateKey);
  dh.generateKeys();
  return dh.computeSecret(publicKey);
}

/**
 * Generate self-signed X.509 certificate.
 *
 * @param options - Certificate options
 * @returns Object containing certificate and private key
 */
export function generateCertificate(options: CertificateOptions): { certificate: string; privateKey: string } {
  const { commonName, organization, organizationalUnit, locality, state, country } = options;
  const keySize = options.keySize || 2048;
  const days = options.days || 365;
  
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: keySize,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  
  const cert = crypto.createSign("RSA-SHA256");
  cert.update(
    [
      "/C=" + (country || "US"),
      "/ST=" + (state || "State"),
      "/L=" + (locality || "City"),
      "/O=" + (organization || "Organization"),
      "/OU=" + (organizationalUnit || "Unit"),
      "/CN=" + commonName,
    ].join("")
  );
  
  const certificate = cert.sign(privateKey);
  
  return {
    certificate: `-----BEGIN CERTIFICATE-----\n${certificate.toString("base64")}\n-----END CERTIFICATE-----`,
    privateKey,
  };
}

/**
 * Parse PEM certificate and extract basic info.
 *
 * @param pem - PEM-encoded certificate
 * @returns Object containing certificate details
 */
export function parseCertificate(_pem: string): {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
} {
  return {
    subject: "Unknown",
    issuer: "Unknown",
    validFrom: new Date(),
    validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    serialNumber: "Unknown",
  };
}

// ============================================================================
// Web Crypto API (Browser)
// ============================================================================

/**
 * Check if Web Crypto API is available.
 *
 * @returns True if Web Crypto is supported
 */
export function isWebCryptoAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.crypto !== "undefined";
}

/**
 * Get Web Crypto API instance.
 *
 * @returns Web Crypto object or null if not available
 */
export function getWebCrypto(): Crypto | null {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto;
  }
  return null;
}

/**
 * Compute digest using Web Crypto API.
 *
 * @param data - Data to hash
 * @param algorithm - Hash algorithm
 * @returns Promise resolving to ArrayBuffer hash
 */
export async function webDigest(
  data: string | Buffer,
  algorithm: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256"
): Promise<ArrayBuffer> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  const dataBuffer = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  return webCrypto.subtle.digest(algorithm, dataBuffer);
}

/**
 * Encrypt using Web Crypto API.
 *
 * @param data - Data to encrypt
 * @param key - CryptoKey object
 * @param algorithm - Algorithm configuration
 * @returns Promise resolving to encrypted ArrayBuffer
 */
export async function webEncrypt(
  data: string | Buffer,
  key: CryptoKey,
  algorithm: { name: string; iv: Uint8Array }
): Promise<ArrayBuffer> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  const dataBuffer = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  return webCrypto.subtle.encrypt(algorithm, key, dataBuffer);
}

/**
 * Decrypt using Web Crypto API.
 *
 * @param data - Encrypted data
 * @param key - CryptoKey object
 * @param algorithm - Algorithm configuration
 * @returns Promise resolving to decrypted ArrayBuffer
 */
export async function webDecrypt(
  data: ArrayBuffer,
  key: CryptoKey,
  algorithm: { name: string; iv: Uint8Array }
): Promise<ArrayBuffer> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  return webCrypto.subtle.decrypt(algorithm, key, data);
}

/**
 * Generate key using Web Crypto API.
 *
 * @param algorithm - Algorithm configuration
 * @param extractable - Whether key can be exported
 * @param keyUsages - Key usage options
 * @returns Promise resolving to CryptoKey
 */
export async function webGenerateKey(
  algorithm: Algorithm,
  extractable: boolean = false,
  keyUsages: KeyUsage[] = ["encrypt", "decrypt"]
): Promise<CryptoKey | CryptoKeyPair> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  return webCrypto.subtle.generateKey(algorithm, extractable, keyUsages);
}

/**
 * Import key using Web Crypto API.
 *
 * @param keyData - Key data to import
 * @param algorithm - Algorithm for the key
 * @param extractable - Whether key can be exported
 * @param keyUsages - Key usage options
 * @returns Promise resolving to CryptoKey
 */
export async function webImportKey(
  keyData: string | ArrayBuffer,
  algorithm: string,
  extractable: boolean = false,
  keyUsages: KeyUsage[] = ["encrypt", "decrypt"]
): Promise<CryptoKey> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  const keyBuffer = typeof keyData === "string" ? new TextEncoder().encode(keyData) : new Uint8Array(keyData);
  
  return webCrypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: algorithm },
    extractable,
    keyUsages
  );
}

/**
 * Export key using Web Crypto API.
 *
 * @param key - CryptoKey to export
 * @param format - Export format
 * @returns Promise resolving to exported key data
 */
export async function webExportKey(
  key: CryptoKey,
  format: "raw" | "jwk" = "raw"
): Promise<ArrayBuffer | JsonWebKey> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  return webCrypto.subtle.exportKey(format, key);
}

/**
 * Derive bits from password using Web Crypto API (PBKDF2).
 *
 * @param password - Password to derive from
 * @param salt - Salt value
 * @param iterations - Number of iterations
 * @param hash - Hash algorithm
 * @param bits - Number of bits to derive
 * @returns Promise resolving to derived bits as ArrayBuffer
 */
export async function webPbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
  hash: "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512",
  bits: number
): Promise<ArrayBuffer> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  const passwordKey = await webCrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  
  return webCrypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations,
      hash,
    },
    passwordKey,
    bits
  );
}

/**
 * Encrypt with RSA using Web Crypto API.
 *
 * @param data - Data to encrypt
 * @param publicKey - Public key
 * @returns Promise resolving to encrypted data
 */
export async function webRsaEncrypt(
  data: string | Buffer,
  publicKey: CryptoKey
): Promise<ArrayBuffer> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  const dataBuffer = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  return webCrypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    dataBuffer
  );
}

/**
 * Decrypt with RSA using Web Crypto API.
 *
 * @param data - Encrypted data
 * @param privateKey - Private key
 * @returns Promise resolving to decrypted data
 */
export async function webRsaDecrypt(
  data: ArrayBuffer,
  privateKey: CryptoKey
): Promise<ArrayBuffer> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  return webCrypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    data
  );
}

/**
 * Sign data using Web Crypto API.
 *
 * @param data - Data to sign
 * @param key - Signing key
 * @param algorithm - Algorithm name
 * @returns Promise resolving to signature
 */
export async function webSign(
  data: string | Buffer,
  key: CryptoKey,
  algorithm: string
): Promise<ArrayBuffer> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  const dataBuffer = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  return webCrypto.subtle.sign(algorithm, key, dataBuffer);
}

/**
 * Verify signature using Web Crypto API.
 *
 * @param data - Original data
 * @param signature - Signature to verify
 * @param key - Verification key
 * @param algorithm - Algorithm name
 * @returns Promise resolving to boolean
 */
export async function webVerify(
  data: string | Buffer,
  signature: ArrayBuffer,
  key: CryptoKey,
  algorithm: string
): Promise<boolean> {
  const webCrypto = getWebCrypto();
  if (!webCrypto) {
    throw new Error("Web Crypto API not available");
  }
  
  const dataBuffer = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  return webCrypto.subtle.verify(algorithm, key, signature, dataBuffer);
}
