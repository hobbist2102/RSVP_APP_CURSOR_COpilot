/**
 * OAuth Security Utilities
 * 
 * This file contains functions for securely handling OAuth client secrets,
 * including encryption, decryption, and secure token storage.
 */

import * as crypto from 'crypto';

// Encryption key and initialization vector (IV)
// In production, these should be stored in environment variables
const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || 'wedding-rsvp-oauth-encryption-key-32c';
const IV_LENGTH = 16; // AES block size for GCM

/**
 * OAuth data structure for tokens and related information
 */
export interface OAuthData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
  email?: string;
  provider: 'gmail' | 'outlook';
  [key: string]: any; // Allow additional properties
}

/**
 * OAuth credentials validation interface
 */
export interface OAuthCredentialsValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns the encrypted text as a base64-encoded string with the IV prepended
 */
export function encrypt(text: string): string {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create a cipher using AES-256-GCM
  const cipher = crypto.createCipheriv(
    'aes-256-gcm', 
    Buffer.from(ENCRYPTION_KEY), 
    iv
  );
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag();
  
  // Combine IV, authTag, and encrypted text
  // Format: iv:authTag:encryptedText
  return iv.toString('base64') + 
    ':' + authTag.toString('base64') + 
    ':' + encrypted;
}

/**
 * Decrypt a string that was encrypted using encrypt()
 * Expects a base64-encoded string with the IV and auth tag prepended
 */
export function decrypt(encryptedText: string): string {
  try {
    // Split the parts (iv:authTag:encryptedText)
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encryptedData = parts[2];
    
    // Create a decipher using AES-256-GCM
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      Buffer.from(ENCRYPTION_KEY), 
      iv
    );
    
    // Set the auth tag
    decipher.setAuthTag(authTag);
    
    // Decrypt the text
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt OAuth data object
 */
export function encryptOAuthData(data: OAuthData): string {
  return encrypt(JSON.stringify(data));
}

/**
 * Decrypt OAuth data object
 */
export function decryptOAuthData(encryptedData: string): OAuthData {
  try {
    const decrypted = decrypt(encryptedData);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error decrypting OAuth data:', error);
    throw new Error('Failed to decrypt OAuth data');
  }
}

/**
 * Generate a random string for use as a state parameter in OAuth flows
 * This helps prevent CSRF attacks
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify that a state parameter matches the expected value
 */
export function verifyOAuthState(received: string, expected: string): boolean {
  try {
    // Use a constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(received), 
      Buffer.from(expected)
    );
  } catch (error) {
    console.error('OAuth state verification error:', error);
    return false;
  }
}

/**
 * Secure hash for token storage
 * Used for securely storing refresh tokens with a salt
 */
export function secureTokenHash(token: string, salt: string): string {
  return crypto
    .createHmac('sha256', salt)
    .update(token)
    .digest('hex');
}

/**
 * Check if an OAuth token is expired
 */
export function isTokenExpired(expiresAt: number | undefined): boolean {
  if (!expiresAt) return true;
  
  // Add a 5-minute buffer to account for clock skew and processing time
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() >= (expiresAt - bufferTime);
}

/**
 * Validate OAuth credentials
 */
export function validateOAuthCredentials(
  clientId?: string,
  clientSecret?: string
): OAuthCredentialsValidation {
  const errors: string[] = [];
  
  if (!clientId || clientId.trim() === '') {
    errors.push('Client ID is required');
  }
  
  if (!clientSecret || clientSecret.trim() === '') {
    errors.push('Client Secret is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}