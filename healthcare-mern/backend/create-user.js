const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB');
    
    // Check if user exists
    const existing = await User.findOne({ email: 'test@test.com' });
    if (existing) {
      console.log('  User already exists');
      await mongoose.disconnect();
      return;
    }
    
    // Create new user (password will be hashed by the model)
    const user = new User({
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123'
    });
    
    await user.save();
    console.log(' Test user created successfully!');
    console.log('   Email: test@test.com');
    console.log('   Password: test123');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
