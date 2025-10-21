const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const dbName = mongoose.connection.db.databaseName;
    console.log(`\n🔍 Debugging login in database: ${dbName}\n`);
    
    const User = mongoose.connection.db.collection('users');
    const user = await User.findOne({ email: 'madudamian25@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log(`✅ User found: ${user.name} (${user.email})`);
    console.log(`\n🔑 Password hash in database:`);
    console.log(`   ${user.password}`);
    
    // Test multiple possible passwords
    const passwords = ['Godofjustice@001', 'Godofjustice@01', 'password123', 'Password@123'];
    
    console.log(`\n🧪 Testing passwords:`);
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, user.password);
      console.log(`   "${pwd}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    // Create a fresh hash
    console.log(`\n🔧 Creating fresh password hash...`);
    const newHash = await bcrypt.hash('Godofjustice@001', 10);
    console.log(`   New hash: ${newHash.substring(0, 40)}...`);
    
    // Update with fresh hash
    await User.updateOne(
      { email: 'madudamian25@gmail.com' },
      { $set: { password: newHash } }
    );
    console.log(`   ✅ Password updated in database`);
    
    // Verify the update
    const updatedUser = await User.findOne({ email: 'madudamian25@gmail.com' });
    const finalTest = await bcrypt.compare('Godofjustice@001', updatedUser.password);
    console.log(`   Final verification: ${finalTest ? '✅ VALID' : '❌ INVALID'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugLogin();
