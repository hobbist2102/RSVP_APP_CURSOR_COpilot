import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { rsvpLinkHandler } from "./middleware";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Production-ready CORS configuration for deployed environment
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Always allow origins for Replit deployment compatibility
  if (origin && (origin.includes('replit.app') || origin.includes('replit.dev') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Apply the RSVP link handler middleware early in the pipeline
// This is essential for handling direct navigation to RSVP links
app.use(rsvpLinkHandler);

// Lightweight logging for essential debugging only
app.use((req, res, next) => {
  // Remove heavy logging middleware that was causing memory issues and server crashes
  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  // Import and register the fallback route handlers AFTER Vite middleware
  try {
    const { registerFallbackRoutes } = await import('./fallback');
    registerFallbackRoutes(app);
    log('Registered fallback route handlers for client-side routing');
  } catch (error) {
    
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    
    res.status(status).json({ message });
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000");
  
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Wedding platform server running on port ${port}`);
  });
  
  server.on('error', (error: any) => {
    log('Server error:', error);
  });

  // Graceful shutdown handling to prevent port conflicts
  const gracefulShutdown = () => {
    
    server.close(() => {
      
      process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      
      process.exit(0);
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGHUP', gracefulShutdown);
  
  } catch (error) {
    
    process.exit(1);
  }
})();
