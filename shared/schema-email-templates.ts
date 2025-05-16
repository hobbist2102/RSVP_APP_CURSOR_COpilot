import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text"),
  category: text("category").notNull(), // invitation, rsvp, reminder, confirmation, etc.
  isDefault: boolean("is_default").default(false),
  isSystem: boolean("is_system").default(false), // System templates can't be deleted
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  isSystem: true,
  lastUpdated: true,
  createdAt: true,
});

// Email Template Styles
export const emailTemplateStyles = pgTable("email_template_styles", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  headerLogo: text("header_logo"), // URL to logo image
  headerBackground: text("header_background"), // Background color or URL
  bodyBackground: text("body_background"), // Background color or URL
  textColor: text("text_color").default("#000000"),
  linkColor: text("link_color").default("#0000FF"),
  buttonColor: text("button_color").default("#4CAF50"),
  buttonTextColor: text("button_text_color").default("#FFFFFF"),
  fontFamily: text("font_family").default("Arial, sans-serif"),
  fontSize: text("font_size").default("16px"),
  borderColor: text("border_color").default("#DDDDDD"),
  footerText: text("footer_text"),
  footerBackground: text("footer_background"), // Background color or URL
  css: text("css"), // Custom CSS for advanced styling
  isDefault: boolean("is_default").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailTemplateStyleSchema = createInsertSchema(emailTemplateStyles).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

// Email Template Variables
export const emailTemplateVariables = pgTable("email_template_variables", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  name: text("name").notNull(), // e.g., "guestName", "eventDate", "rsvpLink"
  defaultValue: text("default_value"),
  description: text("description"),
  required: boolean("required").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailTemplateVariableSchema = createInsertSchema(emailTemplateVariables).omit({
  id: true,
  createdAt: true,
});

// Email Assets (images, banners, etc.)
export const emailAssets = pgTable("email_assets", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // logo, banner, signature, background, etc.
  url: text("url").notNull(), // URL to the asset
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  tags: text("tags"), // Comma-separated tags for organization
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailAssetSchema = createInsertSchema(emailAssets).omit({
  id: true,
  createdAt: true,
});

// Email Signatures
export const emailSignatures = pgTable("email_signatures", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(), // HTML content
  plainText: text("plain_text"), // Plain text version
  includesSocialLinks: boolean("includes_social_links").default(false),
  socialLinks: jsonb("social_links").default({}), // JSON with social media links
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailSignatureSchema = createInsertSchema(emailSignatures).omit({
  id: true,
  createdAt: true,
});

// Email Sending History
export const emailHistory = pgTable("email_history", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  templateId: integer("template_id"),
  subject: text("subject").notNull(),
  sender: text("sender").notNull(),
  recipients: text("recipients").notNull(), // JSON array or comma-separated list
  ccRecipients: text("cc_recipients"), // JSON array or comma-separated list
  bccRecipients: text("bcc_recipients"), // JSON array or comma-separated list
  bodyHtml: text("body_html"),
  bodyText: text("body_text"),
  status: text("status").notNull(), // sent, delivered, failed
  errorMessage: text("error_message"),
  messageId: text("message_id"),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
});

export const insertEmailHistorySchema = createInsertSchema(emailHistory).omit({
  id: true,
  openCount: true,
  clickCount: true,
  sentAt: true,
  deliveredAt: true,
});

// Types for export
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;

export type EmailTemplateStyle = typeof emailTemplateStyles.$inferSelect;
export type InsertEmailTemplateStyle = z.infer<typeof insertEmailTemplateStyleSchema>;

export type EmailTemplateVariable = typeof emailTemplateVariables.$inferSelect;
export type InsertEmailTemplateVariable = z.infer<typeof insertEmailTemplateVariableSchema>;

export type EmailAsset = typeof emailAssets.$inferSelect;
export type InsertEmailAsset = z.infer<typeof insertEmailAssetSchema>;

export type EmailSignature = typeof emailSignatures.$inferSelect;
export type InsertEmailSignature = z.infer<typeof insertEmailSignatureSchema>;

export type EmailHistory = typeof emailHistory.$inferSelect;
export type InsertEmailHistory = z.infer<typeof insertEmailHistorySchema>;