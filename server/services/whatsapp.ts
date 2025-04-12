/**
 * WhatsApp service for sending messages to guests
 * Uses the WhatsApp Business API to send messages
 */
import { Guest, WeddingEvent, WhatsappTemplate } from "@shared/schema";
import { storage } from "../storage";

export interface WhatsAppMessageParameter {
  type: string;
  text?: string;
  image?: {
    link: string;
  };
  document?: {
    link: string;
    filename: string;
  };
  video?: {
    link: string;
  };
  currency?: {
    code: string;
    amount: number;
  };
  date_time?: {
    fallback_value: string;
  };
}

export interface WhatsAppMessageComponent {
  type: string; // 'header', 'body', 'button', 'footer'
  parameters: WhatsAppMessageParameter[];
  sub_type?: string; // Used for buttons: 'quick_reply', 'url'
  index?: number; // Used for buttons
}

export interface WhatsAppMessage {
  to: string;
  templateName: string;
  languageCode: string;
  components?: WhatsAppMessageComponent[];
}

export type WhatsAppTemplateType = 
  | 'invitation'      // General event invitation
  | 'rsvp_invitation' // RSVP request
  | 'rsvp_confirmation' // RSVP confirmed
  | 'rsvp_declined'   // RSVP declined
  | 'reminder'        // General reminder
  | 'itinerary'       // Event schedule/itinerary
  | 'accommodation'   // Accommodation details
  | 'transportation'  // Transportation details
  | 'emergency'       // Emergency contact information
  | 'message_from_couple' // Special message from the couple
  | 'customs';        // Custom templates created by the user

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
   * @param guest The guest to send the message to
   * @param templateName The name/type of the template to use
   * @param parameters Custom parameters to include in the message
   * @returns Promise with success status, message ID, and error if any
   */
  public async sendMessage(guest: Guest, templateName: string, parameters: any = {}): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.warn(`WhatsApp not configured for event ${this.eventId}`);
      return { success: false, error: 'WhatsApp service not configured' };
    }
    
    // Check if guest has a phone number
    if (!guest.phone) {
      // If WhatsApp-specific number exists, use that
      if (guest.whatsappAvailable && guest.whatsappNumber) {
        // Format WhatsApp number
        const whatsAppPhone = this.formatPhoneNumber(
          guest.whatsappNumber, 
          guest.whatsappCountryCode || guest.countryCode || '91'
        );
        return this.sendMessageToPhone(whatsAppPhone, templateName, guest, parameters);
      }
      
      console.warn(`Guest ${guest.id} has no phone number`);
      return { success: false, error: 'Guest has no phone number' };
    }
    
    // Format standard phone number
    const phone = this.formatPhoneNumber(guest.phone, guest.countryCode || '91');
    
    return this.sendMessageToPhone(phone, templateName, guest, parameters);
  }
  
  /**
   * Send a WhatsApp message to a specific phone number
   * @param phone The formatted phone number to send to
   * @param templateName The name/type of the template to use
   * @param guest The guest data to personalize the message
   * @param parameters Custom parameters to include in the message
   * @returns Promise with success status, message ID, and error if any
   */
  private async sendMessageToPhone(
    phone: string, 
    templateName: string, 
    guest: Guest, 
    parameters: any = {}
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Get template from database
      const templates = await storage.getWhatsappTemplatesByCategory(this.eventId, templateName);
      
      if (!templates || templates.length === 0) {
        console.warn(`No template found with name ${templateName} for event ${this.eventId}`);
        return { success: false, error: `Template not found: ${templateName}` };
      }
      
      const template = templates[0];
      
      // Prepare parameters
      const messageParameters = this.prepareMessageParameters(template, guest, parameters);
      
      // Log the message being sent
      console.log(`[WHATSAPP] Sending message to ${guest.firstName} ${guest.lastName} (${phone}) using template "${templateName}"`);
      
      // Call WhatsApp Business API
      return await this.sendTemplateMessage(phone, template, messageParameters);
    } catch (error) {
      console.error(`Error sending WhatsApp message to guest ${guest.id}:`, error);
      return { success: false, error: 'Failed to send WhatsApp message' };
    }
  }
  
  /**
   * Send an RSVP invitation via WhatsApp
   * @param guest The guest to send the invitation to
   * @param event The wedding event details
   * @param rsvpLink The personalized RSVP link for the guest
   * @returns Promise with success status, message ID, and error if any
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
   * Send RSVP confirmation via WhatsApp
   * @param guest The guest whose RSVP was confirmed
   * @param event The wedding event details
   * @returns Promise with success status, message ID, and error if any
   */
  public async sendRSVPConfirmation(guest: Guest, event: WeddingEvent): Promise<{ success: boolean; id?: string; error?: string }> {
    return await this.sendMessage(guest, 'rsvp_confirmation', {
      event_name: event.title,
      couple_names: event.coupleNames,
      event_date: event.startDate,
      event_location: event.location
    });
  }
  
  /**
   * Send RSVP decline acknowledgment via WhatsApp
   * @param guest The guest who declined the invitation
   * @param event The wedding event details
   * @returns Promise with success status, message ID, and error if any
   */
  public async sendRSVPDeclined(guest: Guest, event: WeddingEvent): Promise<{ success: boolean; id?: string; error?: string }> {
    return await this.sendMessage(guest, 'rsvp_declined', {
      event_name: event.title,
      couple_names: event.coupleNames
    });
  }
  
  /**
   * Send event reminder via WhatsApp
   * @param guest The guest to remind
   * @param event The wedding event details
   * @param daysRemaining Number of days remaining until the event
   * @returns Promise with success status, message ID, and error if any
   */
  public async sendEventReminder(guest: Guest, event: WeddingEvent, daysRemaining: number): Promise<{ success: boolean; id?: string; error?: string }> {
    return await this.sendMessage(guest, 'reminder', {
      event_name: event.title,
      couple_names: event.coupleNames,
      event_date: event.startDate,
      event_location: event.location,
      days_remaining: daysRemaining.toString()
    });
  }
  
  /**
   * Send ceremony details via WhatsApp
   * @param guest The guest to send details to
   * @param event The wedding event details
   * @param ceremony The specific ceremony details
   * @returns Promise with success status, message ID, and error if any
   */
  public async sendCeremonyDetails(
    guest: Guest, 
    event: WeddingEvent, 
    ceremony: { name: string; date: string; location: string; startTime: string; attireCode?: string }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    return await this.sendMessage(guest, 'ceremony', {
      event_name: event.title,
      couple_names: event.coupleNames,
      ceremony_name: ceremony.name,
      ceremony_date: ceremony.date,
      ceremony_location: ceremony.location,
      ceremony_time: ceremony.startTime,
      attire_code: ceremony.attireCode || 'Formal'
    });
  }
  
  /**
   * Send accommodation details via WhatsApp
   * @param guest The guest to send details to
   * @param event The wedding event details
   * @param accommodation The accommodation details
   * @returns Promise with success status, message ID, and error if any
   */
  public async sendAccommodationDetails(
    guest: Guest, 
    event: WeddingEvent,
    accommodation: { 
      name: string; 
      roomType?: string; 
      checkInDate?: string; 
      checkOutDate?: string;
      roomNumber?: string;
    }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    return await this.sendMessage(guest, 'accommodation', {
      event_name: event.title,
      couple_names: event.coupleNames,
      hotel_name: accommodation.name,
      room_type: accommodation.roomType || 'Standard',
      check_in_date: accommodation.checkInDate || event.startDate,
      check_out_date: accommodation.checkOutDate || event.endDate,
      room_number: accommodation.roomNumber || 'To be assigned'
    });
  }
  
  /**
   * Send transportation details via WhatsApp
   * @param guest The guest to send details to
   * @param event The wedding event details
   * @param transport The transportation details
   * @returns Promise with success status, message ID, and error if any
   */
  public async sendTransportationDetails(
    guest: Guest, 
    event: WeddingEvent,
    transport: { 
      type: string; 
      pickupLocation?: string; 
      pickupTime?: string;
      contactNumber?: string;
    }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    return await this.sendMessage(guest, 'transportation', {
      event_name: event.title,
      couple_names: event.coupleNames,
      transport_type: transport.type,
      pickup_location: transport.pickupLocation || 'Main entrance',
      pickup_time: transport.pickupTime || '10:00 AM',
      contact_number: transport.contactNumber || 'Event coordinator'
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