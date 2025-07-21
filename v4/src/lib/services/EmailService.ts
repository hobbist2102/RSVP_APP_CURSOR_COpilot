import { createClient } from '@/lib/supabase/server'

interface EmailProvider {
  name: string
  send: (data: EmailData) => Promise<EmailResult>
  isConfigured: () => Promise<boolean>
}

interface EmailData {
  to: string | string[]
  subject: string
  content: string
  isHtml?: boolean
  from?: string
  fromName?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
  templateId?: number
  guestId?: number
  eventId: number
  metadata?: Record<string, any>
}

interface EmailResult {
  success: boolean
  messageId?: string
  provider: string
  error?: string
  deliveryStatus?: 'sent' | 'delivered' | 'failed' | 'pending'
}

interface EmailConfig {
  // SendGrid
  sendGridApiKey?: string
  
  // Brevo
  brevoApiKey?: string
  
  // SMTP
  smtpHost?: string
  smtpPort?: number
  smtpSecure?: boolean
  smtpUser?: string
  smtpPassword?: string
  
  // Gmail SMTP
  useGmailDirectSMTP?: boolean
  gmailPassword?: string
  gmailSmtpHost?: string
  gmailSmtpPort?: number
  gmailSmtpSecure?: boolean
  
  // General settings
  emailFrom?: string
  emailFromName?: string
  emailReplyTo?: string
}

class SendGridProvider implements EmailProvider {
  name = 'SendGrid'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async isConfigured(): Promise<boolean> {
    return !!this.apiKey
  }

  async send(data: EmailData): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: Array.isArray(data.to) ? data.to.map(email => ({ email })) : [{ email: data.to }],
            subject: data.subject,
          }],
          from: {
            email: data.from || 'noreply@example.com',
            name: data.fromName || 'Wedding RSVP'
          },
          reply_to: data.replyTo ? { email: data.replyTo } : undefined,
          content: [{
            type: data.isHtml ? 'text/html' : 'text/plain',
            value: data.content
          }],
          attachments: data.attachments?.map(att => ({
            filename: att.filename,
            content: typeof att.content === 'string' ? att.content : att.content.toString('base64'),
            type: att.contentType || 'application/octet-stream',
            disposition: 'attachment'
          }))
        })
      })

      if (response.ok) {
        const messageId = response.headers.get('X-Message-Id')
        return {
          success: true,
          messageId: messageId || undefined,
          provider: this.name,
          deliveryStatus: 'sent'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          provider: this.name,
          error: errorData.errors?.[0]?.message || 'SendGrid API error',
          deliveryStatus: 'failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unknown SendGrid error',
        deliveryStatus: 'failed'
      }
    }
  }
}

class BrevoProvider implements EmailProvider {
  name = 'Brevo'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async isConfigured(): Promise<boolean> {
    return !!this.apiKey
  }

  async send(data: EmailData): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            email: data.from || 'noreply@example.com',
            name: data.fromName || 'Wedding RSVP'
          },
          to: Array.isArray(data.to) ? data.to.map(email => ({ email })) : [{ email: data.to }],
          subject: data.subject,
          htmlContent: data.isHtml ? data.content : undefined,
          textContent: !data.isHtml ? data.content : undefined,
          replyTo: data.replyTo ? { email: data.replyTo } : undefined,
          attachment: data.attachments?.map(att => ({
            name: att.filename,
            content: typeof att.content === 'string' ? att.content : att.content.toString('base64')
          }))
        })
      })

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          messageId: result.messageId,
          provider: this.name,
          deliveryStatus: 'sent'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          provider: this.name,
          error: errorData.message || 'Brevo API error',
          deliveryStatus: 'failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unknown Brevo error',
        deliveryStatus: 'failed'
      }
    }
  }
}

class SMTPProvider implements EmailProvider {
  name = 'SMTP'
  private config: {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
  }

