#!/usr/bin/env node

/**
 * Vercel Admin User Creation Script
 * 
 * This script creates an admin user for Vercel deployments
 * Run this after deploying to Vercel and setting up your database
 */

const bcrypt = require('bcryptjs');

// Database connection for Vercel deployment
async function createAdminForVercel() {
  try {
    console.log('🚀 Creating admin user for Vercel deployment...');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not set');
      console.log('   Please set DATABASE_URL in your Vercel environment variables');
      process.exit(1);
    }
    
    // Import database after checking environment
    const { db } = require('./server/db');
    const { users } = require('./shared/schema');
    const { eq } = require('drizzle-orm');
    
    console.log('✅ Database connection established');
    
    // Check if admin user already exists
    console.log('🔍 Checking for existing admin user...');
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('   Username: admin');
      console.log('   You can login with your existing credentials');
      return;
    }
    
    // Create admin user
    console.log('👤 Creating new admin user...');
    const hashedPassword = await bcrypt.hash('password1234', 10);
    
    const adminUser = await db.insert(users).values({
      username: 'admin',
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    }).returning();
    
    console.log('🎉 Admin user created successfully!');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   👤 Username: admin');
    console.log('   🔑 Password: password1234');
    console.log('   🛡️  Role: admin');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('   Go to Settings → Security → Change Password');
    console.log('');
    console.log('🌐 Your app is ready at your Vercel URL!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('');
      console.log('🔧 Database connection troubleshooting:');
      console.log('   1. Verify DATABASE_URL is correct');
      console.log('   2. Check if database schema is initialized');
      console.log('   3. Ensure database is accessible from your location');
    }
    
    process.exit(1);
  }
}

// Run the admin creation
createAdminForVercel();