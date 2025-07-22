import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'

interface EmailMessage {
  to: string | string[]
  from: string
  subject: string
  html: string
  text?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
  provider: string
}

interface EmailProvider {
  name: string
  send(message: EmailMessage): Promise<SendResult>
  verify(): Promise<boolean>
}

// Resend Provider
class ResendProvider implements EmailProvider {
  name = 'resend'
  private resend: Resend

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey)
  }

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const result = await this.resend.emails.send({
        from: message.from,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        attachments: message.attachments,
      })

      return {
        success: true,
        messageId: result.data?.id,
        provider: this.name,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: this.name,
      }
    }
  }

  async verify(): Promise<boolean> {
    try {
      // Test by getting domain verification status
      await this.resend.domains.list()
      return true
    } catch {
      return false
    }
  }
}

// Gmail OAuth2 Provider
class GmailProvider implements EmailProvider {
  name = 'gmail'
  private oauth2Client: any
  private transporter: nodemailer.Transporter | null = null

  constructor(
    private clientId: string,
    private clientSecret: string,
    private refreshToken: string,
    private userEmail: string
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'https://developers.google.com/oauthplayground'
    )
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    })
  }

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter()
      }

      const result = await this.transporter!.sendMail({
        from: `${message.from} <${this.userEmail}>`,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        attachments: message.attachments,
      })

      return {
        success: true,
        messageId: result.messageId,
        provider: this.name,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: this.name,
      }
    }
  }

  async verify(): Promise<boolean> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter()
      }
      await this.transporter!.verify()
      return true
    } catch {
      return false
    }
  }

  private async initializeTransporter(): Promise<void> {
    const { token } = await this.oauth2Client.getAccessToken()
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.userEmail,
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        refreshToken: this.refreshToken,
        accessToken: token,
      },
    })
  }
}

// SMTP Provider (Generic)
class SMTPProvider implements EmailProvider {
  name = 'smtp'
  private transporter: nodemailer.Transporter

  constructor(config: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }) {
    this.transporter = nodemailer.createTransport(config)
  }

  async send(message: EmailMessage): Promise<SendResult> {
    try {
      const result = await this.transporter.sendMail({
        from: message.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        attachments: message.attachments,
      })

      return {
        success: true,
        messageId: result.messageId,
        provider: this.name,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        provider: this.name,
      }
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch {
      return false
    }
  }
}

// Email Service Manager
export class EmailService {
  private providers: EmailProvider[] = []
  private primaryProvider: EmailProvider | null = null

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders(): void {
    // Initialize Resend if API key is available
    if (process.env.RESEND_API_KEY) {
      const resendProvider = new ResendProvider(process.env.RESEND_API_KEY)
      this.providers.push(resendProvider)
      if (!this.primaryProvider) this.primaryProvider = resendProvider
    }

    // Initialize Gmail OAuth2 if credentials are available
    if (
      process.env.GMAIL_CLIENT_ID &&
      process.env.GMAIL_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN &&
      process.env.GMAIL_USER_EMAIL
    ) {
      const gmailProvider = new GmailProvider(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REFRESH_TOKEN,
        process.env.GMAIL_USER_EMAIL
      )
      this.providers.push(gmailProvider)
      if (!this.primaryProvider) this.primaryProvider = gmailProvider
    }

    // Initialize SMTP if configuration is available
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      const smtpProvider = new SMTPProvider({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
      this.providers.push(smtpProvider)
      if (!this.primaryProvider) this.primaryProvider = smtpProvider
    }
  }

  async sendEmail(message: EmailMessage): Promise<SendResult> {
    if (!this.primaryProvider) {
      return {
        success: false,
        error: 'No email provider configured',
        provider: 'none',
      }
    }

    // Try primary provider first
    let result = await this.primaryProvider.send(message)
    
    if (result.success) {
      return result
    }

    // If primary provider fails, try fallback providers
    for (const provider of this.providers) {
      if (provider === this.primaryProvider) continue
      
      result = await provider.send(message)
      if (result.success) {
        return result
      }
    }

    // All providers failed
    return {
      success: false,
      error: 'All email providers failed',
      provider: 'fallback',
    }
  }

  async sendBulkEmails(messages: EmailMessage[]): Promise<SendResult[]> {
    const results: SendResult[] = []
    
    for (const message of messages) {
      const result = await this.sendEmail(message)
      results.push(result)
      
      // Add delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return results
  }

  async verifyProviders(): Promise<{ provider: string; status: boolean }[]> {
    const statuses = []
    
    for (const provider of this.providers) {
      const status = await provider.verify()
      statuses.push({ provider: provider.name, status })
    }
    
    return statuses
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name)
  }

  setPrimaryProvider(providerName: string): boolean {
    const provider = this.providers.find(p => p.name === providerName)
    if (provider) {
      this.primaryProvider = provider
      return true
    }
    return false
  }
}

// Template Processing
export interface EmailTemplate {
  subject: string
  html: string
  text?: string
  variables: string[]
}

export function processTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; html: string; text?: string } {
  let { subject, html, text } = template

  // Replace variables in subject
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi')
    subject = subject.replace(regex, value)
    html = html.replace(regex, value)
    if (text) {
      text = text.replace(regex, value)
    }
  }

  return { subject, html, text }
}

