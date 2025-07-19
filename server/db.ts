import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create postgres connection with deployment-optimized configuration
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  max: 5, // Smaller pool for deployment efficiency
  idle_timeout: 30, // Shorter idle timeout for deployment
  connect_timeout: 10, // Faster connection timeout
  max_lifetime: 900, // 15 minutes max connection lifetime
  prepare: false, // Disable prepared statements for deployment compatibility
  onnotice: () => {}, // Silence notice messages
  onparameter: () => {}, // Silence parameter messages
  debug: false, // Disable debug logging for performance
  transform: {
    undefined: null, // Transform undefined to null for database compatibility
  },
});



// Add error handling for the client
process.on('SIGINT', () => {
  
  client.end({ timeout: 5 }).catch(err => {
    
  });
  process.exit(0);
});

// Add database connection test and error handling
async function testConnection() {
  try {
    
    await client`SELECT 1`;
    
  } catch (error) {
    
    throw error;
  }
}

// Test connection immediately
testConnection().catch(err => {
  
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export the client to allow for explicit connection closing when needed
export const pgClient = client;