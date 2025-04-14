import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import axios from "axios";
import { randomBytes } from "crypto";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Please log in again' });
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden' });
};

const router = Router();

// OAuth state management to prevent CSRF attacks
const stateCache = new Map<string, { provider: string; eventId: number; expiresAt: number }>();

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

// Start Gmail OAuth flow
router.get("/gmail/authorize", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.query.eventId as string);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Get event details to retrieve OAuth credentials
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Use event-specific credentials or fall back to environment variables
    const clientId = event.gmailClientId || process.env.GMAIL_CLIENT_ID;
    const redirectUri = event.gmailRedirectUri || DEFAULT_GMAIL_REDIRECT_URI;

    // Validate required credentials
    if (!clientId) {
      return res.status(500).json({ 
        message: "Gmail client ID not configured. Please configure OAuth credentials in event settings." 
      });
    }

    // Generate and store a state parameter to prevent CSRF
    const state = randomBytes(16).toString("hex");
    stateCache.set(state, {
      provider: "gmail",
      eventId,
      expiresAt: Date.now() + 10 * 60 * 1000, // Expires in 10 minutes
    });

    // Build the authorization URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", GMAIL_SCOPES.join(" "));
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");
    authUrl.searchParams.append("state", state);

    // Return the authorization URL
    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Gmail OAuth initiation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      message: "Failed to initiate Gmail authorization", 
      error: errorMessage 
    });
  }
});

// Gmail OAuth callback handler
router.get("/gmail/callback", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    // Validate state to prevent CSRF
    const stateData = stateCache.get(state as string);
    if (!stateData || stateData.provider !== "gmail" || stateData.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OAuth state" });
    }
    
    // Clear the used state
    stateCache.delete(state as string);
    
    // Get event to retrieve client credentials
    const event = await storage.getEvent(stateData.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Use event-specific credentials or fall back to environment variables
    const clientId = event.gmailClientId || process.env.GMAIL_CLIENT_ID;
    const clientSecret = event.gmailClientSecret || process.env.GMAIL_CLIENT_SECRET;
    const redirectUri = event.gmailRedirectUri || DEFAULT_GMAIL_REDIRECT_URI;
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({ 
        message: "Gmail OAuth credentials not configured properly" 
      });
    }
    
    // Exchange the authorization code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Get user's email from Google
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    
    const email = userInfoResponse.data.email;
    
    // Store the tokens in your database
    await storage.updateEventEmailConfig(stateData.eventId, {
      gmailAccount: email,
      gmailAccessToken: access_token,
      gmailRefreshToken: refresh_token,
      gmailTokenExpiry: new Date(Date.now() + expires_in * 1000),
      useGmail: true,
    });
    
    // Return success with the authenticated email
    res.json({ 
      success: true, 
      provider: "gmail", 
      email,
      message: "Gmail account successfully connected" 
    });
  } catch (error) {
    console.error("Gmail OAuth callback error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: "Failed to complete Gmail authorization", error: errorMessage });
  }
});

// Start Outlook OAuth flow
router.get("/outlook/authorize", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.query.eventId as string);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Get event details to retrieve OAuth credentials
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Use event-specific credentials or fall back to environment variables
    const clientId = event.outlookClientId || process.env.OUTLOOK_CLIENT_ID;
    const redirectUri = event.outlookRedirectUri || DEFAULT_OUTLOOK_REDIRECT_URI;

    // Validate required credentials
    if (!clientId) {
      return res.status(500).json({ 
        message: "Outlook client ID not configured. Please configure OAuth credentials in event settings." 
      });
    }

    // Generate and store a state parameter to prevent CSRF
    const state = randomBytes(16).toString("hex");
    stateCache.set(state, {
      provider: "outlook",
      eventId,
      expiresAt: Date.now() + 10 * 60 * 1000, // Expires in 10 minutes
    });

    // Build the authorization URL
    const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", OUTLOOK_SCOPES.join(" "));
    authUrl.searchParams.append("state", state);

    // Return the authorization URL
    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Outlook OAuth initiation error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ 
      message: "Failed to initiate Outlook authorization", 
      error: errorMessage 
    });
  }
});

