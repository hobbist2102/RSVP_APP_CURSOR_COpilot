# Pending Fixes and Outstanding Issues

## Data Consistency Issues
- [ ] **Don ji missing from Rocky Rani event**: Despite being in the database with the correct event_id, Don ji doesn't appear in the guest list when viewing the Rocky Rani event
- [ ] **Event switching redirects**: Users are always redirected back to "Rocky Rani" event when switching events
- [ ] **Multiple implementations of `getGuestsByEvent()`**: There are two different implementations in storage.ts - one using in-memory storage and one using the database

## Required Fixes
- [ ] Complete the consolidation of storage implementations to exclusively use database storage
- [ ] Remove all in-memory implementations that have database counterparts
- [ ] Fix direct database queries for guests to ensure all guests with the correct event_id are returned
- [ ] Verify and improve session-based event context management
- [ ] Add validation for all API routes to ensure event-based data isolation is maintained
- [ ] Fix TypeScript errors in storage.ts related to type mismatches

## Next Features to Implement
1. **Sending Emails**
   - Set up SendGrid integration
   - Create email templates for various notifications
   - Implement email sending functionality

2. **WhatsApp Integration**
   - Implement WhatsApp Business API integration
   - Create message templates
   - Add functionality to send notifications and RSVP forms

3. **RSVP Module**
   - Create RSVP form that can be sent via both WhatsApp and email
   - Show existing guest information for confirmation
   - Add edit button for guests to correct information
   - Support for plus-ones and children details
   - Allow for custom messages from the couple
   - Implement update notifications when new guest details are submitted
   - Consider future AI conversation agent integration