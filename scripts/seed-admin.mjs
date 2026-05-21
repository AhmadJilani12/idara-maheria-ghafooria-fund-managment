import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

async function seedAdmin() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('⚠️ Admin user already exists. Updating password...');
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('✅ Admin password updated to "admin123"');
    } else {
      console.log('⏳ Creating admin user...');
      await User.create({
        name: 'Administrator',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
      });
      console.log('🎉 Admin user created successfully!');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: admin123');
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
