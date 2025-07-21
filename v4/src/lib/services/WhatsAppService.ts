import { createClient } from '@/lib/supabase/server'

interface WhatsAppProvider {
  name: string
  send: (data: WhatsAppData) => Promise<WhatsAppResult>
  isConfigured: () => Promise<boolean>
  getQRCode?: () => Promise<string | null>
  getConnectionStatus?: () => Promise<'connected' | 'disconnected' | 'connecting'>
}

interface WhatsAppData {
  to: string // Phone number with country code
  message: string
  mediaUrl?: string
  mediaCaption?: string
  guestId?: number
  eventId: number
  templateId?: number
  metadata?: Record<string, any>
}

interface WhatsAppResult {
  success: boolean
  messageId?: string
  provider: string
  error?: string
  deliveryStatus?: 'sent' | 'delivered' | 'failed' | 'pending' | 'read'
}

interface WhatsAppConfig {
  // Web.js settings
  useWebJS?: boolean
  webJSSessionPath?: string
  
  // Twilio settings
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioPhoneNumber?: string
  
  // WhatsApp Business API
  whatsappBusinessPhoneId?: string
  whatsappAccessToken?: string
  
  // General settings
  whatsappEnabled?: boolean
  whatsappFrom?: string
}

class WebJSProvider implements WhatsAppProvider {
  name = 'WhatsApp Web.js'
  private client: any
  private isReady = false
  private qrCode: string | null = null

  constructor() {
    this.initializeClient()
  }

  private async initializeClient() {
    try {
      // This would be implemented server-side with whatsapp-web.js
      // For now, simulating the integration
      // Initializing WhatsApp Web.js client (simulation)
      
      // In production, this would initialize the actual client:
      /*
      const { Client, LocalAuth } = require('whatsapp-web.js');
      
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: 'wedding-rsvp-bot'
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      this.client.on('qr', (qr) => {
        this.qrCode = qr;
      });

      this.client.on('ready', () => {
        this.isReady = true;
        // WhatsApp client is ready
      });

      this.client.on('disconnected', () => {
        this.isReady = false;
        // WhatsApp client disconnected
      });

      await this.client.initialize();
      */
      
      // Simulation for demo
      this.isReady = true
    } catch (error) {
      console.error('Failed to initialize WhatsApp Web.js:', error)
    }
  }

  async isConfigured(): Promise<boolean> {
    return this.isReady
  }

  async getQRCode(): Promise<string | null> {
    return this.qrCode
  }

  async getConnectionStatus(): Promise<'connected' | 'disconnected' | 'connecting'> {
    return this.isReady ? 'connected' : 'disconnected'
  }

