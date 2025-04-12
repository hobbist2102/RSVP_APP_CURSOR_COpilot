/**
 * RSVP service for generating secure RSVP links and handling RSVP responses
 */
import { Guest, WeddingEvent, insertGuestSchema } from "@shared/schema";
import { storage } from "../storage";
import { randomBytes, createHmac } from "crypto";
import { z } from "zod";

// RSVP response schema
export const RSVPResponseSchema = z.object({
  guestId: z.number(),
  eventId: z.number(),
  attending: z.boolean(),
  plusOneAttending: z.boolean().optional(),
  plusOneName: z.string().optional(),
  plusOneEmail: z.string().email().optional(),
  plusOnePhone: z.string().optional(),
  childrenAttending: z.number().default(0),
  childrenDetails: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  message: z.string().optional(),
  accommodationNeeded: z.boolean().optional(),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  transportationNeeded: z.boolean().optional(),
  ceremonies: z.array(z.object({
    ceremonyId: z.number(),
    attending: z.boolean(),
    mealOptionId: z.number().optional()
  })).optional()
});

export type RSVPResponse = z.infer<typeof RSVPResponseSchema>;

export class RSVPService {
  private static readonly TOKEN_EXPIRY_DAYS = 90; // 90 days expiry for RSVP tokens
  private static readonly SECRET_KEY = process.env.RSVP_SECRET_KEY || 'wedding_rsvp_default_secret_key';
  
  /**
   * Generate a secure RSVP token for a guest
   */
  static generateToken(guestId: number, eventId: number): string {
    const timestamp = Date.now();
    const randomString = randomBytes(16).toString('hex');
    const payload = `${guestId}:${eventId}:${timestamp}:${randomString}`;
    
    const hmac = createHmac('sha256', this.SECRET_KEY);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    
    return Buffer.from(`${payload}:${signature}`).toString('base64url');
  }
  
  /**
   * Verify a RSVP token and return guest and event IDs if valid
   */
  static verifyToken(token: string): { guestId: number; eventId: number; timestamp: number } | null {
    try {
      const decoded = Buffer.from(token, 'base64url').toString();
      const [guestIdStr, eventIdStr, timestampStr, randomString, signature] = decoded.split(':');
      
      const guestId = parseInt(guestIdStr);
      const eventId = parseInt(eventIdStr);
      const timestamp = parseInt(timestampStr);
      
      if (isNaN(guestId) || isNaN(eventId) || isNaN(timestamp)) {
        console.warn('Invalid token format');
        return null;
      }
      
      // Check if token is expired
      const expiryTime = timestamp + (this.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      if (Date.now() > expiryTime) {
        console.warn('Token expired');
        return null;
      }
      
      // Verify signature
      const payload = `${guestId}:${eventId}:${timestamp}:${randomString}`;
      const hmac = createHmac('sha256', this.SECRET_KEY);
      hmac.update(payload);
      const expectedSignature = hmac.digest('hex');
      
      if (signature !== expectedSignature) {
        console.warn('Invalid token signature');
        return null;
      }
      
      return { guestId, eventId, timestamp };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
  
  /**
   * Generate a RSVP link for a guest
   */
  static generateRSVPLink(baseUrl: string, guest: Guest, event: WeddingEvent): string {
    const token = this.generateToken(guest.id, event.id);
    return `${baseUrl}/rsvp?token=${token}`;
  }
  
  /**
   * Process an RSVP response
   */
  static async processRSVPResponse(response: RSVPResponse): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate guest and event exist
      const guest = await storage.getGuest(response.guestId);
      if (!guest) {
        return { success: false, message: 'Guest not found' };
      }
      
      const event = await storage.getEvent(response.eventId);
      if (!event) {
        return { success: false, message: 'Event not found' };
      }
      
      // Update guest RSVP status
      const updatedGuest = {
        ...guest,
        rsvpStatus: response.attending ? 'confirmed' : 'declined',
        rsvpDate: new Date().toISOString(),
        plusOneConfirmed: response.plusOneAttending,
        plusOneName: response.plusOneName || guest.plusOneName,
        dietaryRestrictions: response.dietaryRestrictions || guest.dietaryRestrictions,
        // Update children information if provided
        childrenDetails: response.childrenDetails || guest.childrenDetails,
      };
      
      await storage.updateGuest(guest.id, updatedGuest);
      
      // Process ceremony selections if provided
      if (response.ceremonies && response.ceremonies.length > 0) {
        for (const ceremony of response.ceremonies) {
          // Check if guest-ceremony relation already exists
          const existingRelation = await storage.getGuestCeremony(guest.id, ceremony.ceremonyId);
          
          if (existingRelation) {
            // Update existing relation
            await storage.updateGuestCeremony(existingRelation.id, {
              attending: ceremony.attending
            });
          } else {
            // Create new relation
            await storage.createGuestCeremony({
              guestId: guest.id,
              ceremonyId: ceremony.ceremonyId,
              attending: ceremony.attending
            });
          }
          
          // Handle meal selection if provided and attending
          if (ceremony.attending && ceremony.mealOptionId) {
            // Check if meal selection already exists
            const existingMealSelections = await storage.getGuestMealSelectionsByGuest(guest.id);
            const existingForCeremony = existingMealSelections.find(ms => 
              ms.ceremonyId === ceremony.ceremonyId
            );
            
            if (existingForCeremony) {
              // Update existing meal selection
              await storage.updateGuestMealSelection(existingForCeremony.id, {
                mealOptionId: ceremony.mealOptionId
              });
            } else {
              // Create new meal selection
              await storage.createGuestMealSelection({
                guestId: guest.id,
                ceremonyId: ceremony.ceremonyId,
                mealOptionId: ceremony.mealOptionId
              });
            }
          }
        }
      }
      
      // Handle accommodation needs
      if (response.accommodationNeeded) {
        // For now, just record this in the guest record
        // In a future enhancement, we would allocate a room based on available inventory
        await storage.updateGuest(guest.id, {
          accommodationPreference: 'needed',
          accommodationNotes: `Arrival: ${response.arrivalDate}, Departure: ${response.departureDate}`
        });
      }
      
      // Handle transportation needs
      if (response.transportationNeeded) {
        // Check if travel info already exists
        const existingTravelInfo = await storage.getTravelInfoByGuest(guest.id);
        
        if (existingTravelInfo) {
          // Update existing travel info
          await storage.updateTravelInfo(existingTravelInfo.id, {
            needsTransportation: true,
            arrivalDate: response.arrivalDate,
            departureDate: response.departureDate
          });
        } else {
          // Create new travel info
          await storage.createTravelInfo({
            guestId: guest.id,
            needsTransportation: true,
            arrivalDate: response.arrivalDate,
            departureDate: response.departureDate
          });
        }
      }
      
      // Record message if provided
      if (response.message) {
        await storage.createCoupleMessage({
          guestId: guest.id,
          eventId: event.id,
          message: response.message,
          isPrivate: false
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error processing RSVP response:', error);
      return { 
        success: false, 
        message: 'An error occurred while processing your RSVP. Please try again later.'
      };
    }
  }
}