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
    
    // Use postgres.js client directly for rollback
    await pgClient`
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
    `;
    
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
    // Use postgres.js client directly
    const result = await pgClient`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'wedding_events'
      AND column_name = 'gmail_client_id'
    `;
    
    // If gmail_client_id column doesn't exist, migration is needed
    return result.length === 0;
  } catch (error) {
    logger.error('Error checking if migration is needed', error as Error);
    throw error;
  }
}

/**
 * Perform the OAuth schema migration with transaction support
 */
async function migrateOAuthCredentials() {
  try {
    logger.info('Starting OAuth credentials migration');
    
    // Check if migration is needed
    const needsMigration = await isMigrationNeeded();
    if (!needsMigration) {
      logger.info('Migration already applied, skipping');
      return;
    }
    
    // postgres.js has built-in transaction support using a callback approach
    await pgClient.begin(async (tx) => {
      try {
        logger.info('Transaction started');
        
        // Use transaction object (tx) for all queries within the transaction
        
        // Add Gmail OAuth fields
        logger.debug('Adding Gmail OAuth columns');
        await tx`
          ALTER TABLE wedding_events 
          ADD COLUMN IF NOT EXISTS gmail_client_id TEXT,
          ADD COLUMN IF NOT EXISTS gmail_client_secret TEXT,
          ADD COLUMN IF NOT EXISTS gmail_redirect_uri TEXT,
          ADD COLUMN IF NOT EXISTS gmail_account TEXT,
          ADD COLUMN IF NOT EXISTS gmail_access_token TEXT,
          ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT,
          ADD COLUMN IF NOT EXISTS gmail_token_expiry TIMESTAMP,
          ADD COLUMN IF NOT EXISTS use_gmail BOOLEAN DEFAULT FALSE
        `;
        
        logger.info('Added Gmail OAuth columns');
        
        // Add Outlook OAuth fields
        logger.debug('Adding Outlook OAuth columns');
        await tx`
          ALTER TABLE wedding_events 
          ADD COLUMN IF NOT EXISTS outlook_client_id TEXT,
          ADD COLUMN IF NOT EXISTS outlook_client_secret TEXT,
          ADD COLUMN IF NOT EXISTS outlook_redirect_uri TEXT,
          ADD COLUMN IF NOT EXISTS outlook_account TEXT,
          ADD COLUMN IF NOT EXISTS outlook_access_token TEXT,
          ADD COLUMN IF NOT EXISTS outlook_refresh_token TEXT,
          ADD COLUMN IF NOT EXISTS outlook_token_expiry TIMESTAMP,
          ADD COLUMN IF NOT EXISTS use_outlook BOOLEAN DEFAULT FALSE
        `;
        
        logger.info('Added Outlook OAuth columns');
        
        // Add general email configuration fields
        logger.debug('Adding email configuration columns');
        await tx`
          ALTER TABLE wedding_events 
          ADD COLUMN IF NOT EXISTS email_from TEXT,
          ADD COLUMN IF NOT EXISTS email_reply_to TEXT,
          ADD COLUMN IF NOT EXISTS use_sendgrid BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS sendgrid_api_key TEXT
        `;
        
        logger.info('Added email configuration columns');
        
        // Create indexes for performance
        logger.debug('Creating indexes');
        await tx`
          CREATE INDEX IF NOT EXISTS idx_wedding_events_gmail_account ON wedding_events(gmail_account);
          CREATE INDEX IF NOT EXISTS idx_wedding_events_outlook_account ON wedding_events(outlook_account);
        `;
        
        logger.info('Created indexes for OAuth fields');
        
        // Verify the migration by checking column existence
        logger.debug('Verifying migration');
        const verificationResult = await tx`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'wedding_events'
          AND column_name IN ('gmail_client_id', 'outlook_client_id', 'email_from')
        `;
        
        if (verificationResult.length < 3) {
          throw new Error('Migration verification failed - not all columns were created');
        }
        
        // Log the current schema
        const schemaResult = await tx`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'wedding_events'
          AND (column_name LIKE '%gmail%' OR column_name LIKE '%outlook%')
          ORDER BY column_name
        `;
        
        logger.info('Schema after migration', {
          columnCount: schemaResult.length,
          columns: schemaResult.map(row => `${row.column_name} (${row.data_type})`)
        });
        
        logger.info('Migration completed successfully!');
        // Transaction will be automatically committed if no errors are thrown
      } catch (error) {
        // Transaction will be automatically rolled back when an error is thrown
        logger.error('Migration failed, transaction rolled back', error as Error);
        throw error;
      }
    });
  } catch (error) {
    logger.error('OAuth migration failed', error as Error);
    throw error;
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