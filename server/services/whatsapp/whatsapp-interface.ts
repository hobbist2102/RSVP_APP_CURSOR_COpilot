/**
 * Interface for WhatsApp service implementations
 */
export interface IWhatsAppService {
  /**
   * Initialize the WhatsApp client
   */
  initialize(): Promise<void>;
  
  /**
   * Check if the WhatsApp client is ready to send messages
   */
  isClientReady(): boolean;
  
  /**
   * Get the QR code for authentication (Web.js only)
   */
  getQRCode?(): string | null;
  
  /**
   * Disconnect the WhatsApp client
   */
  disconnect(): Promise<void>;
  
  /**
   * Send a text message
   * @param to Recipient phone number (with country code)
   * @param message Text message to send
   */
  sendTextMessage(to: string, message: string): Promise<string>;
  
  /**
   * Send a media message
   * @param to Recipient phone number (with country code)
   * @param mediaPath Path to the media file
   * @param caption Optional caption for the media
   */
  sendMediaMessage(to: string, mediaPath: string, caption?: string): Promise<string>;
  
  /**
   * Send a template message (Business API only)
   * @param to Recipient phone number (with country code)
   * @param templateName Name of the template
   * @param languageCode Language code (e.g., en_US)
   * @param components Template components
   */
  sendTemplateMessage?(to: string, templateName: string, languageCode: string, components: any[]): Promise<string>;
}