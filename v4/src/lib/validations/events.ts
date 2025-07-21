import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  coupleNames: z.string().min(1, "Couple names are required"),
  brideName: z.string().min(1, "Bride name is required"),
  groomName: z.string().min(1, "Groom name is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD format"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  rsvpDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "RSVP deadline must be YYYY-MM-DD format").optional(),
  
  // RSVP Settings
  allowPlusOnes: z.boolean().default(true),
  allowChildrenDetails: z.boolean().default(true),
  customRsvpUrl: z.string().optional(),
  rsvpWelcomeTitle: z.string().optional(),
  rsvpWelcomeMessage: z.string().optional(),
  rsvpCustomBranding: z.string().optional(),
  rsvpShowSelectAll: z.boolean().default(true),
  
  // Communication Configuration
  emailProvider: z.enum(['sendgrid', 'brevo', 'gmail', 'outlook', 'smtp']).default('resend'),
  emailFromAddress: z.string().email().optional(),
  emailFromName: z.string().optional(),
  emailConfigured: z.boolean().default(false),
  
  // WhatsApp Configuration
  whatsappConfigured: z.boolean().default(false),
  whatsappBusinessPhoneId: z.string().optional(),
  whatsappAccessToken: z.string().optional(),
  
  // Branding
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default("#7A51E1"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default("#E3C76F"),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
).refine(
  (data) => !data.rsvpDeadline || new Date(data.rsvpDeadline) <= new Date(data.startDate),
  {
    message: "RSVP deadline must be before event start date",
    path: ["rsvpDeadline"],
  }
);

export const updateEventSchema = createEventSchema.partial();

export const eventSettingsSchema = z.object({
  // RSVP Settings
  allowPlusOnes: z.boolean().optional(),
  allowChildrenDetails: z.boolean().optional(),
  customRsvpUrl: z.string().optional(),
  rsvpWelcomeTitle: z.string().optional(),
  rsvpWelcomeMessage: z.string().optional(),
  rsvpCustomBranding: z.string().optional(),
  rsvpShowSelectAll: z.boolean().optional(),
  rsvpDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  
  // Communication Configuration
  emailProvider: z.enum(['sendgrid', 'brevo', 'gmail', 'outlook', 'smtp']).optional(),
  emailFromAddress: z.string().email().optional(),
  emailFromName: z.string().optional(),
  emailConfigured: z.boolean().optional(),
  
  // WhatsApp Configuration
  whatsappConfigured: z.boolean().optional(),
  whatsappBusinessPhoneId: z.string().optional(),
  whatsappAccessToken: z.string().optional(),
  
  // Branding
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const ceremonySchema = z.object({
  name: z.string().min(1, "Ceremony name is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "End time must be HH:MM format"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  attireCode: z.string().optional(),
  ceremonyType: z.string().optional(),
  maxCapacity: z.number().min(1).optional(),
}).refine(
  (data) => data.endTime > data.startTime,
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const eventStatsQuerySchema = z.object({
  includeGuests: z.boolean().default(true),
  includeRsvp: z.boolean().default(true),
  includeCeremonies: z.boolean().default(true),
  includeAccommodations: z.boolean().default(false),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventSettingsInput = z.infer<typeof eventSettingsSchema>;
export type CeremonyInput = z.infer<typeof ceremonySchema>;
export type EventStatsQuery = z.infer<typeof eventStatsQuerySchema>;