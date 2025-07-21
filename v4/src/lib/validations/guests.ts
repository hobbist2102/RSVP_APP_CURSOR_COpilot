import { z } from "zod";

export const createGuestSchema = z.object({
  eventId: z.number().min(1, "Event ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  side: z.enum(['bride', 'groom', 'both'], { required_error: "Side is required" }),
  relationship: z.string().optional(),
  isFamily: z.boolean().default(false),
  isVip: z.boolean().default(false),
  rsvpStatus: z.enum(['pending', 'confirmed', 'declined']).default('pending'),
  plusOneAllowed: z.boolean().default(false),
  plusOneName: z.string().optional(),
  plusOneEmail: z.string().email().optional(),
  plusOnePhone: z.string().optional(),
  plusOneRelationship: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  allergies: z.string().optional(),
  specialRequests: z.string().optional(),
  childrenDetails: z.array(z.object({
    name: z.string(),
    age: z.number().min(0).max(18),
    dietaryRestrictions: z.string().optional(),
  })).default([]),
  needsAccommodation: z.boolean().default(false),
  accommodationPreference: z.string().optional(),
  needsFlightAssistance: z.boolean().default(false),
  arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => !data.arrivalDate || !data.departureDate || 
    new Date(data.departureDate) >= new Date(data.arrivalDate),
  {
    message: "Departure date must be after arrival date",
    path: ["departureDate"],
  }
);

export const updateGuestSchema = createGuestSchema.omit({ eventId: true }).partial();

export const guestImportSchema = z.object({
  guests: z.array(createGuestSchema.omit({ eventId: true })),
  eventId: z.number().min(1, "Event ID is required"),
  overwriteExisting: z.boolean().default(false),
  skipDuplicates: z.boolean().default(true),
});

export const guestSearchSchema = z.object({
  eventId: z.number().min(1).optional(),
  query: z.string().optional(),
  side: z.enum(['bride', 'groom', 'both']).optional(),
  rsvpStatus: z.enum(['pending', 'confirmed', 'declined']).optional(),
  isFamily: z.boolean().optional(),
  isVip: z.boolean().optional(),
  needsAccommodation: z.boolean().optional(),
  needsFlightAssistance: z.boolean().optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  plusOneAllowed: z.boolean().optional(),
  plusOneConfirmed: z.boolean().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'createdAt', 'rsvpDate']).default('firstName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
});

export const familyRelationshipSchema = z.object({
  primaryGuestId: z.number().min(1, "Primary guest ID is required"),
  relatedGuestId: z.number().min(1, "Related guest ID is required"),
  relationship: z.enum(['spouse', 'child', 'parent', 'sibling', 'other']),
  description: z.string().optional(),
});

export const guestCeremonySchema = z.object({
  guestId: z.number().min(1, "Guest ID is required"),
  ceremonyId: z.number().min(1, "Ceremony ID is required"),
  attending: z.boolean().default(false),
  mealPreference: z.string().optional(),
  specialDietaryNeeds: z.string().optional(),
});

export const rsvpUpdateSchema = z.object({
  rsvpStatus: z.enum(['confirmed', 'declined']),
  ceremonyResponses: z.array(z.object({
    ceremonyId: z.number().min(1),
    attending: z.boolean(),
    mealPreference: z.string().optional(),
    specialDietaryNeeds: z.string().optional(),
  })).optional(),
  plusOneConfirmed: z.boolean().optional(),
  plusOneName: z.string().optional(),
  plusOneEmail: z.string().email().optional(),
  plusOnePhone: z.string().optional(),
  plusOneRelationship: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  allergies: z.string().optional(),
  specialRequests: z.string().optional(),
  childrenDetails: z.array(z.object({
    name: z.string(),
    age: z.number().min(0).max(18),
    dietaryRestrictions: z.string().optional(),
  })).optional(),
  needsAccommodation: z.boolean().optional(),
  accommodationPreference: z.string().optional(),
  needsFlightAssistance: z.boolean().optional(),
  arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
}).refine(
  (data) => !data.arrivalDate || !data.departureDate || 
    new Date(data.departureDate) >= new Date(data.arrivalDate),
  {
    message: "Departure date must be after arrival date",
    path: ["departureDate"],
  }
);

export const exportGuestsSchema = z.object({
  eventId: z.number().min(1).optional(),
  format: z.enum(['csv', 'excel']).default('csv'),
  includePersonalInfo: z.boolean().default(true),
  includeRsvpStatus: z.boolean().default(true),
  includeCeremonies: z.boolean().default(true),
  includeAccommodation: z.boolean().default(false),
  includeTravel: z.boolean().default(false),
  includeNotes: z.boolean().default(false),
  filters: guestSearchSchema.omit(['page', 'limit', 'sortBy', 'sortOrder']).optional(),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type GuestImportInput = z.infer<typeof guestImportSchema>;
export type GuestSearchInput = z.infer<typeof guestSearchSchema>;
export type FamilyRelationshipInput = z.infer<typeof familyRelationshipSchema>;
export type GuestCeremonyInput = z.infer<typeof guestCeremonySchema>;
export type RsvpUpdateInput = z.infer<typeof rsvpUpdateSchema>;
export type ExportGuestsInput = z.infer<typeof exportGuestsSchema>;