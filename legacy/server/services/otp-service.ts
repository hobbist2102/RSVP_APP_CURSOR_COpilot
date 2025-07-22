import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../../shared/schema';
import { otpCodes, userSecuritySettings } from '../schema';
import { eq, and, gt } from 'drizzle-orm';
import { UnifiedEmailService } from './unified-email';

export class OTPService {
  // Generate a 6-digit OTP code
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Generate backup codes for 2FA
  static generateBackupCodes(count: number = 8): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(8).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Create and store OTP
  static async createOTP(userId: number, type: string, expirationMinutes: number = 10): Promise<string> {
    const code = this.generateOTP();
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Clean up old unused OTPs for this user and type
    await db.delete(otpCodes)
      .where(and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.type, type),
        eq(otpCodes.used, false)
      ));

    // Insert new OTP
    await db.insert(otpCodes).values({
      userId,
      code,
      type,
      expiresAt,
      used: false
    });

    return code;
  }

  // Verify OTP code
  static async verifyOTP(userId: number, code: string, type: string): Promise<boolean> {
    const otpRecord = await db.select()
      .from(otpCodes)
      .where(and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.code, code),
        eq(otpCodes.type, type),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date())
      ))
      .limit(1);

    if (otpRecord.length === 0) {
      return false;
    }

    // Mark OTP as used
    await db.update(otpCodes)
      .set({ used: true })
      .where(eq(otpCodes.id, otpRecord[0].id));

    return true;
  }

  // Send OTP via email
  static async sendEmailOTP(userId: number, type: string, customMessage?: string): Promise<void> {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found');
    }

    const code = await this.createOTP(userId, type);
    
    const messages = {
      'email_verification': {
        subject: 'Email Verification Code',
        message: `Your email verification code is: ${code}. This code will expire in 10 minutes.`
      },
      'password_reset': {
        subject: 'Password Reset Code',
        message: `Your password reset code is: ${code}. This code will expire in 10 minutes.`
      },
      '2fa_login': {
        subject: 'Two-Factor Authentication Code',
        message: `Your login verification code is: ${code}. This code will expire in 10 minutes.`
      }
    };

    const messageData = messages[type as keyof typeof messages] || {
      subject: 'Verification Code',
      message: customMessage || `Your verification code is: ${code}`
    };

    const emailService = new UnifiedEmailService(
      0, // eventId - using 0 for system-level emails
      'resend', // provider
      'noreply@rsvp-platform.com', // fromEmail
      'RSVP Platform', // eventName
      null // fallbackProvider
    );
    await emailService.sendEmail({
      to: user[0].email,
      subject: messageData.subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #8B5CF6; margin: 0;">Wedding RSVP Platform</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">${messageData.subject}</h3>
            <p style="margin: 0 0 20px 0; color: #666;">${messageData.message}</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <div style="display: inline-block; background: #8B5CF6; color: white; padding: 15px 30px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                ${code}
              </div>
            </div>
          </div>
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `
    });
  }

  // Enable 2FA for user
  static async enable2FA(userId: number, method: string = 'email'): Promise<{ backupCodes: string[] }> {
    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    await db.insert(userSecuritySettings)
      .values({
        userId,
        twoFactorEnabled: true,
        twoFactorMethod: method,
        backupCodes: hashedBackupCodes,
        lastSecurityCheck: new Date()
      })
      .onConflictDoUpdate({
        target: userSecuritySettings.userId,
        set: {
          twoFactorEnabled: true,
          twoFactorMethod: method,
          backupCodes: hashedBackupCodes,
          updatedAt: new Date()
        }
      });

    return { backupCodes };
  }

  // Disable 2FA for user
  static async disable2FA(userId: number): Promise<void> {
    await db.update(userSecuritySettings)
      .set({
        twoFactorEnabled: false,
        backupCodes: null,
        updatedAt: new Date()
      })
      .where(eq(userSecuritySettings.userId, userId));
  }

  // Check if user has 2FA enabled
  static async is2FAEnabled(userId: number): Promise<boolean> {
    const settings = await db.select()
      .from(userSecuritySettings)
      .where(eq(userSecuritySettings.userId, userId))
      .limit(1);

    return settings.length > 0 && settings[0].twoFactorEnabled;
  }

  // Verify backup code
  static async verifyBackupCode(userId: number, code: string): Promise<boolean> {
    const settings = await db.select()
      .from(userSecuritySettings)
      .where(eq(userSecuritySettings.userId, userId))
      .limit(1);

    if (settings.length === 0 || !settings[0].backupCodes) {
      return false;
    }

    const backupCodes = settings[0].backupCodes as string[];
    
    for (let i = 0; i < backupCodes.length; i++) {
      if (await bcrypt.compare(code, backupCodes[i])) {
        // Remove used backup code
        backupCodes.splice(i, 1);
        await db.update(userSecuritySettings)
          .set({
            backupCodes: backupCodes,
            updatedAt: new Date()
          })
          .where(eq(userSecuritySettings.userId, userId));
        
        return true;
      }
    }

    return false;
  }

  // Get user security settings
  static async getUserSecuritySettings(userId: number) {
    const settings = await db.select()
      .from(userSecuritySettings)
      .where(eq(userSecuritySettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return {
        twoFactorEnabled: false,
        twoFactorMethod: 'email',
        backupCodesCount: 0
      };
    }

    const setting = settings[0];
    return {
      twoFactorEnabled: setting.twoFactorEnabled,
      twoFactorMethod: setting.twoFactorMethod,
      backupCodesCount: setting.backupCodes ? (setting.backupCodes as string[]).length : 0,
      lastSecurityCheck: setting.lastSecurityCheck
    };
  }
}