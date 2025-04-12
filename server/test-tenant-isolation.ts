/**
 * Test file to verify tenant isolation in the wedding management system
 * 
 * This script tests that data from one tenant (wedding event) cannot be
 * accessed from another tenant's context, ensuring proper data isolation.
 */

import { 
  eventRepository, 
  guestRepository, 
  ceremonyRepository,
  accommodationRepository,
  mealRepository,
  whatsappTemplateRepository
} from './repositories';

/**
 * Run all tenant isolation tests
 */
async function runTenantIsolationTests() {
  console.log('🧪 Starting tenant isolation tests...');
  
  try {
    // Ensure we have test events
    const event1 = await ensureTestEvent('Test Wedding Event 1');
    const event2 = await ensureTestEvent('Test Wedding Event 2');
    
    console.log(`🔑 Test events created: ${event1.id} and ${event2.id}`);
    
    // Run the isolation tests
    await testGuestIsolation(event1.id, event2.id);
    await testCeremonyIsolation(event1.id, event2.id);
    await testAccommodationIsolation(event1.id, event2.id);
    await testMealIsolation(event1.id, event2.id);
    await testWhatsappTemplateIsolation(event1.id, event2.id);
    
    console.log('✅ All tenant isolation tests completed successfully!');
  } catch (error) {
    console.error('❌ Tenant isolation tests failed:', error);
  }
}

/**
 * Ensure a test event exists
 */
async function ensureTestEvent(title: string) {
  const existing = await eventRepository.getAll();
  const match = existing.find(e => e.title === title);
  
  if (match) {
    return match;
  }
  
  return await eventRepository.create({
    title,
    coupleNames: `${title} Couple`,
    brideName: 'Test Bride',
    groomName: 'Test Groom',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // 32 days from now
    location: 'Test Location',
    createdBy: 1, // Admin user
  });
}

/**
 * Test tenant isolation for guests
 */
async function testGuestIsolation(event1Id: number, event2Id: number) {
  console.log('🧪 Testing guest tenant isolation...');
  
  // Create a guest for event 1
  const guest1 = await guestRepository.create({
    firstName: 'Test',
    lastName: 'Guest1',
    email: `test-${Date.now()}@example.com`,
    phone: '123-456-7890',
    side: 'bride',
  }, event1Id);
  
  console.log(`  ✓ Created guest in event ${event1Id}: ${guest1.id}`);
  
  // Create a guest for event 2
  const guest2 = await guestRepository.create({
    firstName: 'Test',
    lastName: 'Guest2',
    email: `test2-${Date.now()}@example.com`,
    phone: '123-456-7890',
    side: 'groom',
  }, event2Id);
  
  console.log(`  ✓ Created guest in event ${event2Id}: ${guest2.id}`);
  
  // Try to get guest from event 1 using event 2 context
  const crossTenantGuest = await guestRepository.getById(guest1.id, event2Id);
  
  if (crossTenantGuest === undefined) {
    console.log('  ✅ PASS: Guest from event 1 not accessible in event 2 context');
  } else {
    throw new Error('FAIL: Guest from event 1 is accessible in event 2 context!');
  }
  
  // Get all guests for each event
  const event1Guests = await guestRepository.getAllByTenant(event1Id);
  const event2Guests = await guestRepository.getAllByTenant(event2Id);
  
  // Verify guest1 is only in event1's guest list
  const guest1InEvent1 = event1Guests.some(g => g.id === guest1.id);
  const guest1InEvent2 = event2Guests.some(g => g.id === guest1.id);
  
  if (guest1InEvent1 && !guest1InEvent2) {
    console.log('  ✅ PASS: Guest lists are properly isolated between events');
  } else {
    throw new Error('FAIL: Guest lists are not properly isolated between events!');
  }
}

/**
 * Test tenant isolation for ceremonies
 */
