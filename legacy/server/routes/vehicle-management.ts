import express, { Request, Response } from 'express';
import { db } from '../db.js';
import { eventVehicles, transportVendors, transportGroups } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../middleware.js';

const router = express.Router();

/**
 * Get all vehicles for an event
 */
router.get('/events/:eventId/vehicles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);

    const vehicles = await db
      .select({
        id: eventVehicles.id,
        eventId: eventVehicles.eventId,
        vehicleType: eventVehicles.vehicleType,
        capacity: eventVehicles.capacity,
        plateNumber: eventVehicles.plateNumber,
        driverName: eventVehicles.driverName,
        driverPhone: eventVehicles.driverPhone,
        vendorId: eventVehicles.vendorId,
        status: eventVehicles.status,
        currentLocation: eventVehicles.currentLocation,
        route: eventVehicles.route,
        notes: eventVehicles.notes,
        vendor: transportVendors
      })
      .from(eventVehicles)
      .leftJoin(transportVendors, eq(eventVehicles.vendorId, transportVendors.id))
      .where(eq(eventVehicles.eventId, eventId));

    res.json(vehicles);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

/**
 * Create a new vehicle
 */
router.post('/events/:eventId/vehicles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const {
      vehicleType,
      capacity,
      plateNumber,
      driverName,
      driverPhone,
      vendorId,
      notes
    } = req.body;

    const newVehicle = await db
      .insert(eventVehicles)
      .values({
        eventId,
        vehicleType,
        capacity,
        plateNumber: plateNumber || null,
        driverName: driverName || null,
        driverPhone: driverPhone || null,
        vendorId: vendorId || null,
        status: 'available',
        notes: notes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.json({
      success: true,
      vehicle: newVehicle[0]
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

/**
 * Update a vehicle
 */
router.put('/events/:eventId/vehicles/:vehicleId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const vehicleId = parseInt(req.params.vehicleId);
    const {
      vehicleType,
      capacity,
      plateNumber,
      driverName,
      driverPhone,
      vendorId,
      notes
    } = req.body;

    const updatedVehicle = await db
      .update(eventVehicles)
      .set({
        vehicleType,
        capacity,
        plateNumber: plateNumber || null,
        driverName: driverName || null,
        driverPhone: driverPhone || null,
        vendorId: vendorId || null,
        notes: notes || null,
        updatedAt: new Date()
      })
      .where(and(
        eq(eventVehicles.id, vehicleId),
        eq(eventVehicles.eventId, eventId)
      ))
      .returning();

    if (updatedVehicle.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({
      success: true,
      vehicle: updatedVehicle[0]
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

/**
 * Delete a vehicle
 */
router.delete('/events/:eventId/vehicles/:vehicleId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const vehicleId = parseInt(req.params.vehicleId);

    // Check if vehicle is assigned to any transport groups
    const assignedGroups = await db
      .select()
      .from(transportGroups)
      .where(and(
        eq(transportGroups.eventId, eventId),
        eq(transportGroups.vehicleId, vehicleId)
      ));

    if (assignedGroups.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete vehicle that is assigned to transport groups',
        assignedGroups: assignedGroups.length
      });
    }

    const deletedVehicle = await db
      .delete(eventVehicles)
      .where(and(
        eq(eventVehicles.id, vehicleId),
        eq(eventVehicles.eventId, eventId)
      ))
      .returning();

    if (deletedVehicle.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({
      success: true,
      deletedVehicleId: vehicleId
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

/**
 * Update vehicle status
 */
router.patch('/events/:eventId/vehicles/:vehicleId/status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const vehicleId = parseInt(req.params.vehicleId);
    const { status, currentLocation } = req.body;

    const validStatuses = ['available', 'assigned', 'in_transit', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedVehicle = await db
      .update(eventVehicles)
      .set({
        status,
        currentLocation: currentLocation || null,
        updatedAt: new Date()
      })
      .where(and(
        eq(eventVehicles.id, vehicleId),
        eq(eventVehicles.eventId, eventId)
      ))
      .returning();

    if (updatedVehicle.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({
      success: true,
      vehicle: updatedVehicle[0]
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to update vehicle status' });
  }
});

/**
 * Get vehicle assignment history
 */
router.get('/events/:eventId/vehicles/:vehicleId/assignments', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const vehicleId = parseInt(req.params.vehicleId);

    const assignments = await db
      .select({
        group: transportGroups,
        assignedAt: transportGroups.createdAt
      })
      .from(transportGroups)
      .where(and(
        eq(transportGroups.eventId, eventId),
        eq(transportGroups.vehicleId, vehicleId)
      ));

    res.json(assignments);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

/**
 * Assign vehicle to transport group
 */
router.post('/events/:eventId/vehicles/:vehicleId/assign', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const vehicleId = parseInt(req.params.vehicleId);
    const { transportGroupId } = req.body;

    // Verify vehicle exists and is available
    const vehicle = await db
      .select()
      .from(eventVehicles)
      .where(and(
        eq(eventVehicles.id, vehicleId),
        eq(eventVehicles.eventId, eventId)
      ))
      .limit(1);

    if (vehicle.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    if (vehicle[0].status !== 'available') {
      return res.status(400).json({ error: 'Vehicle is not available for assignment' });
    }

    // Verify transport group exists
    const group = await db
      .select()
      .from(transportGroups)
      .where(and(
        eq(transportGroups.id, transportGroupId),
        eq(transportGroups.eventId, eventId)
      ))
      .limit(1);

    if (group.length === 0) {
      return res.status(404).json({ error: 'Transport group not found' });
    }

    // Check capacity
    if (vehicle[0].capacity < group[0].guestCount) {
      return res.status(400).json({ 
        error: 'Vehicle capacity insufficient for group size',
        vehicleCapacity: vehicle[0].capacity,
        groupSize: group[0].guestCount
      });
    }

    // Assign vehicle to group
    await db
      .update(transportGroups)
      .set({ 
        vehicleId,
        updatedAt: new Date()
      })
      .where(eq(transportGroups.id, transportGroupId));

    // Update vehicle status
    await db
      .update(eventVehicles)
      .set({ 
        status: 'assigned',
        updatedAt: new Date()
      })
      .where(eq(eventVehicles.id, vehicleId));

    res.json({
      success: true,
      assignment: {
        vehicleId,
        transportGroupId,
        assignedAt: new Date()
      }
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to assign vehicle' });
  }
});

/**
 * Unassign vehicle from transport group
 */
router.post('/events/:eventId/vehicles/:vehicleId/unassign', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const vehicleId = parseInt(req.params.vehicleId);

    // Find and unassign from transport groups
    await db
      .update(transportGroups)
      .set({ 
        vehicleId: null,
        updatedAt: new Date()
      })
      .where(and(
        eq(transportGroups.eventId, eventId),
        eq(transportGroups.vehicleId, vehicleId)
      ));

    // Update vehicle status to available
    await db
      .update(eventVehicles)
      .set({ 
        status: 'available',
        updatedAt: new Date()
      })
      .where(and(
        eq(eventVehicles.id, vehicleId),
        eq(eventVehicles.eventId, eventId)
      ));

    res.json({
      success: true,
      unassignedVehicleId: vehicleId
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to unassign vehicle' });
  }
});

export default router;