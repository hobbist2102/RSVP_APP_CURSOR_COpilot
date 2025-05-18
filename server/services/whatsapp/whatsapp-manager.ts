import { IWhatsAppService } from './whatsapp-interface';
import WhatsAppFactory, { WhatsAppProvider, WhatsAppConfig } from './whatsapp-factory';
import { db } from '../../db';
import { weddingEvents as events } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Singleton manager for WhatsApp services
 */
export default class WhatsAppManager {
  private static instance: WhatsAppManager;
  private services: Map<number, IWhatsAppService> = new Map();
  private preferredProvider: WhatsAppProvider = WhatsAppProvider.WebJS;
  private businessApiKey: string = '';
  private businessPhoneNumberId: string = '';

  private constructor() {}

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
   * Get the preferred WhatsApp provider
   */
  public getPreferredProvider(): WhatsAppProvider {
    return this.preferredProvider;
  }

  /**
   * Set the preferred WhatsApp provider
   * @param provider The provider to use
   */
  public setPreferredProvider(provider: WhatsAppProvider): void {
    this.preferredProvider = provider;
  }

  /**
   * Set Business API credentials
   * @param apiKey WhatsApp Business API key
   * @param phoneNumberId WhatsApp Business phone number ID
   */
  public setBusinessAPICredentials(apiKey: string, phoneNumberId: string): void {
    this.businessApiKey = apiKey;
    this.businessPhoneNumberId = phoneNumberId;
  }

  /**
   * Get a WhatsApp service for a specific event
   * @param eventId Event ID
   * @returns Promise resolving to a WhatsApp service
   */
  public async getService(eventId: number): Promise<IWhatsAppService> {
    // Check if a service instance already exists
    if (this.services.has(eventId)) {
      return this.services.get(eventId)!;
    }

    // Get event details from the database
    const [event] = await db.select({
      whatsappConfigured: events.whatsappConfigured,
      whatsappAccessToken: events.whatsappAccessToken,
      whatsappBusinessPhoneId: events.whatsappBusinessPhoneId,
      whatsappBusinessNumber: events.whatsappBusinessNumber,
      whatsappBusinessAccountId: events.whatsappBusinessAccountId
    })
    .from(events)
    .where(eq(events.id, eventId));

    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    // Determine which provider to use
    let provider = this.preferredProvider;
    let config: WhatsAppConfig = {
      eventId
    };

    // Configure based on provider
    if (provider === WhatsAppProvider.BusinessAPI) {
      config.accessToken = event.whatsappAccessToken || this.businessApiKey;
      config.phoneNumberId = event.whatsappBusinessPhoneId || this.businessPhoneNumberId;
      config.phoneNumber = event.whatsappBusinessNumber || '';
      config.businessAccountId = event.whatsappBusinessAccountId || '';

      // Validate required credentials
      if (!config.accessToken || !config.phoneNumberId) {
        throw new Error('WhatsApp Business API requires an access token and phone number ID');
      }
    }

    // Create the service
    const service = await WhatsAppFactory.createService(provider, config);
    
    // Initialize the service
    await service.initialize();
    
    // Store and return the service
    this.services.set(eventId, service);
    return service;
  }

  /**
   * Disconnect a WhatsApp service for a specific event
   * @param eventId Event ID
   */
  public async disconnectService(eventId: number): Promise<void> {
    const service = this.services.get(eventId);
    if (service) {
      await service.disconnect();
      this.services.delete(eventId);
    }
  }

  /**
   * Disconnect all WhatsApp services
   */
  public async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.services.entries()).map(async ([eventId, service]) => {
      await service.disconnect();
      this.services.delete(eventId);
    });
    
    await Promise.all(disconnectPromises);
  }

  /**
   * Send a text message
   * @param eventId Event ID
   * @param to Recipient phone number
   * @param message Text message
   * @returns Promise resolving to message ID
   */
  public async sendTextMessage(eventId: number, to: string, message: string): Promise<string> {
    const service = await this.getService(eventId);
    return service.sendTextMessage(to, message);
  }

  /**
   * Send a media message
   * @param eventId Event ID
   * @param to Recipient phone number
   * @param mediaPath Path to media file
   * @param caption Optional caption
   * @returns Promise resolving to message ID
   */
  public async sendMediaMessage(eventId: number, to: string, mediaPath: string, caption?: string): Promise<string> {
    const service = await this.getService(eventId);
    return service.sendMediaMessage(to, mediaPath, caption);
  }

  /**
   * Send a template message (Business API only)
   * @param eventId Event ID
   * @param to Recipient phone number
   * @param templateName Template name
   * @param languageCode Language code
   * @param components Template components
   * @returns Promise resolving to message ID
   */
  public async sendTemplateMessage(
    eventId: number,
    to: string,
    templateName: string,
    languageCode: string,
    components: any[]
  ): Promise<string> {
    const service = await this.getService(eventId);
    
    if (!service.sendTemplateMessage) {
      throw new Error('Template messages are not supported by this WhatsApp provider');
    }
    
    return service.sendTemplateMessage(to, templateName, languageCode, components);
  }
}