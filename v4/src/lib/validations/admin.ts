import { z } from "zod";

export const emailProviderSchema = z.object({
  provider: z.enum(['sendgrid', 'brevo', 'gmail', 'outlook', 'smtp']),
  apiKey: z.string().min(1, 'API key is required').optional(),
  fromEmail: z.string().email('Please enter a valid email address'),
  fromName: z.string().min(1, 'From name is required'),
  // Gmail/Outlook OAuth2 specific
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  refreshToken: z.string().optional(),
  // SMTP specific
  host: z.string().optional(),
  port: z.number().min(1).max(65535).optional(),
  secure: z.boolean().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const whatsappConfigSchema = z.object({
  provider: z.enum(['meta', 'twilio', 'web']),
  phoneNumberId: z.string().min(1, 'Phone number ID is required'),
  accessToken: z.string().min(1, 'Access token is required'),
  webhookVerifyToken: z.string().min(1, 'Webhook verify token is required'),
  businessAccountId: z.string().optional(),
  appId: z.string().optional(),
  appSecret: z.string().optional(),
});

export const adminProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  role: z.literal('admin'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color'),
  logoUrl: z.string().url('Please enter a valid URL').optional(),
  bannerUrl: z.string().url('Please enter a valid URL').optional(),
  companyName: z.string().min(1, 'Company name is required'),
  website: z.string().url('Please enter a valid URL').optional(),
});

export const eventDefaultsSchema = z.object({
  defaultDomain: z.string().min(1, 'Default domain is required'),
  defaultEmailReplyTo: z.string().email('Please enter a valid email address'),
  defaultRsvpSettings: z.object({
    allowPlusOnes: z.boolean().default(true),
    allowChildrenDetails: z.boolean().default(true),
    showSelectAll: z.boolean().default(true),
    rsvpDeadlineDays: z.number().min(1).max(365).default(30),
  }),
  defaultEmailProvider: z.enum(['sendgrid', 'brevo', 'gmail', 'outlook', 'smtp']),
  defaultWhatsappProvider: z.enum(['meta', 'twilio', 'web']).optional(),
});

export const onboardingCompleteSchema = z.object({
  emailProvider: emailProviderSchema,
  whatsappConfig: whatsappConfigSchema.optional(),
  adminProfile: adminProfileSchema,
  branding: brandingSchema,
  eventDefaults: eventDefaultsSchema,
});

// Individual step schemas for multi-step form
export const onboardingStepSchemas = {
  emailProvider: emailProviderSchema,
  whatsappConfig: whatsappConfigSchema,
  adminProfile: adminProfileSchema,
  branding: brandingSchema,
  eventDefaults: eventDefaultsSchema,
} as const;

export type EmailProviderConfig = z.infer<typeof emailProviderSchema>;
export type WhatsAppConfig = z.infer<typeof whatsappConfigSchema>;
export type AdminProfile = z.infer<typeof adminProfileSchema>;
export type BrandingConfig = z.infer<typeof brandingSchema>;
export type EventDefaults = z.infer<typeof eventDefaultsSchema>;
export type OnboardingComplete = z.infer<typeof onboardingCompleteSchema>;

// Email provider display names
export const emailProviderNames = {
  sendgrid: 'SendGrid',
  brevo: 'Brevo (formerly Sendinblue)',
  gmail: 'Gmail OAuth2',
  outlook: 'Outlook OAuth2',
  smtp: 'Custom SMTP',
} as const;

// WhatsApp provider display names
export const whatsappProviderNames = {
  meta: 'Meta WhatsApp Business API',
  twilio: 'Twilio WhatsApp API',
  web: 'WhatsApp Web.js',
} as const;