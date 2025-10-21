const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function resetAllPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database\n');
    
    const emails = [
      'madudamian25@gmail.com',
      'sonwamikedeeson@gmail.com', 
      'euchariaprecious763@gmail.com'
    ];
    
    const newPassword = 'password123';
    
    for (const email of emails) {
      const user = await User.findOne({ email });
      if (user) {
        user.password = newPassword;
        await user.save();
        console.log(' Password reset for:', email);
      }
    }
    
    console.log('\n All passwords reset to: password123');
    console.log('\nYou can now login with any of these emails:');
    emails.forEach(email => console.log('  -', email));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

resetAllPasswords();
