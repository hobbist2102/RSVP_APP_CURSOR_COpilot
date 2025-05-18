import { IWhatsAppService } from './whatsapp-interface';
import WhatsAppFactory, { WhatsAppProvider } from './whatsapp-factory';
import { EventEmitter } from 'events';

/**
 * WhatsApp Manager
 * Manages instances of WhatsApp services for different events
 */
class WhatsAppManager extends EventEmitter {
  private static instance: WhatsAppManager;
  private services: Map<string, IWhatsAppService> = new Map();
  private preferredProvider: WhatsAppProvider = WhatsAppProvider.WebJS;
  private businessApiKey: string | null = null;
  private businessPhoneNumberId: string | null = null;

  private constructor() {
    super();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): WhatsAppManager {
    if (!WhatsAppManager.instance) {
      WhatsAppManager.instance = new WhatsAppManager();
    }
    return WhatsAppManager.instance;
  }

  /**
   * Set the preferred WhatsApp provider
   */
  public setPreferredProvider(provider: WhatsAppProvider): void {
    this.preferredProvider = provider;
  }

  /**
   * Get the preferred WhatsApp provider
   */
  public getPreferredProvider(): WhatsAppProvider {
    return this.preferredProvider;
  }

  /**
   * Set the API credentials for Business API
   */
  public setBusinessAPICredentials(apiKey: string, phoneNumberId: string): void {
    this.businessApiKey = apiKey;
    this.businessPhoneNumberId = phoneNumberId;
  }

  /**
   * Get a service instance for a specific event
   */
  public async getService(eventId: number): Promise<IWhatsAppService> {
    const key = `event-${eventId}`;
    
    if (this.services.has(key)) {
      return this.services.get(key)!;
    }
    
    // Create a new service instance
    const service = this.createService(eventId);
    
    // Initialize the service if needed
    if (this.preferredProvider === WhatsAppProvider.BusinessAPI) {
      if (!this.businessApiKey || !this.businessPhoneNumberId) {
        throw new Error('Business API credentials not set');
      }
      
      await service.initialize(this.businessApiKey, this.businessPhoneNumberId);
    } else {
      await service.initialize();
    }
    
    // Forward events from the service
    service.on('qr', (qr: string) => {
      this.emit('qr', { eventId, qr });
    });
    
    service.on('ready', () => {
      this.emit('ready', { eventId });
    });
    
    service.on('authenticated', () => {
      this.emit('authenticated', { eventId });
    });
    
    service.on('auth_failure', (message: string) => {
      this.emit('auth_failure', { eventId, message });
    });
    
    service.on('disconnected', (reason: string) => {
      this.emit('disconnected', { eventId, reason });
    });
    
    service.on('message', (message: any) => {
      this.emit('message', { eventId, message });
    });
    
    // Store the service instance
    this.services.set(key, service);
    
    return service;
  }

  /**
   * Send a text message to a phone number for a specific event
   */
  public async sendTextMessage(eventId: number, to: string, text: string): Promise<string | null> {
    const service = await this.getService(eventId);
    return service.sendTextMessage(to, text);
  }

  /**
   * Send a media message to a phone number for a specific event
   */
  public async sendMediaMessage(
    eventId: number, 
    to: string, 
    mediaPath: string, 
    caption?: string
  ): Promise<string | null> {
    const service = await this.getService(eventId);
    return service.sendMediaMessage(to, mediaPath, caption);
  }

  /**
   * Send a template message to a phone number for a specific event
   * (Only available with Business API)
   */
  public async sendTemplateMessage(
    eventId: number,
    to: string,
    templateName: string,
    languageCode: string = 'en_US',
    components: any[] = []
  ): Promise<string | null> {
    const service = await this.getService(eventId);
    return service.sendTemplateMessage(to, templateName, languageCode, components);
  }

  /**
   * Disconnect a specific service
   */
  public async disconnectService(eventId: number): Promise<void> {
    const key = `event-${eventId}`;
    
    if (this.services.has(key)) {
      const service = this.services.get(key)!;
      
      if (typeof service.disconnect === 'function') {
        await service.disconnect();
      }
      
      this.services.delete(key);
    }
  }

  /**
   * Disconnect all services
   */
  public async disconnectAll(): Promise<void> {
    for (const [key, service] of this.services.entries()) {
      if (typeof service.disconnect === 'function') {
        await service.disconnect();
      }
    }
    
    this.services.clear();
  }

  /**
   * Create a service instance
   */
  private createService(eventId: number): IWhatsAppService {
    const options: any = {};
    
    if (this.preferredProvider === WhatsAppProvider.WebJS) {
      options.sessionId = `event-${eventId}`;
    } else if (this.preferredProvider === WhatsAppProvider.BusinessAPI) {
      options.apiKey = this.businessApiKey;
      options.phoneNumberId = this.businessPhoneNumberId;
    }
    
    return WhatsAppFactory.createService(this.preferredProvider, options);
  }
}

export default WhatsAppManager;