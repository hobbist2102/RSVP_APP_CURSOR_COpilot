import nodemailer from 'nodemailer';
import { storage } from '../storage';

interface AdminEmailConfig {
  id: number;
  provider: string;
  fromEmail: string;
  fromName: string;
  isActive: boolean;
  // OAuth fields
  gmailClientId?: string;
  gmailClientSecret?: string;
  gmailRefreshToken?: string;
  gmailAccessToken?: string;
  outlookClientId?: string;
  outlookClientSecret?: string;
  outlookRefreshToken?: string;
  outlookAccessToken?: string;
  // SMTP fields
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  // SendGrid
  sendgridApiKey?: string;
}

class AdminEmailService {
  private config: AdminEmailConfig | null = null;
  private transporter: any = null;

  async loadConfig(): Promise<AdminEmailConfig | null> {
    try {
      // For now, return a mock config since we don't have the table in storage yet
      // In production, this would fetch from the admin_email_config table
      const mockConfig: AdminEmailConfig = {
        id: 1,
        provider: 'smtp',
        fromEmail: process.env.ADMIN_FROM_EMAIL || 'admin@wedding-rsvp.com',
        fromName: 'Wedding RSVP System',
        isActive: true,
        smtpHost: process.env.ADMIN_SMTP_HOST || 'localhost',
        smtpPort: parseInt(process.env.ADMIN_SMTP_PORT || '587'),
        smtpUsername: process.env.ADMIN_SMTP_USERNAME,
        smtpPassword: process.env.ADMIN_SMTP_PASSWORD,
        smtpSecure: process.env.ADMIN_SMTP_SECURE === 'true'
      };

      this.config = mockConfig;
      return this.config;
    } catch (error) {
      console.error('Failed to load admin email config:', error);
      return null;
    }
  }

  async createTransporter() {
    if (!this.config) {
      await this.loadConfig();
    }

    if (!this.config || !this.config.isActive) {
      throw new Error('Admin email configuration not found or inactive');
    }

    switch (this.config.provider) {
      case 'gmail':
        return this.createGmailTransporter();
      case 'outlook':
        return this.createOutlookTransporter();
      case 'smtp':
        return this.createSMTPTransporter();
      case 'sendgrid':
        return this.createSendGridTransporter();
      default:
        throw new Error(`Unsupported email provider: ${this.config.provider}`);
    }
  }

  private createSMTPTransporter() {
    if (!this.config) throw new Error('No email configuration loaded');

    return nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: this.config.smtpSecure,
      auth: this.config.smtpUsername && this.config.smtpPassword ? {
        user: this.config.smtpUsername,
        pass: this.config.smtpPassword,
      } : undefined,
    });
  }

  private createGmailTransporter() {
    if (!this.config) throw new Error('No email configuration loaded');

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.config.fromEmail,
        clientId: this.config.gmailClientId,
        clientSecret: this.config.gmailClientSecret,
        refreshToken: this.config.gmailRefreshToken,
        accessToken: this.config.gmailAccessToken,
      },
    });
  }

  private createOutlookTransporter() {
    if (!this.config) throw new Error('No email configuration loaded');

    return nodemailer.createTransport({
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        type: 'OAuth2',
        user: this.config.fromEmail,
        clientId: this.config.outlookClientId,
        clientSecret: this.config.outlookClientSecret,
        refreshToken: this.config.outlookRefreshToken,
        accessToken: this.config.outlookAccessToken,
      },
    });
  }

  private createSendGridTransporter() {
    if (!this.config) throw new Error('No email configuration loaded');

    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: this.config.sendgridApiKey,
      },
    });
  }

  async sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<boolean> {
    try {
      const transporter = await this.createTransporter();
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"${this.config?.fromName}" <${this.config?.fromEmail}>`,
        to: toEmail,
        subject: 'Reset Your Password - Wedding RSVP System',
        html: this.generatePasswordResetHTML(resetUrl),
        text: this.generatePasswordResetText(resetUrl),
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  private generatePasswordResetHTML(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password for your Wedding RSVP System account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p><strong>This link will expire in 15 minutes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #f5576c;">${resetUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Wedding RSVP System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetText(resetUrl: string): string {
    return `
Reset Your Password - Wedding RSVP System

We received a request to reset your password for your Wedding RSVP System account.

To reset your password, visit the following link:
${resetUrl}

This link will expire in 15 minutes.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

© 2024 Wedding RSVP System. All rights reserved.
    `.trim();
  }

  async testConnection(): Promise<boolean> {
    try {
      const transporter = await this.createTransporter();
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('Admin email connection test failed:', error);
      return false;
    }
  }
}

export const adminEmailService = new AdminEmailService();