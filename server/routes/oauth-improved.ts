/**
 * Improved OAuth Routes
 * Enhanced implementation of OAuth flow with better security, logging, and error handling
 */

import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { rateLimit } from 'express-rate-limit';
import { createOAuthLogger } from "../lib/logger";
import { 
  encryptOAuthData, 
  decryptOAuthData,
  generateOAuthState,
  verifyOAuthState,
  validateOAuthCredentials,
  isTokenExpired
} from "../lib/oauth-security";
import { 
  exchangeToken,
  makeAuthenticatedRequest
} from "../lib/oauth-client";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ 
    success: false,
    message: 'Please log in again',
    code: 'AUTHENTICATION_REQUIRED'
  });
};

// Admin role middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).role === 'admin') {
    return next();
  }
  res.status(403).json({ 
    success: false,
    message: 'Forbidden - Admin access required',
    code: 'ADMIN_REQUIRED'
  });
};

// Set up router
const router = Router();

// Default redirect URIs
const DEFAULT_GMAIL_REDIRECT_URI = "http://localhost:5000/api/oauth/gmail/callback";
const DEFAULT_OUTLOOK_REDIRECT_URI = "http://localhost:5000/api/oauth/outlook/callback";

// OAuth scopes
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send", 
  "https://www.googleapis.com/auth/userinfo.email"
];

const OUTLOOK_SCOPES = [
  "offline_access", 
  "https://graph.microsoft.com/mail.send", 
  "https://graph.microsoft.com/user.read"
];

// Rate limiting for authorization endpoints
const authorizationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authorization requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Rate limiting for callback endpoints
const callbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // Limit each IP to 15 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many callback requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * Standardized error response helper
 */
const sendErrorResponse = (
  res: Response, 
  status: number, 
  message: string, 
  code: string,
  details?: string,
  error?: any
) => {
  const response = {
    success: false,
    message,
    code,
    details: details || message
  };
  
  if (error && process.env.NODE_ENV !== 'production') {
    (response as any).error = error instanceof Error ? error.message : String(error);
  }
  
  return res.status(status).json(response);
};

// Gmail OAuth Authorization Route
router.get(
  "/gmail/authorize", 
  isAuthenticated, 
  isAdmin, 
  authorizationLimiter,
  async (req: Request, res: Response) => {
    const eventId = parseInt(req.query.eventId as string);
    const logger = createOAuthLogger(eventId, 'gmail', 'authorize');
    
    logger.request('Gmail authorization request received', req);
    
    try {
      // Validate event ID
      if (isNaN(eventId)) {
        logger.warn('Invalid event ID provided', { eventId: req.query.eventId });
        return sendErrorResponse(
          res, 400, 
          "Invalid event ID", 
          "INVALID_EVENT_ID",
          "The event ID provided must be a valid number"
        );
      }
      
      // Get event details
      const event = await storage.getEvent(eventId);
      if (!event) {
        logger.warn('Event not found', { eventId });
        return sendErrorResponse(
          res, 404, 
          "Event not found", 
          "EVENT_NOT_FOUND",
          `No event exists with ID ${eventId}`
        );
      }
      
      logger.info('Retrieved event for Gmail authorization', { 
        eventId: event.id,
        eventTitle: event.title
      });
      
      // Use event-specific credentials or fall back to environment variables
      const clientId = event.gmailClientId || process.env.GMAIL_CLIENT_ID;
      const redirectUri = event.gmailRedirectUri || DEFAULT_GMAIL_REDIRECT_URI;
      
      logger.debug('Gmail credentials check', {
        hasEventClientId: !!event.gmailClientId,
        hasEnvClientId: !!process.env.GMAIL_CLIENT_ID,
        hasClientId: !!clientId,
        redirectUri
      });
      
      // Validate required credentials
      if (!clientId) {
        logger.warn('Gmail client ID not configured', { eventId });
        return sendErrorResponse(
          res, 400, 
          "Gmail client ID not configured", 
          "MISSING_CLIENT_ID",
          "You need to save Gmail OAuth credentials in your event settings before configuring the connection. Please enter your Client ID and Client Secret, then save your changes."
        );
      }
      
      // Generate secure state parameter
      const state = generateOAuthState('gmail', eventId);
      
      // Build the authorization URL
      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.append("client_id", clientId);
      authUrl.searchParams.append("redirect_uri", redirectUri);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", GMAIL_SCOPES.join(" "));
      authUrl.searchParams.append("access_type", "offline");
      authUrl.searchParams.append("prompt", "consent");
      authUrl.searchParams.append("state", state);
      
      logger.info('Generated Gmail authorization URL', { 
        hasState: !!state,
        authUrl: authUrl.toString().substring(0, 100) + '...'
      });
      
      // Return the authorization URL
      res.json({ 
        success: true,
        authUrl: authUrl.toString() 
      });
    } catch (error) {
      logger.error('Gmail authorization error', error as Error);
      
      sendErrorResponse(
        res, 500, 
        "Failed to initiate Gmail authorization", 
        "AUTHORIZATION_ERROR",
        "An unexpected error occurred while setting up Gmail authorization",
        error
      );
    }
  }
);