async function testCeremonyIsolation(event1Id: number, event2Id: number) {
  console.log('🧪 Testing ceremony tenant isolation...');
  
  // Create a ceremony for event 1
  const ceremony1 = await ceremonyRepository.create({
    name: 'Test Ceremony 1',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    startTime: '14:00',
    endTime: '16:00',
    location: 'Test Venue 1',
    description: 'Test ceremony 1',
  }, event1Id);
  
  console.log(`  ✓ Created ceremony in event ${event1Id}: ${ceremony1.id}`);
  
  // Create a ceremony for event 2
  const ceremony2 = await ceremonyRepository.create({
    name: 'Test Ceremony 2',
    date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
    startTime: '15:00',
    endTime: '17:00',
    location: 'Test Venue 2',
    description: 'Test ceremony 2',
  }, event2Id);
  
  console.log(`  ✓ Created ceremony in event ${event2Id}: ${ceremony2.id}`);
  
  // Try to get ceremony from event 1 using event 2 context
  const crossTenantCeremony = await ceremonyRepository.getById(ceremony1.id, event2Id);
  
  if (crossTenantCeremony === undefined) {
    console.log('  ✅ PASS: Ceremony from event 1 not accessible in event 2 context');
  } else {
    throw new Error('FAIL: Ceremony from event 1 is accessible in event 2 context!');
  }
  
  // Get all ceremonies for each event
  const event1Ceremonies = await ceremonyRepository.getAllByTenant(event1Id);
  const event2Ceremonies = await ceremonyRepository.getAllByTenant(event2Id);
  
  // Verify ceremony1 is only in event1's ceremony list
  const ceremony1InEvent1 = event1Ceremonies.some(c => c.id === ceremony1.id);
  const ceremony1InEvent2 = event2Ceremonies.some(c => c.id === ceremony1.id);
  
  if (ceremony1InEvent1 && !ceremony1InEvent2) {
    console.log('  ✅ PASS: Ceremony lists are properly isolated between events');
  } else {
    throw new Error('FAIL: Ceremony lists are not properly isolated between events!');
  }
}

/**
 * Test tenant isolation for accommodations
 */
async function testAccommodationIsolation(event1Id: number, event2Id: number) {
  console.log('🧪 Testing accommodation tenant isolation...');
  
  // Create an accommodation for event 1
  const accommodation1 = await accommodationRepository.create({
    name: 'Test Hotel 1',
    roomType: 'Standard',
    capacity: 2,
    totalRooms: 10,
    allocatedRooms: 5,
    pricePerNight: '$200',
  }, event1Id);
  
  console.log(`  ✓ Created accommodation in event ${event1Id}: ${accommodation1.id}`);
  
  // Create an accommodation for event 2
  const accommodation2 = await accommodationRepository.create({
    name: 'Test Hotel 2',
    roomType: 'Deluxe',
    capacity: 2,
    totalRooms: 15,
    allocatedRooms: 8,
    pricePerNight: '$300',
  }, event2Id);
  
  console.log(`  ✓ Created accommodation in event ${event2Id}: ${accommodation2.id}`);
  
  // Try to get accommodation from event 1 using event 2 context
  const crossTenantAccommodation = await accommodationRepository.getById(accommodation1.id, event2Id);
  
  if (crossTenantAccommodation === undefined) {
    console.log('  ✅ PASS: Accommodation from event 1 not accessible in event 2 context');
  } else {
    throw new Error('FAIL: Accommodation from event 1 is accessible in event 2 context!');
  }
}

/**
 * Test tenant isolation for meal options
 */
