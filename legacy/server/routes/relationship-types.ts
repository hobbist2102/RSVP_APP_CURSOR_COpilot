import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertRelationshipTypeSchema } from '../../shared/schema';

export default function registerRelationshipTypeRoutes(app: Express, isAuthenticated: any) {
  // Get all relationship types
  app.get('/api/relationship-types', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const relationshipTypes = await storage.getAllRelationshipTypes();
      res.json(relationshipTypes);
    } catch (error) {
      console.error('Fetch relationship types error:', error);
      res.status(500).json({ message: 'Failed to fetch relationship types' });
    }
  });
  
  // Get specific relationship type
  app.get('/api/relationship-types/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const relationshipType = await storage.getRelationshipType(id);
      if (!relationshipType) {
        return res.status(404).json({ message: 'Relationship type not found' });
      }
      res.json(relationshipType);
    } catch (error) {
      console.error('Fetch relationship type error:', error);
      res.status(500).json({ message: 'Failed to fetch relationship type' });
    }
  });
  
  // Create new relationship type
  app.post('/api/relationship-types', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const data = insertRelationshipTypeSchema.parse(req.body);
      const relationshipType = await storage.createRelationshipType(data);
      res.status(201).json(relationshipType);
    } catch (error) {
      console.error('Create relationship type error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create relationship type' });
    }
  });
  
  // Update relationship type
  app.put('/api/relationship-types/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertRelationshipTypeSchema.partial().parse(req.body);
      const relationshipType = await storage.updateRelationshipType(id, data);
      if (!relationshipType) {
        return res.status(404).json({ message: 'Relationship type not found' });
      }
      res.json(relationshipType);
    } catch (error) {
      console.error('Update relationship type error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update relationship type' });
    }
  });
  
  // Delete relationship type
  app.delete('/api/relationship-types/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRelationshipType(id);
      if (!success) {
        return res.status(404).json({ message: 'Relationship type not found' });
      }
      res.json({ message: 'Relationship type deleted successfully' });
    } catch (error) {
      console.error('Delete relationship type error:', error);
      res.status(500).json({ message: 'Failed to delete relationship type' });
    }
  });
}