// Gmail OAuth Callback Route
router.get(
  "/gmail/callback", 
  isAuthenticated, 
  isAdmin,
  callbackLimiter,
  async (req: Request, res: Response) => {
    const logger = createOAuthLogger(undefined, 'gmail', 'callback');
    logger.request('Gmail callback request received', req);
    
    try {
      const { code, state } = req.query;
      
      // Validate authorization code
      if (!code) {
        logger.warn('Missing authorization code in callback');
        return sendErrorResponse(
          res, 400, 
          "Missing authorization code", 
          "MISSING_CODE",
          "The authorization code was not received from Google"
        );
      }
      
      // Validate and decode state
      const stateData = verifyOAuthState(state as string);
      if (!stateData || stateData.provider !== 'gmail') {
        logger.warn('Invalid or expired OAuth state', { 
          hasState: !!state,
          stateValid: !!stateData,
          provider: stateData?.provider
        });
        
        return sendErrorResponse(
          res, 400, 
          "Invalid or expired OAuth state", 
          "INVALID_STATE",
          "Your authorization session has expired or is invalid. Please try again."
        );
      }
      
      const { eventId } = stateData;
      logger.info('Valid state for Gmail callback', { eventId });
      
      // Get event to retrieve client credentials
      const event = await storage.getEvent(eventId);
      if (!event) {
        logger.error('Event not found after state validation', { eventId });
        return sendErrorResponse(
          res, 404, 
          "Event not found", 
          "EVENT_NOT_FOUND",
          `Event with ID ${eventId} no longer exists`
        );
      }
      
      // Use event-specific credentials or fall back to environment variables
      const clientId = event.gmailClientId || process.env.GMAIL_CLIENT_ID;
      const clientSecret = event.gmailClientSecret || process.env.GMAIL_CLIENT_SECRET;
      const redirectUri = event.gmailRedirectUri || DEFAULT_GMAIL_REDIRECT_URI;
      
      logger.debug('Gmail callback credential check', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        redirectUri
      });
      
      if (!clientId || !clientSecret) {
        logger.error('Gmail OAuth credentials not configured properly', { eventId });
        return sendErrorResponse(
          res, 500, 
          "Gmail OAuth credentials not configured properly", 
          "INVALID_CREDENTIALS",
          "Please check your event settings and ensure both Client ID and Client Secret are provided."
        );
      }
      
      try {
        logger.debug('Exchanging code for tokens');
        
        // Exchange the authorization code for tokens
        const tokenResponse = await exchangeToken<any>(
          "https://oauth2.googleapis.com/token",
          {
            code: code as string,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }
        );
        
        logger.info('Successfully exchanged code for tokens', {
          hasAccessToken: !!tokenResponse.access_token,
          hasRefreshToken: !!tokenResponse.refresh_token,
          expiresIn: tokenResponse.expires_in
        });
        
        const { access_token, refresh_token, expires_in } = tokenResponse;
        
        if (!access_token || !refresh_token) {
          logger.error('Missing tokens in response', {
            hasAccessToken: !!access_token,
            hasRefreshToken: !!refresh_token
          });
          
          return sendErrorResponse(
            res, 500, 
            "Failed to retrieve necessary tokens from Google", 
            "MISSING_TOKENS",
            "The OAuth response from Google did not include the required tokens"
          );
        }
        
        try {
          logger.debug('Fetching user info with access token');
          
          // Get user's email from Google using our authenticated request helper
          const userInfoResponse = await makeAuthenticatedRequest<any>(
            "https://www.googleapis.com/userinfo/v2/me",
            access_token
          );
          
          const email = userInfoResponse.email;
          
          if (!email) {
            logger.error('No email returned from Google API');
            return sendErrorResponse(
              res, 500, 
              "Failed to retrieve email from Google profile", 
              "MISSING_EMAIL",
              "Your Google account profile did not return an email address"
            );
          }
          
          logger.info('Successfully retrieved user email', { email });
          
          // Store the encrypted tokens in the database
          logger.debug('Updating event email config with encrypted tokens');
          
          await storage.updateEventEmailConfig(eventId, {
            gmailAccount: email,
            gmailAccessToken: encryptOAuthData(access_token),
            gmailRefreshToken: encryptOAuthData(refresh_token),
            gmailTokenExpiry: new Date(Date.now() + expires_in * 1000),
            useGmail: true,
          });
          
          logger.info('Gmail authentication completed successfully');
          
          // Return success with the authenticated email
          res.json({ 
            success: true, 
            provider: "gmail", 
            email,
            message: "Gmail account successfully connected" 
          });
        } catch (userInfoError) {
          logger.error('Error fetching Gmail user info', userInfoError as Error);
          
          sendErrorResponse(
            res, 500, 
            "Failed to retrieve user info from Google", 
            "USER_INFO_ERROR",
            "Could not fetch your user profile information from Google",
            userInfoError
          );
        }
      } catch (tokenError: any) {
        logger.error('Error exchanging code for Gmail tokens', tokenError);
        
        // Check for specific Google error responses
        if (tokenError.response?.data?.error) {
          logger.error('Google API error', { 
            error: tokenError.response.data.error,
            description: tokenError.response.data.error_description
          });
          
          sendErrorResponse(
            res, 500, 
            `Google API error: ${tokenError.response.data.error}`, 
            "GOOGLE_API_ERROR",
            tokenError.response.data.error_description || 
              'Check redirect URI matches the one configured in Google Cloud Console',
            tokenError
          );
        } else {
          sendErrorResponse(
            res, 500, 
            "Failed to exchange authorization code for tokens", 
            "TOKEN_EXCHANGE_ERROR",
            "Error occurred while exchanging the authorization code for tokens",
            tokenError
          );
        }
      }
    } catch (error) {
      logger.error('Gmail OAuth callback error', error as Error);
      
      sendErrorResponse(
        res, 500, 
        "Failed to complete Gmail authorization", 
        "CALLBACK_ERROR",
        "An unexpected error occurred during Gmail authorization",
        error
      );
    }
  }
);

