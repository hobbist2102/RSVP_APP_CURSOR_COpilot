/**
 * Improved OAuth Migration Script
 * 
 * This script adds necessary database fields for OAuth integration with 
 * transaction support, proper error handling, and rollback capabilities.
 */

import { db, pgClient } from "../server/db";
import { sql } from "drizzle-orm";
import { createOAuthLogger } from "../server/lib/logger";

const logger = createOAuthLogger(undefined, undefined, 'migration');

/**
 * Roll back the migration in case of failure
 */
async function rollbackMigration() {
  try {
    logger.info('Rolling back OAuth migration...');
    
    await db.execute(sql`
      ALTER TABLE wedding_events 
      DROP COLUMN IF EXISTS gmail_client_id,
      DROP COLUMN IF EXISTS gmail_client_secret,
      DROP COLUMN IF EXISTS gmail_redirect_uri,
      DROP COLUMN IF EXISTS gmail_account,
      DROP COLUMN IF EXISTS gmail_access_token,
      DROP COLUMN IF EXISTS gmail_refresh_token,
      DROP COLUMN IF EXISTS gmail_token_expiry,
      DROP COLUMN IF EXISTS use_gmail,
      
      DROP COLUMN IF EXISTS outlook_client_id,
      DROP COLUMN IF EXISTS outlook_client_secret,
      DROP COLUMN IF EXISTS outlook_redirect_uri,
      DROP COLUMN IF EXISTS outlook_account,
      DROP COLUMN IF EXISTS outlook_access_token,
      DROP COLUMN IF EXISTS outlook_refresh_token,
      DROP COLUMN IF EXISTS outlook_token_expiry,
      DROP COLUMN IF EXISTS use_outlook,
      
      DROP COLUMN IF EXISTS email_from,
      DROP COLUMN IF EXISTS email_reply_to,
      DROP COLUMN IF EXISTS use_sendgrid,
      DROP COLUMN IF EXISTS sendgrid_api_key
    `);
    
    logger.info('Rollback completed successfully');
  } catch (error) {
    logger.error('Rollback failed', error as Error);
    console.error('Migration rollback failed:', error);
  }
}

/**
 * Check the current schema to see if migration is needed
 */
async function isMigrationNeeded(): Promise<boolean> {
  try {
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'wedding_events'
      AND column_name = 'gmail_client_id'
    `);
    
    // If gmail_client_id column doesn't exist, migration is needed
    return result.rows.length === 0;
  } catch (error) {
    logger.error('Error checking if migration is needed', error as Error);
    throw error;
  }
}

/**
 * Perform the OAuth schema migration with transaction support
 */
async function migrateOAuthCredentials() {
  const client = await pgClient.connect();
  
  try {
    logger.info('Starting OAuth credentials migration');
    
    // Check if migration is needed
    const needsMigration = await isMigrationNeeded();
    if (!needsMigration) {
      logger.info('Migration already applied, skipping');
      return;
    }
    
    // Start a transaction
    await client.query('BEGIN');
    logger.info('Transaction started');
    
    // Add Gmail OAuth fields
    logger.debug('Adding Gmail OAuth columns');
    await client.query(`
      ALTER TABLE wedding_events 
      ADD COLUMN IF NOT EXISTS gmail_client_id TEXT,
      ADD COLUMN IF NOT EXISTS gmail_client_secret TEXT,
      ADD COLUMN IF NOT EXISTS gmail_redirect_uri TEXT,
      ADD COLUMN IF NOT EXISTS gmail_account TEXT,
      ADD COLUMN IF NOT EXISTS gmail_access_token TEXT,
      ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT,
      ADD COLUMN IF NOT EXISTS gmail_token_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS use_gmail BOOLEAN DEFAULT FALSE
    `);
    
    logger.info('Added Gmail OAuth columns');
    
    // Add Outlook OAuth fields
    logger.debug('Adding Outlook OAuth columns');
    await client.query(`
      ALTER TABLE wedding_events 
      ADD COLUMN IF NOT EXISTS outlook_client_id TEXT,
      ADD COLUMN IF NOT EXISTS outlook_client_secret TEXT,
      ADD COLUMN IF NOT EXISTS outlook_redirect_uri TEXT,
      ADD COLUMN IF NOT EXISTS outlook_account TEXT,
      ADD COLUMN IF NOT EXISTS outlook_access_token TEXT,
      ADD COLUMN IF NOT EXISTS outlook_refresh_token TEXT,
      ADD COLUMN IF NOT EXISTS outlook_token_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS use_outlook BOOLEAN DEFAULT FALSE
    `);
    
    logger.info('Added Outlook OAuth columns');
    
    // Add general email configuration fields
    logger.debug('Adding email configuration columns');
    await client.query(`
      ALTER TABLE wedding_events 
      ADD COLUMN IF NOT EXISTS email_from TEXT,
      ADD COLUMN IF NOT EXISTS email_reply_to TEXT,
      ADD COLUMN IF NOT EXISTS use_sendgrid BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS sendgrid_api_key TEXT
    `);
    
    logger.info('Added email configuration columns');
    
    // Create indexes for performance
    logger.debug('Creating indexes');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wedding_events_gmail_account ON wedding_events(gmail_account);
      CREATE INDEX IF NOT EXISTS idx_wedding_events_outlook_account ON wedding_events(outlook_account);
    `);
    
    logger.info('Created indexes for OAuth fields');
    
    // Verify the migration by checking column existence
    logger.debug('Verifying migration');
    const verificationResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'wedding_events'
      AND column_name IN ('gmail_client_id', 'outlook_client_id', 'email_from')
    `);
    
    if (verificationResult.rows.length < 3) {
      throw new Error('Migration verification failed - not all columns were created');
    }
    
    // Log the current schema
    const schemaResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'wedding_events'
      AND column_name LIKE '%gmail%' OR column_name LIKE '%outlook%'
      ORDER BY column_name
    `);
    
    logger.info('Schema after migration', {
      columnCount: schemaResult.rows.length,
      columns: schemaResult.rows.map(row => `${row.column_name} (${row.data_type})`)
    });
    
    // Commit the transaction
    await client.query('COMMIT');
    logger.info('Migration completed successfully!');
  } catch (error) {
    // Rollback the transaction in case of error
    try {
      logger.error('Migration failed, rolling back transaction', error as Error);
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error('Rollback failed', rollbackError as Error);
    }
    
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

// Execute the migration and handle errors
if (require.main === module) {
  migrateOAuthCredentials()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed', error as Error);
      console.error('Migration script failed:', error);
      
      // Attempt rollback if not in a transaction
      rollbackMigration()
        .finally(() => {
          process.exit(1);
        });
    });
}

export default migrateOAuthCredentials;