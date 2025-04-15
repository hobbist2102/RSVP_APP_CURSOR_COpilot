/**
 * OAuth Security Utility
 * Provides functions for securely storing, retrieving, and validating OAuth credentials
 */

import crypto from 'crypto';
import { URL } from 'url';
import { createOAuthLogger } from './logger';

const logger = createOAuthLogger(undefined, undefined, 'security');

// Encryption keys - In production, these should be in environment variables
const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || 'default-oauth-encryption-key-change-in-production';
const ENCRYPTION_IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Encrypt sensitive OAuth data before storing in database
 * @param text The text to encrypt (client secret, access token, etc.)
 * @returns Encrypted string in format: iv.encryptedData.authTag (dot separated)
 */
export const encryptOAuthData = (text: string): string => {
  try {
    if (!text) return '';
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
    
    // Create a cipher using AES-256-GCM (authenticated encryption)
    const cipher = crypto.createCipheriv(
      'aes-256-gcm', 
      Buffer.from(ENCRYPTION_KEY), 
      iv
    );
    
    // Encrypt the data
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Return iv.encryptedText.authTag
    return `${iv.toString('hex')}.${encrypted}.${authTag}`;
  } catch (error) {
    logger.error('Encryption failed', error as Error);
    throw new Error('Failed to encrypt sensitive data');
  }
};

/**
 * Decrypt OAuth data retrieved from database
 * @param encryptedText The encrypted text in format: iv.encryptedData.authTag
 * @returns Decrypted string or empty string if decryption fails
 */
export const decryptOAuthData = (encryptedText: string): string => {
  try {
    if (!encryptedText) return '';
    
    // Split the encrypted text into parts
    const parts = encryptedText.split('.');
    if (parts.length !== 3) {
      logger.warn('Invalid encrypted data format', { encryptedText: parts.length > 0 ? '...' : 'empty' });
      return '';
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    // Create a decipher
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      Buffer.from(ENCRYPTION_KEY), 
      iv
    );
    
    // Set auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', error as Error);
    return '';
  }
};

/**
 * Validate OAuth redirect URI to prevent open redirectors
 * @param redirectUri The redirect URI to validate
 * @param allowedDomains Array of allowed domains (e.g., ['localhost', 'example.com'])
 * @returns Boolean indicating if the redirect URI is valid
 */
export const validateRedirectUri = (
  redirectUri: string | undefined | null,
  allowedDomains: string[] = ['localhost']
): boolean => {
  try {
    if (!redirectUri) return false;
    
    // Parse the URL
    const url = new URL(redirectUri);
    
    // Check protocol is http or https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      logger.warn('Invalid redirect URI protocol', { redirectUri, protocol: url.protocol });
      return false;
    }
    
    // Check if the hostname is in the allowed domains list
    const isAllowedDomain = allowedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );
    
    if (!isAllowedDomain) {
      logger.warn('Redirect URI domain not allowed', { 
        redirectUri, 
        hostname: url.hostname,
        allowedDomains 
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error('Redirect URI validation error', error as Error, { redirectUri });
    return false;
  }
};

/**
 * Generate a random state for OAuth flow with expiration timestamp
 * @param provider OAuth provider name (gmail, outlook)
 * @param eventId ID of the event
 * @param expiresInSeconds How long the state should be valid (default 10 minutes)
 * @returns Random hex string for state parameter
 */
export const generateOAuthState = (
  provider: string,
  eventId: number,
  expiresInSeconds: number = 600
): string => {
  try {
    // Generate random bytes
    const randomState = crypto.randomBytes(16).toString('hex');
    
    // Add timestamp for expiration
    const expiresAt = Date.now() + (expiresInSeconds * 1000);
    
    // Combine data and create an HMAC signature to prevent tampering
    const payload = `${randomState}:${provider}:${eventId}:${expiresAt}`;
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY)
      .update(payload)
      .digest('hex');
    
    // Return combined state with HMAC signature
    return Buffer.from(`${payload}:${hmac}`).toString('base64');
  } catch (error) {
    logger.error('Failed to generate OAuth state', error as Error);
    throw new Error('Failed to generate secure OAuth state');
  }
};

/**
 * Verify and decode the OAuth state parameter
 * @param state Base64-encoded state parameter from OAuth callback
 * @returns Object with provider, eventId, and expiresAt if valid, null otherwise
 */
export const verifyOAuthState = (
  state: string | undefined | null
): { provider: string; eventId: number; expiresAt: number } | null => {
  try {
    if (!state) return null;
    
    // Decode base64 state
    const decodedState = Buffer.from(state, 'base64').toString('utf8');
    const parts = decodedState.split(':');
    
    // Validate correct number of parts
    if (parts.length !== 5) {
      logger.warn('Invalid OAuth state format', { partsCount: parts.length });
      return null;
    }
    
    const [randomState, provider, eventIdStr, expiresAtStr, receivedHmac] = parts;
    
    // Verify HMAC signature to prevent tampering
    const payload = `${randomState}:${provider}:${eventIdStr}:${expiresAtStr}`;
    const expectedHmac = crypto.createHmac('sha256', ENCRYPTION_KEY)
      .update(payload)
      .digest('hex');
    
    if (receivedHmac !== expectedHmac) {
      logger.warn('OAuth state HMAC validation failed', { provider });
      return null;
    }
    
    // Parse values
    const eventId = parseInt(eventIdStr, 10);
    const expiresAt = parseInt(expiresAtStr, 10);
    
    // Check if state has expired
    if (expiresAt < Date.now()) {
      logger.warn('OAuth state expired', { 
        provider,
        eventId,
        expiresAt: new Date(expiresAt).toISOString(),
        now: new Date().toISOString()
      });
      return null;
    }
    
    return { provider, eventId, expiresAt };
  } catch (error) {
    logger.error('OAuth state verification failed', error as Error);
    return null;
  }
};

/**
 * Validate OAuth credentials are complete
 * @param credentials Object containing OAuth credentials
 * @returns Boolean indicating if the credentials are valid and complete
 */
export const validateOAuthCredentials = (
  credentials: Record<string, any>,
  provider: string
): boolean => {
  try {
    if (!credentials) return false;
    
    if (provider === 'gmail') {
      // Check required Gmail credentials
      if (!credentials.gmailClientId || !credentials.gmailClientSecret) {
        return false;
      }
      
      // Validate redirect URI if present
      if (credentials.gmailRedirectUri && 
          !validateRedirectUri(credentials.gmailRedirectUri)) {
        return false;
      }
      
      return true;
    } 
    else if (provider === 'outlook') {
      // Check required Outlook credentials
      if (!credentials.outlookClientId || !credentials.outlookClientSecret) {
        return false;
      }
      
      // Validate redirect URI if present
      if (credentials.outlookRedirectUri && 
          !validateRedirectUri(credentials.outlookRedirectUri)) {
        return false;
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    logger.error('OAuth credentials validation failed', error as Error, { provider });
    return false;
  }
};

/**
 * Check if token is expired or about to expire (within 5 minutes)
 * @param expiryDate The token expiry date
 * @returns Boolean indicating if token needs refresh
 */
export const isTokenExpired = (expiryDate: Date | null | undefined): boolean => {
  if (!expiryDate) return true;
  
  // Token is considered expired if it's within 5 minutes of expiry
  const safetyBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds
  return new Date(expiryDate).getTime() - safetyBuffer < Date.now();
};

export default {
  encryptOAuthData,
  decryptOAuthData,
  validateRedirectUri,
  generateOAuthState,
  verifyOAuthState,
  validateOAuthCredentials,
  isTokenExpired,
};