/**
 * Communication Filtering Service
 * Handles WhatsApp availability and bride/groom side filtering for targeted communication
 */

import { storage } from '../storage';

class CommunicationFilteringService {
  /**
   * Get guests eligible for WhatsApp communication
   */
  static async getWhatsAppEnabledGuests(eventId: number) {
    try {
      const allGuests = await storage.getGuestsByEvent(eventId);
      
      // Filter guests who have WhatsApp enabled
      const whatsappGuests = allGuests.filter(guest => 
        guest.whatsappAvailable && 
        (guest.whatsappSame ? guest.phone : guest.whatsappNumber)
      );
      
      return {
        success: true,
        guests: whatsappGuests.map(guest => ({
          id: guest.id,
          name: `${guest.firstName} ${guest.lastName}`,
          phone: guest.whatsappSame ? guest.phone : guest.whatsappNumber,
          whatsappNumber: guest.whatsappSame ? guest.phone : guest.whatsappNumber,
          side: guest.side,
          rsvpStatus: guest.rsvpStatus
        })),
        total: whatsappGuests.length
      };
    } catch (error) {
      console.error('Error filtering WhatsApp guests:', error);
      return {
        success: false,
        error: 'Failed to filter WhatsApp guests',
        guests: [],
        total: 0
      };
    }
  }

  /**
   * Get guests by bride/groom side for targeted communication
   */
  static async getGuestsBySide(eventId: number, side: 'bride' | 'groom' | 'mutual') {
    try {
      const allGuests = await storage.getGuestsByEvent(eventId);
      
      // Filter guests by specified side
      const filteredGuests = allGuests.filter(guest => {
        if (side === 'mutual') {
          return guest.side === 'mutual' || !guest.side;
        }
        return guest.side === side;
      });
      
      return {
        success: true,
        side,
        guests: filteredGuests.map(guest => ({
          id: guest.id,
          name: `${guest.firstName} ${guest.lastName}`,
          email: guest.email,
          phone: guest.phone,
          whatsappAvailable: guest.whatsappAvailable,
          whatsappNumber: guest.whatsappSame ? guest.phone : guest.whatsappNumber,
          rsvpStatus: guest.rsvpStatus,
          side: guest.side
        })),
        total: filteredGuests.length
      };
    } catch (error) {
      console.error('Error filtering guests by side:', error);
      return {
        success: false,
        error: 'Failed to filter guests by side',
        guests: [],
        total: 0
      };
    }
  }

  /**
   * Get comprehensive communication statistics
   */
  static async getCommunicationStats(eventId: number) {
    try {
      const allGuests = await storage.getGuestsByEvent(eventId);
      
      const stats = {
        total: allGuests.length,
        whatsappEnabled: allGuests.filter(g => g.whatsappAvailable).length,
        emailAvailable: allGuests.filter(g => g.email).length,
        brideSide: allGuests.filter(g => g.side === 'bride').length,
        groomSide: allGuests.filter(g => g.side === 'groom').length,
        mutualSide: allGuests.filter(g => g.side === 'mutual' || !g.side).length,
        confirmed: allGuests.filter(g => g.rsvpStatus === 'confirmed').length,
        pending: allGuests.filter(g => g.rsvpStatus === 'pending').length,
        declined: allGuests.filter(g => g.rsvpStatus === 'declined').length
      };
      
      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Error getting communication stats:', error);
      return {
        success: false,
        error: 'Failed to get communication statistics'
      };
    }
  }

  /**
   * Filter guests for WhatsApp communication (alias method)
   */
  static async filterGuestsForWhatsApp(eventId: number, filters: any) {
    return this.getWhatsAppEnabledGuests(eventId);
  }

  /**
   * Get guests by filter criteria
   */
  static async getGuestsByFilter(eventId: number, filters: any) {
    try {
      const allGuests = await storage.getGuestsByEvent(eventId);
      let filteredGuests = allGuests;

      // Apply filters
      if (filters.confirmedOnly) {
        filteredGuests = filteredGuests.filter(g => g.rsvpStatus === 'confirmed');
      }
      if (filters.pendingOnly) {
        filteredGuests = filteredGuests.filter(g => g.rsvpStatus === 'pending');
      }
      if (filters.side) {
        filteredGuests = filteredGuests.filter(g => g.side === filters.side);
      }

      return {
        success: true,
        guests: filteredGuests.map(guest => ({
          id: guest.id,
          name: `${guest.firstName} ${guest.lastName}`,
          email: guest.email,
          phone: guest.phone,
          rsvpStatus: guest.rsvpStatus,
          side: guest.side
        })),
        total: filteredGuests.length
      };
    } catch (error) {
      console.error('Error filtering guests:', error);
      return {
        success: false,
        error: 'Failed to filter guests'
      };
    }
  }

  /**
   * Get meal planning data
   */
  static async getMealPlanningData(eventId: number) {
    try {
      const guests = await storage.getGuestsByEvent(eventId);
      const mealSelections = await storage.getGuestMealSelectionsByEvent(eventId);

      const requirements = guests.map(guest => {
        const guestMeals = mealSelections.filter(ms => ms.guestId === guest.id);
        return {
          guestId: guest.id,
          guestName: `${guest.firstName} ${guest.lastName}`,
          dietaryRestrictions: guest.dietaryRestrictions,
          allergies: guest.allergies,
          notes: guest.notes,
          rsvpStatus: guest.rsvpStatus,
          plusOneDietary: guest.plusOneDietary ? {
            name: guest.plusOneName,
            dietary: guest.plusOneDietary
          } : null
        };
      });

      return {
        success: true,
        requirements,
        summary: {
          totalGuests: guests.length,
          confirmedGuests: guests.filter(g => g.rsvpStatus === 'confirmed').length,
          dietaryRestrictions: guests.filter(g => g.dietaryRestrictions).length,
          allergies: guests.filter(g => g.allergies).length
        },
        total: requirements.length
      };
    } catch (error) {
      console.error('Error getting meal planning data:', error);
      return {
        success: false,
        error: 'Failed to get meal planning data'
      };
    }
  }
}

export default CommunicationFilteringService;