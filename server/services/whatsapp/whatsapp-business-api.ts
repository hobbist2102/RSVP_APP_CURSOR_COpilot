import { EventEmitter } from 'events';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

/**
 * WhatsApp Business API Service
 * Uses the official WhatsApp Business API to send messages
 */
class WhatsAppBusinessAPIService extends EventEmitter {
  private apiKey: string | null = null;
  private phoneNumberId: string | null = null;
  private baseUrl: string = 'https://graph.facebook.com/v18.0';
  private isInitialized: boolean = false;

  constructor(apiKey?: string, phoneNumberId?: string) {
    super();
    if (apiKey) this.apiKey = apiKey;
    if (phoneNumberId) this.phoneNumberId = phoneNumberId;
  }

  /**
   * Initialize the WhatsApp Business API service
   */
  public async initialize(apiKey?: string, phoneNumberId?: string): Promise<void> {
    if (apiKey) this.apiKey = apiKey;
    if (phoneNumberId) this.phoneNumberId = phoneNumberId;

    if (!this.apiKey || !this.phoneNumberId) {
      throw new Error('API key and Phone Number ID are required to initialize WhatsApp Business API');
    }

    try {
      // Verify the access token by making a test request
      const response = await axios.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        this.isInitialized = true;
        this.emit('ready');
        console.log('WhatsApp Business API is ready!');
        return;
      } 
      
      throw new Error(`Failed to initialize WhatsApp Business API: ${response.statusText}`);
    } catch (error) {
      console.error('Error initializing WhatsApp Business API:', error);
      throw error;
    }
  }

  /**
   * Check if the service is initialized
   */
  public isClientReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Send a text message to a specific number
   */
  public async sendTextMessage(to: string, text: string): Promise<string | null> {
    if (!this.isInitialized) {
      throw new Error('WhatsApp Business API not initialized');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(to);
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'text',
          text: {
            body: text
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        return response.data.messages?.[0]?.id || null;
      }

      throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send a media message to a specific number
   */
  public async sendMediaMessage(
    to: string, 
    mediaPath: string, 
    caption?: string
  ): Promise<string | null> {
    if (!this.isInitialized) {
      throw new Error('WhatsApp Business API not initialized');
    }

    try {
      // First, upload the media to WhatsApp servers
      const mediaId = await this.uploadMedia(mediaPath);
      if (!mediaId) {
        throw new Error('Failed to upload media');
      }

      // Now send the media message
      const formattedNumber = this.formatPhoneNumber(to);
      
      // Determine media type based on file extension
      const fileExtension = mediaPath.split('.').pop()?.toLowerCase();
      let mediaType = 'document';
      
      if (['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
        mediaType = 'image';
      } else if (['mp4', 'mov', '3gp'].includes(fileExtension || '')) {
        mediaType = 'video';
      } else if (['mp3', 'ogg', 'wav'].includes(fileExtension || '')) {
        mediaType = 'audio';
      }

      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedNumber,
        type: mediaType,
        [mediaType]: {
          id: mediaId
        }
      };

      // Add caption if provided (not applicable for audio)
      if (caption && mediaType !== 'audio') {
        payload[mediaType].caption = caption;
      }

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        return response.data.messages?.[0]?.id || null;
      }

      throw new Error(`Failed to send WhatsApp media message: ${response.statusText}`);
    } catch (error) {
      console.error('Error sending WhatsApp media message:', error);
      throw error;
    }
  }

  /**
   * Upload media to WhatsApp servers
   */
  private async uploadMedia(mediaPath: string): Promise<string | null> {
    try {
      // Check if the file exists
      if (!fs.existsSync(mediaPath)) {
        throw new Error(`File not found: ${mediaPath}`);
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(mediaPath));
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', this.getMediaType(mediaPath));

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/media`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (response.status === 200) {
        return response.data.id || null;
      }

      return null;
    } catch (error) {
      console.error('Error uploading media to WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Determine media type from file extension
   */
  private getMediaType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png'].includes(extension || '')) {
      return 'image';
    } else if (['mp4', 'mov', '3gp'].includes(extension || '')) {
      return 'video';
    } else if (['mp3', 'ogg', 'wav'].includes(extension || '')) {
      return 'audio';
    }
    
    return 'document';
  }

  /**
   * Send a template message (specific to WhatsApp Business API)
   */
  public async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'en_US',
    components: any[] = []
  ): Promise<string | null> {
    if (!this.isInitialized) {
      throw new Error('WhatsApp Business API not initialized');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(to);
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedNumber,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: languageCode
            },
            components: components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        return response.data.messages?.[0]?.id || null;
      }

      throw new Error(`Failed to send WhatsApp template message: ${response.statusText}`);
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      throw error;
    }
  }

  /**
   * Format a phone number to ensure it has the correct format
   * @param phoneNumber The phone number to format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let formatted = phoneNumber.replace(/\D/g, '');
    
    // Make sure the number starts with the country code
    if (!formatted.startsWith('1') && !formatted.startsWith('91')) {
      // Default to India for this wedding platform
      formatted = '91' + formatted;
    }
    
    return formatted;
  }
}

export default WhatsAppBusinessAPIService;