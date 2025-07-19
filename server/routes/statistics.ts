import { Express, Request, Response } from 'express';
import { storage } from '../storage';

export default function registerStatisticsRoutes(app: Express, isAuthenticated: any) {
  // Event statistics endpoint
  app.get('/api/events/:eventId/statistics', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const guests = await storage.getGuestsByEvent(eventId);
      
      const stats = {
        total: guests.length,
        confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
        declined: guests.filter(g => g.rsvpStatus === 'declined').length,
        pending: guests.filter(g => g.rsvpStatus === 'pending').length,
        plusOnes: guests.filter(g => g.plusOneName).length,
        children: guests.reduce((acc, g) => acc + (g.childrenDetails && Array.isArray(g.childrenDetails) ? g.childrenDetails.length : 0), 0),
        rsvpRate: guests.length > 0 ? 
          (guests.filter(g => g.rsvpStatus !== 'pending').length / guests.length) * 100 : 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Statistics fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // Additional statistics endpoints can be added here as they're developed
  // e.g., ceremony-specific stats, accommodation stats, etc.
}