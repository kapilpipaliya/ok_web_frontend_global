/**
 * Token Encryption Utilities
 *
 * Encrypts and decrypts OAuth tokens before storing in database.
 * Uses AES-256-GCM for authenticated encryption.
 *
 * IMPORTANT: Never store tokens in plain text!
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Get encryption key from environment variables
 * Falls back to a warning if not set (for development only)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;

  if (!key) {
    console.error('❌ TOKEN_ENCRYPTION_KEY not set in environment variables!');
    console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable is required');
  }

  if (key.length !== 64) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypts a token string
 * @param token - The token to encrypt
 * @returns Encrypted token in format: iv:authTag:encryptedData
 */
export function encryptToken(token: string): string {
  if (!token) {
    throw new Error('Token cannot be empty');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return IV + authTag + encrypted data (separated by colons)
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts an encrypted token
 * @param encryptedToken - The encrypted token string (iv:authTag:encryptedData)
 * @returns Decrypted token string
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) {
    throw new Error('Encrypted token cannot be empty');
  }

  const parts = encryptedToken.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypts client secret (for OAuth settings)
 * Same implementation as token encryption
 */
export function encryptClientSecret(secret: string): string {
  return encryptToken(secret);
}

/**
 * Decrypts client secret (for OAuth settings)
 * Same implementation as token decryption
 */
export function decryptClientSecret(encryptedSecret: string): string {
  return decryptToken(encryptedSecret);
}
