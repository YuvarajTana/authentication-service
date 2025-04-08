
// scripts/createAdminUser.ts - Script to create an admin user
import 'dotenv/config';
import { connectDB } from '../config/db';
import User from '../models/userModel';
import logger from '../utils/logger';

async function createAdminUser() {
  try {
    await connectDB();
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      logger.info(`Admin user already exists with email: ${adminEmail}`);
      process.exit(0);
    }
    
    // Create new admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      isAdmin: true
    });
    
    await adminUser.save();
    logger.info(`Admin user created with email: ${adminEmail}`);
    
    process.exit(0);
  } catch (error) {
    logger.error('Failed to create admin user', error);
    process.exit(1);
  }
}

createAdminUser();