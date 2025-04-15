# OAuth Frontend Integration Guide

This document provides guidance on how to integrate the improved OAuth security features in your frontend components. The enhanced OAuth implementation offers better security, error handling, and user experience.

## Endpoints

### Base URL

The improved OAuth implementation is available at:

```
/api/oauth2
```

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/oauth2/gmail/authorize` | GET | Initiates Gmail OAuth flow |
| `/api/oauth2/outlook/authorize` | GET | Initiates Outlook OAuth flow |
| `/api/oauth2/gmail/callback` | GET | Handles Gmail OAuth callback |
| `/api/oauth2/outlook/callback` | GET | Handles Outlook OAuth callback |
| `/api/oauth2/status/:provider` | GET | Checks status of OAuth connection for a provider |
| `/api/oauth2/refresh/:provider` | POST | Refreshes OAuth access tokens |

## Updating the RsvpFollowupConfiguration Component

Here's how to update the `RsvpFollowupConfiguration` component to use the improved OAuth implementation:

```tsx
// Before
const GMAIL_AUTH_URL = '/api/oauth/gmail/authorize';
const OUTLOOK_AUTH_URL = '/api/oauth/outlook/authorize';
const GMAIL_STATUS_URL = '/api/oauth/gmail/status';
const OUTLOOK_STATUS_URL = '/api/oauth/outlook/status';

// After
const GMAIL_AUTH_URL = '/api/oauth2/gmail/authorize';
const OUTLOOK_AUTH_URL = '/api/oauth2/outlook/authorize';
const GMAIL_STATUS_URL = '/api/oauth2/status/gmail';
const OUTLOOK_STATUS_URL = '/api/oauth2/status/outlook';
```

## Handling OAuth Responses

The improved OAuth implementation provides more detailed and consistent error responses:

```tsx
// Example of handling OAuth status check
const checkGmailStatus = async () => {
  try {
    const response = await fetch(`${GMAIL_STATUS_URL}?eventId=${event.id}`);
    const data = await response.json();
    
    if (!response.ok) {
      // New standardized error format with error codes
      if (data.code === 'AUTHENTICATION_REQUIRED') {
        // Handle authentication error
        setAuthError('Please log in to configure OAuth');
      } else if (data.code === 'INVALID_EVENT_ID') {
        // Handle invalid event ID error
        setEventError('Invalid event selected');
      } else {
        // Handle other errors
        setError(data.details || data.message || 'Unknown error');
      }
      return;
    }
    
    // Handle successful response
    if (data.success) {
      setGmailConnected(data.isConfigured);
      setGmailAccount(data.account);
      setGmailExpired(data.tokenExpired);
    }
  } catch (error) {
    console.error('Failed to check Gmail status:', error);
    setError('Failed to check Gmail status. Please try again later.');
  }
};
```

## Implementing OAuth Authorization Flow

The improved OAuth implementation uses a secure state parameter for CSRF protection. Here's how to implement the authorization flow:

```tsx
const initiateGmailAuth = async () => {
  setAuthInProgress(true);
  setError(null);
  
  try {
    // Request authorization URL from the server
    const response = await fetch(`${GMAIL_AUTH_URL}?eventId=${event.id}`);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle error based on error code
      if (data.code === 'MISSING_CLIENT_ID') {
        setError('Please configure your Gmail Client ID and Client Secret first.');
      } else {
        setError(data.details || data.message || 'Failed to start OAuth flow');
      }
      setAuthInProgress(false);
      return;
    }
    
    // Success - open the auth URL in a popup
    if (data.success && data.authUrl) {
      const authWindow = window.open(
        data.authUrl,
        'gmail-oauth',
        'width=600,height=700'
      );
      
      // Set up polling to check for completion
      const checkInterval = setInterval(async () => {
        if (authWindow?.closed) {
          clearInterval(checkInterval);
          await checkGmailStatus(); // Refresh status after window is closed
          setAuthInProgress(false);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('Gmail authorization error:', error);
    setError('Failed to start Gmail authorization. Please try again later.');
    setAuthInProgress(false);
  }
};
```

## Handling Token Refresh

The improved OAuth implementation provides an endpoint for refreshing tokens. Here's how to implement token refresh:

```tsx
const refreshGmailToken = async () => {
  setRefreshing(true);
  setError(null);
  
  try {
    const response = await fetch('/api/oauth2/refresh/gmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ eventId: event.id })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      setError(data.details || data.message || 'Failed to refresh Gmail token');
      setRefreshing(false);
      return;
    }
    
    if (data.success) {
      toast({
        title: 'Success',
        description: 'Gmail token refreshed successfully',
        variant: 'success'
      });
      
      // Update the status
      await checkGmailStatus();
    }
  } catch (error) {
    console.error('Failed to refresh Gmail token:', error);
    setError('An unexpected error occurred while refreshing the token');
  } finally {
    setRefreshing(false);
  }
};
```

## Improved Error Handling

The improved OAuth implementation provides more detailed error messages. Here's how to display them to users:

```tsx
// Before
if (!response.ok) {
  setError('Failed to authorize Gmail');
  return;
}

// After
if (!response.ok) {
  // Extract the specific error code and message
  const errorCode = data.code || 'UNKNOWN_ERROR';
  const errorMessage = data.details || data.message || 'Unknown error occurred';
  
  // Provide user-friendly error messages based on error code
  switch (errorCode) {
    case 'MISSING_CLIENT_ID':
      setError('Please configure your Gmail Client ID and Client Secret first.');
      break;
    case 'AUTHENTICATION_REQUIRED':
      setError('Please log in to configure OAuth.');
      break;
    case 'INVALID_REDIRECT_URI':
      setError('The redirect URI is not configured correctly. Please check your OAuth settings.');
      break;
    case 'TOKEN_EXCHANGE_ERROR':
      setError('Failed to exchange the authorization code for tokens. Please try again.');
      break;
    default:
      setError(errorMessage);
  }
  
  return;
}
```

## Best Practices

1. **Always include event ID**: All OAuth requests require the event ID parameter to ensure the correct event context
2. **Handle rate limiting**: Implement exponential backoff for retries if you hit rate limits
3. **Provide clear user feedback**: Use loading states, success messages, and error feedback
4. **Implement token refresh**: Automatically refresh tokens when they're about to expire
5. **Secure callbacks**: Ensure your application properly handles the OAuth callback flow
6. **Display connection status**: Show users whether their OAuth connection is active, expired, or needs reauthorization

## Migration Path

You can gradually migrate components to use the improved OAuth implementation:

1. Start by updating non-critical components first
2. Test thoroughly after each component migration
3. Once all components are migrated, you can switch to using only the improved implementation

## Troubleshooting

If you encounter issues with the OAuth flow:

1. Check the browser console for errors
2. Verify that you're using the correct event ID
3. Ensure the OAuth credentials are properly configured in the event settings
4. Check if tokens have expired and need to be refreshed
5. Verify that the redirect URIs match exactly what's configured in the OAuth provider
6. Check server logs for more detailed error information

---

Last updated: April 15, 2025