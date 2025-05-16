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
    
    // Get user data from the database if it exists
    let existingUser = null;
    try {
      const [foundUser] = await db.select().from(users).where(eq(users.id, claims["sub"] || ""));
      existingUser = foundUser;
    } catch (error) {
      console.log("Error checking for existing user:", error);
    }
    
    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          email: claims["email"] || null,
          firstName: claims["first_name"] || null,
          lastName: claims["last_name"] || null,
          profileImageUrl: claims["profile_image_url"] || null,
          updatedAt: new Date()
        })
        .where(eq(users.id, claims["sub"] || ""))
        .returning();
      
      console.log("Updated existing user:", updatedUser?.id);
      return updatedUser;
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          id: claims["sub"] || "",
          email: claims["email"] || null,
          firstName: claims["first_name"] || null,
          lastName: claims["last_name"] || null,
          profileImageUrl: claims["profile_image_url"] || null,
          role: "staff"
        })
        .returning();
      
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