import { Resend } from 'resend';
import { Guest, WeddingEvent } from '@shared/schema';
import * as SendGrid from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import axios from 'axios';
import { storage } from '../storage';

/**
 * Email service that supports multiple providers
 * Currently implemented: Gmail, Outlook, SendGrid, Resend
 */
export class EmailService {
  // Provider types we support
  private static readonly PROVIDER_RESEND = 'resend';
  private static readonly PROVIDER_SENDGRID = 'sendgrid';
  private static readonly PROVIDER_GMAIL = 'gmail';
  private static readonly PROVIDER_OUTLOOK = 'outlook';

  private provider: string;
  private apiKey: string | null;
  private resendClient: Resend | null = null;
  private sendGridClient: any = null;
  private nodemailerTransport: any = null;
  private eventId: number;
  private defaultFromEmail: string;
  private eventName: string;
  private event: WeddingEvent | null = null;

  constructor(eventId: number, provider: string, apiKey: string | null = null, defaultFromEmail: string = '', eventName: string = '', event: WeddingEvent | null = null) {
    this.eventId = eventId;
    this.provider = provider.toLowerCase();
    this.apiKey = apiKey;
    this.defaultFromEmail = defaultFromEmail;
    this.eventName = eventName;
    this.event = event;

    // Initialize the appropriate client based on provider
    try {
      if (this.provider === EmailService.PROVIDER_RESEND && this.apiKey) {
        this.resendClient = new Resend(this.apiKey);
        console.log(`Initialized Resend client for event ${eventId}`);
      } 
      else if (this.provider === EmailService.PROVIDER_SENDGRID && this.apiKey) {
        this.sendGridClient = SendGrid;
        this.sendGridClient.setApiKey(this.apiKey);
        console.log(`Initialized SendGrid client for event ${eventId}`);
      }
      else if (this.provider === EmailService.PROVIDER_GMAIL && this.apiKey) {
        try {
          // Use the stored event data for OAuth2 configuration
          if (!this.event) {
            console.warn(`No event data available for Gmail OAuth2 configuration`);
            return;
          }

          // Extract the email address from the formatted email if needed
          let userEmail = defaultFromEmail;
          if (userEmail.includes('<') && userEmail.includes('>')) {
            userEmail = userEmail.match(/<([^>]+)>/)?.[1] || userEmail;
          }
          
          let transport: any;
          
          // Check if we should use OAuth2 or direct SMTP
          if (this.event.useGmailDirectSMTP && this.event.gmailPassword) {
            // Use direct SMTP with password (less secure, but more reliable in some cases)
            transport = {
              service: 'gmail',
              auth: {
                user: userEmail,
                pass: this.event.gmailPassword
              }
            };
            console.log(`Using direct SMTP access for Gmail (less secure but more reliable)`);
          } else {
            // Use OAuth2 (more secure but requires proper OAuth setup)
            const clientId = this.event.gmailClientId || process.env.GMAIL_CLIENT_ID;
            const clientSecret = this.event.gmailClientSecret || process.env.GMAIL_CLIENT_SECRET;
            
            if (!clientId || !clientSecret) {
              console.error("Missing Gmail OAuth credentials. Please check event settings.");
              throw new Error("Gmail OAuth credentials not properly configured");
            }
            
            transport = {
              service: 'gmail',
              auth: {
                type: 'OAuth2',
                user: userEmail,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: this.event.gmailRefreshToken,
                accessToken: this.apiKey
              }
            };
            console.log(`Using OAuth2 authentication for Gmail`);
          }
          
          this.nodemailerTransport = nodemailer.createTransport(transport as any);
          console.log(`Initialized Gmail client for event ${eventId}`);
        } catch (err) {
          console.error(`Failed to initialize Gmail client:`, err);
        }
      }
      else if (this.provider === EmailService.PROVIDER_OUTLOOK && this.apiKey) {
        try {
          // Use the stored event data for Outlook OAuth2 configuration
          if (!this.event) {
            console.warn(`No event data available for Outlook OAuth2 configuration`);
            return;
          }
          
          // Extract the email address from the formatted email if needed
          let userEmail = defaultFromEmail;
          if (userEmail.includes('<') && userEmail.includes('>')) {
            userEmail = userEmail.match(/<([^>]+)>/)?.[1] || userEmail;
          }
          
          const transport = {
            service: 'Outlook365',
            auth: {
              type: 'OAuth2',
              user: userEmail,
              clientId: this.event.outlookClientId || process.env.OUTLOOK_CLIENT_ID,
              clientSecret: this.event.outlookClientSecret || process.env.OUTLOOK_CLIENT_SECRET,
              refreshToken: this.event.outlookRefreshToken,
              accessToken: this.apiKey
            }
          };
          
          this.nodemailerTransport = nodemailer.createTransport(transport as any);
          console.log(`Initialized Outlook client for event ${eventId}`);
        } catch (err) {
          console.error(`Failed to initialize Outlook client:`, err);
        }
      }
    } catch (error) {
      console.error(`Failed to initialize email client for provider ${provider}:`, error);
    }
  }

