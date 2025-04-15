# OAuth Implementation for Email Services

## Overview

This document outlines the OAuth implementation for Gmail and Outlook email services in the Wedding RSVP application. The system supports both global OAuth credentials (environment variables) and event-specific OAuth credentials stored in the database, allowing for customized email configurations per wedding event.

## Architecture

### 1. Event-Specific Credentials Storage

OAuth credentials are stored in the events table with the following fields:

- `gmailClientId` - Client ID for Gmail OAuth
- `gmailClientSecret` - Client secret for Gmail OAuth (encrypted)
- `gmailRefreshToken` - Refresh token for Gmail OAuth (encrypted)
- `gmailAccessToken` - Access token for Gmail OAuth (short-lived, encrypted)
- `gmailTokenExpiry` - Expiration time for Gmail access token
- `outlookClientId` - Client ID for Outlook OAuth
- `outlookClientSecret` - Client secret for Outlook OAuth (encrypted)
- `outlookRefreshToken` - Refresh token for Outlook OAuth (encrypted)
- `outlookAccessToken` - Access token for Outlook OAuth (short-lived, encrypted)
- `outlookTokenExpiry` - Expiration time for Outlook access token

### 2. Fallback Mechanism

The system implements a fallback mechanism:
1. First attempts to use event-specific credentials from the database
2. If not available, falls back to environment variables:
   - `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REDIRECT_URI`
   - `OUTLOOK_CLIENT_ID`, `OUTLOOK_CLIENT_SECRET`, `OUTLOOK_REDIRECT_URI`

### 3. OAuth Flow Implementation

The OAuth implementation follows the secure OAuth 2.0 authorization code flow:

1. **Authorization Request**: Generate a secure state parameter and redirect user to provider's authorization endpoint
2. **Authorization Grant**: Provider redirects back with an authorization code and state parameter
3. **State Validation**: Verify the state parameter to prevent CSRF attacks
4. **Token Exchange**: Exchange authorization code for access and refresh tokens with retry logic
5. **Token Encryption**: Encrypt sensitive tokens before storage
6. **Token Storage**: Store encrypted tokens in the database for the specific event
7. **Token Refresh**: Use refresh tokens to obtain new access tokens when expired

## OAuth Flow Diagram

```
┌────────────┐                                  ┌────────────┐                                 ┌────────────┐
│            │                                  │            │                                 │            │
│  Frontend  │                                  │  Backend   │                                 │ OAuth      │
│            │                                  │            │                                 │ Provider   │
└─────┬──────┘                                  └─────┬──────┘                                 └─────┬──────┘
      │                                               │                                              │
      │ 1. Request OAuth Setup                        │                                              │
      │ ────────────────────────────►                 │                                              │
      │                                               │                                              │
      │                                               │ 2. Generate Secure State                     │
      │                                               │ ◄──────────────────────►                     │
      │                                               │                                              │
      │ 3. Return Auth URL with State                 │                                              │
      │ ◄────────────────────────────                 │                                              │
      │                                               │                                              │
      │ 4. Open Auth URL in Popup                     │                                              │
      │ ────────────────────────────────────────────────────────────────────────────────────────────►
      │                                               │                                              │
      │                                               │                                              │ 5. Auth UI
      │                                               │                                              │ ◄────────►
      │                                               │                                              │
      │                                               │                                     6. Auth Code + State
      │                                               │ ◄──────────────────────────────────────────────
      │                                               │                                              │
      │                                               │ 7. Verify State                              │
      │                                               │ ◄──────────────────────►                     │
      │                                               │                                              │
      │                                               │ 8. Exchange Code for Tokens                  │
      │                                               │ ────────────────────────────────────────────►
      │                                               │                                              │
      │                                               │                           9. Return Tokens   │
      │                                               │ ◄────────────────────────────────────────────
      │                                               │                                              │
      │                                               │ 10. Encrypt & Store Tokens                   │
      │                                               │ ◄─────────────────────────►                  │
      │                                               │                                              │
      │ 11. Auth Success                              │                                              │
      │ ◄────────────────────────────                 │                                              │
      │                                               │                                              │
```

## Security Enhancements

### 1. Token Encryption

Sensitive OAuth data (client secrets, refresh tokens, access tokens) are encrypted before storage using AES-256-GCM:

```typescript
// Encryption example
function encryptOAuthData(text: string): string {
  // Generate a random initialization vector
  const iv = crypto.randomBytes(16);
  
  // Create a cipher using AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  // Encrypt the data
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get the authentication tag
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return iv.encryptedText.authTag
  return `${iv.toString('hex')}.${encrypted}.${authTag}`;
}
```

### 2. CSRF Protection

The state parameter is now a secure, tamper-proof token that includes:
- Random data
- Provider information
- Event ID
- Expiration timestamp
- HMAC signature

