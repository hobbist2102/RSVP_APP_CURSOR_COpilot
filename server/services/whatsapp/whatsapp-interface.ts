import { EventEmitter } from 'events';

/**
 * Common interface for all WhatsApp service implementations
 */
export interface IWhatsAppService extends EventEmitter {
  /**
   * Initialize the WhatsApp service
   */
  initialize(...args: any[]): Promise<void>;
  
  /**
   * Check if the client is ready
   */
  isClientReady(): boolean;
  
  /**
   * Get the QR code for authentication (Web client only)
   */
  getQRCode?(): string | null;
  
  /**
   * Send a text message
   */
  sendTextMessage(to: string, text: string): Promise<string | null>;
  
  /**
   * Send a media message
   */
  sendMediaMessage(to: string, mediaPath: string, caption?: string): Promise<string | null>;
  
  /**
   * Send a template message
   */
  sendTemplateMessage(to: string, templateName: string, languageCode: string, components: any[]): Promise<string | null>;
  
  /**
   * Logout the client
   */
  logout?(): Promise<void>;
  
  /**
   * Disconnect the client
   */
  disconnect?(): Promise<void>;
}