// Default Templates
export const defaultTemplates = {
  invitation: {
    subject: 'You\'re Invited: {{eventName}} - {{weddingDate}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #D4AF37, #FFB6C1);">
          <h1 style="color: white; margin: 0; font-size: 32px;">{{coupleNames}}</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">{{weddingDate}}</p>
        </div>
        <div style="padding: 40px 20px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Dear {{guestName}},</h2>
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            We're excited to invite you to celebrate our special day with us! Your presence would make our wedding even more meaningful.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{rsvpLink}}" style="background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              RSVP Now
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; margin: 20px 0 0 0;">
            Please respond by {{rsvpDeadline}}. We can't wait to celebrate with you!
          </p>
          <p style="color: #666; line-height: 1.6; margin: 20px 0 0 0;">
            With love,<br>
            {{coupleNames}}
          </p>
        </div>
      </div>
    `,
    variables: ['eventName', 'coupleNames', 'weddingDate', 'guestName', 'rsvpLink', 'rsvpDeadline'],
  },
  reminder: {
    subject: 'RSVP Reminder: {{eventName}} - {{weddingDate}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 30px 20px; background: #f8f9fa;">
          <h1 style="color: #333; margin: 0; font-size: 28px;">{{coupleNames}}</h1>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">{{weddingDate}}</p>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hi {{guestName}},</h2>
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            We haven't received your RSVP yet for our upcoming wedding. We'd love to know if you'll be joining us!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{rsvpLink}}" style="background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              RSVP Now
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; margin: 20px 0 0 0;">
            Please respond by {{rsvpDeadline}}. Thank you!
          </p>
        </div>
      </div>
    `,
    variables: ['eventName', 'coupleNames', 'weddingDate', 'guestName', 'rsvpLink', 'rsvpDeadline'],
  },
  confirmation: {
    subject: 'RSVP Confirmed: {{eventName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 30px 20px; background: #d4edda;">
          <h1 style="color: #155724; margin: 0; font-size: 28px;">Thank You!</h1>
          <p style="color: #155724; margin: 10px 0 0 0; font-size: 16px;">Your RSVP has been confirmed</p>
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Dear {{guestName}},</h2>
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for confirming your attendance at our wedding! We're so excited to celebrate with you.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Event Details:</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> {{weddingDate}}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Time:</strong> {{weddingTime}}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Venue:</strong> {{venueName}}</p>
          </div>
          <p style="color: #666; line-height: 1.6; margin: 20px 0 0 0;">
            More details will follow closer to the date. See you soon!
          </p>
        </div>
      </div>
    `,
    variables: ['eventName', 'guestName', 'weddingDate', 'weddingTime', 'venueName'],
  },
}

// Singleton instance
export const emailService = new EmailService()