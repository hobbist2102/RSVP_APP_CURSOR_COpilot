import { db } from "../server/db";
import { sessions, users } from "../shared/schema";
import { sql } from "drizzle-orm";

/**
 * Migration script to update the database for Replit Auth
 */
async function replitAuthMigration() {
  console.log("Starting Replit Auth migration...");

  // Create sessions table if it doesn't exist
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" VARCHAR(255) PRIMARY KEY,
        "sess" JSONB NOT NULL,
        "expire" TIMESTAMP(6) NOT NULL
      )
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire")
    `);
    
    console.log("Sessions table created successfully");
  } catch (error) {
    console.error("Error creating sessions table:", error);
    throw error;
  }

  // Update users table schema to match Replit Auth requirements
  try {
    console.log("Updating users table for Replit Auth...");
    
    // Create temporary users table for Replit Auth
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "replit_users" (
        "id" VARCHAR(255) PRIMARY KEY NOT NULL,
        "email" VARCHAR(255) UNIQUE,
        "first_name" VARCHAR(255),
        "last_name" VARCHAR(255),
        "profile_image_url" VARCHAR(255),
        "role" TEXT NOT NULL DEFAULT 'staff',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("Created temporary replit_users table");
    
    // Insert dummy admin user into replit_users
    await db.execute(sql`
      INSERT INTO "replit_users" ("id", "email", "role")
      VALUES ('admin', 'admin@example.com', 'admin')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log("Added default admin user to replit_users");
    
    // Create an index to improve username lookups
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_users_role" ON "replit_users" ("role");
    `);
    console.log("Created index on role column");
    
    // Create updated_at trigger
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await db.execute(sql`
      DROP TRIGGER IF EXISTS update_replit_users_timestamp ON replit_users;
    `);
    
    await db.execute(sql`
      CREATE TRIGGER update_replit_users_timestamp
      BEFORE UPDATE ON replit_users
      FOR EACH ROW
      EXECUTE PROCEDURE update_timestamp();
    `);
    console.log("Created updated_at trigger");
    
    console.log("Migration to replit_users table complete. Using this as a sidecar until ready to completely migrate.");
  } catch (error) {
    console.error("Error updating users table:", error);
    throw error;
  }

  console.log("Replit Auth migration completed successfully");
}

// Run the migration
replitAuthMigration()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });