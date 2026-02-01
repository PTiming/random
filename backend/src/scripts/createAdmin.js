/**
 * Admin User Seeder
 * 
 * Creates an admin user in the database.
 * 
 * Usage:
 *   node src/scripts/createAdmin.js
 *   
 * Or with custom values:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123 node src/scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Default admin credentials (can be overridden via environment variables)
const DEFAULT_ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@lms.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
  firstName: process.env.ADMIN_FIRSTNAME || 'System',
  lastName: process.env.ADMIN_LASTNAME || 'Administrator',
  role: 'admin'
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_lms';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });
    
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      
      // Ask if they want to reset password
      if (process.argv.includes('--reset')) {
        existingAdmin.password = DEFAULT_ADMIN.password;
        await existingAdmin.save();
        console.log('\n✅ Admin password has been reset!');
        console.log(`   New password: ${DEFAULT_ADMIN.password}`);
      } else {
        console.log('\n   Run with --reset flag to reset password');
      }
    } else {
      // Create new admin
      const admin = await User.create(DEFAULT_ADMIN);
      
      console.log('\n✅ Admin user created successfully!');
      console.log('─'.repeat(40));
      console.log(`   Email:     ${admin.email}`);
      console.log(`   Password:  ${DEFAULT_ADMIN.password}`);
      console.log(`   Name:      ${admin.firstName} ${admin.lastName}`);
      console.log(`   Role:      ${admin.role}`);
      console.log('─'.repeat(40));
      console.log('\n⚠️  Please change the password after first login!');
    }

  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
createAdmin();
