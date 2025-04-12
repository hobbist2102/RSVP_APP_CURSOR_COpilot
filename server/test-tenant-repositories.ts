/**
 * This file provides examples of how to use the tenant-aware repositories
 * and demonstrates proper tenant isolation.
 * 
 * Note: This is for demonstration purposes, not for running as actual tests.
 */

import {
  eventRepository,
  guestRepository,
  ceremonyRepository,
  accommodationRepository,
  roomAllocationRepository,
  whatsappTemplateRepository,
  mealRepository
} from './repositories';

/**
 * Example of proper tenant isolation with the Guest Repository
 */
async function demonstrateGuestTenantIsolation() {
  // Assumes event IDs 1 and 2 exist in the database
  const eventId1 = 1;
  const eventId2 = 2;
  
  // Create guests for event 1
  const guest1Event1 = await guestRepository.create({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    side: 'bride'
  }, eventId1);
  
  // Create guests for event 2
  const guest2Event2 = await guestRepository.create({
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    side: 'groom'
  }, eventId2);
  
  // Attempt to get guest from event 1 while using event 2 context - should return undefined
  const guestFromWrongEvent = await guestRepository.getById(guest1Event1.id, eventId2);
  console.log('Guest from wrong event (should be undefined):', guestFromWrongEvent);
  
  // Get all guests for event 1 - should only see guests from event 1
  const guestsEvent1 = await guestRepository.getAllByTenant(eventId1);
  console.log('Guests for event 1:', guestsEvent1);
  
  // Get all guests for event 2 - should only see guests from event 2
  const guestsEvent2 = await guestRepository.getAllByTenant(eventId2);
  console.log('Guests for event 2:', guestsEvent2);
}

/**
 * Example of proper tenant isolation with the Ceremony Repository
 */
async function demonstrateCeremonyTenantIsolation() {
  // Assumes event IDs 1 and 2 exist in the database
  const eventId1 = 1;
  const eventId2 = 2;
  
  // Create ceremonies for event 1
  const ceremony1Event1 = await ceremonyRepository.create({
    name: 'Wedding Ceremony',
    date: new Date('2025-06-15'),
    startTime: '10:00',
    endTime: '12:00',
    location: 'Garden Venue',
    description: 'Main wedding ceremony'
  }, eventId1);
  
  // Create ceremonies for event 2
  const ceremony2Event2 = await ceremonyRepository.create({
    name: 'Reception',
    date: new Date('2025-07-20'),
    startTime: '18:00',
    endTime: '22:00',
    location: 'Grand Hotel',
    description: 'Reception dinner'
  }, eventId2);
  
  // Attempt to get ceremony from event 1 while using event 2 context - should return undefined
  const ceremonyFromWrongEvent = await ceremonyRepository.getById(ceremony1Event1.id, eventId2);
  console.log('Ceremony from wrong event (should be undefined):', ceremonyFromWrongEvent);
  
  // Get upcoming ceremonies for event 1
  const upcomingCeremoniesEvent1 = await ceremonyRepository.getUpcomingCeremonies(eventId1);
  console.log('Upcoming ceremonies for event 1:', upcomingCeremoniesEvent1);
  
  // Get upcoming ceremonies for event 2
  const upcomingCeremoniesEvent2 = await ceremonyRepository.getUpcomingCeremonies(eventId2);
  console.log('Upcoming ceremonies for event 2:', upcomingCeremoniesEvent2);
}

/**
 * Example of combining repositories for complex operations
 */
async function demonstrateComplexTenantOperations() {
  // Assumes event IDs 1 and 2 exist in the database
  const eventId1 = 1;
  
  // Create ceremony for event 1
  const ceremony1 = await ceremonyRepository.create({
    name: 'Sangeet Ceremony',
    date: new Date('2025-06-14'),
    startTime: '19:00',
    endTime: '23:00',
    location: 'Garden Venue',
    description: 'Traditional Sangeet ceremony'
  }, eventId1);
  
  // Create guest for event 1
  const guest1 = await guestRepository.create({
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul.sharma@example.com',
    side: 'groom'
  }, eventId1);
  
  // Create meal option for event 1 and ceremony 1
  const mealOption1 = await mealRepository.create({
    name: 'Vegetarian Thali',
    description: 'Traditional Indian vegetarian thali',
    isVegetarian: true,
    ceremonyId: ceremony1.id
  }, eventId1);
  
  // Create meal selection for guest 1
  await mealRepository.createMealSelection(
    guest1.id,
    mealOption1.id,
    ceremony1.id,
    'No spicy food please',
    eventId1
  );
  
  // Get meal selections for guest 1
  const mealSelectionsGuest1 = await mealRepository.getGuestMealSelections(guest1.id, eventId1);
  console.log('Meal selections for guest 1:', mealSelectionsGuest1);
}

// Main function to demonstrate tenant isolation
async function main() {
  try {
    console.log('=== Demonstrating Guest Tenant Isolation ===');
    await demonstrateGuestTenantIsolation();
    
    console.log('\n=== Demonstrating Ceremony Tenant Isolation ===');
    await demonstrateCeremonyTenantIsolation();
    
    console.log('\n=== Demonstrating Complex Tenant Operations ===');
    await demonstrateComplexTenantOperations();
  } catch (error) {
    console.error('Error demonstrating tenant isolation:', error);
  }
}

// Note: This main function would be called directly if running this file,
// but we're not actually running this as it's just for demonstration
// main();