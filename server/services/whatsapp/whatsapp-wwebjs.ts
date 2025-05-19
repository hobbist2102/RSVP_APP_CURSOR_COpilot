import pkg from 'whatsapp-web.js';
const { Client, LocalAuth, MessageMedia } = pkg;
import { IWhatsAppService } from './whatsapp-interface';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

/**
 * WhatsApp Web.js implementation of WhatsApp service
 */
export default class WhatsAppWebJSService implements IWhatsAppService {
  private client: Client;
  private ready: boolean = false;
  private qrCode: string | null = null;
  private sessionDir: string;
  private eventId: number;

  /**
   * Constructor
   * @param eventId Event ID
   */
  constructor(eventId: number) {
    this.eventId = eventId;
    this.sessionDir = path.join(process.cwd(), 'whatsapp-sessions', `event-${eventId}`);
    
    // Ensure session directory exists
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
    
    // Initialize WhatsApp Web.js client
    this.client = new Client({
      authStrategy: new LocalAuth({ clientId: `event-${eventId}`, dataPath: this.sessionDir }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu'],
        headless: true
      }
    });
    
    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Set up WhatsApp Web.js event handlers
   */
  private setupEventHandlers(): void {
    // QR code generation
    this.client.on('qr', (qrCode) => {
      this.qrCode = qrCode;
      // Generate QR code for debugging in development only
      qrcode.generate(qrCode, { small: true });
    });
    
    // Authentication successful
    this.client.on('authenticated', () => {
      this.qrCode = null; // Clear QR code after authentication
    });
    
    // Client ready
    this.client.on('ready', () => {
      this.ready = true;
    });
    
    // Authentication failure
    this.client.on('auth_failure', (error) => {
      // Silent error in production, just update state
      this.ready = false;
    });
    
    // Disconnected
    this.client.on('disconnected', (reason) => {
      // Update state when disconnected without logging
      this.ready = false;
    });
  }

  /**
   * Initialize the WhatsApp client
   */
  public async initialize(): Promise<void> {
    if (!this.client) {
      throw new Error('WhatsApp client has not been created');
    }
    
    try {
      // Start the client if not already initialized
      if (!this.ready) {
        await this.client.initialize();
      }
    } catch (error) {
      // Re-throw error for proper handling by the service manager
      throw error;
    }
  }

  /**
   * Check if the WhatsApp client is ready to send messages
   */
  public isClientReady(): boolean {
    return this.ready;
  }

  /**
   * Get the QR code for authentication
   */
  public getQRCode(): string | null {
    return this.qrCode;
  }

  /**
   * Disconnect the WhatsApp client
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.destroy();
        this.ready = false;
      }
    } catch (error) {
      // Re-throw error for proper handling by the service manager
      throw error;
    }
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
    
    // WhatsApp Web.js requires number@c.us format
    return formattedNumber.substring(1) + '@c.us';
  }

  /**
   * Send a text message
   * @param to Recipient phone number
   * @param message Text message to send
   * @returns Promise resolving to message ID
   */
  public async sendTextMessage(to: string, message: string): Promise<string> {
    if (!this.isClientReady()) {
      throw new Error('WhatsApp client is not ready. Please scan the QR code to authenticate.');
    }
    
    try {
      const formattedNumber = this.formatPhoneNumber(to);
      const sent = await this.client.sendMessage(formattedNumber, message);
      return sent.id._serialized;
    } catch (error) {
      // Re-throw error for proper handling by caller
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
      throw new Error('WhatsApp client is not ready. Please scan the QR code to authenticate.');
    }
    
    try {
      // Check if file exists
      if (!fs.existsSync(mediaPath)) {
        throw new Error(`Media file not found: ${mediaPath}`);
      }
      
      const formattedNumber = this.formatPhoneNumber(to);
      const media = MessageMedia.fromFilePath(mediaPath);
      
      const sent = await this.client.sendMessage(formattedNumber, media, { caption });
      return sent.id._serialized;
    } catch (error) {
      // Re-throw error for proper handling by caller
      throw error;
    }
  }
}