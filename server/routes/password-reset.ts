import { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { z } from 'zod';
import { storage } from '../storage';

// Password reset schemas
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// In-memory token store (in production, use Redis or database)
const resetTokens = new Map<string, { 
  userId: number; 
  expires: Date; 
  email: string; 
}>();

// Clean up expired tokens every hour
setInterval(() => {
  const now = new Date();
  for (const [token, data] of resetTokens.entries()) {
    if (data.expires < now) {
      resetTokens.delete(token);
    }
  }
}, 60 * 60 * 1000);

export default function registerPasswordResetRoutes(app: Express) {
  
  // Request password reset
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      // Find user by email
      const users = await storage.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Always return success to prevent email enumeration
      const successResponse = {
        message: 'If an account with that email exists, we\'ve sent a password reset link.'
      };
      
      if (!user) {
        // Still return success to prevent email enumeration
        return res.json(successResponse);
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Store token
      resetTokens.set(resetToken, {
        userId: user.id,
        expires,
        email: user.email
      });
      
      // In a real app, send email here
      console.log(`Password reset token for ${user.email}: ${resetToken}`);
      console.log(`Reset link: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`);
      
      // TODO: Implement email sending
      // await emailService.sendPasswordReset(user.email, resetToken);
      
      res.json(successResponse);
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Failed to process password reset request' });
    }
  });
  
  // Verify reset token
  app.get('/api/auth/verify-reset-token/:token', async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const tokenData = resetTokens.get(token);
      if (!tokenData) {
        return res.status(400).json({ 
          message: 'Invalid or expired reset token',
          valid: false 
        });
      }
      
      if (tokenData.expires < new Date()) {
        resetTokens.delete(token);
        return res.status(400).json({ 
          message: 'Reset token has expired',
          valid: false 
        });
      }
      
      res.json({ 
        message: 'Token is valid',
        valid: true,
        email: tokenData.email
      });
    } catch (error) {
      console.error('Verify reset token error:', error);
      res.status(500).json({ 
        message: 'Failed to verify reset token',
        valid: false 
      });
    }
  });
  
  // Reset password
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, password, confirmPassword } = resetPasswordSchema.parse(req.body);
      
      const tokenData = resetTokens.get(token);
      if (!tokenData) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }
      
      if (tokenData.expires < new Date()) {
        resetTokens.delete(token);
        return res.status(400).json({ message: 'Reset token has expired' });
      }
      
      // Get user
      const user = await storage.getUser(tokenData.userId);
      if (!user) {
        resetTokens.delete(token);
        return res.status(400).json({ message: 'User not found' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update user password
      await storage.updateUser(tokenData.userId, { password: hashedPassword });
      
      // Remove used token
      resetTokens.delete(token);
      
      res.json({ 
        message: 'Password has been reset successfully. You can now log in with your new password.' 
      });
    } catch (error) {
      console.error('Reset password error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Failed to reset password' });
    }
  });
  
  // Get active tokens (admin only - for debugging)
  app.get('/api/admin/reset-tokens', async (req: Request, res: Response) => {
    try {
      // Simple admin check
      if (!req.isAuthenticated() || (req.user as any)?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const tokens = Array.from(resetTokens.entries()).map(([token, data]) => ({
        token: token.substring(0, 8) + '...', // Partial token for security
        email: data.email,
        expires: data.expires,
        expired: data.expires < new Date()
      }));
      
      res.json(tokens);
    } catch (error) {
      console.error('Get reset tokens error:', error);
      res.status(500).json({ message: 'Failed to fetch reset tokens' });
    }
  });
}