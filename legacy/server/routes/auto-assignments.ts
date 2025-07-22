import { Request, Response } from "express";
import { storage } from "../storage";
import { eq, and, or, isNull } from "drizzle-orm";
import { roomAllocations, guests } from "@shared/schema";

/**
 * Register auto-assignment related routes to the Express application
 */
export function registerAutoAssignmentRoutes(
  app: any,
  isAuthenticated: (req: Request, res: Response, next: any) => void,
  isAdmin: (req: Request, res: Response, next: any) => void
) {
  // Get all auto-assigned rooms for an event
  app.get('/api/events/:eventId/auto-assignments', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      // Get all room allocations
      const allAllocations = await storage.getRoomAllocationsByEvent(eventId);
      
      if (!allAllocations || allAllocations.length === 0) {
        return res.json([]);
      }
      
      // Identify auto-assigned rooms by checking for special requests containing "AUTO-FLAGGED"
      // or additional info that indicates auto-assignment
      const autoAssignedAllocations = allAllocations.filter(allocation => {
        return allocation.specialRequests?.includes('AUTO-FLAGGED') || 
               allocation.additionalGuestsInfo?.includes('Auto room assignment');
      });
      
      if (autoAssignedAllocations.length === 0) {
        return res.json([]);
      }
      
      // Enrich with guest, accommodation, and hotel data
      const enrichedAllocations = [];
      
      for (const allocation of autoAssignedAllocations) {
        // Get guest data
        const guest = await storage.getGuest(allocation.guestId);
        if (!guest) continue;
        
        // Get accommodation data
        const accommodation = await storage.getAccommodation(allocation.accommodationId);
        if (!accommodation) continue;
        
        // Get hotel data
        const hotel = await storage.getHotel(accommodation.hotelId);
        if (!hotel) continue;
        
        // Determine if early check-in is needed
        const needsEarlyCheckin = allocation.specialRequests?.includes('Early check-in') || false;
        
        // Determine review status
        let reviewStatus = 'pending';
        if (allocation.checkInStatus === 'confirmed') {
          reviewStatus = 'approved';
        } else if (allocation.additionalGuestsInfo?.includes('reassigned')) {
          reviewStatus = 'reassigned';
        }
        
        enrichedAllocations.push({
          ...allocation,
          guest,
          accommodation,
          hotel,
          earlyCheckIn: needsEarlyCheckin,
          reviewStatus
        });
      }
      
      return res.json(enrichedAllocations);
    } catch (error) {
      
      return res.status(500).json({
        message: 'Failed to fetch auto-assigned rooms',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Approve an auto-assigned room
  app.put('/api/room-allocations/:id/approve', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const allocationId = parseInt(req.params.id);
      if (isNaN(allocationId)) {
        return res.status(400).json({ message: 'Invalid allocation ID' });
      }
      
      // Get the allocation
      const allocation = await storage.getRoomAllocation(allocationId);
      if (!allocation) {
        return res.status(404).json({ message: 'Room allocation not found' });
      }
      
      // Update the status to confirmed
      const updatedAllocation = await storage.updateRoomAllocation(allocationId, {
        checkInStatus: 'confirmed',
        // Clean up the special requests text to remove AUTO-FLAGGED prefix
        specialRequests: allocation.specialRequests?.replace('AUTO-FLAGGED: ', '') || ''
      });
      
      
      
      return res.json(updatedAllocation);
    } catch (error) {
      
      return res.status(500).json({
        message: 'Failed to approve room allocation',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Reassign a room (mark existing allocation as reassigned)
  app.put('/api/room-allocations/:id/reassign', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const allocationId = parseInt(req.params.id);
      if (isNaN(allocationId)) {
        return res.status(400).json({ message: 'Invalid allocation ID' });
      }
      
      // Get the allocation
      const allocation = await storage.getRoomAllocation(allocationId);
      if (!allocation) {
        return res.status(404).json({ message: 'Room allocation not found' });
      }
      
      // Update the allocation to mark it as reassigned
      const updatedAllocation = await storage.updateRoomAllocation(allocationId, {
        additionalGuestsInfo: (allocation.additionalGuestsInfo || '') + ' [reassigned]'
      });
      
      
      
      return res.json(updatedAllocation);
    } catch (error) {
      
      return res.status(500).json({
        message: 'Failed to mark room allocation as reassigned',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}