  constructor(config: SMTPProvider['config']) {
    this.config = config
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.config.host && this.config.user && this.config.password)
  }

  async send(data: EmailData): Promise<EmailResult> {
    try {
      // Using nodemailer would require server-side execution
      // For now, implementing a basic SMTP simulation
      // In production, this would use nodemailer or similar
      
      const nodemailer = await import('nodemailer')
      
      const transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.user,
          pass: this.config.password,
        },
      })

      const mailOptions = {
        from: `${data.fromName || 'Wedding RSVP'} <${data.from || this.config.user}>`,
        to: Array.isArray(data.to) ? data.to.join(', ') : data.to,
        subject: data.subject,
        text: !data.isHtml ? data.content : undefined,
        html: data.isHtml ? data.content : undefined,
        replyTo: data.replyTo,
        attachments: data.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      }

      const info = await transporter.sendMail(mailOptions)

      return {
        success: true,
        messageId: info.messageId,
        provider: this.name,
        deliveryStatus: 'sent'
      }
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unknown SMTP error',
        deliveryStatus: 'failed'
      }
    }
  }
}

export class EmailService {
  private providers: EmailProvider[] = []
  private config: EmailConfig
  private eventId: number

  constructor(eventId: number, config: EmailConfig) {
    this.eventId = eventId
    this.config = config
    this.initializeProviders()
  }

  private initializeProviders() {
    // Initialize providers in priority order
    if (this.config.sendGridApiKey) {
      this.providers.push(new SendGridProvider(this.config.sendGridApiKey))
    }

    if (this.config.brevoApiKey) {
      this.providers.push(new BrevoProvider(this.config.brevoApiKey))
    }

    if (this.config.smtpHost && this.config.smtpUser && this.config.smtpPassword) {
      this.providers.push(new SMTPProvider({
        host: this.config.smtpHost,
        port: this.config.smtpPort || 587,
        secure: this.config.smtpSecure || false,
        user: this.config.smtpUser,
        password: this.config.smtpPassword
      }))
    }

    if (this.config.useGmailDirectSMTP && this.config.gmailPassword) {
      this.providers.push(new SMTPProvider({
        host: this.config.gmailSmtpHost || 'smtp.gmail.com',
        port: this.config.gmailSmtpPort || 587,
        secure: this.config.gmailSmtpSecure || false,
        user: this.config.emailFrom || '',
        password: this.config.gmailPassword
      }))
    }
  }

