import bcrypt from 'bcryptjs';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script to reset all demo account passwords to ensure they work in deployment
 */
async function resetDemoPasswords() {
  console.log('Starting demo password reset...');
  
  const demoAccounts = [
    { username: 'demo_couple', password: 'password123' },
    { username: 'demo_planner', password: 'password123' },
    { username: 'demo_couple2', password: 'password123' },
    { username: 'demo_admin', password: 'password123' },
    { username: 'abhishek', password: 'password' }
  ];
  
  try {
    for (const account of demoAccounts) {
      console.log(`Resetting password for ${account.username}...`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(account.password, 10);
      
      // Update the user's password
      const result = await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.username, account.username))
        .returning({ id: users.id, username: users.username });
      
      if (result.length > 0) {
        console.log(`✓ Password reset for ${account.username} (ID: ${result[0].id})`);
      } else {
        console.log(`✗ User ${account.username} not found`);
      }
    }
    
    console.log('\n✅ Demo password reset completed successfully!');
    console.log('\nDemo Account Credentials:');
    console.log('========================');
    console.log('Couple Account:');
    console.log('  Username: demo_couple');
    console.log('  Password: password123');
    console.log('');
    console.log('Event Planner Account:');
    console.log('  Username: demo_planner');
    console.log('  Password: password123');
    console.log('');
    console.log('Second Couple Account:');
    console.log('  Username: demo_couple2');
    console.log('  Password: password123');
    console.log('');
    console.log('Admin Account:');
    console.log('  Username: demo_admin');
    console.log('  Password: password123');
    console.log('');
    console.log('Super Admin Account:');
    console.log('  Username: abhishek');
    console.log('  Password: password');
    
  } catch (error) {
    console.error('Error resetting demo passwords:', error);
    throw error;
  }
}

async function main() {
  try {
    await resetDemoPasswords();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
main();

export { resetDemoPasswords };