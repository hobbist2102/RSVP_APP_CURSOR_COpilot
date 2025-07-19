import { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { z } from 'zod';
import { storage } from '../storage';
import { insertUserSchema } from '../../shared/schema';
import { getDefaultCredentials } from '../auth/production-auth';

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