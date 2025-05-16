/**
 * Script to add event setup wizard tracking tables to the database
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addEventSetupWizardTables() {
  console.log("Adding event setup wizard tables...");

  try {
    // Check if event_setup_progress table already exists
    const checkEventSetupTable = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'event_setup_progress'
    `);
    
    if (checkEventSetupTable.length === 0) {
      console.log("Creating event_setup_progress table...");
      await db.execute(sql`
        CREATE TABLE event_setup_progress (
          id SERIAL PRIMARY KEY,
          event_id INTEGER NOT NULL UNIQUE,
          basic_info_complete BOOLEAN DEFAULT FALSE,
          venues_complete BOOLEAN DEFAULT FALSE,
          rsvp_complete BOOLEAN DEFAULT FALSE,
          accommodation_complete BOOLEAN DEFAULT FALSE,
          transport_complete BOOLEAN DEFAULT FALSE,
          communication_complete BOOLEAN DEFAULT FALSE,
          styling_complete BOOLEAN DEFAULT FALSE,
          completed_at TIMESTAMP,
          current_step TEXT DEFAULT 'basic_info',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log("✅ event_setup_progress table created successfully");
    } else {
      console.log("event_setup_progress table already exists");
    }

    // Check if transport_fleet table already exists
    const checkTransportFleetTable = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'transport_fleet'
    `);
    
    if (checkTransportFleetTable.length === 0) {
      console.log("Creating transport_fleet table...");
      await db.execute(sql`
        CREATE TABLE transport_fleet (
          id SERIAL PRIMARY KEY,
          event_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          transport_mode TEXT NOT NULL,
          vehicle_type TEXT NOT NULL,
          capacity INTEGER NOT NULL,
          count INTEGER NOT NULL DEFAULT 1,
          provider_name TEXT,
          provider_contact TEXT,
          notes TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log("✅ transport_fleet table created successfully");
    } else {
      console.log("transport_fleet table already exists");
    }

    console.log("✅ All event setup wizard tables created successfully");
  } catch (error) {
    console.error("❌ Error creating event setup wizard tables:", error);
    throw error;
  }
}

async function main() {
  try {
    await addEventSetupWizardTables();
    console.log("✅ Database migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database migration failed:", error);
    process.exit(1);
  }
}

main();