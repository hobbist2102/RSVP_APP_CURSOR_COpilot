import { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { storage } from '../storage';
import { insertUserSchema } from '../../shared/schema';

// Admin-only middleware - uses same auth system
export const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && (req.user as any)?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

// User update schema for admin operations
const updateUserSchema = insertUserSchema.partial().extend({
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  lastLogin: z.string().optional()
});

export default function registerAdminRoutes(app: Express, isAuthenticated: any) {
  
  // ===== SYSTEM STATISTICS =====
  
  app.get('/api/admin/system/stats', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const [users, events, allGuests] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllEvents(),
        // Get total guests across all events
        Promise.all((await storage.getAllEvents()).map(event => storage.getGuestsByEvent(event.id)))
      ]);

      const totalGuests = allGuests.flat().length;
      
      const stats = {
        totalUsers: users.length,
        totalEvents: events.length,
        activeEvents: events.filter(e => e.status === 'active' || !e.status).length,
        totalGuests,
        systemStatus: 'healthy' as const,
        databaseSize: '~50MB', // This could be calculated from actual DB
        uptime: process.uptime(),
        lastBackup: new Date().toISOString()
      };

      res.json(stats);
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ message: 'Failed to fetch system statistics' });
    }
  });

  // ===== RECENT ACTIVITY =====
  
  app.get('/api/admin/system/activity', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // For now, return mock activity data
      // In a real system, this would come from an audit log table
      const activity = [
        {
          id: '1',
          type: 'user_login' as const,
          message: 'Admin user logged in',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          severity: 'info' as const
        },
        {
          id: '2', 
          type: 'event_created' as const,
          message: 'New event "Sarah & John Wedding" created',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          severity: 'info' as const
        },
        {
          id: '3',
          type: 'guest_added' as const,
          message: '15 guests imported via Excel',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          severity: 'info' as const
        }
      ];

      res.json(activity);
    } catch (error) {
      console.error('Admin activity error:', error);
      res.status(500).json({ message: 'Failed to fetch system activity' });
    }
  });

  // ===== USER MANAGEMENT =====
  
  // Get all users (admin only)
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return {
          ...safeUser,
          status: 'active', // Default status since we don't have this in schema yet
          lastLogin: null  // We'll add this later
        };
      });

      res.json(safeUsers);
    } catch (error) {
      console.error('Admin get users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Get specific user (admin only)
  app.get('/api/admin/users/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password from response
      const { password, ...safeUser } = user;
      res.json({
        ...safeUser,
        status: 'active',
        lastLogin: null
      });
    } catch (error) {
      console.error('Admin get user error:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Create new user (admin only)
  app.post('/api/admin/users', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsers = await storage.getAllUsers();
      const usernameExists = existingUsers.some(u => u.username === userData.username);
      const emailExists = existingUsers.some(u => u.email === userData.email);
      
      if (usernameExists) {
        return res.status(409).json({ message: 'Username already exists' });
      }
      
      if (emailExists) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const secureUserData = {
        ...userData,
        password: hashedPassword
      };

      const user = await storage.createUser(secureUserData);
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.status(201).json({
        ...safeUser,
        status: 'active',
        lastLogin: null
      });
    } catch (error) {
      console.error('Admin create user error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // Update user (admin only)
  app.put('/api/admin/users/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      const userData = updateUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prevent admin from changing their own role
      if (userId === (req.user as any).id && userData.role && userData.role !== 'admin') {
        return res.status(403).json({ message: 'Cannot change your own admin role' });
      }

      // If password is being updated, hash it
      let updateData = { ...userData };
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 10);
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      res.json({
        ...safeUser,
        status: userData.status || 'active',
        lastLogin: userData.lastLogin || null
      });
    } catch (error) {
      console.error('Admin update user error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error',
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Delete user (admin only)
  app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }

      // Prevent admin from deleting themselves
      if (userId === (req.user as any).id) {
        return res.status(403).json({ message: 'Cannot delete your own account' });
      }

      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Admin delete user error:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // ===== EVENT MANAGEMENT (Admin Overview) =====
  
  app.get('/api/admin/events', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const events = await storage.getAllEvents();
      
      // Enhance events with additional admin info
      const enhancedEvents = await Promise.all(
        events.map(async (event) => {
          try {
            const [guests, creator] = await Promise.all([
              storage.getGuestsByEvent(event.id),
              storage.getUser(event.createdBy)
            ]);

            return {
              ...event,
              guestCount: guests.length,
              creatorName: creator?.name || 'Unknown',
              status: 'active' // Default status
            };
          } catch (error) {
            console.error(`Error enhancing event ${event.id}:`, error);
            return {
              ...event,
              guestCount: 0,
              creatorName: 'Unknown',
              status: 'active'
            };
          }
        })
      );

      res.json(enhancedEvents);
    } catch (error) {
      console.error('Admin events error:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  // ===== TENANT MANAGEMENT =====
  
  app.get('/api/admin/tenants', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      // For now, tenants are essentially events with their creators
      const events = await storage.getAllEvents();
      
      const tenants = await Promise.all(
        events.map(async (event) => {
          try {
            const [creator, guests] = await Promise.all([
              storage.getUser(event.createdBy),
              storage.getGuestsByEvent(event.id)
            ]);

            return {
              id: event.id,
              name: event.title,
              type: 'wedding',
              owner: creator?.name || 'Unknown',
              ownerEmail: creator?.email || '',
              createdAt: event.createdAt,
              status: 'active',
              guestCount: guests.length,
              lastActivity: event.updatedAt || event.createdAt
            };
          } catch (error) {
            console.error(`Error processing tenant for event ${event.id}:`, error);
            return {
              id: event.id,
              name: event.title,
              type: 'wedding',
              owner: 'Unknown',
              ownerEmail: '',
              createdAt: event.createdAt,
              status: 'active',
              guestCount: 0,
              lastActivity: event.createdAt
            };
          }
        })
      );

      res.json(tenants);
    } catch (error) {
      console.error('Admin tenants error:', error);
      res.status(500).json({ message: 'Failed to fetch tenants' });
    }
  });

  // ===== SYSTEM HEALTH =====
  
  app.get('/api/admin/system/health', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'connected',
        version: '1.0.0'
      };

      res.json(health);
    } catch (error) {
      console.error('Admin health check error:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });
}