```typescript
// State parameter generation
function generateOAuthState(provider: string, eventId: number): string {
  // Generate random bytes
  const randomState = crypto.randomBytes(16).toString('hex');
  
  // Add timestamp for expiration
  const expiresAt = Date.now() + (10 * 60 * 1000);
  
  // Combine data and create an HMAC signature
  const payload = `${randomState}:${provider}:${eventId}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY)
    .update(payload)
    .digest('hex');
  
  // Return combined state with HMAC signature
  return Buffer.from(`${payload}:${hmac}`).toString('base64');
}
```

### 3. Redirect URI Validation

Validates OAuth redirect URIs to prevent open redirector vulnerabilities:

```typescript
function validateRedirectUri(
  redirectUri: string,
  allowedDomains: string[] = ['localhost']
): boolean {
  // Parse the URL
  const url = new URL(redirectUri);
  
  // Check protocol is http or https
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }
  
  // Check if the hostname is in the allowed domains list
  return allowedDomains.some(domain => 
    url.hostname === domain || url.hostname.endsWith(`.${domain}`)
  );
}
```

### 4. Rate Limiting

API endpoints are protected with rate limiting to prevent abuse:

```typescript
// Rate limiting for authorization endpoints
const authorizationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  message: {
    success: false,
    message: 'Too many authorization requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

router.get("/gmail/authorize", isAuthenticated, isAdmin, authorizationLimiter, ...);
```

## API Routes

### Authorization Endpoints

- `GET /api/oauth/gmail/authorize`: Initiates Gmail OAuth flow with secure state
- `GET /api/oauth/outlook/authorize`: Initiates Outlook OAuth flow with secure state
- `GET /api/oauth/gmail/callback`: Handles Gmail OAuth callback with state validation
- `GET /api/oauth/outlook/callback`: Handles Outlook OAuth callback with state validation
- `GET /api/oauth/status/:provider`: Checks OAuth connection status for a provider
- `POST /api/oauth/refresh/:provider`: Refreshes access tokens when expired

## Retry & Error Handling

### 1. Automatic Retries

The implementation includes automatic retries for transient errors using axios-retry:

```typescript
// Configure retry behavior for transient errors
axiosRetry(oauthClient, {
  retries: 3, // Number of retries
  retryDelay: axiosRetry.exponentialDelay, // Exponential backoff
  retryCondition: (error) => {
    // Only retry on network errors, timeouts, and 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
      (error.response?.status !== undefined && error.response.status >= 500);
  }
});
```

### 2. Standardized Error Responses

Error responses follow a consistent format with detailed information:

```typescript
// Error response example
{
  "success": false,
  "message": "Invalid or expired OAuth state",
  "code": "INVALID_STATE",
  "details": "Your authorization session has expired or is invalid. Please try again."
}
```

### 3. Structured Logging

Comprehensive logging with context information using Winston:

```typescript
// OAuth-specific logger example
const logger = createOAuthLogger(eventId, 'gmail', 'authorize');

logger.info('Generated Gmail authorization URL', { 
  hasState: !!state,
  authUrl: authUrl.toString().substring(0, 100) + '...'
});

logger.error('Gmail token refresh error', error as Error, {
  eventId,
  retryAttempt: 2
});
```

## Frontend Implementation

### OAuth Configuration Component

The system includes two main components for OAuth configuration:

1. **OAuthConfiguration**: General OAuth settings in the event settings section
2. **RsvpFollowupConfiguration**: OAuth settings specifically for RSVP follow-up communications

### Frontend Validation

Client-side validation prevents invalid OAuth configurations:

```typescript
// Validate OAuth credentials before submission
const getValidationErrors = (service: "gmail" | "outlook") => {
  const errors: string[] = [];
  
  if (service === "gmail" && credentials.useGmail) {
    if (!credentials.gmailClientId) errors.push("Client ID is required");
    if (!credentials.gmailClientSecret) errors.push("Client Secret is required");
    if (credentials.gmailRedirectUri && !validateRedirectUri(credentials.gmailRedirectUri)) {
      errors.push("Redirect URI must be a valid URL with http:// or https:// protocol");
    }
  }
  
  return errors;
};
```

### UI/UX Improvements

- Added tooltips for technical fields
- Improved button styling based on configuration state
- Clear visual indicators for connection status
- Step-by-step guidance with numbered instructions

## Best Practices

When working with the OAuth implementation:

1. **Never store unencrypted tokens** in the database or logs
2. **Always validate event context** before accessing or modifying OAuth credentials
3. **Use the provided utility functions** for OAuth operations rather than direct database access
4. **Handle token expiration gracefully** by checking validity before using tokens
5. **Implement proper error handling** in both frontend and backend operations
6. **Limit OAuth scopes** to only what's necessary for the application
7. **Set up proper monitoring** for OAuth-related errors and token expirations

## Troubleshooting Common Issues

### 1. Invalid Redirect URI

**Symptoms**: Error with message "redirect_uri_mismatch" or "invalid_grant"

**Solution**:
- Ensure the redirect URI in your OAuth provider (Google/Microsoft) exactly matches what you're using in the application
- Check for trailing slashes, http vs https, and domain variations
- For development, use "http://localhost:5000/api/oauth/{provider}/callback"

### 2. Token Expiration

**Symptoms**: "invalid_grant" or "invalid_token" errors after working previously

**Solution**:
- Implement automatic token refresh when tokens expire
- Check token expiration before using with `isTokenExpired()`
- If refresh token is invalid, prompt user to re-authenticate

### 3. Missing Scopes

**Symptoms**: Permission errors when trying to access specific API features

**Solution**:
- Ensure you're requesting all necessary scopes during authorization
- For Gmail: "https://www.googleapis.com/auth/gmail.send" and "https://www.googleapis.com/auth/userinfo.email"
- For Outlook: "offline_access", "https://graph.microsoft.com/mail.send", and "https://graph.microsoft.com/user.read"

## Recent Improvements

As of April 15, 2025, the following improvements have been made:

1. Implemented token encryption using AES-256-GCM
2. Added secure state parameter with HMAC validation
3. Implemented automatic retries for transient errors
4. Added rate limiting for OAuth endpoints
5. Enhanced logging with structured context information
6. Improved frontend validation and UI/UX
7. Added comprehensive documentation with examples and troubleshooting guides