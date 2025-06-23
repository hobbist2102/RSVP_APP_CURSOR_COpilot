import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create postgres connection with optimized configuration for stability
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  max: 20, // Increased connection pool size
  idle_timeout: 300, // 5 minutes before closing idle connections
  connect_timeout: 30, // 30 seconds connection timeout
  max_lifetime: 3600, // 1 hour max connection lifetime
  onnotice: () => {}, // Silence notice messages
  onparameter: () => {}, // Silence parameter messages
  debug: false, // Disable debug logging for performance
  transform: {
    undefined: null, // Transform undefined to null for database compatibility
  },
});

// Add error handling for the client
process.on('SIGINT', () => {
  console.log('Closing postgres connection due to app termination');
  client.end({ timeout: 5 }).catch(err => {
    console.error('Error closing postgres connections', err);
  });
  process.exit(0);
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export the client to allow for explicit connection closing when needed
export const pgClient = client;