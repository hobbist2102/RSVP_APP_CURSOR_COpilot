/**
 * WhatsApp service for sending messages to guests
 * Uses the WhatsApp Business API to send messages
 */
import { Guest, WeddingEvent, WhatsappTemplate } from "@shared/schema";
import { storage } from "../storage";

export interface WhatsAppMessage {
  to: string;
  templateName: string;
  languageCode: string;
  components?: Array<{
    type: string;
    parameters: Array<{
      type: string;
      text?: string;
      image?: {
        link: string;
      };
      document?: {
        link: string;
        filename: string;
      };
    }>;
  }>;
}

export class WhatsAppService {
  private apiKey: string | null;
  private businessPhoneNumberId: string | null;
  private eventId: number;
  private eventName: string;
  
  constructor(eventId: number, apiKey: string | null = null, businessPhoneNumberId: string | null = null, eventName: string = '') {
    this.eventId = eventId;
    this.apiKey = apiKey;
    this.businessPhoneNumberId = businessPhoneNumberId;
    this.eventName = eventName;
  }
  
  /**
   * Check if the WhatsApp service is configured and ready to use
   */
  public isConfigured(): boolean {
    return !!(this.apiKey && this.businessPhoneNumberId);
  }
  
  /**
   * Send a WhatsApp message to a guest
   */
  public async sendMessage(guest: Guest, templateName: string, parameters: any = {}): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.warn(`WhatsApp not configured for event ${this.eventId}`);
      return { success: false, error: 'WhatsApp service not configured' };
    }
    
    if (!guest.phone) {
      console.warn(`Guest ${guest.id} has no phone number`);
      return { success: false, error: 'Guest has no phone number' };
    }
    
    // Format phone number - ensure it includes country code and remove any spaces or dashes
    const phone = this.formatPhoneNumber(guest.phone, guest.countryCode || '91');
    
    // Get template from database
    try {
      const templates = await storage.getWhatsappTemplatesByCategory(this.eventId, templateName);
      
      if (!templates || templates.length === 0) {
        console.warn(`No template found with name ${templateName} for event ${this.eventId}`);
        return { success: false, error: `Template not found: ${templateName}` };
      }
      
      const template = templates[0];
      
      // Prepare parameters
      const messageParameters = this.prepareMessageParameters(template, guest, parameters);
      
      // Call WhatsApp Business API
      return await this.sendTemplateMessage(phone, template, messageParameters);
    } catch (error) {
      console.error(`Error sending WhatsApp message to guest ${guest.id}:`, error);
      return { success: false, error: 'Failed to send WhatsApp message' };
    }
  }
  
  /**
   * Send an RSVP invitation via WhatsApp
   */
  public async sendRSVPInvitation(guest: Guest, event: WeddingEvent, rsvpLink: string): Promise<{ success: boolean; id?: string; error?: string }> {
    // Get the deadline from the event, defaulting to a week from now if not set
    const deadline = event.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return await this.sendMessage(guest, 'rsvp_invitation', {
      event_name: event.title,
      couple_names: event.coupleNames,
      rsvp_link: rsvpLink,
      rsvp_deadline: deadline
    });
  }
  
  /**
   * Format a phone number for WhatsApp
   */
  private formatPhoneNumber(phone: string, countryCode: string): string {
    // Remove any non-digit characters
    let cleanPhone = phone.replace(/\D/g, '');
    
    // If phone doesn't start with +, add the country code
    if (!cleanPhone.startsWith('+')) {
      // If country code doesn't start with +, add it
      if (!countryCode.startsWith('+')) {
        countryCode = '+' + countryCode;
      }
      
      // Remove country code if it's already at the beginning of the phone number
      const codeWithoutPlus = countryCode.replace('+', '');
      if (cleanPhone.startsWith(codeWithoutPlus)) {
        cleanPhone = '+' + cleanPhone;
      } else {
        cleanPhone = countryCode + cleanPhone;
      }
    }
    
    return cleanPhone;
  }
  
  /**
   * Prepare message parameters from template and guest data
   */
  private prepareMessageParameters(template: WhatsappTemplate, guest: Guest, customParams: any): any {
    // Base parameters that are available for all templates
    const baseParams = {
      guest_name: `${guest.salutation || ''} ${guest.firstName} ${guest.lastName}`.trim(),
      first_name: guest.firstName,
      last_name: guest.lastName,
      event_name: this.eventName,
      ...customParams
    };
    
    // Parse template parameters from the database (if any)
    let templateParams = {};
    if (template.parameters) {
      try {
        templateParams = typeof template.parameters === 'string' ? 
          JSON.parse(template.parameters) : template.parameters;
      } catch (e) {
        console.warn(`Failed to parse template parameters for template ${template.id}:`, e);
      }
    }
    
    // Merge all parameters, with custom params taking precedence
    return {
      ...baseParams,
      ...templateParams
    };
  }
  
  /**
   * Send a template message to WhatsApp Business API
   */
  private async sendTemplateMessage(
    to: string, 
    template: WhatsappTemplate, 
    parameters: any
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.apiKey || !this.businessPhoneNumberId) {
      return { success: false, error: 'WhatsApp credentials not configured' };
    }
    
    try {
      // In a real implementation, we would make an HTTP request to the WhatsApp API
      // For now, we'll simulate a successful response
      console.log(`[WHATSAPP] Sending template "${template.name}" to ${to}`);
      console.log(`[WHATSAPP] Parameters:`, parameters);
      
      // If this is a development environment, just simulate success
      if (process.env.NODE_ENV !== 'production') {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update last used timestamp for the template
        await storage.markWhatsappTemplateAsUsed(template.id);
        
        return { 
          success: true, 
          id: `whatsapp_msg_${Date.now()}_${Math.floor(Math.random() * 1000)}` 
        };
      }
      
      // In production, make the actual API call to WhatsApp
      const response = await fetch(`https://graph.facebook.com/v17.0/${this.businessPhoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'template',
          template: {
            name: template.templateId || template.name,
            language: {
              code: template.language || 'en'
            },
            components: this.buildTemplateComponents(template, parameters)
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`WhatsApp API error:`, errorData);
        return { success: false, error: `WhatsApp API error: ${errorData.error?.message || 'Unknown error'}` };
      }
      
      const result = await response.json();
      
      // Update last used timestamp for the template
      await storage.markWhatsappTemplateAsUsed(template.id);
      
      return { success: true, id: result.messages?.[0]?.id };
    } catch (error) {
      console.error(`Error sending WhatsApp message:`, error);
      return { success: false, error: `Error sending WhatsApp message: ${error.message}` };
    }
  }
  
  /**
   * Build template components for WhatsApp API
   */
  private buildTemplateComponents(template: WhatsappTemplate, parameters: any): any[] {
    // This is a simplified implementation that would need to be expanded
    // based on the actual structure of your templates
    const headerComponent = {
      type: 'header',
      parameters: []
    };
    
    const bodyComponent = {
      type: 'body',
      parameters: Object.entries(parameters).map(([key, value]) => ({
        type: 'text',
        text: String(value)
      }))
    };
    
    return [headerComponent, bodyComponent];
  }
  
  /**
   * Create a WhatsAppService instance from an event object
   */
  public static fromEvent(event: WeddingEvent): WhatsAppService {
    // Get the WhatsApp API credentials from the event
    // Using the accessToken and businessPhoneId fields if available
    return new WhatsAppService(
      event.id,
      event.whatsappAccessToken || null,
      event.whatsappBusinessPhoneId || null,
      event.title
    );
  }
}