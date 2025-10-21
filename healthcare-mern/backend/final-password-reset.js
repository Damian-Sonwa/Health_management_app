const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    const email = 'madudamian25@gmail.com';
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found!');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ User found:', user.name);
    
    // Set password - this will trigger the pre-save hook to hash it
    user.password = 'password123';
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: madudamian25@gmail.com');
    console.log('   Password: password123');
    console.log('\n✨ Try logging in now!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

resetPassword();

