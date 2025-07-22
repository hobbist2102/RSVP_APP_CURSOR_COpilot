/**
 * Integration Routes
 * API endpoints for cross-module data integration
 */

import express from 'express';
// Auth middleware will be passed as parameter
import CommunicationFilteringService from '../services/communication-filtering';
import DietaryIntegrationService from '../services/dietary-integration';

// Create function to register integration routes
export function registerIntegrationRoutes(app: any, isAuthenticated: any) {
  const router = express.Router();

/**
 * Get WhatsApp-enabled guests for communication
 */
router.get('/events/:eventId/guests/whatsapp', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { side, status, withPlusOnes } = req.query;
    
    const filters: any = {};
    if (side === 'bride') filters.brideSideOnly = true;
    if (side === 'groom') filters.groomSideOnly = true;
    if (status === 'confirmed') filters.confirmedOnly = true;
    if (status === 'pending') filters.pendingOnly = true;
    if (withPlusOnes === 'true') filters.withPlusOnes = true;
    
    const whatsappGuests = await CommunicationFilteringService.filterGuestsForWhatsApp(eventId, filters);
    
    res.json({
      success: true,
      count: whatsappGuests.length,
      guests: whatsappGuests.map(guest => ({
        id: guest.id,
        name: `${guest.firstName} ${guest.lastName}`,
        whatsappNumber: guest.whatsappSame ? guest.phone : guest.whatsappNumber,
        side: guest.side,
        rsvpStatus: guest.rsvpStatus,
        plusOneAllowed: guest.plusOneAllowed
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get WhatsApp guests' });
  }
});

/**
 * Get email-enabled guests for communication
 */
router.get('/events/:eventId/guests/email', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { side, status } = req.query;
    
    const filters: any = {};
    if (side === 'bride') filters.brideSideOnly = true;
    if (side === 'groom') filters.groomSideOnly = true;
    if (status === 'confirmed') filters.confirmedOnly = true;
    if (status === 'pending') filters.pendingOnly = true;
    
    const emailGuests = await CommunicationFilteringService.getGuestsByFilter(eventId, filters);
    
    res.json({
      success: true,
      count: emailGuests.length,
      guests: emailGuests.map(guest => ({
        id: guest.id,
        name: `${guest.firstName} ${guest.lastName}`,
        email: guest.email,
        side: guest.side,
        rsvpStatus: guest.rsvpStatus
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get email guests' });
  }
});

/**
 * Get comprehensive communication statistics
 */
router.get('/events/:eventId/communication/stats', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const stats = await CommunicationFilteringService.getCommunicationStats(eventId);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get communication stats' });
  }
});

/**
 * Get dietary requirements for meal planning
 */
router.get('/events/:eventId/dietary/requirements', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const requirements = await DietaryIntegrationService.getDietaryRequirements(eventId);
    
    res.json({
      success: true,
      count: requirements.length,
      requirements
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get dietary requirements' });
  }
});

/**
 * Get meal planning data for kitchen coordination
 */
router.get('/events/:eventId/dietary/meal-planning', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const mealData = await DietaryIntegrationService.getMealPlanningData(eventId);
    
    res.json({
      success: true,
      mealData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get meal planning data' });
  }
});

/**
 * Get kitchen preparation notes
 */
router.get('/events/:eventId/dietary/kitchen-notes', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const notes = { notes: "Kitchen notes feature coming soon", allergies: [], specialRequests: [] };
    
    res.json({
      success: true,
      notes
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get kitchen notes' });
  }
});

/**
 * Export dietary data for caterers
 */
router.get('/events/:eventId/dietary/export', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const exportData = { message: "Caterer export feature coming soon", format: "csv" };
    
    res.json({
      success: true,
      exportData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to export dietary data' });
  }
});

/**
 * Get guests by side for targeted communication
 */
router.get('/events/:eventId/guests/by-side/:side', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const side = req.params.side as 'bride' | 'groom' | 'mutual';
    
    if (!['bride', 'groom', 'mutual'].includes(side)) {
      return res.status(400).json({ success: false, error: 'Invalid side parameter' });
    }
    
    const guests = await CommunicationFilteringService.getGuestsBySide(eventId, side);
    
    res.json({
      success: true,
      side,
      count: guests.length,
      guests: guests.map(guest => ({
        id: guest.id,
        name: `${guest.firstName} ${guest.lastName}`,
        email: guest.email,
        whatsappAvailable: guest.whatsappAvailable,
        rsvpStatus: guest.rsvpStatus
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get guests by side' });
  }
});

  // Mount router
  app.use('/api', router);
}