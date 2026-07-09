require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const authService = require('../services/authService');

const admins = [
  {
    name: 'Toofan Admin Desk',
    email: 'admin@toofan.gov',
    password: 'AdminPassword123!',
    role: 'admin',
    phone: '1112223333',
    isVerified: true
  },
  {
    name: 'Toofan Super Admin',
    email: 'superadmin@toofan.gov',
    password: 'SuperAdminPassword123!',
    role: 'superadmin',
    phone: '4445556666',
    isVerified: true
  }
];

const seedAdmins = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/operation_toofan');
    console.log('Database connected.');

    // Remove existing admin/superadmin accounts to avoid duplicates
    console.log('Cleaning existing admin & superadmin records...');
    await User.deleteMany({ role: { $in: ['admin', 'superadmin'] } });

    // Seed users
    for (const adminData of admins) {
      const hashedPassword = await authService.hashPassword(adminData.password);
      
      const adminUser = await User.create({
        ...adminData,
        password: hashedPassword
      });
      
      console.log(`Seeded user: ${adminUser.name} (${adminUser.role}) -> ${adminUser.email}`);
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmins();
