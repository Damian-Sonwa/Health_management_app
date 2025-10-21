const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function updatePassword() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to healthify_tracker database');
    
    const User = mongoose.connection.db.collection('users');
    
    // Find the user
    const user = await User.findOne({ email: 'madudamian25@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log(`\n👤 Found user: ${user.name} (${user.email})`);
    console.log(`Current password hash: ${user.password.substring(0, 20)}...`);
    
    // Hash the new password
    const newPassword = 'Godofjustice@001';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`\n🔐 New password hash: ${hashedPassword.substring(0, 20)}...`);
    
    // Update the password directly
    await User.updateOne(
      { email: 'madudamian25@gmail.com' },
      { $set: { password: hashedPassword } }
    );
    
    console.log('\n✅ Password updated successfully!');
    
    // Verify the password
    const updatedUser = await User.findOne({ email: 'madudamian25@gmail.com' });
    const isValid = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`\n🔍 Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    console.log('\n💡 You can now login with:');
    console.log('   Email: madudamian25@gmail.com');
    console.log('   Password: Godofjustice@001');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

updatePassword();