  async send(data: WhatsAppData): Promise<WhatsAppResult> {
    try {
      if (!this.isReady) {
        return {
          success: false,
          provider: this.name,
          error: 'WhatsApp client not connected',
          deliveryStatus: 'failed'
        }
      }

      // Format phone number
      const phoneNumber = this.formatPhoneNumber(data.to)
      
      // In production, this would send via whatsapp-web.js:
      /*
      let sentMessage;
      if (data.mediaUrl) {
        const media = await MessageMedia.fromUrl(data.mediaUrl);
        sentMessage = await this.client.sendMessage(phoneNumber, media, {
          caption: data.mediaCaption || data.message
        });
      } else {
        sentMessage = await this.client.sendMessage(phoneNumber, data.message);
      }
      */

      // Simulation for demo
      const messageId = `webjs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return {
        success: true,
        messageId,
        provider: this.name,
        deliveryStatus: 'sent'
      }
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unknown Web.js error',
        deliveryStatus: 'failed'
      }
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove non-digits and format for WhatsApp
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.endsWith('@c.us') ? cleaned : `${cleaned}@c.us`
  }
}

class TwilioProvider implements WhatsAppProvider {
  name = 'Twilio WhatsApp'
  private accountSid: string
  private authToken: string
  private fromNumber: string

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid
    this.authToken = authToken
    this.fromNumber = fromNumber
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.accountSid && this.authToken && this.fromNumber)
  }

  async send(data: WhatsAppData): Promise<WhatsAppResult> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')
      
      const body = new URLSearchParams({
        From: `whatsapp:${this.fromNumber}`,
        To: `whatsapp:${data.to}`,
        Body: data.message
      })

      if (data.mediaUrl) {
        body.append('MediaUrl', data.mediaUrl)
      }

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString()
        }
      )

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          messageId: result.sid,
          provider: this.name,
          deliveryStatus: 'sent'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          provider: this.name,
          error: errorData.message || 'Twilio API error',
          deliveryStatus: 'failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unknown Twilio error',
        deliveryStatus: 'failed'
      }
    }
  }
}

class WhatsAppBusinessProvider implements WhatsAppProvider {
  name = 'WhatsApp Business API'
  private phoneNumberId: string
  private accessToken: string

  constructor(phoneNumberId: string, accessToken: string) {
    this.phoneNumberId = phoneNumberId
    this.accessToken = accessToken
  }

  async isConfigured(): Promise<boolean> {
    return !!(this.phoneNumberId && this.accessToken)
  }

  async send(data: WhatsAppData): Promise<WhatsAppResult> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: data.to,
            type: data.mediaUrl ? 'image' : 'text',
            text: data.mediaUrl ? undefined : { body: data.message },
            image: data.mediaUrl ? {
              link: data.mediaUrl,
              caption: data.mediaCaption || data.message
            } : undefined
          })
        }
      )

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          messageId: result.messages[0]?.id,
          provider: this.name,
          deliveryStatus: 'sent'
        }
      } else {
        const errorData = await response.json()
        return {
          success: false,
          provider: this.name,
          error: errorData.error?.message || 'WhatsApp Business API error',
          deliveryStatus: 'failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        provider: this.name,
        error: error instanceof Error ? error.message : 'Unknown WhatsApp Business API error',
        deliveryStatus: 'failed'
      }
    }
  }
}

export class WhatsAppService {
  private providers: WhatsAppProvider[] = []
  private config: WhatsAppConfig
  private eventId: number

  constructor(eventId: number, config: WhatsAppConfig) {
    this.eventId = eventId
    this.config = config
    this.initializeProviders()
  }

  private initializeProviders() {
    // Initialize providers in priority order
    if (this.config.whatsappBusinessPhoneId && this.config.whatsappAccessToken) {
      this.providers.push(new WhatsAppBusinessProvider(
        this.config.whatsappBusinessPhoneId,
        this.config.whatsappAccessToken
      ))
    }

    if (this.config.twilioAccountSid && this.config.twilioAuthToken && this.config.twilioPhoneNumber) {
      this.providers.push(new TwilioProvider(
        this.config.twilioAccountSid,
        this.config.twilioAuthToken,
        this.config.twilioPhoneNumber
      ))
    }

    if (this.config.useWebJS) {
      this.providers.push(new WebJSProvider())
    }
  }

  async sendMessage(data: WhatsAppData): Promise<WhatsAppResult> {
    if (!this.config.whatsappEnabled) {
      return {
        success: false,
        provider: 'none',
        error: 'WhatsApp is not enabled for this event',
        deliveryStatus: 'failed'
      }
    }

    data.eventId = this.eventId
    let lastError = 'No WhatsApp providers configured'

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
            console.warn(`WhatsApp provider ${provider.name} failed:`, result.error)
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error'
          console.error(`WhatsApp provider ${provider.name} error:`, error)
        }
      }
    }

    // All providers failed
    const failedResult: WhatsAppResult = {
      success: false,
      provider: 'none',
      error: lastError,
      deliveryStatus: 'failed'
    }

    // Log the failed attempt
    await this.logCommunication(data, failedResult)

    return failedResult
  }

  async sendBulkMessages(recipients: Array<{
    to: string
    guestId?: number
    customData?: Record<string, any>
  }>, template: {
    message: string
    mediaUrl?: string
    mediaCaption?: string
    templateId?: number
  }): Promise<Array<WhatsAppResult & { recipient: string; guestId?: number }>> {
    const results: Array<WhatsAppResult & { recipient: string; guestId?: number }> = []

    // Send messages with rate limiting (WhatsApp has strict limits)
    for (const recipient of recipients) {
      const messageData: WhatsAppData = {
        to: recipient.to,
        message: template.message,
        mediaUrl: template.mediaUrl,
        mediaCaption: template.mediaCaption,
        templateId: template.templateId,
        guestId: recipient.guestId,
        eventId: this.eventId,
        metadata: recipient.customData
      }

      const result = await this.sendMessage(messageData)
      results.push({
        ...result,
        recipient: recipient.to,
        guestId: recipient.guestId
      })

      // Add delay to respect WhatsApp rate limits
      if (results.length < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay
      }
    }

    return results
  }

  async getQRCode(): Promise<string | null> {
    const webJSProvider = this.providers.find(p => p.name === 'WhatsApp Web.js') as WebJSProvider
    if (webJSProvider && webJSProvider.getQRCode) {
      return await webJSProvider.getQRCode()
    }
    return null
  }

  async getConnectionStatus(): Promise<{
    connected: boolean
    provider?: string
    status?: string
  }> {
    for (const provider of this.providers) {
      if (await provider.isConfigured()) {
        if (provider.getConnectionStatus) {
          const status = await provider.getConnectionStatus()
          return {
            connected: status === 'connected',
            provider: provider.name,
            status
          }
        }
        return {
          connected: true,
          provider: provider.name
        }
      }
    }

    return {
      connected: false
    }
  }

  private async logCommunication(data: WhatsAppData, result: WhatsAppResult) {
    try {
      const supabase = createClient()

      const logData = {
        eventId: data.eventId,
        guestId: data.guestId || null,
        templateId: data.templateId || null,
        channel: 'whatsapp',
        recipient: data.to,
        subject: null,
        content: data.message,
        status: result.deliveryStatus || (result.success ? 'sent' : 'failed'),
        errorMessage: result.error || null,
        sentAt: result.success ? new Date().toISOString() : null,
        metadata: {
          provider: result.provider,
          messageId: result.messageId,
          mediaUrl: data.mediaUrl,
          mediaCaption: data.mediaCaption,
          ...data.metadata
        }
      }

      const { error } = await supabase
        .from('communication_logs')
        .insert(logData)

      if (error) {
        console.error('Failed to log WhatsApp communication:', error)
      }
    } catch (error) {
      console.error('Error logging WhatsApp communication:', error)
    }
  }

  async getAvailableProviders(): Promise<Array<{ name: string; configured: boolean }>> {
    const providers = [
      { 
        name: 'WhatsApp Business API', 
        configured: !!(this.config.whatsappBusinessPhoneId && this.config.whatsappAccessToken) 
      },
      { 
        name: 'Twilio WhatsApp', 
        configured: !!(this.config.twilioAccountSid && this.config.twilioAuthToken) 
      },
      { 
        name: 'WhatsApp Web.js', 
        configured: !!this.config.useWebJS 
      }
    ]

    return providers
  }
}

// Factory function to create WhatsAppService instance
export async function createWhatsAppService(eventId: number): Promise<WhatsAppService> {
  const supabase = createClient()
  
  const { data: event, error } = await supabase
    .from('wedding_events')
    .select(`
      whatsapp_enabled,
      whatsapp_from,
      whatsapp_business_phone_id,
      whatsapp_access_token,
      twilio_account_sid,
      twilio_auth_token,
      twilio_phone_number
    `)
    .eq('id', eventId)
    .single()

  if (error || !event) {
    throw new Error('Event not found or access denied')
  }

  const config: WhatsAppConfig = {
    whatsappEnabled: event.whatsapp_enabled,
    whatsappFrom: event.whatsapp_from,
    whatsappBusinessPhoneId: event.whatsapp_business_phone_id,
    whatsappAccessToken: event.whatsapp_access_token,
    twilioAccountSid: event.twilio_account_sid,
    twilioAuthToken: event.twilio_auth_token,
    twilioPhoneNumber: event.twilio_phone_number,
    useWebJS: true // Can be configured per event
  }

  return new WhatsAppService(eventId, config)
}