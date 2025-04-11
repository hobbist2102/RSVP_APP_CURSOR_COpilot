import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create postgres connection with improved configuration for resilience
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // How many seconds to wait before killing an idle connection
  connect_timeout: 10, // How many seconds to wait before timing out when connecting
  max_lifetime: 60 * 30, // How many seconds a connection can stay open
  onnotice: () => {}, // Silence notice messages
  onparameter: () => {}, // Silence parameter messages
  debug: (connection, query, params, types) => {
    // Optional debugging - can be uncommented when needed
    // console.log('DB Query:', query);
  },
  onclose: async (connection) => {
    // This gets called when a connection is closed
    console.log('Database connection was closed');
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