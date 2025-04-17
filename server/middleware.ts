import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { log } from './vite';

// Add proper type declaration for Express.User
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      name: string;
      email: string;
      role: string;
    }
  }
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
};

// RSVP link handler middleware - place this before any other routes
export const rsvpLinkHandler = (req: Request, res: Response, next: NextFunction) => {
  // Check if this is an RSVP link path
  if (req.path.startsWith('/guest-rsvp/')) {
    log(`RSVP link handler processing: ${req.path}`);
    
    // In production, we need to serve the index.html
    if (process.env.NODE_ENV === 'production') {
      try {
        const indexPath = path.join(process.cwd(), 'dist/public/index.html');
        if (fs.existsSync(indexPath)) {
          log(`Serving index.html for RSVP path: ${req.path}`);
          
          // Extract the token from the URL
          const token = req.path.replace('/guest-rsvp/', '');
          
          // Read the index.html file
          const htmlContent = fs.readFileSync(indexPath, 'utf8');
          
          // Inject a script that sets the token in the window object
          const injectedHtml = htmlContent.replace(
            '<head>', 
            `<head>
            <script>
              window.rsvpToken = "${token}";
              console.log("RSVP token loaded from direct URL:", "${token}");
            </script>`
          );
          
          // Send the modified HTML
          return res.send(injectedHtml);
        }
      } catch (error) {
        console.error('Error serving RSVP page:', error);
      }
    }
    
    // In development, we'll let Vite handle it
    log('Letting Vite handle RSVP link in development mode');
  }
  
  next();
};