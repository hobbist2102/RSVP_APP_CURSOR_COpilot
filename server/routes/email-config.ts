import express, { Request, Response } from 'express';
import { db } from '../db';
import { events } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated, isAdmin } from '../middleware';
import { UnifiedEmailService, EmailProvider } from '../services/unified-email';

const router = express.Router();

/**
 * Get email configuration for an event
 */
router.get('/api/events/:eventId/email-config', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Return sanitized config (without sensitive data)
    const config = {
      useGmail: event.useGmail || false,
      useOutlook: event.useOutlook || false,
      useGmailDirectSMTP: event.useGmailDirectSMTP || false,
      
      // Gmail configuration (without secrets)
      gmailClientIdConfigured: !!event.gmailClientId,
      gmailClientSecretConfigured: !!event.gmailClientSecret,
      gmailRedirectUri: event.gmailRedirectUri,
      gmailAccount: event.gmailAccount,
      gmailRefreshTokenConfigured: !!event.gmailRefreshToken,
      
      // Outlook configuration (without secrets)
      outlookClientIdConfigured: !!event.outlookClientId,
      outlookClientSecretConfigured: !!event.outlookClientSecret,
      outlookRedirectUri: event.outlookRedirectUri,
      outlookAccount: event.outlookAccount,
      outlookRefreshTokenConfigured: !!event.outlookRefreshToken,
      
      // SMTP configuration (without password)
      smtpHost: event.smtpHost,
      smtpPort: event.smtpPort,
      smtpUsername: event.smtpUsername,
      smtpSecure: event.smtpSecure,
      
      // General email settings
      emailFromName: event.emailFromName,
      emailFromAddress: event.emailFromAddress,
      emailReplyTo: event.emailReplyTo,
      emailProvider: determineActiveProvider(event),
    };

    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching email configuration:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Update email configuration
 */
router.post('/api/events/:eventId/email-config', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Extract and validate configuration from request body
    const config = req.body;
    
    // Update event with new configuration
    await db.update(events)
      .set({
        // Provider selection
        useGmail: config.useGmail === true,
        useOutlook: config.useOutlook === true,
        useGmailDirectSMTP: config.useGmailDirectSMTP === true,
        
        // Gmail config (only update if provided)
        ...(config.gmailClientId && { gmailClientId: config.gmailClientId }),
        ...(config.gmailClientSecret && { gmailClientSecret: config.gmailClientSecret }),
        ...(config.gmailRedirectUri && { gmailRedirectUri: config.gmailRedirectUri }),
        ...(config.gmailAccount && { gmailAccount: config.gmailAccount }),
        ...(config.gmailPassword && { gmailPassword: config.gmailPassword }),
        
        // Outlook config (only update if provided)
        ...(config.outlookClientId && { outlookClientId: config.outlookClientId }),
        ...(config.outlookClientSecret && { outlookClientSecret: config.outlookClientSecret }),
        ...(config.outlookRedirectUri && { outlookRedirectUri: config.outlookRedirectUri }),
        ...(config.outlookAccount && { outlookAccount: config.outlookAccount }),
        
        // SMTP config (only update if provided)
        ...(config.smtpHost && { smtpHost: config.smtpHost }),
        ...(config.smtpPort && { smtpPort: config.smtpPort }),
        ...(config.smtpUsername && { smtpUsername: config.smtpUsername }),
        ...(config.smtpPassword && { smtpPassword: config.smtpPassword }),
        smtpSecure: config.smtpSecure === true,
        
        // General email settings
        ...(config.emailFromName && { emailFromName: config.emailFromName }),
        ...(config.emailFromAddress && { emailFromAddress: config.emailFromAddress }),
        ...(config.emailReplyTo && { emailReplyTo: config.emailReplyTo }),
      })
      .where(eq(events.id, eventId));

    res.json({ success: true, message: 'Email configuration updated successfully' });
  } catch (error) {
    console.error('Error updating email configuration:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Send a test email
 */
router.post('/api/events/:eventId/test-email', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const { toEmail } = req.body;
    if (!toEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email is required' });
    }

    // Create email service from event configuration
    const emailService = await UnifiedEmailService.fromEvent(eventId);
    if (!emailService) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email service could not be initialized. Please check your configuration.'
      });
    }

    if (!emailService.isReady()) {
      return res.status(400).json({ 
        success: false, 
        message: `Email service is not ready: ${emailService.getLastError() || 'Unknown error'}`
      });
    }

    // Send test email
    const result = await emailService.sendTestEmail(toEmail);
    if (result.success) {
      res.json({ success: true, message: 'Test email sent successfully', messageId: result.messageId });
    } else {
      res.status(400).json({ success: false, message: `Failed to send test email: ${result.error}` });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
  }
});

/**
 * Helper function to determine the active email provider
 */
function determineActiveProvider(event: any): string {
  if (event.useGmail) {
    return event.useGmailDirectSMTP ? 'Gmail (Direct SMTP)' : 'Gmail (OAuth)';
  } else if (event.useOutlook) {
    return 'Outlook (OAuth)';
  } else if (event.smtpHost && event.smtpPort) {
    return 'SMTP';
  }
  return 'Not configured';
}

export default router;