import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { sessions, users } from "@shared/schema";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("Environment variable SESSION_SECRET not provided");
}

const getOidcConfig = memoize(
  async () => {
    console.log("Using REPL_ID:", process.env.REPL_ID);
    console.log("Getting OIDC config from:", "https://replit.com/oidc");
    return await client.discovery(
      new URL("https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  console.log('Setting up session with DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('Session secret length:', process.env.SESSION_SECRET?.length);
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  try {
    console.log("Received claims for user:", JSON.stringify({
      sub: claims["sub"],
      email: claims["email"],
      first_name: claims["first_name"],
      last_name: claims["last_name"],
      has_profile_image: !!claims["profile_image_url"]
    }));
    
    // Execute a direct SQL query to check if the users table exists and create it if needed
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY NOT NULL,
        email VARCHAR(255) UNIQUE,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        profile_image_url VARCHAR(255),
        role TEXT NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Get user data from the database if it exists
    let existingUser = null;
    try {
      // Use raw SQL to avoid column name mismatches
      const result = await db.execute(sql`
        SELECT * FROM users WHERE id = ${claims["sub"] || ""}
      `);
      
      if (result && result.length > 0) {
        existingUser = result[0];
      }
    } catch (error) {
      console.log("Error checking for existing user:", error);
    }
    
    if (existingUser) {
      // Update existing user with raw SQL
      const result = await db.execute(sql`
        UPDATE users
        SET 
          email = ${claims["email"] || null},
          first_name = ${claims["first_name"] || null},
          last_name = ${claims["last_name"] || null},
          profile_image_url = ${claims["profile_image_url"] || null},
          updated_at = NOW()
        WHERE id = ${claims["sub"] || ""}
        RETURNING *
      `);
      
      const updatedUser = result && result.length > 0 ? result[0] : null;
      console.log("Updated existing user:", updatedUser?.id);
      return updatedUser;
    } else {
      // Create new user with raw SQL
      const result = await db.execute(sql`
        INSERT INTO users (id, email, first_name, last_name, profile_image_url, role)
        VALUES (
          ${claims["sub"] || ""},
          ${claims["email"] || null},
          ${claims["first_name"] || null},
          ${claims["last_name"] || null},
          ${claims["profile_image_url"] || null},
          'staff'
        )
        RETURNING *
      `);
      
      const newUser = result && result.length > 0 ? result[0] : null;
      console.log("Created new user:", newUser?.id);
      return newUser;
    }
  } catch (error) {
    console.error("Error upserting user:", error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    const dbUser = await upsertUser(tokens.claims());
    Object.assign(user, { 
      role: dbUser.role, 
      id: dbUser.id,
      email: dbUser.email
    });
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    console.log("Login request received, hostname:", req.hostname);
    
    // Save the return URL so we can redirect back after authentication
    if (req.query.returnTo) {
      req.session.returnTo = req.query.returnTo as string;
    }
    
    // Temporary debug info
    console.log("Available strategies:", Object.keys(passport._strategies));
    console.log("Using strategy:", `replitauth:${req.hostname}`);
    
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    console.log("Callback received from Replit Auth, hostname:", req.hostname);
    
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  
  if (!req.isAuthenticated() || !user?.role || user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden" });
  }
  
  return next();
};