import { pgTable, varchar, json, timestamp, serial, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from '../shared/schema';

export const sessions = pgTable('session', {
  sid: varchar('sid').primaryKey(),
  sess: json('sess').notNull(),
  expire: timestamp('expire', { mode: 'date' }).notNull(),
});

// OTP/2FA Tables
export const otpCodes = pgTable('otp_codes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'email_verification', 'password_reset', '2fa_login'
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userSecuritySettings = pgTable('user_security_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).unique().notNull(),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorMethod: varchar('two_factor_method', { length: 20 }).default('email'), // 'email', 'sms'
  backupCodes: json('backup_codes'), // Array of backup codes
  lastSecurityCheck: timestamp('last_security_check'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});