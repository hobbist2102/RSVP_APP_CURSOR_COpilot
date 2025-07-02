import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  transportVendors, 
  locationRepresentatives, 
  eventVehicles, 
  guestTravelInfo,
  insertTransportVendorSchema,
  insertLocationRepresentativeSchema,
  insertEventVehicleSchema,
  insertGuestTravelInfoSchema
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../middleware';

const router = Router();

// Transport Vendors Routes
router.get('/vendors', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const vendors = await db
      .select()
      .from(transportVendors)
      .where(eq(transportVendors.eventId, eventId));

    res.json(vendors);
  } catch (error) {
    console.error('Error fetching transport vendors:', error);
    res.status(500).json({ error: 'Failed to fetch transport vendors' });
  }
});

router.post('/vendors', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const validatedData = insertTransportVendorSchema.parse({
      ...req.body,
      eventId
    });

    const [vendor] = await db
      .insert(transportVendors)
      .values(validatedData)
      .returning();

    res.status(201).json(vendor);
  } catch (error) {
    console.error('Error creating transport vendor:', error);
    res.status(500).json({ error: 'Failed to create transport vendor' });
  }
});

router.put('/vendors/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const vendorId = parseInt(req.params.id);
    const validatedData = insertTransportVendorSchema.partial().parse(req.body);

    const [updatedVendor] = await db
      .update(transportVendors)
      .set(validatedData)
      .where(and(
        eq(transportVendors.id, vendorId),
        eq(transportVendors.eventId, eventId)
      ))
      .returning();

    if (!updatedVendor) {
      return res.status(404).json({ error: 'Transport vendor not found' });
    }

    res.json(updatedVendor);
  } catch (error) {
    console.error('Error updating transport vendor:', error);
    res.status(500).json({ error: 'Failed to update transport vendor' });
  }
});

router.delete('/vendors/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const vendorId = parseInt(req.params.id);

    await db
      .delete(transportVendors)
      .where(and(
        eq(transportVendors.id, vendorId),
        eq(transportVendors.eventId, eventId)
      ));

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transport vendor:', error);
    res.status(500).json({ error: 'Failed to delete transport vendor' });
  }
});

// Location Representatives Routes
router.get('/representatives', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const representatives = await db
      .select()
      .from(locationRepresentatives)
      .where(eq(locationRepresentatives.eventId, eventId));

    res.json(representatives);
  } catch (error) {
    console.error('Error fetching location representatives:', error);
    res.status(500).json({ error: 'Failed to fetch location representatives' });
  }
});

router.post('/representatives', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const validatedData = insertLocationRepresentativeSchema.parse({
      ...req.body,
      eventId
    });

    const [representative] = await db
      .insert(locationRepresentatives)
      .values(validatedData)
      .returning();

    res.status(201).json(representative);
  } catch (error) {
    console.error('Error creating location representative:', error);
    res.status(500).json({ error: 'Failed to create location representative' });
  }
});

router.put('/representatives/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const repId = parseInt(req.params.id);
    const validatedData = insertLocationRepresentativeSchema.partial().parse(req.body);

    const [updatedRep] = await db
      .update(locationRepresentatives)
      .set(validatedData)
      .where(and(
        eq(locationRepresentatives.id, repId),
        eq(locationRepresentatives.eventId, eventId)
      ))
      .returning();

    if (!updatedRep) {
      return res.status(404).json({ error: 'Location representative not found' });
    }

    res.json(updatedRep);
  } catch (error) {
    console.error('Error updating location representative:', error);
    res.status(500).json({ error: 'Failed to update location representative' });
  }
});

router.delete('/representatives/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const repId = parseInt(req.params.id);

    await db
      .delete(locationRepresentatives)
      .where(and(
        eq(locationRepresentatives.id, repId),
        eq(locationRepresentatives.eventId, eventId)
      ));

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting location representative:', error);
    res.status(500).json({ error: 'Failed to delete location representative' });
  }
});

// Event Vehicles Routes
router.get('/vehicles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const vehicles = await db
      .select()
      .from(eventVehicles)
      .where(eq(eventVehicles.eventId, eventId));

    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

router.post('/vehicles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const validatedData = insertEventVehicleSchema.parse({
      ...req.body,
      eventId,
      vendorId: parseInt(req.body.vendorId)
    });

    const [vehicle] = await db
      .insert(eventVehicles)
      .values(validatedData)
      .returning();

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

router.put('/vehicles/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const vehicleId = parseInt(req.params.id);
    const validatedData = insertEventVehicleSchema.partial().parse(req.body);

    const [updatedVehicle] = await db
      .update(eventVehicles)
      .set(validatedData)
      .where(and(
        eq(eventVehicles.id, vehicleId),
        eq(eventVehicles.eventId, eventId)
      ))
      .returning();

    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

router.delete('/vehicles/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const vehicleId = parseInt(req.params.id);

    await db
      .delete(eventVehicles)
      .where(and(
        eq(eventVehicles.id, vehicleId),
        eq(eventVehicles.eventId, eventId)
      ));

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// Guest Travel Info Routes
router.get('/travel-info', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const travelInfo = await db
      .select()
      .from(guestTravelInfo)
      .where(eq(guestTravelInfo.eventId, eventId));

    res.json(travelInfo);
  } catch (error) {
    console.error('Error fetching travel info:', error);
    res.status(500).json({ error: 'Failed to fetch travel info' });
  }
});

router.post('/travel-info', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = req.session.currentEvent?.id;
    if (!eventId) {
      return res.status(400).json({ error: 'No event selected' });
    }

    const validatedData = insertGuestTravelInfoSchema.parse({
      ...req.body,
      eventId
    });

    const [travelInfo] = await db
      .insert(guestTravelInfo)
      .values(validatedData)
      .returning();

    res.status(201).json(travelInfo);
  } catch (error) {
    console.error('Error creating travel info:', error);
    res.status(500).json({ error: 'Failed to create travel info' });
  }
});

export default router;