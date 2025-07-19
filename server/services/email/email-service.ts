import nodemailer from 'nodemailer';
import { MailService } from '@sendgrid/mail';

/**
 * Unified Email Service
 * Handles email sending across multiple providers
 */

export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailProvider {
  type: 'smtp' | 'sendgrid' | 'gmail' | 'outlook';
  config: {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
    apiKey?: string;
    from?: string;
  };
}

export class EmailService {
  private providers: Map<string, EmailProvider> = new Map();
  private sendGridService: MailService | null = null;

  constructor() {
    this.initializeSendGrid();
  }

  /**
   * Initialize SendGrid service
   */
  private initializeSendGrid() {
    if (process.env.SENDGRID_API_KEY) {
      this.sendGridService = new MailService();
      this.sendGridService.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  /**
   * Add email provider configuration
   */
  addProvider(providerId: string, provider: EmailProvider) {
    this.providers.set(providerId, provider);
  }

  /**
   * Send email using specified provider
   */
  async sendEmail(message: EmailMessage, providerId?: string): Promise<boolean> {
    try {
      // Use SendGrid if available and no specific provider requested
      if (!providerId && this.sendGridService) {
        return await this.sendViaSendGrid(message);
      }

      // Use specific provider if configured
      if (providerId && this.providers.has(providerId)) {
        const provider = this.providers.get(providerId)!;
        return await this.sendViaProvider(message, provider);
      }

      // Fallback to SMTP if configured
      if (process.env.SMTP_HOST) {
        return await this.sendViaSMTP(message);
      }

      
      return false;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Send email via SendGrid
   */
  private async sendViaSendGrid(message: EmailMessage): Promise<boolean> {
    if (!this.sendGridService) {
      
      return false;
    }

    try {
      await this.sendGridService.send({
        to: message.to,
        from: message.from,
        subject: message.subject,
        text: message.text,
        html: message.html,
        cc: message.cc,
        bcc: message.bcc,
      });

      
      return true;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Send email via SMTP
   */
  private async sendViaSMTP(message: EmailMessage): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        } : undefined,
      });

      const info = await transporter.sendMail({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        cc: message.cc,
        bcc: message.bcc,
      });

      
      return true;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Send email via specific provider
   */
  private async sendViaProvider(message: EmailMessage, provider: EmailProvider): Promise<boolean> {
    switch (provider.type) {
      case 'smtp':
        return await this.sendViaSMTPProvider(message, provider.config);
      case 'sendgrid':
        return await this.sendViaSendGridProvider(message, provider.config);
      case 'gmail':
        return await this.sendViaGmail(message, provider.config);
      case 'outlook':
        return await this.sendViaOutlook(message, provider.config);
      default:
        
        return false;
    }
  }

  /**
   * Send email via SMTP provider with custom config
   */
  private async sendViaSMTPProvider(message: EmailMessage, config: any): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port || 587,
        secure: config.secure || false,
        auth: config.auth ? {
          user: config.auth.user,
          pass: config.auth.pass,
        } : undefined,
      });

      const info = await transporter.sendMail({
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        cc: message.cc,
        bcc: message.bcc,
      });

      
      return true;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Send email via SendGrid with custom config
   */
  private async sendViaSendGridProvider(message: EmailMessage, config: any): Promise<boolean> {
    try {
      const sgMail = new MailService();
      sgMail.setApiKey(config.apiKey);

      await sgMail.send({
        to: message.to,
        from: message.from,
        subject: message.subject,
        text: message.text,
        html: message.html,
        cc: message.cc,
        bcc: message.bcc,
      });

      
      return true;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Send email via Gmail (OAuth)
   */
  private async sendViaGmail(message: EmailMessage, config: any): Promise<boolean> {
    try {
      // TODO: Implement Gmail OAuth email sending
      // This requires Google OAuth setup and gmail API integration
      
      return false;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Send email via Outlook (OAuth)
   */
  private async sendViaOutlook(message: EmailMessage, config: any): Promise<boolean> {
    try {
      // TODO: Implement Outlook OAuth email sending
      // This requires Microsoft Graph API integration
      
      return false;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Test email connection
   */
  async testConnection(providerId?: string): Promise<boolean> {
    try {
      const testMessage: EmailMessage = {
        to: 'test@example.com',
        from: 'noreply@example.com',
        subject: 'Test Connection',
        text: 'This is a test email to verify the connection.',
      };

      // Don't actually send, just test the configuration
      if (providerId && this.providers.has(providerId)) {
        const provider = this.providers.get(providerId)!;
        
        if (provider.type === 'smtp') {
          const transporter = nodemailer.createTransport({
            host: provider.config.host,
            port: provider.config.port || 587,
            secure: provider.config.secure || false,
            auth: provider.config.auth,
          });
          
          await transporter.verify();
          return true;
        }
      }

      // Test SendGrid if available
      if (this.sendGridService) {
        // SendGrid doesn't have a verify method, so we assume it's working if configured
        return true;
      }

      return false;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    const providers: string[] = [];
    
    if (this.sendGridService) {
      providers.push('sendgrid');
    }
    
    if (process.env.SMTP_HOST) {
      providers.push('smtp');
    }
    
    providers.push(...Array.from(this.providers.keys()));
    
    return providers;
  }
}

// Export singleton instance
export const emailService = new EmailService();