// Outlook OAuth Authorization Route
router.get(
  "/outlook/authorize", 
  isAuthenticated, 
  isAdmin,
  authorizationLimiter,
  async (req: Request, res: Response) => {
    const eventId = parseInt(req.query.eventId as string);
    const logger = createOAuthLogger(eventId, 'outlook', 'authorize');
    
    logger.request('Outlook authorization request received', req);
    
    try {
      // Validate event ID
      if (isNaN(eventId)) {
        logger.warn('Invalid event ID provided', { eventId: req.query.eventId });
        return sendErrorResponse(
          res, 400, 
          "Invalid event ID", 
          "INVALID_EVENT_ID",
          "The event ID provided must be a valid number"
        );
      }
      
      // Get event details
      const event = await storage.getEvent(eventId);
      if (!event) {
        logger.warn('Event not found', { eventId });
        return sendErrorResponse(
          res, 404, 
          "Event not found", 
          "EVENT_NOT_FOUND",
          `No event exists with ID ${eventId}`
        );
      }
      
      logger.info('Retrieved event for Outlook authorization', { 
        eventId: event.id,
        eventTitle: event.title
      });
      
      // Use event-specific credentials or fall back to environment variables
      const clientId = event.outlookClientId || process.env.OUTLOOK_CLIENT_ID;
      const redirectUri = event.outlookRedirectUri || DEFAULT_OUTLOOK_REDIRECT_URI;
      
      logger.debug('Outlook credentials check', {
        hasEventClientId: !!event.outlookClientId,
        hasEnvClientId: !!process.env.OUTLOOK_CLIENT_ID,
        hasClientId: !!clientId,
        redirectUri
      });
      
      // Validate required credentials
      if (!clientId) {
        logger.warn('Outlook client ID not configured', { eventId });
        return sendErrorResponse(
          res, 400, 
          "Outlook client ID not configured", 
          "MISSING_CLIENT_ID",
          "You need to save Outlook OAuth credentials in your event settings before configuring the connection. Please enter your Client ID and Client Secret, then save your changes."
        );
      }
      
      // Generate secure state parameter
      const state = generateOAuthState('outlook', eventId);
      
      // Build the authorization URL
      const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
      authUrl.searchParams.append("client_id", clientId);
      authUrl.searchParams.append("redirect_uri", redirectUri);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("scope", OUTLOOK_SCOPES.join(" "));
      authUrl.searchParams.append("state", state);
      
      logger.info('Generated Outlook authorization URL', { 
        hasState: !!state,
        authUrl: authUrl.toString().substring(0, 100) + '...'
      });
      
      // Return the authorization URL
      res.json({ 
        success: true,
        authUrl: authUrl.toString() 
      });
    } catch (error) {
      logger.error('Outlook authorization error', error as Error);
      
      sendErrorResponse(
        res, 500, 
        "Failed to initiate Outlook authorization", 
        "AUTHORIZATION_ERROR",
        "An unexpected error occurred while setting up Outlook authorization",
        error
      );
    }
  }
);

