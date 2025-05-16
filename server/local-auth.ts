import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Define custom User interface to include role
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    }
  }
}

// Mock users for now - will be moved to database later
const users = [
  {
    id: "1",
    username: "abhishek",
    password: "password", // In production, this would be hashed
    role: "admin",
    email: "mail.abhishek.mehta@gmail.com",
    firstName: "Abhishek",
    lastName: "Mehta"
  }
];

export function setupLocalAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'wedding-rsvp-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: sessionTtl,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy for username/password authentication
  passport.use(new LocalStrategy(
    (username, password, done) => {
      const user = users.find(user => user.username === username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id: string, done) => {
    const user = users.find(user => user.id === id);
    done(null, user || null);
  });

  // Login route
  app.post('/api/local/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post('/api/local/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Current user route
  app.get('/api/local/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    res.json({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    });
  });
}

// Middleware to ensure user is authenticated
export const isLocalAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to ensure user is an admin
export const isLocalAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden' });
};