async function testMealIsolation(event1Id: number, event2Id: number) {
  console.log('🧪 Testing meal tenant isolation...');
  
  // First need to ensure ceremonies exist
  const ceremony1 = (await ceremonyRepository.getAllByTenant(event1Id))[0] || 
    await ceremonyRepository.create({
      name: 'Test Ceremony for Meals',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startTime: '18:00',
      endTime: '22:00',
      location: 'Test Venue',
      description: 'Test ceremony for meals',
    }, event1Id);
  
  const ceremony2 = (await ceremonyRepository.getAllByTenant(event2Id))[0] || 
    await ceremonyRepository.create({
      name: 'Test Ceremony for Meals',
      date: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
      startTime: '18:00',
      endTime: '22:00',
      location: 'Test Venue',
      description: 'Test ceremony for meals',
    }, event2Id);
  
  // Create meal options for event 1
  const mealOption1 = await mealRepository.createMealOption({
    ceremonyId: ceremony1.id,
    name: 'Test Meal 1',
    description: 'Delicious meal option 1',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isNutFree: true,
  }, event1Id);
  
  console.log(`  ✓ Created meal option in event ${event1Id}: ${mealOption1.id}`);
  
  // Create meal options for event 2
  const mealOption2 = await mealRepository.createMealOption({
    ceremonyId: ceremony2.id,
    name: 'Test Meal 2',
    description: 'Delicious meal option 2',
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isNutFree: true,
  }, event2Id);
  
  console.log(`  ✓ Created meal option in event ${event2Id}: ${mealOption2.id}`);
  
  // Try to get meal options from event 1 using event 2 context
  const event1Meals = await mealRepository.getMealOptionsByCeremony(ceremony1.id, event1Id);
  const event2Meals = await mealRepository.getMealOptionsByCeremony(ceremony1.id, event2Id);
  
  if (event1Meals.length > 0 && event2Meals.length === 0) {
    console.log('  ✅ PASS: Meal options are properly isolated between events');
  } else {
    throw new Error('FAIL: Meal options are not properly isolated between events!');
  }
}

/**
 * Test tenant isolation for WhatsApp templates
 */
async function testWhatsappTemplateIsolation(event1Id: number, event2Id: number) {
  console.log('🧪 Testing WhatsApp template tenant isolation...');
  
  // Create a template for event 1
  const template1 = await whatsappTemplateRepository.create({
    name: 'Test Template 1',
    category: 'invitation',
    content: 'This is a test template for event 1',
    templateId: `test_template_${Date.now()}_1`,
    parameters: [],
    language: 'en_US',
  }, event1Id);
  
  console.log(`  ✓ Created WhatsApp template in event ${event1Id}: ${template1.id}`);
  
  // Create a template for event 2
  const template2 = await whatsappTemplateRepository.create({
    name: 'Test Template 2',
    category: 'invitation',
    content: 'This is a test template for event 2',
    templateId: `test_template_${Date.now()}_2`,
    parameters: [],
    language: 'en_US',
  }, event2Id);
  
  console.log(`  ✓ Created WhatsApp template in event ${event2Id}: ${template2.id}`);
  
  // Try to get template from event 1 using event 2 context
  const crossTenantTemplate = await whatsappTemplateRepository.getById(template1.id, event2Id);
  
  if (crossTenantTemplate === undefined) {
    console.log('  ✅ PASS: Template from event 1 not accessible in event 2 context');
  } else {
    throw new Error('FAIL: Template from event 1 is accessible in event 2 context!');
  }
  
  // Get templates by category for both events
  const event1Templates = await whatsappTemplateRepository.getTemplatesByCategory('invitation', event1Id);
  const event2Templates = await whatsappTemplateRepository.getTemplatesByCategory('invitation', event2Id);
  
  // Verify template1 is only in event1's template list
  const template1InEvent1 = event1Templates.some(t => t.id === template1.id);
  const template1InEvent2 = event2Templates.some(t => t.id === template1.id);
  
  if (template1InEvent1 && !template1InEvent2) {
    console.log('  ✅ PASS: WhatsApp templates are properly isolated between events');
  } else {
    throw new Error('FAIL: WhatsApp templates are not properly isolated between events!');
  }
}

// Uncomment to run the tests directly
// runTenantIsolationTests().catch(console.error);

// Export for use in other modules
export { runTenantIsolationTests };