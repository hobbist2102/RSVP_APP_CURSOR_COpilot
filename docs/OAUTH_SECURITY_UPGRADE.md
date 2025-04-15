# OAuth Security Upgrade Guide

## Overview

This document outlines the security improvements made to the OAuth implementation in the Wedding RSVP application. The enhanced implementation includes encryption, better error handling, structured logging, retry mechanisms, and protection against various OAuth-related vulnerabilities.

## Security Enhancements

### 1. Token Encryption

All sensitive OAuth data (client secrets, refresh tokens, access tokens) are now encrypted using AES-256-GCM before being stored in the database. This provides:

- **Data at rest protection**: Even if the database is compromised, the tokens remain secure
- **Authentication tags**: Protects against tampering with encrypted data
- **Unique initialization vectors**: Each encryption operation uses a unique IV for enhanced security

### 2. CSRF Protection

The state parameter in the OAuth flow is now a secure, tamper-proof token that includes:

- Random data
- Provider information
- Event ID
- Expiration timestamp
- HMAC signature for integrity validation

This prevents cross-site request forgery attacks that could trick users into initiating unauthorized OAuth flows.

### 3. Rate Limiting

API endpoints are now protected with rate limiting to prevent abuse:

- 10 requests per minute for authorization endpoints
- 15 requests per minute for callback endpoints
- Clear error messages when limits are exceeded

### 4. Structured Logging

Comprehensive logging system with context information:

- Event-specific logs for easier debugging
- User context tracking across requests
- Masked sensitive information in logs
- Error tracking with detailed context
- Transaction tracking across OAuth flow stages

### 5. Automatic Retries

Robust error handling with automatic retries for transient errors:

- Exponential backoff strategy
- Only retries idempotent operations
- Detailed logging of retry attempts
- Configurable retry limits

### 6. Standardized Error Responses

All API responses now follow a consistent format:

```json
{
  "success": false,
  "message": "Invalid or expired OAuth state",
  "code": "INVALID_STATE",
  "details": "Your authorization session has expired or is invalid. Please try again."
}
```

This makes client-side error handling more predictable and user-friendly.

## Using the Improved OAuth Implementation

### API Endpoints

The improved OAuth implementation is currently available at `/api/oauth2/*` to allow for a phased transition. The following endpoints are available:

- `GET /api/oauth2/gmail/authorize`: Initiates Gmail OAuth flow with secure state
- `GET /api/oauth2/outlook/authorize`: Initiates Outlook OAuth flow with secure state
- `GET /api/oauth2/gmail/callback`: Handles Gmail OAuth callback with state validation
- `GET /api/oauth2/outlook/callback`: Handles Outlook OAuth callback with state validation
- `GET /api/oauth2/status/:provider`: Checks OAuth connection status for a provider
- `POST /api/oauth2/refresh/:provider`: Refreshes access tokens when expired

### Frontend Integration

To use the improved OAuth implementation in the frontend, update the API endpoints in your OAuth-related components:

```typescript
// Before:
const GMAIL_AUTH_URL = '/api/oauth/gmail/authorize';

// After:
const GMAIL_AUTH_URL = '/api/oauth2/gmail/authorize';
```

### Migrating Database Schema

A migration script has been created to add the necessary database fields for the improved OAuth implementation:

```bash
# Run the migration script
npm run db:migrate:oauth
```

This script:
1. Checks if the migration is needed
2. Runs all schema changes in a transaction
3. Adds proper indexes for performance
4. Has built-in rollback capabilities if anything fails

### Transition Plan

We recommend a phased approach to transitioning to the improved OAuth implementation:

1. **Phase 1 (Current)**: Both implementations are available
   - Original: `/api/oauth/*`
   - Improved: `/api/oauth2/*`

2. **Phase 2**: Switch components gradually to the improved implementation
   - Update OAuth configuration components
   - Update RSVP follow-up configuration components

3. **Phase 3**: Complete transition
   - Remove the original implementation
   - Redirect any `/api/oauth/*` calls to `/api/oauth2/*`
   - Eventually rename `/api/oauth2/*` back to `/api/oauth/*`

## Security Best Practices for OAuth

### 1. Keep OAuth Credentials Secure

- Never commit OAuth credentials to source control
- Store credentials in environment variables or secure storage
- Regularly rotate client secrets

### 2. Validate Redirect URIs

- Always register exact redirect URIs with OAuth providers
- Validate incoming redirect URIs against allowed lists
- Watch for subtle differences like trailing slashes

### 3. Limit OAuth Scopes

- Request only the minimum scopes required
- Document why each scope is needed
- Review scope requirements regularly

### 4. Implement Token Refresh Logic

- Check token expiration before using
- Implement automatic refresh when tokens expire
- Have fallback mechanisms for expired refresh tokens

### 5. Set Up Monitoring

- Monitor OAuth failures and suspicious patterns
- Set up alerts for unusual activity
- Regularly audit OAuth usage

## Troubleshooting

### Invalid Redirect URI Errors

If you encounter `redirect_uri_mismatch` errors:

1. Verify the redirect URI in your OAuth provider console matches exactly
2. Check for protocol differences (http vs https)
3. Watch for domain differences (localhost vs your production domain)
4. Be careful with trailing slashes

### Token Expiration Issues

If tokens are unexpectedly expiring:

1. Check your token refresh logic
2. Verify the OAuth provider hasn't revoked access
3. Ensure your server's clock is synchronized

### Permission Errors

If you encounter permission denied errors:

1. Verify you're requesting the correct scopes
2. Check if the user denied specific permissions
3. Ensure your app is verified if required by the provider

## Contact

For questions or issues related to the OAuth security upgrade, please contact the development team.

---

Last updated: April 15, 2025