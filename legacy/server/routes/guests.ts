import { Express, Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { storage } from '../storage';
import { insertGuestSchema } from '../../shared/schema';

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export default function registerGuestRoutes(app: Express, isAuthenticated: any) {
  // Get all guests for an event
  app.get('/api/events/:eventId/guests', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const guests = await storage.getGuestsByEvent(eventId);
      res.json(guests);
    } catch (error) {
      console.error('Guests fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch guests' });
    }
  });

  // Get specific guest by ID
  app.get('/api/guests/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid guest ID" });
      }
      
      const guest = await storage.getGuest(id);
      if (!guest) {
        return res.status(404).json({ message: 'Guest not found' });
      }
      
      res.json(guest);
    } catch (error) {
      console.error('Guest fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch guest' });
    }
  });

  // Create new guest
  app.post('/api/events/:eventId/guests', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const guestData = insertGuestSchema.parse({
        ...req.body,
        eventId
      });
      
      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      console.error('Guest creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create guest' });
    }
  });

  // Update guest
  app.put('/api/guests/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid guest ID" });
      }
      
      const updateData = insertGuestSchema.partial().parse(req.body);
      const guest = await storage.updateGuest(id, updateData);
      
      if (!guest) {
        return res.status(404).json({ message: 'Guest not found' });
      }
      
      res.json(guest);
    } catch (error) {
      console.error('Guest update error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update guest' });
    }
  });

  // Delete guest
  app.delete('/api/guests/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid guest ID" });
      }
      
      const success = await storage.deleteGuest(id);
      if (!success) {
        return res.status(404).json({ message: 'Guest not found' });
      }
      
      res.json({ message: 'Guest deleted successfully' });
    } catch (error) {
      console.error('Guest deletion error:', error);
      res.status(500).json({ message: 'Failed to delete guest' });
    }
  });

  // Update guest contact preference
  app.patch('/api/guests/:id/contact-preference', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid guest ID" });
      }
      
      const { contactPreference } = req.body;
      if (!contactPreference || !['email', 'whatsapp', 'phone'].includes(contactPreference)) {
        return res.status(400).json({ message: "Invalid contact preference" });
      }
      
      const guest = await storage.updateGuest(id, { contactPreference });
      if (!guest) {
        return res.status(404).json({ message: 'Guest not found' });
      }
      
      res.json(guest);
    } catch (error) {
      console.error('Contact preference update error:', error);
      res.status(500).json({ message: 'Failed to update contact preference' });
    }
  });

  // Import guests from file
  app.post('/api/events/:eventId/guests/import', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      // Parse CSV data
      const csvData = req.file.buffer.toString('utf-8');
      const result = await storage.importGuestsFromCSV(eventId, csvData);
      
      res.json(result);
    } catch (error) {
      console.error('Guest import error:', error);
      res.status(500).json({ message: 'Failed to import guests' });
    }
  });

  // Export guests to CSV
  app.get('/api/events/:eventId/guests/export', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const guests = await storage.getGuestsByEvent(eventId);
      
      // Convert to CSV format
      const csvHeaders = 'Name,Email,Phone,RSVP Status,Plus One,Dietary Requirements\n';
      const csvRows = guests.map(guest => 
        `"${guest.name}","${guest.email || ''}","${guest.phone || ''}","${guest.rsvpStatus || 'pending'}","${guest.plusOneName || ''}","${guest.dietaryRequirements || ''}"`
      ).join('\n');
      
      const csvContent = csvHeaders + csvRows;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=guests.csv');
      res.send(csvContent);
    } catch (error) {
      console.error('Guest export error:', error);
      res.status(500).json({ message: 'Failed to export guests' });
    }
  });
}