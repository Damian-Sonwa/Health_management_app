const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'madudamian25@gmail.com';
    const user = await User.findOne({ email }).select('+password');
    
    if (user) {
      console.log(' User found:', user.name);
      console.log('Email:', user.email);
      console.log('Password hash exists:', !!user.password);
      console.log('Password hash length:', user.password?.length);
      
      // Test password
      const testPassword = 'password123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('\nPassword "password123" valid:', isValid);
      
      if (!isValid) {
        console.log('\n Password does not match! Resetting...');
        user.password = testPassword;
        await user.save();
        console.log(' Password reset to: password123');
      }
    } else {
      console.log(' User not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUser();