// Outlook OAuth Callback Route
router.get(
  "/outlook/callback", 
  isAuthenticated, 
  isAdmin,
  callbackLimiter,
  async (req: Request, res: Response) => {
    const logger = createOAuthLogger(undefined, 'outlook', 'callback');
    logger.request('Outlook callback request received', req);
    
    try {
      const { code, state } = req.query;
      
      // Validate authorization code
      if (!code) {
        logger.warn('Missing authorization code in callback');
        return sendErrorResponse(
          res, 400, 
          "Missing authorization code", 
          "MISSING_CODE",
          "The authorization code was not received from Microsoft"
        );
      }
      
      // Validate and decode state
      const stateData = verifyOAuthState(state as string);
      if (!stateData || stateData.provider !== 'outlook') {
        logger.warn('Invalid or expired OAuth state', { 
          hasState: !!state,
          stateValid: !!stateData,
          provider: stateData?.provider
        });
        
        return sendErrorResponse(
          res, 400, 
          "Invalid or expired OAuth state", 
          "INVALID_STATE",
          "Your authorization session has expired or is invalid. Please try again."
        );
      }
      
      const { eventId } = stateData;
      logger.info('Valid state for Outlook callback', { eventId });
      
      // Get event to retrieve client credentials
      const event = await storage.getEvent(eventId);
      if (!event) {
        logger.error('Event not found after state validation', { eventId });
        return sendErrorResponse(
          res, 404, 
          "Event not found", 
          "EVENT_NOT_FOUND",
          `Event with ID ${eventId} no longer exists`
        );
      }
      
      // Use event-specific credentials or fall back to environment variables
      const clientId = event.outlookClientId || process.env.OUTLOOK_CLIENT_ID;
      const clientSecret = event.outlookClientSecret || process.env.OUTLOOK_CLIENT_SECRET;
      const redirectUri = event.outlookRedirectUri || DEFAULT_OUTLOOK_REDIRECT_URI;
      
      logger.debug('Outlook callback credential check', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        redirectUri
      });
      
      if (!clientId || !clientSecret) {
        logger.error('Outlook OAuth credentials not configured properly', { eventId });
        return sendErrorResponse(
          res, 500, 
          "Outlook OAuth credentials not configured properly", 
          "INVALID_CREDENTIALS",
          "Please check your event settings and ensure both Client ID and Client Secret are provided."
        );
      }
      
      try {
        logger.debug('Exchanging code for tokens');
        
        // Exchange the authorization code for tokens
        const tokenResponse = await exchangeToken<any>(
          "https://login.microsoftonline.com/common/oauth2/v2.0/token",
          {
            code: code as string,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }
        );
        
        logger.info('Successfully exchanged code for tokens', {
          hasAccessToken: !!tokenResponse.access_token,
          hasRefreshToken: !!tokenResponse.refresh_token,
          expiresIn: tokenResponse.expires_in
        });
        
        const { access_token, refresh_token, expires_in } = tokenResponse;
        
        if (!access_token || !refresh_token) {
          logger.error('Missing tokens in response', {
            hasAccessToken: !!access_token,
            hasRefreshToken: !!refresh_token
          });
          
          return sendErrorResponse(
            res, 500, 
            "Failed to retrieve necessary tokens from Microsoft", 
            "MISSING_TOKENS",
            "The OAuth response from Microsoft did not include the required tokens"
          );
        }
        
        try {
          logger.debug('Fetching user info with access token');
          
          // Get user's email from Microsoft
          const userInfoResponse = await makeAuthenticatedRequest<any>(
            "https://graph.microsoft.com/v1.0/me",
            access_token
          );
          
          const email = userInfoResponse.mail || userInfoResponse.userPrincipalName;
          
          if (!email) {
            logger.error('No email returned from Microsoft Graph API');
            return sendErrorResponse(
              res, 500, 
              "Failed to retrieve email from Microsoft profile", 
              "MISSING_EMAIL",
              "Your Microsoft account profile did not return an email address"
            );
          }
          
          logger.info('Successfully retrieved user email', { email });
          
          // Store the encrypted tokens in the database
          logger.debug('Updating event email config with encrypted tokens');
          
          await storage.updateEventEmailConfig(eventId, {
            outlookAccount: email,
            outlookAccessToken: encryptOAuthData(access_token),
            outlookRefreshToken: encryptOAuthData(refresh_token),
            outlookTokenExpiry: new Date(Date.now() + expires_in * 1000),
            useOutlook: true,
          });
          
          logger.info('Outlook authentication completed successfully');
          
          // Return success with the authenticated email
          res.json({ 
            success: true, 
            provider: "outlook", 
            email,
            message: "Outlook account successfully connected" 
          });
        } catch (userInfoError) {
          logger.error('Error fetching Outlook user info', userInfoError as Error);
          
          sendErrorResponse(
            res, 500, 
            "Failed to retrieve user info from Microsoft", 
            "USER_INFO_ERROR",
            "Could not fetch your user profile information from Microsoft",
            userInfoError
          );
        }
      } catch (tokenError: any) {
        logger.error('Error exchanging code for Outlook tokens', tokenError);
        
        // Check for specific Microsoft error responses
        if (tokenError.response?.data?.error) {
          logger.error('Microsoft API error', { 
            error: tokenError.response.data.error,
            description: tokenError.response.data.error_description
          });
          
          sendErrorResponse(
            res, 500, 
            `Microsoft API error: ${tokenError.response.data.error}`, 
            "MICROSOFT_API_ERROR",
            tokenError.response.data.error_description || 
              'Check redirect URI matches the one configured in Azure portal',
            tokenError
          );
        } else {
          sendErrorResponse(
            res, 500, 
            "Failed to exchange authorization code for tokens", 
            "TOKEN_EXCHANGE_ERROR",
            "Error occurred while exchanging the authorization code for tokens",
            tokenError
          );
        }
      }
    } catch (error) {
      logger.error('Outlook OAuth callback error', error as Error);
      
      sendErrorResponse(
        res, 500, 
        "Failed to complete Outlook authorization", 
        "CALLBACK_ERROR",
        "An unexpected error occurred during Outlook authorization",
        error
      );
    }
  }
);

