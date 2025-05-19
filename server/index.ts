import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { rsvpLinkHandler } from "./middleware";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set appropriate CORS headers to ensure cookies can be sent cross-origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Apply the RSVP link handler middleware early in the pipeline
// This is essential for handling direct navigation to RSVP links
app.use(rsvpLinkHandler);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  // Only capture responses in development mode to reduce memory usage
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  
  if (process.env.NODE_ENV === 'development') {
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      // Only keep a reference to small responses or just the response shape for large ones
      if (bodyJson && typeof bodyJson === 'object') {
        const isLarge = JSON.stringify(bodyJson).length > 500;
        if (isLarge) {
          // For large responses, just log the structure with field names
          capturedJsonResponse = Object.keys(bodyJson).reduce((acc: Record<string, string>, key) => {
            const value = bodyJson[key];
            acc[key] = Array.isArray(value) ? `Array(${value.length})` : typeof value;
            return acc;
          }, {});
        } else {
          capturedJsonResponse = bodyJson;
        }
      } else {
        capturedJsonResponse = bodyJson;
      }
      
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      if (capturedJsonResponse && process.env.NODE_ENV === 'development') {
        try {
          // Use a more memory-efficient approach to stringify the response
          logLine += ` :: ${JSON.stringify(capturedJsonResponse).slice(0, 75)}`;
          if (JSON.stringify(capturedJsonResponse).length > 75) {
            logLine += "…";
          }
        } catch (e) {
          logLine += " :: [Large response object]";
        }
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Import and register the fallback route handlers
  // This needs to be done after API routes but before error handler
  try {
    const { registerFallbackRoutes } = await import('./fallback');
    registerFallbackRoutes(app);
    log('Registered fallback route handlers for client-side routing');
  } catch (error) {
    console.error('Failed to register fallback routes:', error);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error(`Server error: ${err.message || 'Unknown error'}`, err);
    res.status(status).json({ message });
    // Removed the 'throw err' line to prevent server crashes
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000");
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
