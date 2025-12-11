const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'healthify_tracker'
    });
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Users to update with their roles (read from .env for security)
const usersToUpdate = [
  {
    email: process.env.PHARMACY_EMAIL || 'pharmacy@healthapp.com',
    role: 'pharmacy',
    password: process.env.PHARMACY_PASSWORD || 'Pharmacy123!',
    name: process.env.PHARMACY_NAME || 'Pharmacy User'
  },
  {
    email: process.env.ADMIN_EMAIL || 'admin@healthapp.com',
    role: 'admin',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    name: process.env.ADMIN_NAME || 'Admin User'
  },
  {
    email: process.env.DOCTOR_EMAIL || 'doctor@healthapp.com',
    role: 'doctor',
    password: process.env.DOCTOR_PASSWORD || 'Doctor123!',
    name: process.env.DOCTOR_NAME || 'Doctor User'
  }
];

// Update user roles
const updateUserRoles = async () => {
  try {
    console.log('🔄 Starting user role updates...\n');

    for (const userData of usersToUpdate) {
      const { email, role, password, name } = userData;
      
      // Find the user (case-insensitive search)
      const normalizedEmail = email.toLowerCase().trim();
      let user = await User.findOne({ email: normalizedEmail });
      
      if (!user) {
        console.log(`⚠️  User not found: ${email}`);
        console.log(`   Creating new user with role: ${role}`);
        
        // Create new user - password will be hashed by pre-save hook
        const newUser = new User({
          name: name || email.split('@')[0].replace(/[0-9]/g, '').replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: normalizedEmail,
          password: password, // Will be hashed by pre-save hook
          role: role,
          subscription: {
            plan: 'premium',
            status: 'active',
            trialEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        });
        
        await newUser.save();
        console.log(`✅ Created user: ${email} with role: ${role}`);
        console.log(`   Password: ${password}`);
        continue;
      }
      
      // Update existing user's role and password
      const oldRole = user.role || 'patient';
      user.role = role;
      user.name = name || user.name;
      
      // Update password - need to hash it manually since we're updating existing user
      if (password) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        console.log(`   Password updated`);
      }
      
      // Mark password as modified to trigger pre-save hook if needed
      user.markModified('password');
      await user.save();
      
      console.log(`✅ Updated user: ${email}`);
      console.log(`   Role changed from "${oldRole}" to "${role}"`);
      console.log(`   Password: ${password}`);
    }

    console.log('\n✅ All user role updates completed successfully!');
    console.log('\n📋 Login Credentials (from .env):');
    usersToUpdate.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}:`);
      console.log(`     Email:    ${user.email}`);
      console.log(`     Password: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if executed directly
if (require.main === module) {
  connectDB().then(() => {
    updateUserRoles();
  });
}

module.exports = { updateUserRoles };

