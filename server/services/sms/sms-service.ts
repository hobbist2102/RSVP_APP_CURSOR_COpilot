/**
 * SMS Service
 * Handles SMS sending via Twilio and other providers
 */

export interface SMSMessage {
  to: string;
  content: string;
}

export interface SMSProvider {
  type: 'twilio' | 'custom';
  config: any;
}

export class SMSService {
  private providers: Map<string, SMSProvider> = new Map();
  private twilioConfig: any = null;

  constructor() {
    this.initializeTwilio();
  }

  /**
   * Initialize Twilio SMS
   */
  private initializeTwilio() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioConfig = {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_PHONE_NUMBER,
      };
    }
  }

  /**
   * Add SMS provider configuration
   */
  addProvider(providerId: string, provider: SMSProvider) {
    this.providers.set(providerId, provider);
  }

  /**
   * Send SMS message
   */
  async sendSMS(message: SMSMessage, providerId?: string): Promise<boolean> {
    try {
      // Use Twilio if available and no specific provider requested
      if (!providerId && this.twilioConfig) {
        return await this.sendViaTwilio(message);
      }

      // Use specific provider if configured
      if (providerId && this.providers.has(providerId)) {
        const provider = this.providers.get(providerId)!;
        return await this.sendViaProvider(message, provider);
      }

      
      return false;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Send SMS via Twilio
   */
  private async sendViaTwilio(message: SMSMessage): Promise<boolean> {
    if (!this.twilioConfig) {
      
      return false;
    }

    try {
      // Use Twilio REST API directly
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioConfig.accountSid}/Messages.json`;
      
      const params = new URLSearchParams();
      params.append('To', message.to);
      params.append('From', this.twilioConfig.fromNumber);
      params.append('Body', message.content);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.twilioConfig.accountSid}:${this.twilioConfig.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (response.ok) {
        const result = await response.json();
        
        return true;
      } else {
        const error = await response.text();
        
        return false;
      }
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Send SMS via specific provider
   */
  private async sendViaProvider(message: SMSMessage, provider: SMSProvider): Promise<boolean> {
    switch (provider.type) {
      case 'twilio':
        return await this.sendViaTwilioProvider(message, provider.config);
      case 'custom':
        return await this.sendViaCustomProvider(message, provider.config);
      default:
        
        return false;
    }
  }

  /**
   * Send SMS via Twilio with custom config
   */
  private async sendViaTwilioProvider(message: SMSMessage, config: any): Promise<boolean> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
      
      const params = new URLSearchParams();
      params.append('To', message.to);
      params.append('From', config.fromNumber);
      params.append('Body', message.content);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (response.ok) {
        const result = await response.json();
        
        return true;
      } else {
        const error = await response.text();
        
        return false;
      }
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Send SMS via custom provider
   */
  private async sendViaCustomProvider(message: SMSMessage, config: any): Promise<boolean> {
    try {
      // TODO: Implement custom SMS provider logic
      
      
      return false;
    } catch (error) {
      
      return false;
    }
  }

  /**
   * Test SMS connection
   */
  async testConnection(providerId?: string): Promise<boolean> {
    try {
      // Test Twilio if available
      if (!providerId && this.twilioConfig) {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioConfig.accountSid}.json`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.twilioConfig.accountSid}:${this.twilioConfig.authToken}`).toString('base64')}`,
          },
        });

        return response.ok;
      }

      // Test specific provider
      if (providerId && this.providers.has(providerId)) {
        const provider = this.providers.get(providerId)!;
        
        if (provider.type === 'twilio') {
          const url = `https://api.twilio.com/2010-04-01/Accounts/${provider.config.accountSid}.json`;
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${provider.config.accountSid}:${provider.config.authToken}`).toString('base64')}`,
            },
          });

          return response.ok;
        }
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
    
    if (this.twilioConfig) {
      providers.push('twilio');
    }
    
    providers.push(...Array.from(this.providers.keys()));
    
    return providers;
  }

  /**
   * Format phone number for SMS
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add + and country code if not present (assuming India +91 as default)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    return '+' + cleaned;
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // Basic validation: should start with + and be at least 10 digits
    return formatted.match(/^\+\d{10,15}$/) !== null;
  }
}

// Export singleton instance
export const smsService = new SMSService();