// Helper route to check OAuth connection status
router.get(
  "/status/:provider", 
  isAuthenticated, 
  isAdmin,
  async (req: Request, res: Response) => {
    const provider = req.params.provider;
    const eventId = parseInt(req.query.eventId as string);
    const logger = createOAuthLogger(eventId, provider, 'status-check');
    
    logger.request('OAuth status check request received', req);
    
    try {
      // Validate provider
      if (provider !== 'gmail' && provider !== 'outlook') {
        logger.warn('Invalid provider specified', { provider });
        return sendErrorResponse(
          res, 400, 
          "Invalid provider", 
          "INVALID_PROVIDER",
          "Provider must be either 'gmail' or 'outlook'"
        );
      }
      
      // Validate event ID
      if (isNaN(eventId)) {
        logger.warn('Invalid event ID provided', { eventId: req.query.eventId });
        return sendErrorResponse(
          res, 400, 
          "Invalid event ID", 
          "INVALID_EVENT_ID",
          "The event ID provided must be a valid number"
        );
      }
      
      // Get event details
      const event = await storage.getEvent(eventId);
      if (!event) {
        logger.warn('Event not found', { eventId });
        return sendErrorResponse(
          res, 404, 
          "Event not found", 
          "EVENT_NOT_FOUND",
          `No event exists with ID ${eventId}`
        );
      }
      
      let isConfigured = false;
      let account = '';
      let tokenExpired = true;
      
      if (provider === 'gmail') {
        isConfigured = !!event.gmailRefreshToken;
        account = event.gmailAccount || '';
        tokenExpired = isTokenExpired(event.gmailTokenExpiry);
      } else if (provider === 'outlook') {
        isConfigured = !!event.outlookRefreshToken;
        account = event.outlookAccount || '';
        tokenExpired = isTokenExpired(event.outlookTokenExpiry);
      }
      
      logger.info('OAuth status check completed', {
        provider,
        isConfigured,
        hasAccount: !!account,
        tokenExpired
      });
      
      // Return the status
      res.json({
        success: true,
        provider,
        isConfigured,
        account: account || null,
        tokenExpired,
        needsReauthorization: isConfigured && tokenExpired
      });
    } catch (error) {
      logger.error('OAuth status check error', error as Error);
      
      sendErrorResponse(
        res, 500, 
        `Failed to check ${provider} status`, 
        "STATUS_CHECK_ERROR",
        "An unexpected error occurred while checking the OAuth status",
        error
      );
    }
  }
);