  /**
   * Check if the email service is configured and ready to use
   */
  public isConfigured(): boolean {
    // Check if we have a from email address
    if (!this.defaultFromEmail) {
      console.warn(`No from email address configured for event ${this.eventId}`);
      return false;
    }

    // Check provider-specific configuration
    if (this.provider === EmailService.PROVIDER_RESEND) {
      return !!this.resendClient;
    }
    else if (this.provider === EmailService.PROVIDER_SENDGRID) {
      return !!this.sendGridClient;
    }
    else if (this.provider === EmailService.PROVIDER_GMAIL) {
      // The transport might be initialized but with incorrect credentials
      // Check if the event data is available
      if (!this.event) {
        console.warn('Gmail email service is not properly configured - missing event data');
        return false;
      }
      
      // For Gmail, we need to check if either direct SMTP or OAuth is properly configured
      if (this.event.useGmailDirectSMTP) {
        // Direct SMTP requires a password
        if (!this.event.gmailPassword) {
          console.warn('Gmail direct SMTP is enabled but no password is configured');
          return false;
        }
      } else {
        // OAuth requires client ID, client secret, and refresh token
        const hasClientId = !!(this.event.gmailClientId || process.env.GMAIL_CLIENT_ID);
        const hasClientSecret = !!(this.event.gmailClientSecret || process.env.GMAIL_CLIENT_SECRET);
        const hasRefreshToken = !!this.event.gmailRefreshToken;
        
        if (!hasClientId || !hasClientSecret || !hasRefreshToken) {
          console.warn(`Gmail OAuth not properly configured - missing credentials: ${!hasClientId ? 'clientId ' : ''}${!hasClientSecret ? 'clientSecret ' : ''}${!hasRefreshToken ? 'refreshToken' : ''}`);
          return false;
        }
      }
      
      return !!this.nodemailerTransport;
    }
    else if (this.provider === EmailService.PROVIDER_OUTLOOK) {
      // Check similar configuration requirements for Outlook
      if (!this.event) {
        console.warn('Outlook email service is not properly configured - missing event data');
        return false;
      }
      
      // OAuth requires client ID, client secret, and refresh token
      const hasClientId = !!(this.event.outlookClientId || process.env.OUTLOOK_CLIENT_ID);
      const hasClientSecret = !!(this.event.outlookClientSecret || process.env.OUTLOOK_CLIENT_SECRET);
      const hasRefreshToken = !!this.event.outlookRefreshToken;
      
      if (!hasClientId || !hasClientSecret || !hasRefreshToken) {
        console.warn(`Outlook OAuth not properly configured - missing credentials: ${!hasClientId ? 'clientId ' : ''}${!hasClientSecret ? 'clientSecret ' : ''}${!hasRefreshToken ? 'refreshToken' : ''}`);
        return false;
      }
      
      return !!this.nodemailerTransport;
    }
    
    console.warn(`Unknown email provider: ${this.provider} for event ${this.eventId}`);
    return false;
  }

