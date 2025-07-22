import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create the connection
const client = postgres(connectionString, {
  max: parseInt(process.env.DATABASE_POOL_SIZE || '5'),
  idle_timeout: parseInt(process.env.DATABASE_TIMEOUT || '30'),
  connect_timeout: parseInt(process.env.DATABASE_CONNECT_TIMEOUT || '10'),
  max_lifetime: parseInt(process.env.DATABASE_MAX_LIFETIME || '900'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Create the database instance
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === 'development'
})

// Export types and schema
export * from './schema'
export type Database = typeof db