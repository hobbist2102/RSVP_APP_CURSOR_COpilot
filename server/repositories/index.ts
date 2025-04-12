import { EventRepository } from './event-repository';
import { GuestRepository } from './guest-repository';
import { CeremonyRepository } from './ceremony-repository';

// Initialize and export repositories
export const eventRepository = new EventRepository();
export const guestRepository = new GuestRepository();
export const ceremonyRepository = new CeremonyRepository();

// Export repository classes for extension
export { EventRepository } from './event-repository';
export { GuestRepository } from './guest-repository';
export { CeremonyRepository } from './ceremony-repository';
export { TenantRepository } from '../lib/tenant-repository';