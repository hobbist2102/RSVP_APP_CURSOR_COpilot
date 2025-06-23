import { db } from '../server/db';
import { users } from '../shared/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

/**
 * Script to create demo accounts for the deployed application
 */
async function createDemoAccounts() {
  console.log('Creating demo accounts...');

  const demoAccounts = [
    {
      username: 'demo_couple',
      password: 'password123',
      name: 'Raj & Priya',
      email: 'couple@example.com',
      role: 'couple'
    },
    {
      username: 'demo_planner',
      password: 'password123',
      name: 'Wedding Planner',
      email: 'planner@example.com',
      role: 'staff'
    },
    {
      username: 'demo_couple2',
      password: 'password123',
      name: 'Arjun & Nisha',
      email: 'couple2@example.com',
      role: 'couple'
    },
    {
      username: 'demo_admin',
      password: 'password123',
      name: 'System Admin',
      email: 'admin2@example.com',
      role: 'admin'
    },
    {
      username: 'abhishek',
      password: 'password',
      name: 'Super Admin',
      email: 'admin@example.com',
      role: 'admin'
    }
  ];

  for (const account of demoAccounts) {
    try {
      // Check if user already exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.username, account.username))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`User ${account.username} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(account.password, 10);

      // Create the user
      await db.insert(users).values({
        username: account.username,
        password: hashedPassword,
        name: account.name,
        email: account.email,
        role: account.role
      });

      console.log(`✓ Created user: ${account.username} (${account.role})`);
    } catch (error) {
      console.error(`Failed to create user ${account.username}:`, error);
    }
  }

  console.log('Demo account creation completed.');
}

// Run the script
createDemoAccounts().catch(console.error);