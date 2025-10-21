const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function ensureUserExists() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const dbName = mongoose.connection.db.databaseName;
    console.log(`✅ Connected to: ${dbName}\n`);
    
    const User = mongoose.connection.db.collection('users');
    
    // Check if user exists
    let user = await User.findOne({ email: 'madudamian25@gmail.com' });
    
    if (user) {
      console.log('✅ User exists:', user.name);
      console.log(`   Email: ${user.email}`);
      
      // Update password
      const hashedPassword = await bcrypt.hash('Godofjustice@001', 10);
      await User.updateOne(
        { email: 'madudamian25@gmail.com' },
        { $set: { password: hashedPassword } }
      );
      console.log('✅ Password updated\n');
      
    } else {
      console.log('❌ User does not exist. Creating...\n');
      
      // Create user
      const hashedPassword = await bcrypt.hash('Godofjustice@001', 10);
      await User.insertOne({
        name: 'Madu Damian',
        email: 'madudamian25@gmail.com',
        password: hashedPassword,
        phone: '+1234567890',
        role: 'patient',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ User created\n');
    }
    
    // Verify
    user = await User.findOne({ email: 'madudamian25@gmail.com' });
    const isValid = await bcrypt.compare('Godofjustice@001', user.password);
    
    console.log('🔍 Verification:');
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Password valid: ${isValid ? '✅ YES' : '❌ NO'}`);
    console.log(`   User ID: ${user._id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

ensureUserExists();

