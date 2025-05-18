import { IWhatsAppService } from './whatsapp-interface';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * WhatsApp Business API implementation of WhatsApp service
 */
export default class WhatsAppBusinessAPIService implements IWhatsAppService {
  private eventId: number;
  private accessToken: string;
  private phoneNumberId: string;
  private phoneNumber: string;
  private businessAccountId: string;
  private ready: boolean = false;
  private baseUrl: string = 'https://graph.facebook.com/v17.0';

  /**
   * Constructor
   * @param eventId Event ID
   * @param accessToken WhatsApp Business API access token
   * @param phoneNumberId WhatsApp Business API phone number ID
   * @param phoneNumber WhatsApp Business phone number
   * @param businessAccountId WhatsApp Business account ID
   */
  constructor(
    eventId: number,
    accessToken: string,
    phoneNumberId: string,
    phoneNumber: string = '',
    businessAccountId: string = ''
  ) {
    this.eventId = eventId;
    this.accessToken = accessToken;
    this.phoneNumberId = phoneNumberId;
    this.phoneNumber = phoneNumber;
    this.businessAccountId = businessAccountId;
  }

  /**
   * Initialize the WhatsApp Business API client
   */
  public async initialize(): Promise<void> {
    try {
      // Validate required credentials
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp Business API requires an access token and phone number ID');
      }

      // Verify the API token by making a test request
      await this.verifyCredentials();
      
      this.ready = true;
      console.log(`WhatsApp Business API client ready for event ${this.eventId}`);
    } catch (error) {
      this.ready = false;
      console.error(`Error initializing WhatsApp Business API for event ${this.eventId}:`, error);
      throw error;
    }
  }

  /**
   * Verify API credentials by making a test request
   */
  private async verifyCredentials(): Promise<void> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`Failed to verify WhatsApp Business API credentials: ${response.status} ${response.statusText}`);
      }
      
      // Store the phone number if available in the response
      if (response.data?.phone_number && !this.phoneNumber) {
        this.phoneNumber = response.data.phone_number;
      }
      
      // Store the business account ID if available in the response
      if (response.data?.waba_id && !this.businessAccountId) {
        this.businessAccountId = response.data.waba_id;
      }
    } catch (error) {
      console.error('Error verifying WhatsApp Business API credentials:', error);
      throw new Error('Failed to verify WhatsApp Business API credentials. Please check your access token and phone number ID.');
    }
  }

  /**
   * Check if the WhatsApp client is ready to send messages
   */
  public isClientReady(): boolean {
    return this.ready;
  }

  /**
   * Disconnect the WhatsApp client (no-op for Business API)
   */
  public async disconnect(): Promise<void> {
    this.ready = false;
    console.log(`WhatsApp Business API disconnected for event ${this.eventId}`);
  }

  /**
   * Format phone number to include country code if missing
   * @param phoneNumber Phone number to format
   * @returns Formatted phone number
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces, dashes, or parentheses
    let formattedNumber = phoneNumber.replace(/[\s\-()]/g, '');
    
    // Add country code if missing
    if (!formattedNumber.startsWith('+')) {
      if (formattedNumber.startsWith('0')) {
        // Assuming Indian number starting with 0, convert to +91
        formattedNumber = '+91' + formattedNumber.substring(1);
      } else if (!formattedNumber.match(/^\d{1,3}/)) {
        // If no country code, default to +91 (India)
        formattedNumber = '+91' + formattedNumber;
      } else {
        // Add + if missing but has country code
        formattedNumber = '+' + formattedNumber;
      }
    }
    
    return formattedNumber;
  }

  /**
   * Send a text message
   * @param to Recipient phone number
   * @param message Text message to send
   * @returns Promise resolving to message ID
   */
  public async sendTextMessage(to: string, message: string): Promise<string> {
    if (!this.isClientReady()) {
      throw new Error('WhatsApp Business API client is not ready. Please check your credentials.');
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
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.data?.messages || response.data.messages.length === 0) {
        throw new Error('No message ID returned from WhatsApp Business API');
      }
      
      return response.data.messages[0].id;
    } catch (error) {
      console.error(`Error sending WhatsApp Business API message to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send a media message
   * @param to Recipient phone number
   * @param mediaPath Path to the media file
   * @param caption Optional caption for the media
   * @returns Promise resolving to message ID
   */
  public async sendMediaMessage(to: string, mediaPath: string, caption?: string): Promise<string> {
    if (!this.isClientReady()) {
      throw new Error('WhatsApp Business API client is not ready. Please check your credentials.');
    }
    
    try {
      // Check if file exists
      if (!fs.existsSync(mediaPath)) {
        throw new Error(`Media file not found: ${mediaPath}`);
      }
      
      // First, upload the media file to get an ID
      const mediaType = this.getMediaType(mediaPath);
      const mediaId = await this.uploadMedia(mediaPath, mediaType);
      
      if (!mediaId) {
        throw new Error('Failed to upload media to WhatsApp Business API');
      }
      
      // Then send the media message
      const formattedNumber = this.formatPhoneNumber(to);
      
      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedNumber,
        type: mediaType
      };
      
      // Add the correct media type object with ID
      payload[mediaType] = { id: mediaId };
      
      // Add caption if provided
      if (caption && (mediaType === 'image' || mediaType === 'video' || mediaType === 'document')) {
        payload[mediaType].caption = caption;
      }
      
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.data?.messages || response.data.messages.length === 0) {
        throw new Error('No message ID returned from WhatsApp Business API');
      }
      
      return response.data.messages[0].id;
    } catch (error) {
      console.error(`Error sending WhatsApp Business API media message to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Upload media to the WhatsApp Business API
   * @param mediaPath Path to the media file
   * @param mediaType Type of the media (image, video, audio, document)
   * @returns Promise resolving to media ID
   */
  private async uploadMedia(mediaPath: string, mediaType: string): Promise<string> {
    try {
      // Read the file
      const media = fs.readFileSync(mediaPath);
      
      // Get the mime type
      const mimeType = this.getMimeType(mediaPath);
      
      // Upload to WhatsApp Business API
      const formData = new FormData();
      const blob = new Blob([media], { type: mimeType });
      formData.append('file', blob, path.basename(mediaPath));
      formData.append('messaging_product', 'whatsapp');
      formData.append('type', mimeType);
      
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (!response.data?.id) {
        throw new Error('No media ID returned from WhatsApp Business API');
      }
      
      return response.data.id;
    } catch (error) {
      console.error('Error uploading media to WhatsApp Business API:', error);
      throw error;
    }
  }

  /**
   * Get the media type based on the file extension
   * @param filePath Path to the media file
   * @returns Media type (image, video, audio, document)
   */
  private getMediaType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      return 'image';
    } else if (['.mp4', '.3gp', '.mov'].includes(ext)) {
      return 'video';
    } else if (['.mp3', '.ogg', '.wav', '.opus'].includes(ext)) {
      return 'audio';
    } else {
      return 'document';
    }
  }

  /**
   * Get the MIME type based on the file extension
   * @param filePath Path to the media file
   * @returns MIME type
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.mp4':
        return 'video/mp4';
      case '.3gp':
        return 'video/3gpp';
      case '.mov':
        return 'video/quicktime';
      case '.mp3':
        return 'audio/mpeg';
      case '.ogg':
        return 'audio/ogg';
      case '.wav':
        return 'audio/wav';
      case '.opus':
        return 'audio/opus';
      case '.pdf':
        return 'application/pdf';
      case '.doc':
        return 'application/msword';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.xls':
        return 'application/vnd.ms-excel';
      case '.xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case '.ppt':
        return 'application/vnd.ms-powerpoint';
      case '.pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Send a template message
   * @param to Recipient phone number
   * @param templateName Name of the template
   * @param languageCode Language code (e.g., en_US)
   * @param components Template components
   * @returns Promise resolving to message ID
   */
  public async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = 'en_US',
    components: any[] = []
  ): Promise<string> {
    if (!this.isClientReady()) {
      throw new Error('WhatsApp Business API client is not ready. Please check your credentials.');
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
            components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.data?.messages || response.data.messages.length === 0) {
        throw new Error('No message ID returned from WhatsApp Business API');
      }
      
      return response.data.messages[0].id;
    } catch (error) {
      console.error(`Error sending WhatsApp Business API template message to ${to}:`, error);
      throw error;
    }
  }
}