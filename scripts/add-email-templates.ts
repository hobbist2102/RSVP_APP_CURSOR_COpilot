import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { emailTemplates, emailTemplateStyles, emailAssets, emailSignatures, emailHistory } from "../shared/schema";

/**
 * Script to add email template features to the database
 */
async function addEmailTemplates() {
  console.log("Creating email templates tables...");

  try {
    // Create tables using Drizzle's schema (type-safe approach)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${emailTemplates}
    `);
    console.log("Created email_templates table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${emailTemplateStyles}
    `);
    console.log("Created email_template_styles table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${emailAssets}
    `);
    console.log("Created email_assets table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${emailSignatures}
    `);
    console.log("Created email_signatures table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${emailHistory}
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