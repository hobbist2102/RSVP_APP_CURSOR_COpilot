import { IWhatsAppService } from './whatsapp-interface';
import WhatsAppWebJSService from './whatsapp-wwebjs';
import WhatsAppBusinessAPIService from './whatsapp-business-api';

export enum WhatsAppProvider {
  WebJS = 'webjs',
  BusinessAPI = 'business-api'
}

/**
 * Factory class to create WhatsApp service instances
 */
class WhatsAppFactory {
  /**
   * Create a WhatsApp service instance based on the provider type
   */
  static createService(provider: WhatsAppProvider, options?: any): IWhatsAppService {
    switch (provider) {
      case WhatsAppProvider.WebJS:
        const sessionId = options?.sessionId || 'default-session';
        return new WhatsAppWebJSService(sessionId);
        
      case WhatsAppProvider.BusinessAPI:
        const { apiKey, phoneNumberId } = options || {};
        return new WhatsAppBusinessAPIService(apiKey, phoneNumberId);
        
      default:
        throw new Error(`Unknown WhatsApp provider: ${provider}`);
    }
  }
}

export default WhatsAppFactory;