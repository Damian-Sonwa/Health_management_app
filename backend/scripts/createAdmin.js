const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

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

// Create admin user
const createAdmin = async () => {
  try {
    console.log('🔄 Creating admin user...\n');

    const email = 'johnsnowwhite@gmail.com';
    const password = 'Godofjustice@001';
    const name = 'John Snow White';
    const role = 'admin';

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      console.log(`⚠️  User already exists: ${email}`);
      console.log(`   Updating to admin role...`);
      
      // Update existing user
      user.role = role;
      user.name = name;
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.markModified('password');
      
      await user.save();
      console.log(`✅ Updated user: ${email} to admin role`);
      console.log(`   Password updated`);
    } else {
      console.log(`   Creating new admin user...`);
      
      // Create new user - password will be hashed by pre-save hook
      const newUser = new User({
        name: name,
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
      console.log(`✅ Created admin user: ${email}`);
    }

    console.log('\n✅ Admin user setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ${role}`);

  } catch (error) {
    console.error('❌ Failed to create admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if executed directly
if (require.main === module) {
  connectDB().then(() => {
    createAdmin();
  });
}

module.exports = { createAdmin };