// Outlook OAuth callback handler
router.get("/outlook/callback", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    // Validate state to prevent CSRF
    const stateData = stateCache.get(state as string);
    if (!stateData || stateData.provider !== "outlook" || stateData.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OAuth state" });
    }
    
    // Clear the used state
    stateCache.delete(state as string);
    
    // Get event to retrieve client credentials
    const event = await storage.getEvent(stateData.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Use event-specific credentials or fall back to environment variables
    const clientId = event.outlookClientId || process.env.OUTLOOK_CLIENT_ID;
    const clientSecret = event.outlookClientSecret || process.env.OUTLOOK_CLIENT_SECRET;
    const redirectUri = event.outlookRedirectUri || DEFAULT_OUTLOOK_REDIRECT_URI;
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({ 
        message: "Outlook OAuth credentials not configured properly" 
      });
    }
    
    // Exchange the authorization code for tokens
    const tokenResponse = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Get user's email from Microsoft Graph API
    const userInfoResponse = await axios.get(
      "https://graph.microsoft.com/v1.0/me",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    
    const email = userInfoResponse.data.mail || userInfoResponse.data.userPrincipalName;
    
    // Store the tokens in your database
    await storage.updateEventEmailConfig(stateData.eventId, {
      outlookAccount: email,
      outlookAccessToken: access_token,
      outlookRefreshToken: refresh_token,
      outlookTokenExpiry: new Date(Date.now() + expires_in * 1000),
      useOutlook: true,
    });
    
    // Return success with the authenticated email
    res.json({ 
      success: true, 
      provider: "outlook", 
      email,
      message: "Outlook account successfully connected" 
    });
  } catch (error) {
    console.error("Outlook OAuth callback error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: "Failed to complete Outlook authorization", error: errorMessage });
  }
});

// Token refresh utility
router.post("/refresh-token", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { provider, eventId } = req.body;
    
    if (!eventId || !provider) {
      return res.status(400).json({ message: "Missing provider or event ID" });
    }
    
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    if (provider === "gmail") {
      // Refresh Gmail token
      if (!event.gmailRefreshToken) {
        return res.status(400).json({ message: "No Gmail refresh token available" });
      }
      
      // Use event-specific credentials or fall back to environment variables
      const clientId = event.gmailClientId || process.env.GMAIL_CLIENT_ID;
      const clientSecret = event.gmailClientSecret || process.env.GMAIL_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.status(500).json({ 
          message: "Gmail OAuth credentials not configured properly" 
        });
      }
      
      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: event.gmailRefreshToken,
          grant_type: "refresh_token",
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      
      const { access_token, expires_in } = response.data;
      
      await storage.updateEventEmailConfig(eventId, {
        gmailAccessToken: access_token,
        gmailTokenExpiry: new Date(Date.now() + expires_in * 1000),
      });
      
      return res.json({ success: true, message: "Gmail token refreshed successfully" });
    } else if (provider === "outlook") {
      // Refresh Outlook token
      if (!event.outlookRefreshToken) {
        return res.status(400).json({ message: "No Outlook refresh token available" });
      }
      
      // Use event-specific credentials or fall back to environment variables
      const clientId = event.outlookClientId || process.env.OUTLOOK_CLIENT_ID;
      const clientSecret = event.outlookClientSecret || process.env.OUTLOOK_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.status(500).json({ 
          message: "Outlook OAuth credentials not configured properly" 
        });
      }
      
      const response = await axios.post(
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: event.outlookRefreshToken,
          grant_type: "refresh_token",
          scope: OUTLOOK_SCOPES.join(" "),
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      
      const { access_token, refresh_token, expires_in } = response.data;
      
      await storage.updateEventEmailConfig(eventId, {
        outlookAccessToken: access_token,
        outlookRefreshToken: refresh_token, // Microsoft may issue a new refresh token
        outlookTokenExpiry: new Date(Date.now() + expires_in * 1000),
      });
      
      return res.json({ success: true, message: "Outlook token refreshed successfully" });
    } else {
      return res.status(400).json({ message: "Invalid provider" });
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: "Failed to refresh token", error: errorMessage });
  }
});

export default router;