  async sendEmail(data: EmailData): Promise<EmailResult> {
    // Set default values from config
    if (!data.from) data.from = this.config.emailFrom
    if (!data.fromName) data.fromName = this.config.emailFromName
    if (!data.replyTo) data.replyTo = this.config.emailReplyTo
    data.eventId = this.eventId

    let lastError = 'No email providers configured'
    
    // Try providers in order until one succeeds
    for (const provider of this.providers) {
      if (await provider.isConfigured()) {
        try {
          const result = await provider.send(data)
          
          // Log the communication
          await this.logCommunication(data, result)
          
          if (result.success) {
            return result
          } else {
            lastError = result.error || 'Provider failed'
            console.warn(`Email provider ${provider.name} failed:`, result.error)
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error'
          console.error(`Email provider ${provider.name} error:`, error)
        }
      }
    }

    // All providers failed
    const failedResult: EmailResult = {
      success: false,
      provider: 'none',
      error: lastError,
      deliveryStatus: 'failed'
    }

    // Log the failed attempt
    await this.logCommunication(data, failedResult)

    return failedResult
  }

  async sendBulkEmails(recipients: Array<{
    to: string
    guestId?: number
    customData?: Record<string, any>
  }>, template: {
    subject: string
    content: string
    isHtml?: boolean
    templateId?: number
  }): Promise<Array<EmailResult & { recipient: string; guestId?: number }>> {
    const results: Array<EmailResult & { recipient: string; guestId?: number }> = []

    // Send emails with rate limiting
    for (const recipient of recipients) {
      const emailData: EmailData = {
        to: recipient.to,
        subject: template.subject,
        content: template.content,
        isHtml: template.isHtml,
        templateId: template.templateId,
        guestId: recipient.guestId,
        eventId: this.eventId,
        metadata: recipient.customData
      }

      const result = await this.sendEmail(emailData)
      results.push({
        ...result,
        recipient: recipient.to,
        guestId: recipient.guestId
      })

      // Add small delay to avoid rate limiting
      if (results.length < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return results
  }

  private async logCommunication(data: EmailData, result: EmailResult) {
    try {
      const supabase = createClient()

      const logData = {
        eventId: data.eventId,
        guestId: data.guestId || null,
        templateId: data.templateId || null,
        channel: 'email',
        recipient: Array.isArray(data.to) ? data.to[0] : data.to,
        subject: data.subject,
        content: data.content,
        status: result.deliveryStatus || (result.success ? 'sent' : 'failed'),
        errorMessage: result.error || null,
        sentAt: result.success ? new Date().toISOString() : null,
        metadata: {
          provider: result.provider,
          messageId: result.messageId,
          isHtml: data.isHtml,
          ...data.metadata
        }
      }

      const { error } = await supabase
        .from('communication_logs')
        .insert(logData)

      if (error) {
        console.error('Failed to log communication:', error)
      }
    } catch (error) {
      console.error('Error logging communication:', error)
    }
  }

  async getDeliveryStatus(messageId: string): Promise<{
    status: string
    deliveredAt?: string
    openedAt?: string
    clickedAt?: string
  } | null> {
    // This would integrate with provider webhooks in production
    // For now, return basic status from logs
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('communication_logs')
        .select('status, delivered_at, opened_at, clicked_at')
        .eq('metadata->messageId', messageId)
        .single()

      if (error || !data) return null

      return {
        status: data.status,
        deliveredAt: data.delivered_at,
        openedAt: data.opened_at,
        clickedAt: data.clicked_at
      }
    } catch (error) {
      console.error('Error getting delivery status:', error)
      return null
    }
  }

  async getAvailableProviders(): Promise<Array<{ name: string; configured: boolean }>> {
    const providers = [
      { name: 'SendGrid', configured: !!this.config.sendGridApiKey },
      { name: 'Brevo', configured: !!this.config.brevoApiKey },
      { name: 'SMTP', configured: !!(this.config.smtpHost && this.config.smtpUser) },
      { name: 'Gmail SMTP', configured: !!(this.config.useGmailDirectSMTP && this.config.gmailPassword) }
    ]

    return providers
  }
}

// Factory function to create EmailService instance
export async function createEmailService(eventId: number): Promise<EmailService> {
  const supabase = createClient()
  
  const { data: event, error } = await supabase
    .from('wedding_events')
    .select(`
      sendgrid_api_key,
      brevo_api_key,
      smtp_host,
      smtp_port,
      email_from_name,
      use_gmail_direct_smtp,
      gmail_password,
      gmail_smtp_host,
      gmail_smtp_port,
      gmail_smtp_secure,
      email_from,
      email_reply_to
    `)
    .eq('id', eventId)
    .single()

  if (error || !event) {
    throw new Error('Event not found or access denied')
  }

  const config: EmailConfig = {
    sendGridApiKey: event.sendgrid_api_key,
    brevoApiKey: event.brevo_api_key,
    smtpHost: event.smtp_host,
    smtpPort: event.smtp_port,
    useGmailDirectSMTP: event.use_gmail_direct_smtp,
    gmailPassword: event.gmail_password,
    gmailSmtpHost: event.gmail_smtp_host,
    gmailSmtpPort: event.gmail_smtp_port,
    gmailSmtpSecure: event.gmail_smtp_secure,
    emailFrom: event.email_from,
    emailFromName: event.email_from_name,
    emailReplyTo: event.email_reply_to
  }

  return new EmailService(eventId, config)
}