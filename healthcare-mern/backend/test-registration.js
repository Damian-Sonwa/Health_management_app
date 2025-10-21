require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testRegistration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('\n✅ Connected to MongoDB\n');
    
    const testEmail = `test-${Date.now()}@testing.com`;
    const testName = `Test User ${Date.now()}`;
    
    console.log('🧪 Creating test user:');
    console.log(`   Name: ${testName}`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: test1234\n`);
    
    // Check if user exists
    const existing = await User.findOne({ email: testEmail });
    if (existing) {
      console.log('❌ User already exists (should not happen with timestamp)');
      process.exit(1);
    }
    
    // Create user
    const user = new User({
      name: testName,
      email: testEmail,
      password: 'test1234'
    });
    
    console.log('💾 Saving user...');
    await user.save();
    console.log('✅ Save completed!');
    console.log(`   User ID: ${user._id}\n`);
    
    // Verify it's in database
    console.log('🔍 Verifying user in database...');
    const found = await User.findOne({ email: testEmail });
    
    if (found) {
      console.log('✅ USER FOUND IN DATABASE!');
      console.log(`   Name: ${found.name}`);
      console.log(`   Email: ${found.email}`);
      console.log(`   ID: ${found._id}`);
      console.log(`   Created: ${found.createdAt}\n`);
      
      // Clean up
      console.log('🧹 Cleaning up test user...');
      await User.deleteOne({ _id: found._id });
      console.log('✅ Test user removed\n');
      
      console.log('✅ REGISTRATION IS WORKING CORRECTLY!\n');
    } else {
      console.log('❌ USER NOT FOUND IN DATABASE!');
      console.log('🚨 REGISTRATION IS BROKEN!\n');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

testRegistration();