// OAuth token refresh route
router.post(
  "/refresh/:provider", 
  isAuthenticated, 
  isAdmin,
  async (req: Request, res: Response) => {
    const provider = req.params.provider;
    const eventId = parseInt(req.body.eventId as string);
    const logger = createOAuthLogger(eventId, provider, 'token-refresh');
    
    logger.request('OAuth token refresh request received', req);
    
    try {
      // Validate provider
      if (provider !== 'gmail' && provider !== 'outlook') {
        logger.warn('Invalid provider specified', { provider });
        return sendErrorResponse(
          res, 400, 
          "Invalid provider", 
          "INVALID_PROVIDER",
          "Provider must be either 'gmail' or 'outlook'"
        );
      }
      
      // Validate event ID
      if (isNaN(eventId)) {
        logger.warn('Invalid event ID provided', { eventId: req.body.eventId });
        return sendErrorResponse(
          res, 400, 
          "Invalid event ID", 
          "INVALID_EVENT_ID",
          "The event ID provided must be a valid number"
        );
      }
      
      // Get event details
      const event = await storage.getEvent(eventId);
      if (!event) {
        logger.warn('Event not found', { eventId });
        return sendErrorResponse(
          res, 404, 
          "Event not found", 
          "EVENT_NOT_FOUND",
          `No event exists with ID ${eventId}`
        );
      }
      
      // Different token refresh logic based on provider
      if (provider === 'gmail') {
        try {
          if (!event.gmailRefreshToken) {
            logger.warn('No refresh token available for Gmail', { eventId });
            return sendErrorResponse(
              res, 400, 
              "Gmail not configured", 
              "NOT_CONFIGURED",
              "Gmail OAuth has not been configured for this event"
            );
          }
          
          // Decrypt the refresh token
          const refreshToken = decryptOAuthData(event.gmailRefreshToken);
          if (!refreshToken) {
            logger.error('Failed to decrypt Gmail refresh token', { eventId });
            return sendErrorResponse(
              res, 500, 
              "Failed to decrypt refresh token", 
              "DECRYPTION_ERROR",
              "Could not decrypt the stored refresh token"
            );
          }
          
          // Get client credentials
          const clientId = event.gmailClientId || process.env.GMAIL_CLIENT_ID;
          const clientSecret = event.gmailClientSecret || process.env.GMAIL_CLIENT_SECRET;
          
          if (!clientId || !clientSecret) {
            logger.error('Missing Gmail client credentials for token refresh', { eventId });
            return sendErrorResponse(
              res, 400, 
              "Missing Gmail client credentials", 
              "MISSING_CREDENTIALS",
              "Client ID and Client Secret are required for token refresh"
            );
          }
          
          logger.debug('Refreshing Gmail access token');
          
          // Exchange refresh token for a new access token
          const tokenResponse = await exchangeToken<any>(
            "https://oauth2.googleapis.com/token",
            {
              client_id: clientId,
              client_secret: clientSecret,
              refresh_token: refreshToken,
              grant_type: "refresh_token",
            }
          );
          
          const { access_token, expires_in } = tokenResponse;
          
          if (!access_token) {
            logger.error('No access token in Gmail refresh response');
            return sendErrorResponse(
              res, 500, 
              "Failed to refresh Gmail access token", 
              "REFRESH_FAILED",
              "The token refresh response did not include an access token"
            );
          }
          
          logger.info('Successfully refreshed Gmail access token', {
            expiresIn: expires_in
          });
          
          // Update token in database with encryption
          await storage.updateEventEmailConfig(eventId, {
            gmailAccessToken: encryptOAuthData(access_token),
            gmailTokenExpiry: new Date(Date.now() + expires_in * 1000),
          });
          
          // Return success
          res.json({
            success: true,
            provider: 'gmail',
            message: 'Gmail access token refreshed successfully',
            expiresAt: new Date(Date.now() + expires_in * 1000).toISOString()
          });
        } catch (error) {
          logger.error('Gmail token refresh error', error as Error);
          
          sendErrorResponse(
            res, 500, 
            "Failed to refresh Gmail token", 
            "REFRESH_ERROR",
            "An error occurred while refreshing the Gmail access token",
            error
          );
        }
      } 
      else if (provider === 'outlook') {
        try {
          if (!event.outlookRefreshToken) {
            logger.warn('No refresh token available for Outlook', { eventId });
            return sendErrorResponse(
              res, 400, 
              "Outlook not configured", 
              "NOT_CONFIGURED",
              "Outlook OAuth has not been configured for this event"
            );
          }
          
          // Decrypt the refresh token
          const refreshToken = decryptOAuthData(event.outlookRefreshToken);
          if (!refreshToken) {
            logger.error('Failed to decrypt Outlook refresh token', { eventId });
            return sendErrorResponse(
              res, 500, 
              "Failed to decrypt refresh token", 
              "DECRYPTION_ERROR",
              "Could not decrypt the stored refresh token"
            );
          }
          
          // Get client credentials
          const clientId = event.outlookClientId || process.env.OUTLOOK_CLIENT_ID;
          const clientSecret = event.outlookClientSecret || process.env.OUTLOOK_CLIENT_SECRET;
          
          if (!clientId || !clientSecret) {
            logger.error('Missing Outlook client credentials for token refresh', { eventId });
            return sendErrorResponse(
              res, 400, 
              "Missing Outlook client credentials", 
              "MISSING_CREDENTIALS",
              "Client ID and Client Secret are required for token refresh"
            );
          }
          
          logger.debug('Refreshing Outlook access token');
          
          // Exchange refresh token for a new access token
          const tokenResponse = await exchangeToken<any>(
            "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            {
              client_id: clientId,
              client_secret: clientSecret,
              refresh_token: refreshToken,
              grant_type: "refresh_token",
              scope: OUTLOOK_SCOPES.join(" ")
            }
          );
          
          const { access_token, expires_in, refresh_token: new_refresh_token } = tokenResponse;
          
          if (!access_token) {
            logger.error('No access token in Outlook refresh response');
            return sendErrorResponse(
              res, 500, 
              "Failed to refresh Outlook access token", 
              "REFRESH_FAILED",
              "The token refresh response did not include an access token"
            );
          }
          
          logger.info('Successfully refreshed Outlook access token', {
            expiresIn: expires_in,
            hasNewRefreshToken: !!new_refresh_token
          });
          
          // Update tokens in database with encryption
          // Note: Microsoft might issue a new refresh token too
          const updateData: any = {
            outlookAccessToken: encryptOAuthData(access_token),
            outlookTokenExpiry: new Date(Date.now() + expires_in * 1000),
          };
          
          // If a new refresh token was provided, update it
          if (new_refresh_token) {
            updateData.outlookRefreshToken = encryptOAuthData(new_refresh_token);
          }
          
          await storage.updateEventEmailConfig(eventId, updateData);
          
          // Return success
          res.json({
            success: true,
            provider: 'outlook',
            message: 'Outlook access token refreshed successfully',
            expiresAt: new Date(Date.now() + expires_in * 1000).toISOString()
          });
        } catch (error) {
          logger.error('Outlook token refresh error', error as Error);
          
          sendErrorResponse(
            res, 500, 
            "Failed to refresh Outlook token", 
            "REFRESH_ERROR",
            "An error occurred while refreshing the Outlook access token",
            error
          );
        }
      }
    } catch (error) {
      logger.error('OAuth token refresh general error', error as Error);
      
      sendErrorResponse(
        res, 500, 
        `Failed to refresh ${provider} token`, 
        "REFRESH_ERROR",
        "An unexpected error occurred during token refresh",
        error
      );
    }
  }
);

export default router;