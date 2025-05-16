import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { Express } from "express";

export async function setupLocalAuth(app: Express) {
  // Set up local strategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const result = await db.execute(
          sql`SELECT * FROM users WHERE username = ${username} LIMIT 1`
        );
        
        const user = result.rows?.[0];
        
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Local auth routes
  app.post("/api/auth/local/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(400).json({ message: info.message || "Login failed" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        return res.json({ 
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || "user"
        });
      });
    })(req, res, next);
  });

  // Register new user
  app.post("/api/auth/local/register", async (req, res) => {
    try {
      const { username, email, password, name } = req.body;
      
      // Check if user exists
      const existingUser = await db.execute(
        sql`SELECT * FROM users WHERE username = ${username} OR email = ${email} LIMIT 1`
      );
      
      if (existingUser.rows?.length > 0) {
        return res.status(400).json({ message: "Username or email already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const result = await db.execute(
        sql`INSERT INTO users (username, email, password, name, role) 
            VALUES (${username}, ${email}, ${hashedPassword}, ${name}, 'user')
            RETURNING id, username, email, name, role`
      );
      
      const newUser = result.rows?.[0];
      
      // Log in the new user
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        
        return res.status(201).json({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        });
      });
      
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: error.message || "Registration failed" });
    }
  });

  // Create a seed user
  try {
    // Check if user exists
    const existingUser = await db.execute(
      sql`SELECT * FROM users WHERE username = 'abhishek' LIMIT 1`
    );
    
    if (existingUser.rows?.length === 0) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password", salt);
      
      // Create user
      await db.execute(
        sql`INSERT INTO users (username, email, password, name, role) 
            VALUES ('abhishek', 'abhishek@example.com', ${hashedPassword}, 'Abhishek', 'admin')
            ON CONFLICT (username) DO NOTHING`
      );
      
      console.log("Seed user created: abhishek / password");
    }
  } catch (error) {
    console.error("Error creating seed user:", error);
  }
}