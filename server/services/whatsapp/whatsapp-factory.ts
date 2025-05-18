/**
 * WhatsApp Provider Enum - Defines which implementation to use
 */
export enum WhatsAppProvider {
  WebJS = 'webjs',
  BusinessAPI = 'business-api'
}

/**
 * Configuration for WhatsApp services
 */
export interface WhatsAppConfig {
  eventId: number;
  accessToken?: string;
  phoneNumberId?: string;
  phoneNumber?: string;
  businessAccountId?: string;
}

export default class WhatsAppFactory {
  /**
   * Create a WhatsApp service instance based on the provider
   * @param provider WhatsApp provider type
   * @param config Configuration for the WhatsApp service
   * @returns Promise resolving to a WhatsApp service instance
   */
  static async createService(provider: WhatsAppProvider, config: WhatsAppConfig) {
    // Dynamic imports to avoid circular dependencies
    const { WhatsAppWebJSService, WhatsAppBusinessAPIService } = await import('./index');
    
    switch (provider) {
      case WhatsAppProvider.WebJS:
        return new WhatsAppWebJSService(config.eventId);
      
      case WhatsAppProvider.BusinessAPI:
        if (!config.accessToken || !config.phoneNumberId) {
          throw new Error('Access token and phone number ID are required for WhatsApp Business API');
        }
        return new WhatsAppBusinessAPIService(
          config.eventId,
          config.accessToken,
          config.phoneNumberId,
          config.phoneNumber || '',
          config.businessAccountId || ''
        );
      
      default:
        throw new Error(`Unsupported WhatsApp provider: ${provider}`);
    }
  }
}