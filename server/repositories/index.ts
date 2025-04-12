import { EventRepository } from './event-repository';
import { GuestRepository } from './guest-repository';
import { CeremonyRepository } from './ceremony-repository';
import { AccommodationRepository } from './accommodation-repository';
import { RoomAllocationRepository } from './room-allocation-repository';
import { WhatsappTemplateRepository } from './whatsapp-template-repository';
import { MealRepository } from './meal-repository';

// Initialize and export repositories
export const eventRepository = new EventRepository();
export const guestRepository = new GuestRepository();
export const ceremonyRepository = new CeremonyRepository();
export const accommodationRepository = new AccommodationRepository();
export const roomAllocationRepository = new RoomAllocationRepository();
export const whatsappTemplateRepository = new WhatsappTemplateRepository();
export const mealRepository = new MealRepository();

// Export repository classes for extension
export { EventRepository } from './event-repository';
export { GuestRepository } from './guest-repository';
export { CeremonyRepository } from './ceremony-repository';
export { AccommodationRepository } from './accommodation-repository';
export { RoomAllocationRepository } from './room-allocation-repository';
export { WhatsappTemplateRepository } from './whatsapp-template-repository';
export { MealRepository } from './meal-repository';
export { TenantRepository } from '../lib/tenant-repository';