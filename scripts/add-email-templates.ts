import { db, pgClient } from "../server/db";
import { emailTemplates, emailTemplateStyles, emailAssets, emailSignatures } from "../shared/schema";

/**
 * Script to add email template features to the database
 */
async function addEmailTemplates() {
  console.log("Creating email templates tables...");

  try {
    // Create email_templates table
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        subject TEXT NOT NULL,
        body_html TEXT NOT NULL,
        body_text TEXT,
        category TEXT NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        is_system BOOLEAN DEFAULT FALSE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log("Created email_templates table");

    // Create email_template_styles table
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS email_template_styles (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        header_logo TEXT,
        header_background TEXT,
        body_background TEXT,
        text_color TEXT DEFAULT '000000',
        link_color TEXT DEFAULT '0000FF',
        button_color TEXT DEFAULT '4CAF50',
        button_text_color TEXT DEFAULT 'FFFFFF',
        font_family TEXT DEFAULT 'Arial, sans-serif',
        font_size TEXT DEFAULT '16px',
        border_color TEXT DEFAULT 'DDDDDD',
        footer_text TEXT,
        footer_background TEXT,
        css TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log("Created email_template_styles table");

    // Create email_assets table
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS email_assets (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        alt_text TEXT,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log("Created email_assets table");

    // Create email_signatures table
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS email_signatures (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        plain_text TEXT,
        includes_social_links BOOLEAN DEFAULT FALSE,
        social_links JSONB DEFAULT '{}',
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `);
    console.log("Created email_signatures table");

    // Create email_history table
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS email_history (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        template_id INTEGER,
        subject TEXT NOT NULL,
        sender TEXT NOT NULL,
        recipients TEXT NOT NULL,
        cc_recipients TEXT,
        bcc_recipients TEXT,
        body_html TEXT,
        body_text TEXT,
        status TEXT NOT NULL,
        error_message TEXT,
        message_id TEXT,
        open_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        delivered_at TIMESTAMP
      );
    `);
    console.log("Created email_history table");

    console.log("✅ Email templates tables created successfully!");
  } catch (error) {
    console.error("Error creating email templates tables:", error);
    throw error;
  }
}

async function main() {
  try {
    await addEmailTemplates();
    console.log("Email templates migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    pgClient.end();
  }
}

main();