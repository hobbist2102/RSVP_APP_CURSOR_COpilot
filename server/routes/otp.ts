import { Router } from 'express';
import { z } from 'zod';
import { OTPService } from '../services/otp-service';
import { isAuthenticated } from './auth';

const router = Router();

// Validation schemas
const enableTwoFactorSchema = z.object({
  method: z.enum(['email']).default('email')
});

const verifyOTPSchema = z.object({
  code: z.string().length(6, 'OTP code must be 6 digits'),
  type: z.string().min(1)
});

const sendOTPSchema = z.object({
  type: z.string().min(1),
  customMessage: z.string().optional()
});

const verifyBackupCodeSchema = z.object({
  code: z.string().min(8, 'Backup code must be at least 8 characters')
});

// Enable 2FA for current user
router.post('/enable-2fa', isAuthenticated, async (req, res) => {
  try {
    const { method } = enableTwoFactorSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await OTPService.enable2FA(userId, method);

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes: result.backupCodes
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable 2FA'
    });
  }
});

// Disable 2FA for current user
router.post('/disable-2fa', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    await OTPService.disable2FA(userId);

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
});

// Send OTP code
router.post('/send-otp', isAuthenticated, async (req, res) => {
  try {
    const { type, customMessage } = sendOTPSchema.parse(req.body);
    const userId = req.user!.id;

    await OTPService.sendEmailOTP(userId, type, customMessage);

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// Verify OTP code
router.post('/verify-otp', isAuthenticated, async (req, res) => {
  try {
    const { code, type } = verifyOTPSchema.parse(req.body);
    const userId = req.user!.id;

    const isValid = await OTPService.verifyOTP(userId, code, type);

    if (isValid) {
      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code'
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
});

// Verify backup code
router.post('/verify-backup-code', isAuthenticated, async (req, res) => {
  try {
    const { code } = verifyBackupCodeSchema.parse(req.body);
    const userId = req.user!.id;

    const isValid = await OTPService.verifyBackupCode(userId, code);

    if (isValid) {
      res.json({
        success: true,
        message: 'Backup code verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid backup code'
      });
    }
  } catch (error) {
    console.error('Error verifying backup code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify backup code'
    });
  }
});

// Get security settings
router.get('/security-settings', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const settings = await OTPService.getUserSecuritySettings(userId);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security settings'
    });
  }
});

// Check if 2FA is required for login (public endpoint)
router.get('/check-2fa/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // This would typically be implemented with user lookup
    // For now, return false to maintain backward compatibility
    res.json({
      success: true,
      requires2FA: false
    });
  } catch (error) {
    console.error('Error checking 2FA requirement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check 2FA requirement'
    });
  }
});

export default router;