import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';

export interface WhatsAppWebConfig {
  eventId: number;
  sessionPath?: string;
  userAgent?: string;
}

export interface QRCodeData {
  qr: string;
  image: string; // Base64 image
  expires: Date;
}

export interface WhatsAppMessage {
  to: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  mediaCaption?: string;
}

export interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  isRegistered: boolean;
}

export class WhatsAppWebService extends EventEmitter {
  private client: Client | null = null;
  private eventId: number;
  private sessionPath: string;
  private isReady: boolean = false;
  private qrData: QRCodeData | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: WhatsAppWebConfig) {
    super();
    this.eventId = config.eventId;
    this.sessionPath = config.sessionPath || path.join(process.cwd(), 'whatsapp-sessions', `event-${config.eventId}`);
    
    // Ensure session directory exists
    this.ensureSessionDirectory();
  }

  /**
   * Initialize WhatsApp Web client
   */
  async initialize(): Promise<void> {
    try {
      console.log(`[WhatsApp] Initializing client for event ${this.eventId}`);
      
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: `event-${this.eventId}`,
          dataPath: this.sessionPath
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        },
        webVersionCache: {
          type: 'remote',
          remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
      });

      this.setupEventHandlers();
      await this.client.initialize();
      
    } catch (error) {
      console.error(`[WhatsApp] Initialization failed:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Setup event handlers for WhatsApp client
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    // QR Code generation
    this.client.on('qr', async (qr) => {
      console.log(`[WhatsApp] QR Code received for event ${this.eventId}`);
      
      try {
        const qrImage = await qrcode.toDataURL(qr, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          width: 256
        });

        this.qrData = {
          qr,
          image: qrImage,
          expires: new Date(Date.now() + 45000) // QR expires in 45 seconds
        };

        this.emit('qr', this.qrData);
        console.log(`[WhatsApp] QR Code generated and ready for scanning`);
        
      } catch (error) {
        console.error('[WhatsApp] Failed to generate QR code:', error);
        this.emit('error', error);
      }
    });

    // Authentication success
    this.client.on('authenticated', () => {
      console.log(`[WhatsApp] Client authenticated for event ${this.eventId}`);
      this.emit('authenticated');
    });

    // Authentication failure
    this.client.on('auth_failure', (msg) => {
      console.error(`[WhatsApp] Authentication failed for event ${this.eventId}:`, msg);
      this.emit('auth_failure', msg);
    });

    // Client ready
    this.client.on('ready', async () => {
      console.log(`[WhatsApp] Client ready for event ${this.eventId}`);
      this.isReady = true;
      this.reconnectAttempts = 0;
      this.qrData = null; // Clear QR data once authenticated
      
      // Get client info
      const info = this.client!.info;
      console.log(`[WhatsApp] Connected as: ${info.pushname} (${info.wid.user})`);
      
      this.emit('ready', {
        name: info.pushname,
        number: info.wid.user,
        platform: info.platform
      });
    });

    // Disconnection
    this.client.on('disconnected', (reason) => {
      console.log(`[WhatsApp] Client disconnected for event ${this.eventId}:`, reason);
      this.isReady = false;
      this.emit('disconnected', reason);
      
      // Attempt reconnection
      this.attemptReconnection();
    });

    // Message received
    this.client.on('message', (message) => {
      this.emit('message', {
        id: message.id.id,
        from: message.from,
        to: message.to,
        body: message.body,
        type: message.type,
        timestamp: message.timestamp,
        isForwarded: message.isForwarded,
        isStarred: message.isStarred
      });
    });

    // Group join/leave events
    this.client.on('group_join', (notification) => {
      this.emit('group_join', notification);
    });

    this.client.on('group_leave', (notification) => {
      this.emit('group_leave', notification);
    });
  }

  /**
   * Attempt to reconnect the client
   */
  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`[WhatsApp] Max reconnection attempts reached for event ${this.eventId}`);
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
    
    console.log(`[WhatsApp] Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        await this.initialize();
      } catch (error) {
        console.error(`[WhatsApp] Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      }
    }, delay);
  }

  /**
   * Send a text message
   */
  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client not ready');
    }

    try {
      // Format number (ensure it includes country code)
      const chatId = this.formatPhoneNumber(to);
      
      // Check if number is registered on WhatsApp
      const isRegistered = await this.client.isRegisteredUser(chatId);
      if (!isRegistered) {
        throw new Error(`Number ${to} is not registered on WhatsApp`);
      }

      const result = await this.client.sendMessage(chatId, message);
      console.log(`[WhatsApp] Message sent to ${to}: ${message.substring(0, 50)}...`);
      
      this.emit('message_sent', {
        to: chatId,
        message: message,
        messageId: result.id.id,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error(`[WhatsApp] Failed to send message to ${to}:`, error);
      this.emit('message_error', { to, message, error });
      return false;
    }
  }

  /**
   * Send media message (image, video, document)
   */
  async sendMedia(to: string, mediaPath: string, caption?: string): Promise<boolean> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client not ready');
    }

    try {
      const chatId = this.formatPhoneNumber(to);
      
      // Check if file exists
      if (!fs.existsSync(mediaPath)) {
        throw new Error(`Media file not found: ${mediaPath}`);
      }

      const media = MessageMedia.fromFilePath(mediaPath);
      const result = await this.client.sendMessage(chatId, media, { caption });
      
      console.log(`[WhatsApp] Media sent to ${to}: ${path.basename(mediaPath)}`);
      
      this.emit('media_sent', {
        to: chatId,
        mediaPath,
        caption,
        messageId: result.id.id,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error(`[WhatsApp] Failed to send media to ${to}:`, error);
      this.emit('media_error', { to, mediaPath, caption, error });
      return false;
    }
  }

  /**
   * Get contact info
   */
  async getContact(number: string): Promise<WhatsAppContact | null> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client not ready');
    }

    try {
      const chatId = this.formatPhoneNumber(number);
      const contact = await this.client.getContactById(chatId);
      const isRegistered = await this.client.isRegisteredUser(chatId);

      return {
        id: contact.id._serialized,
        name: contact.name || contact.pushname || 'Unknown',
        number: contact.number,
        isRegistered
      };
    } catch (error) {
      console.error(`[WhatsApp] Failed to get contact ${number}:`, error);
      return null;
    }
  }

  /**
   * Get current QR code data
   */
  getQRCode(): QRCodeData | null {
    return this.qrData;
  }

  /**
   * Check if client is ready
   */
  isClientReady(): boolean {
    return this.isReady;
  }

  /**
   * Get client status
   */
  getStatus(): string {
    if (!this.client) return 'not_initialized';
    if (!this.isReady) return 'connecting';
    return 'ready';
  }

  /**
   * Logout and destroy client
   */
  async logout(): Promise<void> {
    try {
      if (this.client) {
        await this.client.logout();
        await this.client.destroy();
        this.client = null;
      }
      this.isReady = false;
      this.qrData = null;
      
      console.log(`[WhatsApp] Client logged out for event ${this.eventId}`);
      this.emit('logout');
    } catch (error) {
      console.error(`[WhatsApp] Logout failed:`, error);
      throw error;
    }
  }

  /**
   * Destroy client without logout
   */
  async destroy(): Promise<void> {
    try {
      if (this.client) {
        await this.client.destroy();
        this.client = null;
      }
      this.isReady = false;
      this.qrData = null;
      
      console.log(`[WhatsApp] Client destroyed for event ${this.eventId}`);
      this.emit('destroyed');
    } catch (error) {
      console.error(`[WhatsApp] Destroy failed:`, error);
    }
  }

  /**
   * Format phone number for WhatsApp
   */
  private formatPhoneNumber(number: string): string {
    // Remove all non-digit characters
    let cleaned = number.replace(/\D/g, '');
    
    // Add @c.us suffix if not present
    if (!cleaned.includes('@')) {
      cleaned += '@c.us';
    }
    
    return cleaned;
  }

  /**
   * Ensure session directory exists
   */
  private ensureSessionDirectory(): void {
    const sessionDir = path.dirname(this.sessionPath);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
      console.log(`[WhatsApp] Created session directory: ${sessionDir}`);
    }
  }

  /**
   * Clean up old session files
   */
  async cleanupSession(): Promise<void> {
    try {
      if (fs.existsSync(this.sessionPath)) {
        fs.rmSync(this.sessionPath, { recursive: true, force: true });
        console.log(`[WhatsApp] Session cleanup completed for event ${this.eventId}`);
      }
    } catch (error) {
      console.error(`[WhatsApp] Session cleanup failed:`, error);
    }
  }
}

// Export singleton manager for multiple event instances
export class WhatsAppManager {
  private static instances: Map<number, WhatsAppWebService> = new Map();

  static async getInstance(eventId: number): Promise<WhatsAppWebService> {
    if (!this.instances.has(eventId)) {
      const service = new WhatsAppWebService({ eventId });
      this.instances.set(eventId, service);
    }
    return this.instances.get(eventId)!;
  }

  static async removeInstance(eventId: number): Promise<void> {
    const instance = this.instances.get(eventId);
    if (instance) {
      await instance.destroy();
      this.instances.delete(eventId);
    }
  }

  static getAllInstances(): Map<number, WhatsAppWebService> {
    return this.instances;
  }

  static async destroyAll(): Promise<void> {
    for (const [eventId, instance] of this.instances) {
      await instance.destroy();
    }
    this.instances.clear();
  }
}