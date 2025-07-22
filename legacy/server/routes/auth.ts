import { Express, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { z } from 'zod';
import { storage } from '../storage';
import { insertUserSchema } from '../../shared/schema';
import { getDefaultCredentials } from '../auth/production-auth';
import crypto from 'crypto';
import { passwordResetTokens } from '../../shared/schema';
import { and, lte } from 'drizzle-orm';

// CSRF token generation utility
function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Auth middleware
export const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

export const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && (req.user as any)?.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
};

export default function registerAuthRoutes(app: Express) {
  // Configure Passport strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      // Handle both hashed passwords and plain text passwords (for backward compatibility)
      let passwordMatch = false;
      
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        // Password is already hashed, use bcrypt comparison
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        // Legacy plain-text password - direct comparison with automatic upgrade
        passwordMatch = user.password === password;
        
        if (passwordMatch) {
          // Upgrade the plain-text password to a hashed one
          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await storage.updateUserPassword(user.id, hashedPassword);
            // Password successfully upgraded to hashed format
          } catch (hashError) {
            console.error('Failed to upgrade password:', hashError);
          }
        }
      }
      
      if (!passwordMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Create a safe version of the user without the password
      const { password, ...safeUser } = user;
      return done(null, safeUser);
    } catch (error) {
      console.error('Deserialization error:', error);
      return done(error, false);
    }
  });

  // CSRF token endpoint
  app.get('/api/csrf-token', (req, res) => {
    const token = generateCSRFToken();
    req.session.csrfToken = token;
    res.json({ csrfToken: token });
  });

  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const secureUserData = {
        ...userData,
        password: hashedPassword
      };
      
      // Create new user with hashed password
      const user = await storage.createUser(secureUserData);
      
      // Log the user in automatically
      req.login(user, (err) => {
        if (err) {
          console.error('Login after registration failed:', err);
          return res.status(500).json({ message: 'Registration successful but login failed' });
        }
        
        // Save the session explicitly before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save failed:', saveErr);
            return res.status(500).json({ message: 'Registration successful but session save failed' });
          }
          
          // Create a safe user object without the password
          const { password, ...safeUser } = user;
          res.status(201).json({ user: safeUser });
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to register user' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error('Authentication error:', err);
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return next(loginErr);
        }
        
        // Create a safe user object without the password
        const safeUser: { [key: string]: unknown } = { ...user };
        if ('password' in safeUser) {
          delete safeUser.password;
        }
          
        // Force immediate session save and wait for completion
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return next(saveErr);
          }
          
          return res.json({ user: safeUser });
        });
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Auth status endpoint
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const userObj = req.user as Record<string, unknown>;
      const user = {
        id: userObj.id,
        username: userObj.username,
        name: userObj.name || 'User',
        email: userObj.email || '',
        role: userObj.role || 'couple',
      };
      return res.json({ user, authenticated: true });
    } else {
      return res.status(401).json({ message: 'Not authenticated', authenticated: false });
    }
  });

  // Get current user endpoint
  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const userObj = req.user as Record<string, unknown>;
      const user = {
        id: userObj.id,
        username: userObj.username,
        name: userObj.name || 'User',
        email: userObj.email || '',
        role: userObj.role || 'couple',
      };
      return res.json({ user });
    } else {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Get current user profile
  app.get('/api/auth/profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't send password in response
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  // Update user profile
  app.put('/api/auth/profile', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const updateData = req.body;

      // Validate update data
      const profileUpdateSchema = z.object({
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        bio: z.string().max(500).optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        website: z.string().url().optional().or(z.literal('')),
        location: z.string().optional(),
      });

      const validatedData = profileUpdateSchema.parse(updateData);

      // Check if email is already taken by another user
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      // Update user profile
      await storage.updateUser(userId, validatedData);

      // Get updated user data
      const updatedUser = await storage.getUserById(userId);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't send password in response
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
      }
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Change password
  app.post('/api/auth/change-password', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { currentPassword, newPassword } = req.body;

      // Validate input
      const passwordChangeSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      });

      const validatedData = passwordChangeSchema.parse({ currentPassword, newPassword });

      // Get current user
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      let currentPasswordMatch = false;
      
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        // Password is already hashed, use bcrypt comparison
        currentPasswordMatch = await bcrypt.compare(validatedData.currentPassword, user.password);
      } else {
        // Legacy plain-text password - direct comparison
        currentPasswordMatch = user.password === validatedData.currentPassword;
      }

      if (!currentPasswordMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(validatedData.newPassword, 10);

      // Update password
      await storage.updateUser(userId, { password: hashedNewPassword });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: error.errors 
        });
      }
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  // Password reset request
  app.post('/api/auth/password-reset/request', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Don't reveal whether email exists - security best practice
        return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Store token in database
      await storage.createPasswordResetToken(user.id, hashedToken, expiresAt);
      
      // TODO: Send email with reset token
      // In production, you would use an email service here
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
      
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  });

  // Verify reset token
  app.post('/api/auth/password-reset/verify', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }
      
      // Hash the provided token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      // Find valid token
      const resetRecord = await storage.getPasswordResetTokenByToken(hashedToken);
      
      if (!resetRecord) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      res.json({ message: 'Token is valid', userId: resetRecord.userId });
    } catch (error) {
      console.error('Password reset verify error:', error);
      res.status(500).json({ error: 'Failed to verify reset token' });
    }
  });

  // Reset password
  app.post('/api/auth/password-reset/reset', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      
      // Hash the provided token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      // Find valid token
      const resetRecord = await storage.getPasswordResetTokenByToken(hashedToken);
      
      if (!resetRecord) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update user password
      await storage.updateUserPassword(resetRecord.userId, hashedPassword);
      
      // Delete the used token and any other tokens for this user
      await storage.deletePasswordResetTokensByUserId(resetRecord.userId);
      
      res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  // Clean up expired tokens (utility endpoint for admin or cron job)
  app.post('/api/auth/password-reset/cleanup', isAdmin, async (req, res) => {
    try {
      const result = await storage.deleteExpiredPasswordResetTokens();
      
      res.json({ message: 'Expired tokens cleaned up successfully' });
    } catch (error) {
      console.error('Token cleanup error:', error);
      res.status(500).json({ error: 'Failed to clean up expired tokens' });
    }
  });

  // System info endpoint (for deployment debugging)
  app.get('/api/system/info', async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allEvents = await storage.getAllEvents();
      const defaultCreds = getDefaultCredentials();
      
      res.json({
        users: allUsers.map(u => ({ id: u.id, username: u.username, name: u.name, role: u.role })),
        events: allEvents.map(e => ({ id: e.id, title: e.title, createdBy: e.createdBy })),
        defaultCredentials: defaultCreds,
        authentication: {
          isAuthenticated: req.isAuthenticated(),
          user: req.user ? {
            id: (req.user as Record<string, unknown>).id,
            username: (req.user as Record<string, unknown>).username,
            role: (req.user as Record<string, unknown>).role
          } : null
        }
      });
    } catch (error) {
      console.error('System info error:', error);
      res.status(500).json({ message: 'Failed to get system info' });
    }
  });

  // User management endpoint (admin only)
  app.post('/api/users', isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const secureUserData = {
        ...userData,
        password: hashedPassword
      };
      
      const user = await storage.createUser(secureUserData);
      
      // Don't return the password in the response
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error('Create user error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });
}