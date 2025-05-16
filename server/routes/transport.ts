/**
 * Transport Group Management API Routes
 */
import { Router } from 'express';
import { storage } from '../storage';
import * as transportService from '../services/transport-service';
import { z } from 'zod';
import { insertTransportGroupSchema, insertTransportAllocationSchema } from '@shared/schema';

const router = Router();

// Get all transport groups for an event
router.get('/events/:eventId/transport-groups', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const transportGroups = await storage.getTransportGroupsByEvent(eventId);
    return res.json(transportGroups);
  } catch (error) {
    console.error('Error fetching transport groups:', error);
    return res.status(500).json({ error: 'Failed to fetch transport groups' });
  }
});

// Get a specific transport group with allocations
router.get('/transport-groups/:groupId', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    
    const groupWithAllocations = await transportService.getTransportGroupWithAllocations(groupId);
    return res.json(groupWithAllocations);
  } catch (error) {
    console.error('Error fetching transport group:', error);
    return res.status(500).json({ error: 'Failed to fetch transport group' });
  }
});

// Create a new transport group
router.post('/transport-groups', async (req, res) => {
  try {
    const validatedData = insertTransportGroupSchema.parse(req.body);
    const transportGroup = await storage.createTransportGroup(validatedData);
    return res.status(201).json(transportGroup);
  } catch (error) {
    console.error('Error creating transport group:', error);
    return res.status(500).json({ error: 'Failed to create transport group' });
  }
});

// Update a transport group
router.put('/transport-groups/:groupId', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    
    const validatedData = insertTransportGroupSchema.partial().parse(req.body);
    const updatedGroup = await storage.updateTransportGroup(groupId, validatedData);
    
    if (!updatedGroup) {
      return res.status(404).json({ error: 'Transport group not found' });
    }
    
    return res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating transport group:', error);
    return res.status(500).json({ error: 'Failed to update transport group' });
  }
});

// Delete a transport group
router.delete('/transport-groups/:groupId', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    
    const deleted = await storage.deleteTransportGroup(groupId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Transport group not found' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transport group:', error);
    return res.status(500).json({ error: 'Failed to delete transport group' });
  }
});

// Add allocation to a transport group
router.post('/transport-groups/:groupId/allocations', async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }
    
    const validatedData = insertTransportAllocationSchema.parse({
      ...req.body,
      transportGroupId: groupId
    });
    
    const allocation = await storage.createTransportAllocation(validatedData);
    return res.status(201).json(allocation);
  } catch (error) {
    console.error('Error creating transport allocation:', error);
    return res.status(500).json({ error: 'Failed to create transport allocation' });
  }
});

// Update a transport allocation
router.put('/transport-allocations/:allocationId', async (req, res) => {
  try {
    const allocationId = parseInt(req.params.allocationId);
    if (isNaN(allocationId)) {
      return res.status(400).json({ error: 'Invalid allocation ID' });
    }
    
    const validatedData = insertTransportAllocationSchema.partial().parse(req.body);
    const updatedAllocation = await storage.updateTransportAllocation(allocationId, validatedData);
    
    if (!updatedAllocation) {
      return res.status(404).json({ error: 'Transport allocation not found' });
    }
    
    return res.json(updatedAllocation);
  } catch (error) {
    console.error('Error updating transport allocation:', error);
    return res.status(500).json({ error: 'Failed to update transport allocation' });
  }
});

// Delete a transport allocation
router.delete('/transport-allocations/:allocationId', async (req, res) => {
  try {
    const allocationId = parseInt(req.params.allocationId);
    if (isNaN(allocationId)) {
      return res.status(400).json({ error: 'Invalid allocation ID' });
    }
    
    const deleted = await storage.deleteTransportAllocation(allocationId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Transport allocation not found' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transport allocation:', error);
    return res.status(500).json({ error: 'Failed to delete transport allocation' });
  }
});

// Generate transport groups based on travel info
router.post('/events/:eventId/generate-transport-groups', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const generatedGroups = await transportService.generateTransportGroups(eventId);
    return res.json(generatedGroups);
  } catch (error) {
    console.error('Error generating transport groups:', error);
    return res.status(500).json({ error: 'Failed to generate transport groups' });
  }
});

// Check if transport groups need to be regenerated
router.get('/events/:eventId/check-transport-updates', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    const updates = await transportService.checkForTransportUpdates(eventId);
    return res.json(updates);
  } catch (error) {
    console.error('Error checking transport updates:', error);
    return res.status(500).json({ error: 'Failed to check transport updates' });
  }
});

export default router;