const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAllPasswords() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to database: ${dbName}\n`);
    
    const User = mongoose.connection.db.collection('users');
    const users = await User.find({}).toArray();
    
    console.log(`👥 Found ${users.length} users\n`);
    console.log('🔧 Fixing passwords for all users...\n');
    
    // Default password for all users
    const defaultPassword = 'Godofjustice@001';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const user of users) {
      try {
        // Update password directly using updateOne
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        console.log(`✅ ${user.name || 'Unknown'} (${user.email})`);
        successCount++;
      } catch (error) {
        console.log(`❌ Failed: ${user.email} - ${error.message}`);
        failCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   ✅ Successfully updated: ${successCount} users`);
    console.log(`   ❌ Failed: ${failCount} users`);
    console.log('='.repeat(60));
    
    console.log('\n🔐 All users can now login with:');
    console.log(`   Password: ${defaultPassword}`);
    console.log('\n📋 User List:');
    
    const updatedUsers = await User.find({}, { projection: { name: 1, email: 1 } }).sort({ email: 1 }).toArray();
    updatedUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.name || 'Unknown'}`);
    });
    
    // Verify one user to make sure it works
    console.log('\n🔍 Verifying password for madudamian25@gmail.com...');
    const testUser = await User.findOne({ email: 'madudamian25@gmail.com' });
    if (testUser) {
      const isValid = await bcrypt.compare(defaultPassword, testUser.password);
      console.log(`   Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixAllPasswords();