  /**
   * Send a simple email
   */
  public async sendEmail(options: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    text?: string;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    const { to, subject, html, text, from } = options;
    const fromEmail = from || this.defaultFromEmail;

    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Email service not properly configured. Check API key and from email.'
      };
    }

    try {
      // Format recipient(s) as an array
      const toAddresses = Array.isArray(to) ? to : [to];
      
      // Handle different providers
      if (this.provider === EmailService.PROVIDER_RESEND) {
        if (!this.resendClient) {
          return { success: false, error: 'Resend client not initialized' };
        }
        
        const response = await this.resendClient.emails.send({
          from: fromEmail,
          to: toAddresses,
          subject,
          html,
          text: text || undefined,
        });

        if (response.error) {
          console.error(`Resend email sending failed: ${response.error.message}`);
          return {
            success: false,
            error: response.error.message
          };
        }

        return {
          success: true,
          id: response.data?.id
        };
      }
      
      else if (this.provider === EmailService.PROVIDER_SENDGRID) {
        if (!this.sendGridClient) {
          return { success: false, error: 'SendGrid client not initialized' };
        }
        
        const msg = {
          to: toAddresses,
          from: fromEmail,
          subject: subject,
          text: text || '',
          html: html,
        };
        
        try {
          const response = await this.sendGridClient.send(msg);
          console.log('SendGrid email sent successfully:', response);
          
          return {
            success: true,
            id: response?.[0]?.headers['x-message-id'] || 'unknown'
          };
        } catch (error: any) {
          console.error('SendGrid email error:', error);
          
          if (error.response) {
            // Extract more detailed error information
            const errorDetails = error.response.body?.errors?.map((err: any) => err.message).join(', ') 
              || error.message;
              
            return {
              success: false,
              error: `SendGrid error: ${errorDetails}`
            };
          }
          
          return {
            success: false,
            error: `SendGrid error: ${error.message}`
          };
        }
      }
      
      else if (this.provider === EmailService.PROVIDER_GMAIL || this.provider === EmailService.PROVIDER_OUTLOOK) {
        if (!this.nodemailerTransport) {
          return { 
            success: false, 
            error: `${this.provider} transport not initialized` 
          };
        }
        
        // For nodemailer, we need to extract the email address from the formatted from string
        // if it's in the format "Name <email@example.com>"
        let fromEmailAddress = fromEmail;
        if (fromEmail.includes('<') && fromEmail.includes('>')) {
          fromEmailAddress = fromEmail.match(/<([^>]+)>/)?.[1] || fromEmail;
        }
        
        try {
          const mailOptions = {
            from: fromEmail,
            to: toAddresses.join(', '),
            subject: subject,
            text: text || '',
            html: html
          };
          
          console.log(`Attempting to send ${this.provider} email with options:`, {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
          });
          
          try {
            const info = await this.nodemailerTransport.sendMail(mailOptions);
            console.log(`${this.provider} email sent successfully:`, {
              messageId: info.messageId,
              response: info.response,
              accepted: info.accepted,
              rejected: info.rejected
            });
            
            return {
              success: true,
              id: info.messageId
            };
          } catch (error) {
            console.error(`${this.provider} email sending failed with detailed error:`, error);
            
            // Check for common OAuth errors
            const errorMessage = (error as any)?.message || '';
            const errorCode = (error as any)?.code || '';
            
            const needsTokenRefresh = 
              errorMessage.includes('invalid_grant') ||
              errorMessage.includes('Invalid login') ||
              errorMessage.includes('invalid access token') ||
              errorCode === 'EAUTH';
            
            if (needsTokenRefresh && this.event) {
              console.log(`Attempting to refresh OAuth token for ${this.provider}...`);
              try {
                const refreshed = await this.refreshOAuthToken();
                if (refreshed) {
                  console.log(`Successfully refreshed ${this.provider} OAuth token, retrying email send`);
                  
                  // Retry sending the email with the refreshed token
                  const retryInfo = await this.nodemailerTransport.sendMail(mailOptions);
                  console.log(`${this.provider} email sent successfully after token refresh:`, {
                    messageId: retryInfo.messageId,
                    response: retryInfo.response
                  });
                  
                  return {
                    success: true,
                    id: retryInfo.messageId
                  };
                }
              } catch (refreshError) {
                console.error(`Failed to refresh OAuth token for ${this.provider}:`, refreshError);
              }
            }
            
            if (errorMessage.includes('invalid_grant')) {
              console.error(`OAuth token for ${this.provider} may have expired or been revoked`);
            }
            
            if (errorCode === 'EAUTH') {
              console.error(`Authentication error with ${this.provider}. Check credentials and OAuth permissions.`);
            }
            
            throw error;
          }
        } catch (error: any) {
          console.error(`${this.provider} email error:`, error);
          
          return {
            success: false,
            error: `${this.provider} error: ${error.message}`
          };
        }
      }

      // If we get here, the provider is not supported
      return {
        success: false,
        error: `Unsupported email provider: ${this.provider}`
      };
    } catch (error: any) {
      console.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message || 'Unknown error sending email'
      };
    }
  }

  /**
   * Send an RSVP form email to a guest
   */
  public async sendRSVPEmail(guest: Guest, event: WeddingEvent, rsvpLink: string): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!guest.email) {
      return {
        success: false,
        error: 'Guest email is required'
      };
    }

    const guestName = `${guest.firstName} ${guest.lastName}`;
    const subject = `RSVP Request for ${event.title}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #9c27b0; text-align: center; padding-bottom: 10px; border-bottom: 1px solid #eee;">
          ${event.title}
        </h2>
        <p>Dear ${guestName},</p>
        <p>
          You are cordially invited to celebrate the wedding of <strong>${event.brideName}</strong> and <strong>${event.groomName}</strong>.
        </p>
        <p>
          <strong>When:</strong> ${event.startDate} to ${event.endDate}<br>
          <strong>Where:</strong> ${event.location}
        </p>
        <p>
          Please let us know if you'll be joining us by clicking the link below to complete your RSVP:
        </p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${rsvpLink}" style="background-color: #9c27b0; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            RSVP Now
          </a>
        </p>
        <p>
          If the button doesn't work, you can copy and paste this link into your browser:<br>
          <a href="${rsvpLink}">${rsvpLink}</a>
        </p>
        <p>
          We look forward to celebrating with you!
        </p>
        <p style="font-style: italic; color: #666;">
          ${event.brideName} & ${event.groomName}
        </p>
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
          This invitation was sent by ${event.title} Wedding RSVP System
        </div>
      </div>
    `;

    const text = `
Dear ${guestName},

You are cordially invited to celebrate the wedding of ${event.brideName} and ${event.groomName}.

When: ${event.startDate} to ${event.endDate}
Where: ${event.location}

Please let us know if you'll be joining us by visiting:
${rsvpLink}

We look forward to celebrating with you!

${event.brideName} & ${event.groomName}
    `;

    return this.sendEmail({
      to: guest.email,
      subject,
      html,
      text
    });
  }

  /**
   * Refresh OAuth token for the current provider
   * Returns true if the token was successfully refreshed
   */
  private async refreshOAuthToken(): Promise<boolean> {
    if (!this.event) {
      console.error('Cannot refresh OAuth token: No event data available');
      return false;
    }

    try {
      if (this.provider === EmailService.PROVIDER_GMAIL) {
        // Refresh Gmail token
        if (!this.event.gmailRefreshToken) {
          console.error('Cannot refresh Gmail token: No refresh token available');
          return false;
        }
        
        // Use event-specific credentials or fall back to environment variables
        const clientId = this.event.gmailClientId || process.env.GMAIL_CLIENT_ID;
        const clientSecret = this.event.gmailClientSecret || process.env.GMAIL_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
          console.error('Cannot refresh Gmail token: OAuth credentials not configured properly');
          return false;
        }
        
        console.log(`Refreshing Gmail token for event ${this.eventId}...`);
        
        const response = await axios.post(
          "https://oauth2.googleapis.com/token",
          new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: this.event.gmailRefreshToken,
            grant_type: "refresh_token",
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        
        const { access_token, expires_in } = response.data;
        
        if (!access_token) {
          console.error('Failed to retrieve access token from Google');
          return false;
        }
        
        // Update the token in the database
        await storage.updateEventEmailConfig(this.eventId, {
          gmailAccessToken: access_token,
          gmailTokenExpiry: new Date(Date.now() + expires_in * 1000),
        });
        
        // Update the current instance
        this.apiKey = access_token;
        
        // Reinitialize the transport with the new token
        const transport = {
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: this.event.gmailAccount,
            clientId,
            clientSecret,
            refreshToken: this.event.gmailRefreshToken,
            accessToken: access_token
          }
        };
        
        this.nodemailerTransport = nodemailer.createTransport(transport as any);
        
        console.log(`Successfully refreshed Gmail token for event ${this.eventId}`);
        return true;
      }
      else if (this.provider === EmailService.PROVIDER_OUTLOOK) {
        // Refresh Outlook token
        if (!this.event.outlookRefreshToken) {
          console.error('Cannot refresh Outlook token: No refresh token available');
          return false;
        }
        
        // Use event-specific credentials or fall back to environment variables
        const clientId = this.event.outlookClientId || process.env.OUTLOOK_CLIENT_ID;
        const clientSecret = this.event.outlookClientSecret || process.env.OUTLOOK_CLIENT_SECRET;
        
        if (!clientId || !clientSecret) {
          console.error('Cannot refresh Outlook token: OAuth credentials not configured properly');
          return false;
        }
        
        console.log(`Refreshing Outlook token for event ${this.eventId}...`);
        
        const response = await axios.post(
          "https://login.microsoftonline.com/common/oauth2/v2.0/token",
          new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: this.event.outlookRefreshToken,
            grant_type: "refresh_token",
            scope: "https://outlook.office.com/SMTP.Send offline_access",
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        
        const { access_token, expires_in, refresh_token } = response.data;
        
        if (!access_token) {
          console.error('Failed to retrieve access token from Microsoft');
          return false;
        }
        
        // Update tokens in the database
        const updateData: any = {
          outlookAccessToken: access_token,
          outlookTokenExpiry: new Date(Date.now() + expires_in * 1000)
        };
        
        // If a new refresh token was provided, update that too
        if (refresh_token) {
          updateData.outlookRefreshToken = refresh_token;
        }
        
        await storage.updateEventEmailConfig(this.eventId, updateData);
        
        // Update the current instance
        this.apiKey = access_token;
        
        // Reinitialize the transport with the new token
        const transport = {
          service: 'Outlook365',
          auth: {
            type: 'OAuth2',
            user: this.event.outlookAccount,
            clientId,
            clientSecret,
            refreshToken: refresh_token || this.event.outlookRefreshToken,
            accessToken: access_token
          }
        };
        
        this.nodemailerTransport = nodemailer.createTransport(transport as any);
        
        console.log(`Successfully refreshed Outlook token for event ${this.eventId}`);
        return true;
      }
      
      console.error(`Token refresh not implemented for provider: ${this.provider}`);
      return false;
    } catch (error) {
      console.error(`Failed to refresh ${this.provider} token:`, error);
      return false;
    }
  }

  /**
   * Create an EmailService instance from an event object
   */
  public static fromEvent(event: WeddingEvent): EmailService {
    if (!event) {
      throw new Error('Event is required to create an email service');
    }

    // Extract email configuration from the event
    const emailProvider = event.emailProvider || 'resend';
    
    // Determine the API key to use based on the event's configuration
    let emailApiKey = null;
    
    // First try the direct API key in the event object
    if (event.emailApiKey) {
      emailApiKey = event.emailApiKey;
      console.log(`Using direct email API key for event ${event.id}`);
    }
    // If Gmail is configured and selected as provider
    else if (event.useGmail && emailProvider === 'gmail') {
      // Check if we're using direct SMTP or OAuth
      if (event.useGmailDirectSMTP) {
        // For direct SMTP, the API key is still null, but we'll use the password stored in the event
        emailApiKey = null; // Not used for direct SMTP
        console.log(`Using Gmail Direct SMTP for event ${event.id}`);
      } 
      // If using OAuth, use the access token
      else if (event.gmailAccessToken) {
        emailApiKey = event.gmailAccessToken;
        console.log(`Using Gmail OAuth token for event ${event.id}`);
      }
    }
    // If Outlook is configured and selected as provider, use Outlook OAuth tokens
    else if (event.useOutlook && emailProvider === 'outlook' && event.outlookAccessToken) {
      emailApiKey = event.outlookAccessToken;
      console.log(`Using Outlook OAuth token for event ${event.id}`);
    }
    // If SendGrid is configured and selected as provider, use SendGrid API key
    else if (event.useSendGrid && emailProvider === 'sendgrid' && event.sendGridApiKey) {
      emailApiKey = event.sendGridApiKey;
      console.log(`Using SendGrid API key for event ${event.id}`);
    }
    // Fallback to environment variables if available
    else if (process.env.RESEND_API_KEY && emailProvider === 'resend') {
      emailApiKey = process.env.RESEND_API_KEY;
      console.log(`Using environment RESEND_API_KEY for event ${event.id}`);
    }
    
    // Special handling for Gmail Direct SMTP - we don't have an API key but it's still valid
    if (!emailApiKey && !(emailProvider === 'gmail' && event.useGmailDirectSMTP)) {
      console.warn(`No email API key found for event ${event.id} with provider ${emailProvider}`);
    }
    
    // Determine from email address
    // Default format is "Wedding of [Couple] <noreply@domain.com>"
    const fromName = `Wedding of ${event.coupleNames}`;
    const fromDomain = event.emailFromDomain || 'example.com';
    const fromEmail = event.emailFromAddress || `noreply@${fromDomain}`;
    const formattedFromEmail = `${fromName} <${fromEmail}>`;

    // Log the email configuration (without API key details for security)
    let configMethod = !!emailApiKey ? "API Key" : "No API Key";
    if (emailProvider === 'gmail' && event.useGmailDirectSMTP) {
      configMethod = "Direct SMTP";
    }

    console.log(`Email service configuration for event ${event.id}:
      - Provider: ${emailProvider}
      - From: ${formattedFromEmail}
      - Configuration Method: ${configMethod}
    `);

    return new EmailService(
      event.id,
      emailProvider,
      emailApiKey,
      formattedFromEmail,
      event.title,
      event
    );
  }
}

/**
 * Get the RSVP link for a guest
 */
export function generateRSVPLink(baseUrl: string, eventId: number, guestId: number, token: string): string {
  return `${baseUrl}/guest-rsvp/${token}`;
}