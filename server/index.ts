import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handle direct RSVP routes by reading and serving the index.html
// This is a crucial fix to ensure direct access to RSVP links works correctly
app.get('/guest-rsvp/:token', (req, res, next) => {
  log(`Direct access to RSVP with token: ${req.params.token}`);
  
  // In development, let Vite handle it
  if (app.get("env") === "development") {
    return next();
  }
  
  // In production, serve the index.html directly
  try {
    const indexPath = path.join(process.cwd(), 'dist/public/index.html');
    if (fs.existsSync(indexPath)) {
      log(`Serving index.html for RSVP token: ${req.params.token}`);
      const content = fs.readFileSync(indexPath, 'utf8');
      
      // Inject the token into the HTML for client-side use
      const injectedScript = `
        <script>
          window.rsvpToken = "${req.params.token}";
          console.log("Injected RSVP token from server:", "${req.params.token}");
        </script>
      `;
      
      // Insert the script right after the opening head tag
      const modifiedContent = content.replace(/<head>/, '<head>' + injectedScript);
      res.set('Content-Type', 'text/html');
      return res.send(modifiedContent);
    }
  } catch (error) {
    console.error('Error serving RSVP page:', error);
  }
  
  next();
});

// Also handle the base RSVP route
app.get('/guest-rsvp', (req, res, next) => {
  log('Direct access to base RSVP route');
  // Just pass to the next middleware which will eventually go to the vite handler
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
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

    res.status(status).json({ message });
    throw err;
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
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
