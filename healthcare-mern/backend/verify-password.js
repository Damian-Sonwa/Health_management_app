const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function checkAndResetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');
    
    const email = 'madudamian25@gmail.com';
    const user = await User.findOne({ email }).select('+password');
    
    if (user) {
      console.log(' User found:', user.name);
      console.log('Email:', user.email);
      
      // Test current password
      const testPass = 'password123';
      const isValid = await bcrypt.compare(testPass, user.password);
      console.log('\nPassword "password123" valid:', isValid);
      
      if (!isValid) {
        console.log('\n  Password mismatch! Resetting...');
        user.password = testPass;
        await user.save();
        console.log(' Password reset complete!');
        
        // Verify the reset worked
        const updatedUser = await User.findOne({ email }).select('+password');
        const nowValid = await bcrypt.compare(testPass, updatedUser.password);
        console.log(' Verification after reset:', nowValid);
      } else {
        console.log(' Password is already correct!');
      }
    } else {
      console.log(' User not found!');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAndResetPassword();
