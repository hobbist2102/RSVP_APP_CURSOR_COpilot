import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { EventEmitter } from 'events';

/**
 * WhatsApp Web JS Service
 * Uses the whatsapp-web.js library to connect to WhatsApp Web
 */
class WhatsAppWebJSService extends EventEmitter {
  private client: Client | null = null;
  private isInitialized: boolean = false;
  private isReady: boolean = false;
  private qrCode: string | null = null;
  private sessionId: string;
  private sessionPath: string;

  constructor(sessionId: string = 'default-session') {
    super();
    this.sessionId = sessionId;
    this.sessionPath = path.join(process.cwd(), 'whatsapp-sessions', sessionId);
    
    // Create session directory if it doesn't exist
    if (!fs.existsSync(path.join(process.cwd(), 'whatsapp-sessions'))) {
      fs.mkdirSync(path.join(process.cwd(), 'whatsapp-sessions'), { recursive: true });
    }
  }

  /**
   * Initialize the WhatsApp client
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: this.sessionId,
          dataPath: path.join(process.cwd(), 'whatsapp-sessions')
        }),
        puppeteer: {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        }
      });

      // Register event handlers
      this.client.on('qr', (qr) => {
        this.qrCode = qr;
        // Generate QR code in terminal for scanning
        qrcode.generate(qr, { small: true });
        this.emit('qr', qr);
      });

      this.client.on('ready', () => {
        console.log('WhatsApp client is ready!');
        this.isReady = true;
        this.qrCode = null;
        this.emit('ready');
      });

      this.client.on('authenticated', () => {
        console.log('WhatsApp client authenticated!');
        this.emit('authenticated');
      });

      this.client.on('auth_failure', (msg) => {
        console.error('WhatsApp authentication failed:', msg);
        this.emit('auth_failure', msg);
      });

      this.client.on('disconnected', (reason) => {
        console.log('WhatsApp client disconnected:', reason);
        this.isReady = false;
        this.emit('disconnected', reason);
      });

      this.client.on('message', (message) => {
        this.emit('message', message);
      });

      // Initialize the client
      await this.client.initialize();
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      throw error;
    }
  }

  /**
   * Check if the client is ready
   */
  public isClientReady(): boolean {
    return this.isReady;
  }

  /**
   * Get the current QR code for authentication
   */
  public getQRCode(): string | null {
    return this.qrCode;
  }

  /**
   * Send a text message to a specific number
   */
  public async sendTextMessage(to: string, text: string): Promise<string | null> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client not ready');
    }

    try {
      // Format the number to ensure it has the correct format
      const formattedNumber = this.formatPhoneNumber(to);
      const chatId = `${formattedNumber}@c.us`;
      
      // Send the message
      const message = await this.client.sendMessage(chatId, text);
      return message.id._serialized;
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
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client not ready');
    }

    try {
      // Format the number
      const formattedNumber = this.formatPhoneNumber(to);
      const chatId = `${formattedNumber}@c.us`;
      
      // Check if the file exists
      if (!fs.existsSync(mediaPath)) {
        throw new Error(`File not found: ${mediaPath}`);
      }

      // Get the mime type
      const mimeType = mime.lookup(mediaPath) || 'application/octet-stream';
      
      // Read the file
      const media = fs.readFileSync(mediaPath);
      const base64Media = media.toString('base64');
      const fileData = `data:${mimeType};base64,${base64Media}`;
      
      // Send the media message
      const message = await this.client.sendMessage(chatId, {
        body: caption,
        media: fileData
      });
      
      return message.id._serialized;
    } catch (error) {
      console.error('Error sending WhatsApp media message:', error);
      throw error;
    }
  }

  /**
   * Send a template message for business accounts
   */
  public async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    parameters: Record<string, string>[]
  ): Promise<string | null> {
    throw new Error('Template messages not supported in WhatsApp Web JS. Use the WhatsApp Business API instead.');
  }

  /**
   * Logout the WhatsApp client
   */
  public async logout(): Promise<void> {
    if (this.client) {
      await this.client.logout();
      this.isReady = false;
      this.qrCode = null;
    }
  }

  /**
   * Disconnect the WhatsApp client
   */
  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isInitialized = false;
      this.isReady = false;
      this.qrCode = null;
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

export default WhatsAppWebJSService;